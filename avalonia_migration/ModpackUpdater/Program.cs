using Avalonia;
using System;

namespace ModpackUpdater;

sealed class Program
{
    // Initialization code. Don't use any Avalonia, third-party APIs or any
    // SynchronizationContext-reliant code before AppMain is called: things aren't initialized
    // yet and stuff might break.
    [STAThread]
    public static void Main(string[] args)
    {
        try 
        {
            var assembly = System.Reflection.Assembly.GetExecutingAssembly();
            var resources = assembly.GetManifestResourceNames();
            System.IO.File.WriteAllLines("resources.log", resources);
            
            BuildAvaloniaApp().StartWithClassicDesktopLifetime(args);
        }
        catch (Exception ex)
        {
            System.IO.File.WriteAllText("crash.log", ex.ToString());
            // throw; 
        }
    }

    // Avalonia configuration, don't remove; also used by visual designer.
    public static AppBuilder BuildAvaloniaApp()
        => AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace();
}
