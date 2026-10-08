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
      className={`bg-white border border-[#e6eaf2] rounded-2xl shadow-[0_4px_18px_rgba(31,45,75,0.04)] ${
        hover ? 'hover:shadow-[0_8px_24px_rgba(31,45,75,0.08)] hover:border-[#ccd6e8] transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between pb-4 mb-4 border-b border-[#edf0f5] px-5 pt-5 md:px-6 md:pt-6 ${headerClassName}`}>
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-bold text-[#172033] tracking-tight m-0">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm text-[#68738a] mt-0.5 m-0 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`${(title || subtitle || action) ? 'px-5 pb-5 md:px-6 md:pb-6' : padding} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
