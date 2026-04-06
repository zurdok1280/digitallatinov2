import React from 'react';
import { useToast } from '../hooks/use-toast';
import './Toaster.css'; // Nuestros estilos independientes

export function Toaster() {
  const { toasts } = useToast();

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
        >
          {t.title && <h3 className="toast-title">{t.title}</h3>}
          {t.description && <p className="toast-description">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
