import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon = null,
  trend = null, // e.g., '+12%', 'up'
  color = 'blue', // 'blue' | 'green' | 'orange' | 'purple' | 'neutral'
  className = '',
  onClick = null
}) => {
  const colorMap = {
    blue: 'text-[#315bdc]',
    green: 'text-[#15966b]',
    orange: 'text-[#c97817]',
    purple: 'text-[#8b5cf6]',
    neutral: 'text-[#172033]'
  };

  const bgIconMap = {
    blue: 'bg-[#edf2ff] text-[#315bdc]',
    green: 'bg-[#e7f7f0] text-[#15966b]',
    orange: 'bg-[#fff4e6] text-[#c97817]',
    purple: 'bg-[#f3e8ff] text-[#8b5cf6]',
    neutral: 'bg-[#f1f4fa] text-[#68738a]'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#e6eaf2] rounded-2xl p-5 shadow-[0_4px_18px_rgba(31,45,75,0.04)] hover:shadow-[0_6px_20px_rgba(31,45,75,0.07)] hover:border-[#cbd5e6] transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#68738a]">
          {title}
        </div>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${bgIconMap[color] || bgIconMap.blue}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className={`text-2xl md:text-3xl font-extrabold tracking-tight my-1 ${colorMap[color] || colorMap.neutral}`}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-[#68738a] mt-1 font-medium">
          {trend && (
            <span className={trend.startsWith('+') || trend.includes('up') ? 'text-[#15966b] font-bold' : 'text-[#dc2626] font-bold'}>
              {trend}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
