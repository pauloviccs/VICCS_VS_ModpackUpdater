import { AlertTriangle, XCircle, Gamepad2 } from 'lucide-react';

interface ErrorDisplayProps {
  type: 'error' | 'game_running';
  message: string;
}

const ErrorDisplay = ({ type, message }: ErrorDisplayProps) => {
  const isGameRunning = type === 'game_running';
  
  return (
    <div className="glass-subtle rounded-lg p-4 fade-in border-destructive/30 border">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          {isGameRunning ? (
            <Gamepad2 size={24} className="text-destructive" />
          ) : (
            <XCircle size={24} className="text-destructive" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-display text-destructive mb-1">
            {isGameRunning ? 'Jogo em Execução' : 'Erro'}
          </h4>
          <p className="text-sm text-muted-foreground">
            {isGameRunning 
              ? 'Por favor, feche o Vintage Story antes de atualizar.'
              : message
            }
          </p>
        </div>
        
        <AlertTriangle size={20} className="text-destructive/50" />
      </div>
    </div>
  );
};

export default ErrorDisplay;
