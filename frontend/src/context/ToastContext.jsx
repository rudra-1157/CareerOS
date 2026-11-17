import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const toast = { id, type, title, message };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container portal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : isWarning ? AlertTriangle : Info;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-fade-in text-xs"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-main)'
              }}
            >
              <div
                className="shrink-0 mt-0.5"
                style={{
                  color: isSuccess ? '#10B981' : isError ? '#EF4444' : isWarning ? '#F59E0B' : 'var(--color-primary-accent)'
                }}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-0.5">
                {toast.title && <strong className="font-bold block">{toast.title}</strong>}
                <p className="leading-relaxed text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded hover:bg-slate-500/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      addToast: ({ title, message }) => console.log(`[Toast]: ${title} - ${message}`),
      removeToast: () => {}
    };
  }
  return context;
};

export default ToastContext;