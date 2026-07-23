import React, { createContext, useContext, useCallback, useState } from 'react';
import '../components/Toast.css';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const toast = {
    success: (msg, duration) => push(msg, 'success', duration),
    error: (msg, duration) => push(msg, 'error', duration),
    warning: (msg, duration) => push(msg, 'warning', duration),
    info: (msg, duration) => push(msg, 'info', duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type} slide-up`}>
            <span className="toast-icon" aria-hidden="true">
              {t.type === 'success' && '✓'}
              {t.type === 'error' && '✕'}
              {t.type === 'warning' && '!'}
              {t.type === 'info' && 'i'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => remove(t.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
