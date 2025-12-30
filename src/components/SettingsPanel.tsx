import { useState, useEffect } from 'react';
import { FolderOpen, Settings, X } from 'lucide-react';
import { getApi, Config } from '@/types/api';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const [config, setConfig] = useState<Config | null>(null);
  const api = getApi();

  useEffect(() => {
    const loadConfig = async () => {
      const result = await api.getConfig();
      setConfig(result);
    };
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const handleSelectFolder = async () => {
    const newPath = await api.selectFolder();
    if (newPath) {
      setConfig(prev => prev ? { ...prev, gamePath: newPath } : null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm fade-in">
      <div className="glass-panel rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            <h3 className="font-display text-lg">Configurações</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Diretório do Jogo
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-muted-foreground truncate border border-border/50">
                {config?.gamePath || 'Carregando...'}
              </div>
              <button
                onClick={handleSelectFolder}
                className="btn-secondary p-2 rounded-lg"
                title="Alterar diretório"
              >
                <FolderOpen size={18} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Versão do Modpack
            </label>
            <div className="bg-secondary rounded-lg px-3 py-2 text-sm font-mono text-foreground border border-border/50">
              v{config?.version || '...'}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-border/50">
          <button
            onClick={onClose}
            className="w-full btn-primary py-2 rounded-lg font-display"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
