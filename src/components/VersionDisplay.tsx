import { ArrowRight } from 'lucide-react';

interface VersionDisplayProps {
  localVersion: string;
  remoteVersion?: string;
  showArrow?: boolean;
}

const VersionDisplay = ({ localVersion, remoteVersion, showArrow = false }: VersionDisplayProps) => {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Versão Atual:</span>
        <span className="font-mono text-foreground bg-secondary px-2 py-0.5 rounded">
          v{localVersion}
        </span>
      </div>
      
      {showArrow && remoteVersion && (
        <>
          <ArrowRight size={16} className="text-primary" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
              v{remoteVersion}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default VersionDisplay;
