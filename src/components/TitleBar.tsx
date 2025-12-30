import { Minus, X } from 'lucide-react';
import { getApi } from '@/types/api';

const TitleBar = () => {
  const api = getApi();

  return (
    <div className="title-bar border-b border-border/50">
      <div className="flex items-center gap-3 px-4">
        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-xs font-bold">VS</span>
        </div>
        <span className="text-sm font-display text-muted-foreground tracking-wider">
          TarValon Modpack Updater
        </span>
      </div>
      
      <div className="flex">
        <button
          onClick={() => api.minimize()}
          className="title-bar-button"
          aria-label="Minimizar"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => api.close()}
          className="title-bar-button close"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
