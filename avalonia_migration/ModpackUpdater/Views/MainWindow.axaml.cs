using Avalonia.Controls;
using Avalonia.Input;
using ModpackUpdater.ViewModels;

namespace ModpackUpdater.Views;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void MinimizeWindow_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        WindowState = WindowState.Minimized;
    }

    private void MaximizeWindow_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        WindowState = WindowState == WindowState.Maximized 
            ? WindowState.Normal 
            : WindowState.Maximized;
    }

    private void CloseWindow_Click(object? sender, Avalonia.Interactivity.RoutedEventArgs e)
    {
        Close();
    }

    private void ChangelogCard_Click(object? sender, PointerPressedEventArgs e)
    {
        if (DataContext is MainWindowViewModel vm)
        {
            vm.ToggleChangelogCommand.Execute(null);
        }
    }
}