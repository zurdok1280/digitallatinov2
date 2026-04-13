import { Home, ChartBarBig, Headphones, Sparkles, Camera, Wand2, Radio, X, Mic2, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, activeView, setActiveView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          background: 'linear-gradient(180deg, var(--accent-primary) 0%, #aa63ff 100%)',
          color: 'white',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-normal)',
          boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
          </div>
          <button onClick={onClose} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '0 1.5rem', marginTop: '1rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1rem', fontWeight: 600 }}>Navegación</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {user?.role === 'ARTIST' && user?.allowedArtistId && (
              <SidebarItem 
                icon={Mic2} 
                label={(user.allowedArtistName || '').toUpperCase()} 
                active={location.pathname === '/my-artist'}
                onClick={() => handleNavigate('/my-artist')}
                isVIP={true}
              />
            )}
            <SidebarItem icon={Home} label="Charts" active={(location.pathname === '/' && (activeView === 'Charts' || !activeView))} onClick={() => { setActiveView('Charts'); handleNavigate('/'); }} />
            <SidebarItem icon={ChartBarBig} label="Platforms" active={activeView === 'Platforms'} onClick={() => { setActiveView('Platforms'); handleNavigate('/'); }} />
            <SidebarItem 
              icon={Headphones} 
              label="Artists Analytics" 
              active={activeView === 'Artists'} 
              onClick={() => { setActiveView('Artists'); handleNavigate('/'); }} 
            />
            <SidebarItem 
              icon={Sparkles} 
              label="Heavy Hitters" 
              active={activeView === 'HeavyHitters'} 
              onClick={() => { setActiveView('HeavyHitters'); handleNavigate('/'); }} 
            />
            <SidebarItem 
              icon={Camera} 
              label="Curator Picks" 
              active={activeView === 'CuratorPicks'} 
              onClick={() => { setActiveView('CuratorPicks'); handleNavigate('/'); }} 
            />
            <SidebarItem 
              icon={Wand2} 
              label="Tiktoker Picks" 
              active={activeView === 'TiktokerPicks'} 
              onClick={() => { setActiveView('TiktokerPicks'); handleNavigate('/'); }} 
            />
            <SidebarItem 
              icon={Radio} 
              label="Digital Hits for Radio" 
              active={activeView === 'DigitalHitsForRadio'} 
              onClick={() => { setActiveView('DigitalHitsForRadio'); handleNavigate('/'); }} 
            />
            {user?.role === 'ADMIN' && (
              <SidebarItem 
                icon={Settings} 
                label="Panel Admin" 
                active={location.pathname === '/admin'}
                onClick={() => handleNavigate('/admin')}
              />
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, isVIP }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.8rem 1rem',
      borderRadius: '8px',
      background: active ? (isVIP ? 'rgba(255,234,167,0.2)' : 'rgba(255,255,255,0.2)') : 'transparent',
      color: active ? (isVIP ? '#ffeaa7' : 'white') : 'rgba(255,255,255,0.85)',
      transition: 'all 0.2s',
      width: '100%',
      textAlign: 'left',
      fontSize: '1.05rem',
      fontWeight: active ? 600 : 400,
      border: isVIP && active ? '1px solid rgba(255,234,167,0.3)' : '1px solid transparent'
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.background = isVIP ? 'rgba(255,234,167,0.1)' : 'rgba(255,255,255,0.1)';
        e.currentTarget.style.color = isVIP ? '#fff3ce' : 'white';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
      }
    }}
  >
    <Icon size={20} color={active && isVIP ? '#ffeaa7' : (isVIP && !active ? 'rgba(255,234,167,0.8)' : undefined)} />
    {label}
  </button>
);

export default Sidebar;
