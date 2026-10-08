import React from 'react';

const Toast = ({
  message,
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  onClose,
  show = false
}) => {
  if (!show) return null;

  const typeConfig = {
    success: { bg: 'bg-[#15966b]', icon: '✓', text: 'text-white' },
    error: { bg: 'bg-[#dc2626]', icon: '✕', text: 'text-white' },
    warning: { bg: 'bg-[#c97817]', icon: '⚠', text: 'text-white' },
    info: { bg: 'bg-[#172654]', icon: 'ℹ', text: 'text-white' }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-fadeIn bg-white border border-[#e6eaf2]">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${config.bg} ${config.text}`}>
        {config.icon}
      </div>
      <span className="text-sm font-medium text-[#172033]">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-[#68738a] hover:text-[#172033] text-sm font-bold p-1"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
