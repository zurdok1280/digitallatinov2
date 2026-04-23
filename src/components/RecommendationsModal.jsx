import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Music2, MessageCircle, Rocket, Sparkles, Star } from 'lucide-react';

/* ─── WhatsApp link (same as legacy component) ─────────────────────────── */
const buildWhatsappUrl = (songName) =>
  `https://wa.me/13104699872?text=Estoy%20interesado%20en%20hacer%20una%20campaña%20personalizada%20para%20${
    songName
      ? encodeURIComponent(`la canción "${songName}"`)
      : 'mi música'
  }.`;

/* ─── Campaign cards data ───────────────────────────────────────────────── */
const CAMPAIGNS = [
  {
    icon: null,
    imgSrc: '/logos/spotify-icon.png',
    platform: 'Playlists',
    benefit: 'Crecimiento orgánico garantizado',
    metric: '+Streams',
    gradient: 'linear-gradient(135deg, #1a3a24, #0a2016)',
    accentColor: '#1DB954',
    glow: 'rgba(29,185,84,0.25)',
  },
  {
    icon: null,
    imgSrc: '/logos/tiktok-icon.png',
    platform: 'TikTok',
    benefit: 'Alcance viral masivo',
    metric: '150K+ personas',
    gradient: 'linear-gradient(135deg, #2d0a1a, #1a0510)',
    accentColor: '#ff0050',
    glow: 'rgba(255,0,80,0.25)',
  },
  {
    icon: null,
    imgSrc: '/logos/instagram-icon.svg',
    platform: 'Instagram',
    benefit: 'Exposición en Reels y Stories',
    metric: '200K+ cuentas',
    gradient: 'linear-gradient(135deg, #2a0a2e, #150618)',
    accentColor: '#E1306C',
    glow: 'rgba(225,48,108,0.25)',
  },
  {
    icon: null,
    imgSrc: '/logos/facebook-icon.svg',
    platform: 'Facebook',
    benefit: 'Alcance directo en la plataforma',
    metric: '120K+ cuentas',
    gradient: 'linear-gradient(135deg, #091b2e, #040e1e)',
    accentColor: '#1877F2',
    glow: 'rgba(24,119,242,0.25)',
  },
];

/* ─── Single Campaign Card ──────────────────────────────────────────────── */
const CampaignCard = ({ icon: Icon, imgSrc, platform, benefit, metric, gradient, accentColor, glow }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: gradient,
        border: `1px solid ${accentColor}33`,
        borderRadius: '20px',
        padding: '1.8rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.8rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 20px 40px ${glow}, 0 0 0 1px ${accentColor}55` : `0 4px 12px rgba(0,0,0,0.3)`,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow orb behind icon */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
        opacity: hovered ? 1 : 0.6,
      }} />

      {/* Icon area */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: `${accentColor}18`,
        border: `1.5px solid ${accentColor}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
        transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {imgSrc ? (
          <img src={imgSrc} alt={platform} style={{ width: 32, height: 32, objectFit: 'contain' }} />
        ) : Icon ? (
          <Icon size={28} color={accentColor} />
        ) : null}
      </div>

      <div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          {platform}
        </h3>
        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
          {benefit}
        </p>
      </div>

      <div style={{
        fontSize: '1.4rem',
        fontWeight: 900,
        color: accentColor,
        textShadow: `0 0 20px ${accentColor}88`,
        letterSpacing: '-0.5px',
      }}>
        {metric}
      </div>
    </div>
  );
};

/* ─── Promo Banner (trigger) ────────────────────────────────────────────── */
export const RecommendationsBanner = ({ songName, csSong, spotifyId, onOpen }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        marginTop: '2rem',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(138,136,255,0.12) 0%, rgba(193,147,255,0.08) 50%, rgba(255,183,0,0.06) 100%)',
        border: '1px solid rgba(138,136,255,0.25)',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.01)' : 'scale(1)',
        boxShadow: hovered
          ? '0 16px 40px rgba(138,136,255,0.2), 0 0 0 1px rgba(138,136,255,0.4)'
          : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      {/* Background animated glow */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        right: '-5%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(138,136,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'pulse 3s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes reco-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes reco-shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
      `}</style>

      {/* Left: icon + text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '15px',
          background: 'linear-gradient(135deg, #8a88ff, #c193ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 8px 16px rgba(138,136,255,0.4)',
          animation: 'reco-pulse 3s ease-in-out infinite',
        }}>
          <Rocket size={24} color="white" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: '0.72rem',
            color: 'var(--accent-primary)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '0.3rem',
          }}>
            ✦ Impulsa tu Música
          </p>
          <h4 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            ¿Quieres llevar esta canción a nuevos lugares?
          </h4>
          <p style={{
            margin: '0.2rem 0 0 0',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            Conoce las recomendaciones para impulsar tu presencia digital
          </p>
        </div>
      </div>

      {/* Right: CTA button */}
      <button
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        style={{
          background: 'linear-gradient(135deg, #8a88ff, #c193ff)',
          border: 'none',
          borderRadius: '14px',
          padding: '0.75rem 1.6rem',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexShrink: 0,
          boxShadow: '0 8px 20px rgba(138,136,255,0.4)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Shimmer effect on button */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: 'reco-shimmer 2s infinite',
          pointerEvents: 'none',
        }} />
        <Sparkles size={16} />
        Ver Recomendaciones
      </button>
    </div>
  );
};

