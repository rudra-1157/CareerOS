import React from 'react';

const ProgressBar = ({
  value = 0,
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'red'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = false,
  label = '',
  className = ''
}) => {
  const clampedValue = Math.min(100, Math.max(0, Number(value) || 0));

  const colorStyles = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    emerald: 'bg-emerald-600 dark:bg-emerald-500',
    green: 'bg-emerald-600 dark:bg-emerald-500',
    amber: 'bg-amber-500 dark:bg-amber-400',
    orange: 'bg-amber-500 dark:bg-amber-400',
    red: 'bg-red-600 dark:bg-red-500',
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          <span>{label}</span>
          <span className="font-semibold">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorStyles[color] || colorStyles.blue}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
