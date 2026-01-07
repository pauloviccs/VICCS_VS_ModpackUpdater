using System.Diagnostics;
using System.Linq;

namespace ModpackUpdater.Services
{
    public class GameProcessService
    {
        public bool IsGameRunning()
        {
            var processes = Process.GetProcessesByName("Vintagestory");
            return processes.Any();
        }
    }
}
