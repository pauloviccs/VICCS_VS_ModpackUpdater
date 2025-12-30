interface ProgressBarProps {
  percent: number;
  status: string;
}

const ProgressBar = ({ percent, status }: ProgressBarProps) => {
  return (
    <div className="w-full space-y-3 fade-in">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{status}</span>
        <span className="text-sm font-medium text-primary">{Math.round(percent)}%</span>
      </div>
      
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
