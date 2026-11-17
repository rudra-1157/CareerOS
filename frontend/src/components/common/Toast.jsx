import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({
  message,
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  onClose,
  show = false
}) => {
  if (!show) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      border: 'border-emerald-200 dark:border-emerald-800/60',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/40'
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
      border: 'border-red-200 dark:border-red-800/60',
      bg: 'bg-red-50/50 dark:bg-red-950/40'
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      border: 'border-amber-200 dark:border-amber-800/60',
      bg: 'bg-amber-50/50 dark:bg-amber-950/40'
    },
    info: {
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      border: 'border-blue-200 dark:border-blue-800/60',
      bg: 'bg-blue-50/50 dark:bg-blue-950/40'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-white dark:bg-slate-900 border ${config.border} max-w-md animate-fadeIn`}>
      <div className="shrink-0">{config.icon}</div>
      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;
