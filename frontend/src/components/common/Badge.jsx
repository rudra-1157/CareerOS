import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'blue'
  size = 'md', // 'sm' | 'md'
  icon = null,
  className = ''
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    danger: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
    info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };

  const sizeStyles = {
    sm: 'py-0.5 px-2 text-[11px] gap-1',
    md: 'py-1 px-2.5 text-xs gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-md border tracking-tight ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
