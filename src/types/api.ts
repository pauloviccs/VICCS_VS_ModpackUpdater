// API Contract Types for window.api (Electron Backend)

export interface UpdateCheckResult {
  available: boolean;
  localVersion: string;
  remoteVersion: string;
  news: string;
  error?: string;
}

export interface UpdateResult {
  success: boolean;
  error?: string;
}

export interface Config {
  gamePath: string;
  version: string;
}

export interface ProgressData {
  status: string;
  percent: number;
}

export type AppState =
  | 'INITIALIZING'
  | 'UPDATE_AVAILABLE'
  | 'UP_TO_DATE'
  | 'UPDATING'
  | 'ERROR'
  | 'GAME_RUNNING_ERROR'
  | 'SUCCESS';

// Mock API for development (when not running in Electron)
export const createMockApi = () => ({
  minimize: () => console.log('Mock: minimize'),
  close: () => console.log('Mock: close'),
  checkUpdate: async (): Promise<UpdateCheckResult> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      available: true,
      localVersion: '1.0.0',
      remoteVersion: '1.1.0',
      news: `## Novidades da Versão 1.1.0\n\n- Novos mods adicionados ao pack\n- Correções de bugs\n- Melhorias de performance\n- Novos biomas e estruturas\n\n### Mods Atualizados\n- Mod A: v2.0 → v2.1\n- Mod B: v1.5 → v1.6\n- Mod C: v3.0 → v3.2`,
    };
  },
  startUpdate: async (): Promise<UpdateResult> => {
    return { success: true };
  },
  getConfig: async (): Promise<Config> => {
    return { gamePath: 'C:\\Games\\VintageStory', version: '1.0.0' };
  },
  selectFolder: async (): Promise<string | null> => {
    return 'C:\\Games\\VintageStory';
  },
  onProgress: (callback: (data: ProgressData) => void) => {
    // Simulate progress for development
    let percent = 0;
    const statuses = [
      'Verificando arquivos...',
      'Baixando atualizações...',
      'Extraindo arquivos...',
      'Aplicando patches...',
      'Finalizando...',
    ];

    const interval = setInterval(() => {
      percent += Math.random() * 15;
      if (percent >= 100) {
        percent = 100;
        clearInterval(interval);
        callback({ status: 'Atualização completa!', percent: 100 });
      } else {
        const statusIndex = Math.floor((percent / 100) * statuses.length);
        callback({
          status: `${statuses[Math.min(statusIndex, statuses.length - 1)]} ${Math.round(percent)}%`,
          percent
        });
      }
    }, 500);

    return () => clearInterval(interval);
  },
});

// Get the API (real or mock)
export const getApi = () => {
  if (typeof window !== 'undefined' && (window as any).api) {
    return (window as any).api;
  }
  // ⚠️ CRITICAL DEBUG: If we are here in the built app, something is wrong.
  console.warn("⚠️ API not found! Falling back to Mock API.");
  return createMockApi();
};
