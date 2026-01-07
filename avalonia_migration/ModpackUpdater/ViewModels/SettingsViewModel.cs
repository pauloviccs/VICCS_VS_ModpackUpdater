using System;
using System.Threading.Tasks;
using Avalonia.Platform.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ModpackUpdater.Services;

namespace ModpackUpdater.ViewModels;

public partial class SettingsViewModel : ViewModelBase
{
    private readonly ConfigService _configService;

    [ObservableProperty]
    private string _gamePath = "";

    [ObservableProperty]
    private string _currentVersion = "1.0.0";

    public SettingsViewModel(ConfigService configService, string currentVersion)
    {
        _configService = configService;
        _currentVersion = currentVersion;
        
        LoadSettings();
    }

    private async void LoadSettings()
    {
        var config = await _configService.LoadConfigAsync();
        GamePath = config.GamePath;
    }

    [RelayCommand]
    private async Task BrowseDirectoryAsync(IStorageProvider? storageProvider)
    {
        if (storageProvider == null) return;

        var folders = await storageProvider.OpenFolderPickerAsync(new FolderPickerOpenOptions
        {
            Title = "Selecione o diretório de Mods do Vintage Story",
            AllowMultiple = false
        });

        if (folders.Count > 0)
        {
            GamePath = folders[0].Path.LocalPath;
            
            // Save to config
            var config = await _configService.LoadConfigAsync();
            config.GamePath = GamePath;
            await _configService.SaveConfigAsync(config);
        }
    }
}
