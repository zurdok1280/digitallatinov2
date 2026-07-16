import React from 'react';
import ReactDOM from 'react-dom';
import { X, Mail, Phone, MapPin, Globe, Edit2, Calendar } from 'lucide-react';
import ModalEditContacts from './ModalEditContacts'; // We'll conditionally use this or pass onEdit

export default function ContactPreviewModal({ isOpen, onClose, contact, type }) {
  const [isEditing, ReactSetIsEditing] = React.useState(false);

  if (!isOpen || !contact) {
    if (isEditing) ReactSetIsEditing(false);
    return null;
  }

  // Si contact es un CuratorSummaryDto (solo id y displayName), lo mostramos resumido
  const isFullContact = contact.hasOwnProperty('email') || contact.hasOwnProperty('country');

  if (isEditing) {
    return (
      <ModalEditContacts
        isOpen={true}
        onClose={() => { ReactSetIsEditing(false); onClose(); }}
        type={type}
        contactToEdit={contact}
      />
    );
  }
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Contactado': return 'rgba(29, 185, 84, 0.15)'; // Verde
      case 'Pendiente': return 'rgba(255, 170, 0, 0.15)'; // Naranja
      case 'Rechazado': return 'rgba(255, 60, 60, 0.15)'; // Rojo
      case 'En Negociación': return 'rgba(60, 150, 255, 0.15)'; // Azul
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getStatusTextColor = (status) => {
    switch(status) {
      case 'Contactado': return '#1db954';
      case 'Pendiente': return '#ffaa00';
      case 'Rechazado': return '#ff3c3c';
      case 'En Negociación': return '#3c96ff';
      default: return 'var(--text-muted)';
    }
  };

  // Custom Social Icons
  const TikTokIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.32 6.32 0 0 0 6.27 6.32 6.32 6.32 0 0 0 6.27-6.31V10a8.3 8.3 0 0 0 5.46 2.05V8.59a4.81 4.81 0 0 1-3.41-1.9z" />
    </svg>
  );

  const InstagramIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );

  const YoutubeIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  );

  const modalContent = (
    <div className="modal-overlay-anim" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }} onClick={onClose}>
      <div className="modal-drop-anim glass-panel" style={{
        width: '90%', maxWidth: '420px',
        background: 'var(--bg-dark)', border: '1px solid var(--glass-border)',
        borderRadius: '12px', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
              {type === 'tiktokers' ? 'TikToker' : 'Curador'}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {contact.name || contact.displayName}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {!isFullContact ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
              Información detallada no disponible. Por favor actualice el contacto o intente recargar.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Status & Last Contact */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{
                  background: getStatusColor(contact.status),
                  color: getStatusTextColor(contact.status),
                  padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
                }}>
                  {contact.status || 'Pendiente'}
                </div>
                {contact.lastContact && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Calendar size={14} /> Último: {contact.lastContact}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                {contact.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    <Mail size={16} color="var(--text-muted)" />
                    <a href={`mailto:${contact.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{contact.email}</a>
                  </div>
                )}
                {contact.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    <Phone size={16} color="var(--text-muted)" />
                    <a href={`tel:${contact.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{contact.phone}</a>
                  </div>
                )}
                {(contact.country || contact.language) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    <MapPin size={16} color="var(--text-muted)" />
                    <span>{[contact.country, contact.language].filter(Boolean).join(' • ')}</span>
                  </div>
                )}

              </div>

              {/* Social Media */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {contact.instagram?.url && (
                  <a href={contact.instagram.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.85rem' }}>
                    <InstagramIcon /> {contact.instagram.handle || 'Instagram'}
                  </a>
                )}
                {contact.tiktok?.url && (
                  <a href={contact.tiktok.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.85rem' }}>
                    <TikTokIcon /> {contact.tiktok.handle || 'TikTok'}
                  </a>
                )}
                {contact.youtube?.url && (
                  <a href={contact.youtube.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.85rem' }}>
                    <YoutubeIcon /> {contact.youtube.handle || 'YouTube'}
                  </a>
                )}
                {contact.facebook?.url && (
                  <a href={contact.facebook.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.85rem' }}>
                    <FacebookIcon /> {contact.facebook.handle || 'Facebook'}
                  </a>
                )}
              </div>

              {/* Notes */}
              {contact.notes && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>NOTAS</div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {contact.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem', borderTop: '1px solid var(--glass-border)',
          display: 'flex', justifyContent: 'space-between', gap: '1rem',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1.2rem', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
            Cerrar
          </button>
          <button onClick={() => ReactSetIsEditing(true)} className="btn-primary" style={{ padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <Edit2 size={14} /> Editar
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
