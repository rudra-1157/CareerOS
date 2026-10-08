import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon = '📂',
  title = 'No records found',
  description = 'There is currently no data available for this section.',
  actionText = null,
  onAction = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-[#f8f9fc] border border-dashed border-[#d5dbe7] rounded-2xl ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-4 border border-[#e5e9f1]">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#172033] mb-1">{title}</h3>
      <p className="text-sm text-[#68738a] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
