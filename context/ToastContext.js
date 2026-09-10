import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  // type: 'info' | 'success' | 'error'
  const showToast = useCallback((message, type = 'info') => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 1000 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="card"
            role="status"
            style={{
              minWidth: 260,
              maxWidth: 360,
              borderColor: t.type === 'error' ? 'var(--red)' : t.type === 'success' ? 'var(--teal)' : 'var(--panel-line)',
              cursor: 'pointer',
            }}
            onClick={() => dismiss(t.id)}
          >
            <p style={{ fontSize: 13.5, margin: 0 }}>{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
