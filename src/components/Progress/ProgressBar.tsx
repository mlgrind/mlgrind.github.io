interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  size = 'md',
  showLabel = false
}: ProgressBarProps) {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-dark-700 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className="h-full bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-primary-400 min-w-[3rem] text-right">
          {progress}%
        </span>
      )}
    </div>
  );
}
