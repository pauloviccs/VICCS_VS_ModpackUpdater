using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Platform;
using Avalonia.Threading;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ModpackUpdater.Services;
using ModpackUpdater.Views;

namespace ModpackUpdater.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
    private readonly UpdateService _updateService;
    private readonly ConfigService _configService;
    private readonly GameProcessService _gameProcessService;

    [ObservableProperty]
    private string _statusMessage = "Pronto";

    [ObservableProperty]
    private IBrush _statusBrush = Brushes.Gray;

    [ObservableProperty]
    private double _progressValue = 0;

    [ObservableProperty]
    private bool _isBusy = false;

    [ObservableProperty]
    private bool _isUpdateAvailable = false;

    [ObservableProperty]
    private string _currentVersion = "1.0.0";

    [ObservableProperty]
    private string _remoteVersion = "...";

    [ObservableProperty]
    private string _news = "Carregando...";

    [ObservableProperty]
    private ObservableCollection<string> _newsLines = new();

    [ObservableProperty]
    private string _gamePath = "";

    [ObservableProperty]
    private bool _isChangelogExpanded = false;

    [ObservableProperty]
    private Bitmap? _currentBackgroundImage;

    private readonly DispatcherTimer _backgroundTimer;
    private int _currentImageIndex = 0;
    private readonly string[] _backgroundImages = new[]
    {
        "avares://ModpackUpdater/Assets/art/webp/0.webp",
        "avares://ModpackUpdater/Assets/art/webp/1.webp",
        "avares://ModpackUpdater/Assets/art/webp/2.webp",
        "avares://ModpackUpdater/Assets/art/webp/3.webp",
        "avares://ModpackUpdater/Assets/art/webp/4.webp",
        "avares://ModpackUpdater/Assets/art/webp/5.webp"
    };
    private readonly Bitmap?[] _loadedImages;

    public string VersionDisplayText => IsUpdateAvailable ? RemoteVersion : CurrentVersion;

    public MainWindowViewModel()
    {
        // Simple composition root for now. In a larger app, use DI.
        _configService = new ConfigService();
        _updateService = new UpdateService(_configService);
        _gameProcessService = new GameProcessService();

        // Pre-load all background images
        _loadedImages = new Bitmap?[_backgroundImages.Length];
        LoadBackgroundImages();

        // Initialize background slideshow timer using DispatcherTimer (UI thread safe)
        _backgroundTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(5)
        };
        _backgroundTimer.Tick += (s, e) => CycleBackgroundImage();
        _backgroundTimer.Start();

        InitializeAsync();
    }

    private async void InitializeAsync()
    {
        try 
        {
            var config = await _configService.LoadConfigAsync();
            CurrentVersion = config.Version;
            GamePath = config.GamePath;
            
            await CheckForUpdatesAsync();
        }
        catch (Exception ex)
        {
            StatusMessage = $"Erro fatal ao iniciar: {ex.Message}";
            StatusBrush = Brushes.Red;
        }
    }

    [RelayCommand]
    private async Task CheckForUpdatesAsync()
    {
        IsBusy = true;
        StatusMessage = "Verificando atualizações...";

        try
        {
            var result = await _updateService.CheckForUpdatesAsync();
            
            if (!string.IsNullOrEmpty(result.Error))
            {
                StatusMessage = "Erro: " + result.Error;
                return;
            }

            IsUpdateAvailable = result.Available;
            RemoteVersion = result.RemoteVersion;
            News = result.News;
            
            // Parse news into lines for changelog display
            NewsLines.Clear();
            if (!string.IsNullOrEmpty(result.News))
            {
                var lines = result.News.Split('\n')
                    .Where(l => !string.IsNullOrWhiteSpace(l))
                    .Select(l => l.Trim());
                
                foreach (var line in lines)
                {
                    NewsLines.Add(line);
                }
            }
            
            StatusMessage = result.Available ? "Nova versão disponível!" : "Você já está atualizado.";
            StatusBrush = result.Available ? Brushes.Green : Brushes.Gray;
            
            // Notify version display change
            OnPropertyChanged(nameof(VersionDisplayText));
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task StartUpdateAsync()
    {
        if (_gameProcessService.IsGameRunning())
        {
            StatusMessage = "Erro: O jogo está aberto! Feche o Vintage Story.";
            return;
        }

        if (string.IsNullOrEmpty(GamePath))
        {
            StatusMessage = "Erro: Caminho do jogo não configurado.";
            return;
        }

        IsBusy = true;
        StatusMessage = "Iniciando atualização...";
        ProgressValue = 0;

        var progress = new Progress<double>(p => ProgressValue = p);
        
        var success = await _updateService.PerformUpdateAsync(GamePath, progress);

        if (success)
        {
            StatusMessage = "Atualização concluída com sucesso!";
            IsUpdateAvailable = false;
            var config = await _configService.LoadConfigAsync();
            CurrentVersion = config.Version;
        }
        else
        {
            StatusMessage = "Falha na atualização. Verifique o log.";
        }

        IsBusy = false;
    }

    [RelayCommand]
    private async Task OpenSettingsAsync()
    {
        try
        {
            var dialog = new SettingsDialog
            {
                DataContext = new SettingsViewModel(_configService, CurrentVersion)
            };

            if (Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                await dialog.ShowDialog(desktop.MainWindow!);
                
                // Reload config after closing settings
                var config = await _configService.LoadConfigAsync();
                GamePath = config.GamePath;
            }
        }
        catch (Exception ex)
        {
            StatusMessage = $"Erro ao abrir configurações: {ex.Message}";
        }
    }

    [RelayCommand]
    private void ToggleChangelog()
    {
        IsChangelogExpanded = !IsChangelogExpanded;
    }

    private void CycleBackgroundImage()
    {
        _currentImageIndex = (_currentImageIndex + 1) % _loadedImages.Length;
        if (_loadedImages[_currentImageIndex] != null)
        {
            CurrentBackgroundImage = _loadedImages[_currentImageIndex];
        }
    }

    private void LoadBackgroundImages()
    {
        for (int i = 0; i < _backgroundImages.Length; i++)
        {
            try
            {
                var uri = new Uri(_backgroundImages[i]);
                using var stream = AssetLoader.Open(uri);
                _loadedImages[i] = new Bitmap(stream);
            }
            catch
            {
                // Silently ignore loading errors
                _loadedImages[i] = null;
            }
        }

        // Set initial image
        if (_loadedImages[0] != null)
        {
            CurrentBackgroundImage = _loadedImages[0];
        }
    }
}
