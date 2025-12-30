import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Download, Wrench, RotateCcw } from 'lucide-react';
import TitleBar from '@/components/TitleBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressBar from '@/components/ProgressBar';
import StatusBadge from '@/components/StatusBadge';
import ActionButton from '@/components/ActionButton';
import ReleaseNotes from '@/components/ReleaseNotes';
import VersionDisplay from '@/components/VersionDisplay';
import ErrorDisplay from '@/components/ErrorDisplay';
import SettingsPanel from '@/components/SettingsPanel';
import SuccessDisplay from '@/components/SuccessDisplay';
import { useUpdater } from '@/hooks/useUpdater';

import bg0 from '@/assets/backgrounds/0.png';
import bg1 from '@/assets/backgrounds/1.png';
import bg2 from '@/assets/backgrounds/2.png';
import bg3 from '@/assets/backgrounds/3.png';
import bg4 from '@/assets/backgrounds/4.png';
import bg5 from '@/assets/backgrounds/5.png';
import bg6 from '@/assets/backgrounds/6.png';
import bg7 from '@/assets/backgrounds/7.png';

const backgroundImages = [
  bg0, bg1, bg2, bg3, bg4, bg5, bg6, bg7
];

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    appState,
    localVersion,
    remoteVersion,
    news,
    error,
    progress,
    startUpdate,
    retry,
    checkUpdate
  } = useUpdater();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case 'INITIALIZING':
        return (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        );

      case 'UPDATE_AVAILABLE':
        return (
          <div className="flex-1 flex flex-col gap-4 fade-in">
            <div className="flex items-center justify-between">
              <StatusBadge type="warning">Atualização Disponível</StatusBadge>
              <VersionDisplay
                localVersion={localVersion}
                remoteVersion={remoteVersion}
                showArrow
              />
            </div>

            <ReleaseNotes notes={news} />

            <div className="flex justify-center pt-2">
              <ActionButton
                onClick={startUpdate}
                icon={<Download size={18} />}
              >
                Atualizar Agora
              </ActionButton>
            </div>
          </div>
        );

      case 'UP_TO_DATE':
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 fade-in">
            <StatusBadge type="success">Atualizado</StatusBadge>

            <div className="text-center">
              <h2 className="text-2xl font-display text-foreground mb-2">
                Tudo Pronto!
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Seu modpack está na versão mais recente. Divirta-se!
              </p>
            </div>

            <VersionDisplay localVersion={localVersion} />

            <div className="flex gap-3 pt-2">
              <ActionButton
                onClick={startUpdate}
                variant="secondary"
                icon={<Wrench size={18} />}
              >
                Reparar
              </ActionButton>
              <ActionButton
                onClick={checkUpdate}
                variant="secondary"
                icon={<RefreshCw size={18} />}
              >
                Verificar
              </ActionButton>
            </div>
          </div>
        );

      case 'UPDATING':
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 fade-in px-4">
            <LoadingSpinner message="Atualizando modpack..." />
            <div className="w-full max-w-md">
              <ProgressBar percent={progress.percent} status={progress.status} />
            </div>
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 fade-in">
            <SuccessDisplay />
            <ActionButton
              onClick={checkUpdate}
              variant="secondary"
              icon={<RefreshCw size={18} />}
            >
              Verificar Novamente
            </ActionButton>
          </div>
        );

      case 'ERROR':
      case 'GAME_RUNNING_ERROR':
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 fade-in px-4">
            <ErrorDisplay
              type={appState === 'GAME_RUNNING_ERROR' ? 'game_running' : 'error'}
              message={error}
            />
            <ActionButton
              onClick={retry}
              icon={<RotateCcw size={18} />}
            >
              Tentar Novamente
            </ActionButton>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0 bg-black">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-40' : 'opacity-0'
              }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <TitleBar />

        <main className="flex-1 flex flex-col p-6 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display text-primary tracking-wide">
                TarValon
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Modpack para Vintage Story
              </p>
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-secondary/80 rounded-lg transition-colors group"
              aria-label="Configurações"
            >
              <Settings
                size={20}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 glass-panel rounded-xl p-4 flex flex-col min-h-0">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 text-center border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Design by VICCS 2025 ©
          </p>
        </footer>
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default Index;
