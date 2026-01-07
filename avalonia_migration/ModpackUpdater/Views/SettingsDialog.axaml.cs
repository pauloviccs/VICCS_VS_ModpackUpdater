using Avalonia.Controls;
using Avalonia.Interactivity;

namespace ModpackUpdater.Views;

public partial class SettingsDialog : Window
{
    public SettingsDialog()
    {
        InitializeComponent();
    }

    private void CloseButton_Click(object? sender, RoutedEventArgs e)
    {
        Close();
    }
}
