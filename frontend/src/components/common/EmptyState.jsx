import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There is currently no data available for this section.',
  actionText = null,
  onAction = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 border border-slate-200 dark:border-slate-700">
        {React.isValidElement(Icon) ? Icon : <Icon className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
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
