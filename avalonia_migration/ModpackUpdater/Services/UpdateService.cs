using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;

namespace ModpackUpdater.Services
{
    public class RemoteManifest
    {
        public string? version { get; set; }
        public string? downloadUrl { get; set; }
        public string? news { get; set; }
    }

    public class UpdateResult
    {
        public bool Available { get; set; }
        public string? LocalVersion { get; set; }
        public string? RemoteVersion { get; set; }
        public string? News { get; set; }
        public string? Error { get; set; }
    }

    public class UpdateService
    {
        private const string ManifestUrl = "https://pastebin.com/raw/anmQgXXs"; // Update if needed
        private readonly HttpClient _httpClient;
        private readonly ConfigService _configService;

        public UpdateService(ConfigService configService)
        {
            _httpClient = new HttpClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(10);
            _configService = configService;
        }

        public async Task<UpdateResult> CheckForUpdatesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync(ManifestUrl);
                if (!response.IsSuccessStatusCode)
                {
                    return new UpdateResult { Error = $"Manifesto não encontrado ({response.StatusCode})." };
                }

                var json = await response.Content.ReadAsStringAsync();
                var remote = JsonSerializer.Deserialize<RemoteManifest>(json);

                var config = await _configService.LoadConfigAsync();

                // Check if mods folder exists and has files
                bool modsIntegrityOk = CheckModsIntegrity(config.GamePath);
                bool versionMatch = remote.version == config.Version;

                // Force update available if:
                // 1. Version mismatch OR
                // 2. Mods folder is empty/missing
                bool updateAvailable = !versionMatch || !modsIntegrityOk;

                return new UpdateResult
                {
                    Available = updateAvailable,
                    LocalVersion = config.Version,
                    RemoteVersion = remote.version,
                    News = remote.news ?? "Sem notas de atualização.",
                };
            }
            catch (Exception ex)
            {
                return new UpdateResult { Error = $"Erro ao verificar atualizações: {ex.Message}" };
            }
        }

        private bool CheckModsIntegrity(string gamePath)
        {
            if (string.IsNullOrEmpty(gamePath) || !Directory.Exists(gamePath))
                return false;

            // Check if folder has at least one mod file (.cs or .dll)
            var modFiles = Directory.GetFiles(gamePath, "*.cs", SearchOption.AllDirectories)
                .Concat(Directory.GetFiles(gamePath, "*.dll", SearchOption.AllDirectories));

            return modFiles.Any();
        }

        public async Task<bool> PerformUpdateAsync(string gamePath, IProgress<double> progress)
        {
            try
            {
                progress?.Report(5); // Verificando versão...
                var response = await _httpClient.GetAsync(ManifestUrl);
                var json = await response.Content.ReadAsStringAsync();
                var remote = JsonSerializer.Deserialize<RemoteManifest>(json);

                if (string.IsNullOrEmpty(remote.downloadUrl)) return false;

                // Download
                progress?.Report(15); // Baixando...
                var tempPath = Path.GetTempFileName();
                await DownloadFileAsync(remote.downloadUrl, tempPath, progress);

                // Extract
                progress?.Report(80); // Extraindo...
                
                if (Directory.Exists(gamePath))
                {
                     // Use specific logic if you want to wipe ONLY mods or the whole folder.
                     // The requirement said "Wipe Mods Folder". 
                     // Assuming gamePath is the specific folder to install into.
                     DirectoryInfo di = new DirectoryInfo(gamePath);
                     foreach (FileInfo file in di.GetFiles()) file.Delete();
                     foreach (DirectoryInfo dir in di.GetDirectories()) dir.Delete(true);
                }
                else 
                {
                    Directory.CreateDirectory(gamePath);
                }

                ZipFile.ExtractToDirectory(tempPath, gamePath);

                // Cleanup
                progress?.Report(95); // Finalizando...
                File.Delete(tempPath);

                // Update Config
                var config = await _configService.LoadConfigAsync();
                config.Version = remote.version;
                await _configService.SaveConfigAsync(config);
                
                progress?.Report(100); // Pronto!
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Update failed: {ex.Message}");
                return false;
            }
        }

        private async Task DownloadFileAsync(string url, string destination, IProgress<double> progress)
        {
            using var response = await _httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            var totalBytes = response.Content.Headers.ContentLength ?? -1L;
            var canReportProgress = totalBytes != -1 && progress != null;

            using var stream = await response.Content.ReadAsStreamAsync();
            using var fileStream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None);
            
            var buffer = new byte[8192];
            var totalRead = 0L;
            int bytesRead;

            // Map progress from 15% to 75%
            while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                await fileStream.WriteAsync(buffer, 0, bytesRead);
                totalRead += bytesRead;

                if (canReportProgress)
                {
                    var percent = (totalRead * 1d) / (totalBytes * 1d); // 0 to 1
                    var scaledPercent = 15 + (percent * 60); // 15 to 75
                    progress.Report(scaledPercent);
                }
            }
        }
    }
}
