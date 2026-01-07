using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace ModpackUpdater.Services
{
    public class Config
    {
        public string GamePath { get; set; } = "";
        public string Version { get; set; } = "1.0.0";
    }

    public class ConfigService
    {
        private readonly string _configPath;
        private readonly string _appDataPath;

        public ConfigService()
        {
            _appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "VSModpackUpdater");
            _configPath = Path.Combine(_appDataPath, "config.json");
        }

        private string? TryDetectGamePath()
        {
            // Try to detect default Vintage Story mods path
            var roamingPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var vsModsPath = Path.Combine(roamingPath, "VintagestoryData", "Mods");
            
            return Directory.Exists(vsModsPath) ? vsModsPath : null;
        }

        public async Task<Config> LoadConfigAsync()
        {
            Config config;
            
            if (!File.Exists(_configPath))
            {
                config = new Config();
            }
            else
            {
                try
                {
                    using var stream = File.OpenRead(_configPath);
                    config = await JsonSerializer.DeserializeAsync<Config>(stream) ?? new Config();
                }
                catch
                {
                    config = new Config();
                }
            }

            // Auto-detect game path if not configured
            if (string.IsNullOrEmpty(config.GamePath))
            {
                var detectedPath = TryDetectGamePath();
                if (detectedPath != null)
                {
                    config.GamePath = detectedPath;
                    await SaveConfigAsync(config); // Persist detected path
                }
            }

            return config;
        }

        public async Task SaveConfigAsync(Config config)
        {
            try
            {
                if (!Directory.Exists(_appDataPath))
                {
                    Directory.CreateDirectory(_appDataPath);
                }

                using var stream = File.Create(_configPath);
                await JsonSerializer.SerializeAsync(stream, config, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving config: {ex.Message}");
            }
        }
    }
}
