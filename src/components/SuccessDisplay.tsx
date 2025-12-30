import { CheckCircle2, Sparkles } from 'lucide-react';

const SuccessDisplay = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 fade-in py-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center gold-glow">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <Sparkles 
          size={20} 
          className="absolute -top-1 -right-1 text-primary animate-pulse" 
        />
      </div>
      
      <div className="text-center">
        <h3 className="font-display text-xl text-foreground mb-1">
          Atualização Completa!
        </h3>
        <p className="text-sm text-muted-foreground">
          Seu modpack está pronto para jogar.
        </p>
      </div>
    </div>
  );
};

export default SuccessDisplay;
