import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface ReleaseNotesProps {
  notes: string;
}

const ReleaseNotes = ({ notes }: ReleaseNotesProps) => {
  // Simple markdown-like parsing
  const parseNotes = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-display text-primary mb-3 mt-4 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-sm font-display text-foreground mb-2 mt-3">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="text-muted-foreground text-sm ml-4 mb-1">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="text-muted-foreground text-sm mb-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="glass-subtle rounded-lg overflow-hidden fade-in">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <FileText size={16} className="text-primary" />
        <span className="text-sm font-display text-foreground">Notas de Atualização</span>
      </div>
      
      <ScrollArea className="h-[180px]">
        <div className="p-4">
          {parseNotes(notes)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReleaseNotes;
