import { useEffect, useState } from 'react';
import { Home, ChartBarBig, Headphones, Sparkles, Camera, Wand2, Radio, X, Mic2, Settings, Contact } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/* View-specific accent colors */
const ITEM_COLORS = {
  Charts:              '#ffd166',
  Platforms:           '#1DB954',
  Artists:             '#8a88ff',
  HeavyHitters:        '#aa63ff',
  CuratorPicks:        '#ff3366',
  TiktokerPicks:       '#ff0050',
  DigitalHitsForRadio: '#00e5ff',
};

const Sidebar = ({ isOpen, onClose, activeView, setActiveView, onLoginClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  /* Trigger stagger animation when sidebar opens */
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setMounted(true), 40);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  /* Lock body scroll when open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleItemClick = (view, path = '/') => {
    if (!user) {
      if (location.pathname === '/' && activeView !== view) { onLoginClick(); return; }
      if (location.pathname !== '/') { onLoginClick(); return; }
    }
    setActiveView(view);
    handleNavigate(path);
  };

  const handleLinkClick = (path) => {
    if (!user) { onLoginClick(); return; }
    handleNavigate(path);
  };

  const navItems = [
    ...(user?.role === 'ARTIST' ? [{
      icon: Mic2,
      label: (user.allowedArtistName || 'MI ARTISTA').toUpperCase(),
      active: location.pathname === '/my-artist',
      onClick: () => handleLinkClick('/my-artist'),
      isVIP: true,
      color: '#ffd166',
    }] : []),
    { icon: Home,         label: 'Charts',                  active: location.pathname === '/' && activeView === 'Charts',              onClick: () => handleItemClick('Charts'),              color: ITEM_COLORS.Charts },
    { icon: ChartBarBig,  label: 'Platforms',               active: activeView === 'Platforms',                                        onClick: () => handleItemClick('Platforms'),           color: ITEM_COLORS.Platforms },
    { icon: Headphones,   label: 'Artists Analytics',       active: activeView === 'Artists',                                          onClick: () => handleItemClick('Artists'),             color: ITEM_COLORS.Artists },
    { icon: Sparkles,     label: 'Heavy Hitters',           active: activeView === 'HeavyHitters',                                     onClick: () => handleItemClick('HeavyHitters'),        color: ITEM_COLORS.HeavyHitters },
    { icon: Camera,       label: 'Curator Picks',           active: activeView === 'CuratorPicks',                                     onClick: () => handleItemClick('CuratorPicks'),        color: ITEM_COLORS.CuratorPicks },
    { icon: Wand2,        label: 'Tiktoker Picks',          active: activeView === 'TiktokerPicks',                                    onClick: () => handleItemClick('TiktokerPicks'),       color: ITEM_COLORS.TiktokerPicks },
    { icon: Radio,        label: 'Digital Hits for Radio',  active: activeView === 'DigitalHitsForRadio',                              onClick: () => handleItemClick('DigitalHitsForRadio'), color: ITEM_COLORS.DigitalHitsForRadio },
    ...(user?.role === 'ADMIN' ? [
      {
        icon: Settings,
        label: 'Panel Admin',
        active: location.pathname === '/admin',
        onClick: () => handleLinkClick('/admin'),
        color: '#94a3b8',
      },
      {
        icon: Contact,
        label: 'TikTokers',
        active: location.pathname === '/tiktokers',
        onClick: () => handleLinkClick('/tiktokers'),
        color: '#ff0050',
      }
    ] : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 150,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Sidebar Panel */}
      <aside
        className="sidebar-drawer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          zIndex: 160,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(10, 10, 18, 0.97)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: isOpen ? '8px 0 40px rgba(0,0,0,0.6), 2px 0 0 rgba(138,136,255,0.08)' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Purple accent gradient at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'radial-gradient(ellipse at 30% 0%, rgba(138,136,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Pink accent at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '150px',
          background: 'radial-gradient(ellipse at 70% 100%, rgba(255,158,238,0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '1.5rem 1.25rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <img
            src="/logo.png"
            alt="DigitalLatino"
            style={{
              height: '30px',
              objectFit: 'contain',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateX(0)' : 'translateX(-8px)',
              transition: 'opacity 0.4s ease 0.1s, transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s',
            }}
          />
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: '8px',
              transition: 'color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Nav */}
        <nav
          style={{
            position: 'relative',
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
          }}
        >
          <p style={{
            fontSize: '0.62rem',
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            fontWeight: 700,
            padding: '0 0.5rem',
            marginBottom: '0.5rem',
          }}>
            Navegación
          </p>

          {navItems.map((item, i) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={item.active}
              onClick={item.onClick}
              isVIP={item.isVIP}
              color={item.color}
              animationDelay={mounted ? i * 0.045 : 0}
              mounted={mounted}
            />
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          position: 'relative',
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#1DB954',
            boxShadow: '0 0 6px #1DB954',
          }} />
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            fontWeight: 500,
          }}>
            Digital Latino — Estadísticas
          </span>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, isVIP, color = '#8a88ff', animationDelay, mounted }) => {
  const [hovered, setHovered] = useState(false);

  const accentColor = isVIP ? '#ffd166' : color;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.65rem 0.85rem',
        borderRadius: '10px',
        background: active
          ? `${accentColor}18`
          : hovered
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        color: active
          ? accentColor
          : hovered
            ? 'var(--text-main)'
            : 'var(--text-muted)',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.9rem',
        fontWeight: active ? 600 : 400,
        border: active
          ? `1px solid ${accentColor}28`
          : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
        transitionDelay: `${animationDelay}s`,
        letterSpacing: isVIP ? '0.03em' : '0',
      }}
    >
      {/* Active indicator bar */}
      <span style={{
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: '3px',
        borderRadius: '0 3px 3px 0',
        background: `linear-gradient(180deg, ${accentColor}, ${accentColor}80)`,
        opacity: active ? 1 : 0,
        transform: active ? 'scaleY(1)' : 'scaleY(0)',
        transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'center',
      }} />

      {/* Icon with color */}
      <Icon
        size={18}
        strokeWidth={active ? 2 : 1.75}
        style={{
          color: active ? accentColor : hovered ? 'var(--text-main)' : 'var(--text-muted)',
          transition: 'color 0.22s ease',
          flexShrink: 0,
        }}
      />

      {/* Label */}
      <span style={{ flex: 1, lineHeight: 1.3 }}>{label}</span>

      {/* VIP badge */}
      {isVIP && (
        <span style={{
          fontSize: '0.55rem',
          fontWeight: 700,
          letterSpacing: '0.8px',
          color: '#ffd166',
          background: 'rgba(255,209,102,0.12)',
          border: '1px solid rgba(255,209,102,0.25)',
          padding: '0.15rem 0.4rem',
          borderRadius: '4px',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          VIP
        </span>
      )}

      {/* Active glow dot */}
      {active && (
        <span
          className="glow-pulse"
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: accentColor,
            color: accentColor,
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
};

export default Sidebar;
