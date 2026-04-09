import React from 'react';
import { useToast } from '../hooks/use-toast';
import { X } from 'lucide-react';
import './Toaster.css'; // Nuestros estilos independientes

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toaster-container">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={`toast-item ${
            t.variant === 'destructive' 
              ? 'toast-error' 
              : 'toast-success'
          }`}
          style={{ position: 'relative', paddingRight: '2.5rem' }}
        >
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Cerrar notificación"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            <X size={18} />
          </button>
          {t.title && <h3 className="toast-title">{t.title}</h3>}
          {t.description && <p className="toast-description">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
