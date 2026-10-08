import React from 'react';

export const Badge = ({
  children,
  variant = 'success', // 'success' | 'warning' | 'danger' | 'info' | 'blue' | 'neutral'
  size = 'md', // 'sm' | 'md'
  className = ''
}) => {
  const variantStyles = {
    success: 'bg-[#e7f7f0] text-[#11825c] border border-[#a3e0c7]',
    warning: 'bg-[#fff3df] text-[#a66512] border border-[#fbd38d]',
    danger: 'bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]',
    info: 'bg-[#edf2ff] text-[#315bdc] border border-[#d6e2ff]',
    blue: 'bg-[#edf2ff] text-[#315bdc] border border-[#d6e2ff]',
    neutral: 'bg-[#f1f4fa] text-[#475569] border border-[#e2e8f0]'
  };

  const sizeStyles = {
    sm: 'py-0.5 px-2 text-[10px]',
    md: 'py-1 px-2.5 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold tracking-wide ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {children}
    </span>
  );
};

export { default as Button } from './Button';
export default Badge;
