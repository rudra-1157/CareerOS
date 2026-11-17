import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'subtle'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none text-sm cursor-pointer';

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[var(--color-primary-accent)] hover:brightness-105 active:brightness-95 text-white shadow-sm focus:ring-[var(--color-primary-accent)]',
    secondary: 'bg-[var(--color-secondary-bg)] hover:brightness-95 text-[var(--color-text-main)] border border-[var(--color-card-border)] focus:ring-[var(--color-primary-accent)]',
    outline: 'border border-[var(--color-card-border)] bg-[var(--color-card-bg)] hover:bg-[var(--color-secondary-bg)] text-[var(--color-text-main)] focus:ring-[var(--color-primary-accent)] shadow-xs',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-[var(--color-secondary-bg)] text-[var(--color-text-main)] focus:ring-[var(--color-primary-accent)]',
    subtle: 'bg-[var(--color-badge-bg)] text-[var(--color-badge-text)] hover:brightness-95 border border-[var(--color-card-border)]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0 flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
