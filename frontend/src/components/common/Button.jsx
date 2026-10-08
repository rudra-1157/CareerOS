import React from 'react';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#315bdc] hover:bg-[#2547b7] text-white shadow-sm hover:shadow-md focus:ring-[#315bdc]/40',
    secondary: 'bg-[#edf2ff] hover:bg-[#dbe6ff] text-[#315bdc] font-semibold focus:ring-[#315bdc]/20',
    outline: 'border border-[#d9deea] bg-white hover:bg-[#f8f9fc] text-[#172033] hover:border-[#b8c2d8] focus:ring-[#315bdc]/20',
    danger: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white focus:ring-red-500/40',
    success: 'bg-[#15966b] hover:bg-[#107856] text-white focus:ring-emerald-500/40',
    ghost: 'bg-transparent hover:bg-[#edf2ff] text-[#68738a] hover:text-[#315bdc] focus:ring-[#315bdc]/20'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
