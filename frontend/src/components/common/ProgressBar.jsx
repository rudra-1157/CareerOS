import React from 'react';

const ProgressBar = ({
  value = 0, // 0 to 100
  color = 'blue', // 'blue' | 'green' | 'orange' | 'purple' | 'red'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = false,
  label = '',
  className = ''
}) => {
  const clampedValue = Math.min(100, Math.max(0, Number(value) || 0));

  const colorStyles = {
    blue: 'bg-[#315bdc]',
    green: 'bg-[#15966b]',
    orange: 'bg-[#c97817]',
    purple: 'bg-[#8b5cf6]',
    red: 'bg-[#dc2626]',
    gradient: 'bg-gradient-to-r from-[#172654] to-[#315bdc]'
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-[#172033] mb-1.5">
          <span>{label}</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-[#e9edf5] rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color] || colorStyles.blue}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