/* ─── Main Recommendations Modal ────────────────────────────────────────── */
const RecommendationsModal = ({ isOpen, onClose, songName, songImage, spotifyId, csSong }) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure portal target exists (SSR-safe)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleContactExpert = () => {
    window.open(buildWhatsappUrl(songName), '_blank');
  };

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(1140px, 95vw)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-dark, #0a0a0f)',
          border: '1px solid rgba(138,136,255,0.2)',
          borderRadius: '28px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(138,136,255,0.1)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(20px)',
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(138,136,255,0.3) transparent',
        }}
      >
        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          padding: '3rem 3rem 2rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          {/* Background glow blobs */}
          <div style={{
            position: 'absolute', top: '-40px', left: '10%',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(138,136,255,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '-20px', right: '15%',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(193,147,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <X size={18} />
          </button>

          {/* Song cover / Icon badge */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.4rem' }}>
            {/* Outer glow ring */}
            <div style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '26px',
              background: 'linear-gradient(135deg, #8a88ff, #c193ff, #ff0050)',
              opacity: 0.7,
              filter: 'blur(8px)',
              zIndex: 0,
            }} />
            {/* Inner ring border */}
            <div style={{
              position: 'relative',
              padding: '3px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #8a88ff, #c193ff)',
              zIndex: 1,
            }}>
              {songImage ? (
                <img
                  src={songImage}
                  alt={songName || 'Canción'}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '18px',
                    objectFit: 'cover',
                    display: 'block',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              {/* Fallback icon shown when no image or image errors */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(138,136,255,0.25), rgba(193,147,255,0.15))',
                display: songImage ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Music2 size={40} color="#c193ff" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #fff 0%, #c193ff 60%, #8a88ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}>
            Plan de Acción Recomendado
          </h1>

          {songName && (
            <div style={{
              marginTop: '0.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(138,136,255,0.1)',
              border: '1px solid rgba(138,136,255,0.2)',
              borderRadius: '30px',
              padding: '0.3rem 1rem',
            }}>
              <Star size={12} color="#c193ff" />
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {songName}
              </span>
            </div>
          )}

          <p style={{
            marginTop: '1rem',
            marginBottom: 0,
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '480px',
            margin: '1rem auto 0',
            lineHeight: 1.6,
          }}>
            Estrategias clave para impulsar tu música y alcanzar nuevas audiencias
          </p>
        </div>

        {/* ── Divider ─────────────────────────────────────────────── */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(138,136,255,0.3), transparent)',
          margin: '0 2rem',
        }} />

        {/* ── Campaign Cards Grid ──────────────────────────────────── */}
        <div style={{ padding: '2rem 2.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '1rem',
          }}>
            {CAMPAIGNS.map((c, i) => (
              <CampaignCard key={i} {...c} />
            ))}
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────── */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(138,136,255,0.3), transparent)',
          margin: '0 2rem',
        }} />

        {/* ── CTA Section ─────────────────────────────────────────── */}
        <div style={{
          padding: '2.5rem 2.5rem 3rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Bottom glow */}
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p style={{
            margin: '0 auto 0.5rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#fff',
            maxWidth: '400px',
          }}>
            ¿Listo para impulsar tu música?
          </p>
          <p style={{
            margin: '0 auto 1.8rem',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '400px',
            lineHeight: 1.5,
          }}>
            Nuestros expertos crearán una campaña personalizada para llevar tu canción al siguiente nivel.
          </p>

          {/* WhatsApp CTA Button */}
          <button
            onClick={handleContactExpert}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.7rem',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              border: 'none',
              borderRadius: '50px',
              padding: '1rem 2.5rem',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(37,211,102,0.35)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              letterSpacing: '0.2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
              e.currentTarget.style.boxShadow = '0 18px 40px rgba(37,211,102,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,211,102,0.35)';
            }}
          >
            <MessageCircle size={22} />
            Contacta un Asesor
          </button>

          <p style={{
            marginTop: '1rem',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.3)',
          }}>
            Respuesta garantizada en menos de 24 horas
          </p>
        </div>
      </div>
    </div>
  );

  // ✅ Portal: renders directly into document.body, escaping all parent stacking contexts
  return ReactDOM.createPortal(modalContent, document.body);
};

export default RecommendationsModal;

