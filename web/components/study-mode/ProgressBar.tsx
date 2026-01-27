'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  primary: 'bg-primary',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

export default function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  color = 'primary',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5 text-sm">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="text-gray-500">
              {current}/{total} ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
