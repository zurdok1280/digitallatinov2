import React, { useEffect } from 'react';
import { Database, Search } from 'lucide-react';

const DataUnavailableModal = ({ item, onClose }) => {
  // Manejar Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div 
      className="flex-center" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.7)', 
        backdropFilter: 'blur(12px)', 
        zIndex: 10000, 
        padding: '1rem',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes pulse-bounce {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-10px) scale(1.05); opacity: 1; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-glass-container {
          background: rgba(30, 30, 40, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5), 0 0 40px rgba(138, 136, 255, 0.15);
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .animated-icon-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .animated-icon-database {
          color: #c193ff;
          animation: pulse-bounce 2s infinite ease-in-out;
        }
        .animated-icon-search {
          position: absolute;
          bottom: -5px;
          right: -5px;
          color: #ff9eee;
          background: #1e1e28;
          border-radius: 50%;
          padding: 4px;
          animation: rotate-slow 8s linear infinite;
        }
        .btn-entendido {
          margin-top: 2rem;
          width: 100%;
          padding: 0.85rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #8a88ff 0%, #c193ff 100%);
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-entendido:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(138, 136, 255, 0.4);
        }
        .btn-entendido:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="modal-glass-container">
        <div className="animated-icon-container">
          <Database size={56} className="animated-icon-database" strokeWidth={1.5} />
          <div className="animated-icon-search">
            <Search size={24} strokeWidth={2.5} />
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.8rem', lineHeight: 1.2 }}>
          Recopilando Información
        </h2>
        
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          Esta información no está disponible actualmente en nuestra base de datos. Nos encargaremos de buscarla por ti, regresa en un par de horas. 
          <br /><br />
          <span style={{ fontWeight: 600, color: '#ff9eee' }}>¡Gracias por la paciencia!</span>
        </p>

        <button className="btn-entendido" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
};

export default DataUnavailableModal;
