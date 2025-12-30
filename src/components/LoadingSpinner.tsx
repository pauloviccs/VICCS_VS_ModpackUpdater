import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = 'Verificando atualizações...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 fade-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-primary/20" />
        <Loader2 
          className="absolute inset-0 w-16 h-16 text-primary animate-spin" 
          strokeWidth={1.5}
        />
      </div>
      <p className="text-muted-foreground text-sm font-medium tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
