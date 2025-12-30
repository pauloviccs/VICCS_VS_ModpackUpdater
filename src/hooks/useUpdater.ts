import { useState, useEffect, useCallback } from 'react';
import { AppState, UpdateCheckResult, ProgressData, getApi } from '@/types/api';

interface UpdaterState {
  appState: AppState;
  localVersion: string;
  remoteVersion: string;
  news: string;
  error: string;
  progress: ProgressData;
}

export const useUpdater = () => {
  const [state, setState] = useState<UpdaterState>({
    appState: 'INITIALIZING',
    localVersion: '',
    remoteVersion: '',
    news: '',
    error: '',
    progress: { status: '', percent: 0 },
  });

  const api = getApi();

  const checkUpdate = useCallback(async () => {
    setState(prev => ({ ...prev, appState: 'INITIALIZING', error: '' }));
    
    try {
      const result: UpdateCheckResult = await api.checkUpdate();
      
      if (result.error) {
        setState(prev => ({
          ...prev,
          appState: 'ERROR',
          error: result.error || 'Erro desconhecido',
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        localVersion: result.localVersion,
        remoteVersion: result.remoteVersion,
        news: result.news,
        appState: result.available ? 'UPDATE_AVAILABLE' : 'UP_TO_DATE',
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        appState: 'ERROR',
        error: 'Falha ao verificar atualizações. Verifique sua conexão.',
      }));
    }
  }, [api]);

  const startUpdate = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      appState: 'UPDATING',
      progress: { status: 'Iniciando...', percent: 0 }
    }));

    try {
      const result = await api.startUpdate();
      
      if (!result.success) {
        if (result.error?.toLowerCase().includes('running') || 
            result.error?.toLowerCase().includes('executando')) {
          setState(prev => ({
            ...prev,
            appState: 'GAME_RUNNING_ERROR',
            error: result.error || 'O jogo está em execução',
          }));
        } else {
          setState(prev => ({
            ...prev,
            appState: 'ERROR',
            error: result.error || 'Falha na atualização',
          }));
        }
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        appState: 'ERROR',
        error: 'Erro durante a atualização',
      }));
    }
  }, [api]);

  const retry = useCallback(() => {
    checkUpdate();
  }, [checkUpdate]);

  // Setup progress listener
  useEffect(() => {
    const cleanup = api.onProgress?.((data: ProgressData) => {
      setState(prev => {
        // When progress reaches 100%, transition to SUCCESS state
        if (data.percent >= 100) {
          return {
            ...prev,
            progress: data,
            appState: 'SUCCESS',
          };
        }
        return {
          ...prev,
          progress: data,
        };
      });
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [api]);

  // Initial check on mount
  useEffect(() => {
    checkUpdate();
  }, []);

  return {
    ...state,
    checkUpdate,
    startUpdate,
    retry,
  };
};
