import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon = null,
  trend = null,
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'indigo' | 'neutral'
  className = '',
  onClick = null
}) => {
  const colorMap = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    orange: 'text-amber-600 dark:text-amber-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    purple: 'text-indigo-600 dark:text-indigo-400',
    neutral: 'text-slate-900 dark:text-slate-100'
  };

  const bgIconMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60',
    green: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60',
    orange: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60',
    purple: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card dark:shadow-card-dark transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgIconMap[color] || bgIconMap.blue}`}>
            {typeof Icon === 'function' || typeof Icon === 'object' ? (
              React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4" />
            ) : (
              <span className="text-xs">{Icon}</span>
            )}
          </div>
        )}
      </div>

      <div className={`text-2xl font-bold tracking-tight mb-1 ${colorMap[color] || colorMap.neutral}`}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
          {trend && (
            <span className={`font-semibold ${trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend}
            </span>
          )}
          <span className="truncate">{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
