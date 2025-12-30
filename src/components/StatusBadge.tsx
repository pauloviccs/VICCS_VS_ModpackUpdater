import { CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface StatusBadgeProps {
  type: 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

const StatusBadge = ({ type, children }: StatusBadgeProps) => {
  const icons = {
    success: CheckCircle2,
    warning: Download,
    error: AlertCircle,
  };
  
  const Icon = icons[type];

  return (
    <div className={`status-badge ${type}`}>
      <Icon size={14} />
      <span>{children}</span>
    </div>
  );
};

export default StatusBadge;
