import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  icon?: ReactNode;
}

const ActionButton = ({ 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  children,
  icon
}: ActionButtonProps) => {
  const baseClasses = "px-8 py-3 rounded-lg font-display text-sm flex items-center justify-center gap-2 min-w-[180px]";
  const variantClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses}`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default ActionButton;
