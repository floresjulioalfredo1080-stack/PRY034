import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// Contexto para las notificaciones
const ToastContext = createContext(null);

// Hook para usar el toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Proveedor del Toast
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-eliminar después del tiempo
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Métodos específicos para cada tipo
  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Contenedor de Toasts
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: 'min(400px, calc(100vw - 40px))'
    }}>
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Componente individual de Toast
function ToastItem({ toast, onClose }) {
  const { message, type } = toast;

  const config = {
    success: {
      icon: <CheckCircle size={22} />,
      bgColor: '#10B981',
      bgLight: '#D1FAE5',
      borderColor: '#34D399',
      textColor: '#065F46'
    },
    error: {
      icon: <AlertCircle size={22} />,
      bgColor: '#EF4444',
      bgLight: '#FEE2E2',
      borderColor: '#F87171',
      textColor: '#991B1B'
    },
    warning: {
      icon: <AlertTriangle size={22} />,
      bgColor: '#F59E0B',
      bgLight: '#FEF3C7',
      borderColor: '#FBBF24',
      textColor: '#92400E'
    },
    info: {
      icon: <Info size={22} />,
      bgColor: '#3B82F6',
      bgLight: '#DBEAFE',
      borderColor: '#60A5FA',
      textColor: '#1E40AF'
    }
  };

  const style = config[type] || config.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${style.bgColor}`,
        animation: 'slideIn 0.3s ease-out',
        minWidth: '280px'
      }}
    >
      {/* Icono */}
      <div style={{
        color: style.bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {style.icon}
      </div>

      {/* Mensaje */}
      <div style={{
        flex: 1,
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: '#2C3E50',
        fontWeight: '500',
        lineHeight: '1.4'
      }}>
        {message}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#9CA3AF',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          transition: 'all 0.2s',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F3F4F6';
          e.currentTarget.style.color = '#6B7280';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#9CA3AF';
        }}
      >
        <X size={18} />
      </button>

      {/* Estilos de animación */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

// Componente de confirmación (modal)
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning' // 'warning', 'danger', 'info'
}) {
  if (!isOpen) return null;

  const typeConfig = {
    warning: { color: '#F59E0B', icon: <AlertTriangle size={32} /> },
    danger: { color: '#EF4444', icon: <AlertCircle size={32} /> },
    info: { color: '#3B82F6', icon: <Info size={32} /> },
    success: { color: '#10B981', icon: <CheckCircle size={32} /> }
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '16px',
        padding: 'clamp(20px, 5vw, 30px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        zIndex: 9999,
        width: 'min(400px, calc(100vw - 40px))',
        animation: 'scaleIn 0.3s ease-out'
      }}>
        {/* Icono */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            background: `${config.color}15`,
            color: config.color,
            padding: '15px',
            borderRadius: '50%'
          }}>
            {config.icon}
          </div>
        </div>

        {/* Título */}
        <h3 style={{
          textAlign: 'center',
          color: '#2C3E50',
          margin: '0 0 10px 0',
          fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
          fontWeight: '700'
        }}>
          {title}
        </h3>

        {/* Mensaje */}
        {message && (
          <p style={{
            textAlign: 'center',
            color: '#666',
            margin: '0 0 25px 0',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
            lineHeight: '1.5'
          }}>
            {message}
          </p>
        )}

        {/* Botones */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '12px 24px',
              border: '2px solid #E5E7EB',
              background: 'white',
              borderRadius: '10px',
              color: '#6B7280',
              fontWeight: '600',
              fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '12px 24px',
              border: 'none',
              background: config.color,
              borderRadius: '10px',
              color: 'white',
              fontWeight: '600',
              fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 4px 12px ${config.color}40`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${config.color}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${config.color}40`;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}

export default ToastProvider;
