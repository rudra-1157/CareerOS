import React from 'react';

const Card = ({
  children,
  title = null,
  subtitle = null,
  action = null,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  padding = 'p-5 md:p-6',
  hover = false,
  onClick = null,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--color-card-bg)] text-[var(--color-text-main)] border border-[var(--color-card-border)] rounded-xl shadow-subtle transition-all duration-150 ${
        hover ? 'hover:border-[var(--color-primary-accent)] hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-card-border)] px-5 pt-5 md:px-6 md:pt-6 ${headerClassName}`}>
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[var(--color-text-main)] tracking-tight m-0">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 m-0 font-normal leading-relaxed opacity-85">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}
      <div className={`${(title || subtitle || action) ? 'px-5 pb-5 md:px-6 md:pb-6' : padding} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
