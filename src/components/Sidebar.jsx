import React from 'react';
import { Home, ChartBarBig, Headphones, Sparkles, Camera, Wand2, Radio, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, activeView, setActiveView }) => {
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

        <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1rem', fontWeight: 600 }}>Navegación</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <SidebarItem icon={Home} label="Charts" active={activeView === 'Charts' || !activeView} onClick={() => { setActiveView('Charts'); onClose(); }} />
            <SidebarItem icon={ChartBarBig} label="Platforms" active={activeView === 'Platforms'} onClick={() => { setActiveView('Platforms'); onClose(); }} />
            <SidebarItem 
              icon={Headphones} 
              label="Artists Analytics" 
              active={activeView === 'Artists'} 
              onClick={() => { setActiveView('Artists'); onClose(); }} 
            />
            <SidebarItem 
              icon={Sparkles} 
              label="Heavy Hitters" 
              active={activeView === 'HeavyHitters'} 
              onClick={() => { setActiveView('HeavyHitters'); onClose(); }} 
            />
            <SidebarItem 
              icon={Camera} 
              label="Curator Picks" 
              active={activeView === 'CuratorPicks'} 
              onClick={() => { setActiveView('CuratorPicks'); onClose(); }} 
            />
            <SidebarItem 
              icon={Wand2} 
              label="Tiktoker Picks" 
              active={activeView === 'TiktokerPicks'} 
              onClick={() => { setActiveView('TiktokerPicks'); onClose(); }} 
            />
            <SidebarItem 
              icon={Radio} 
              label="Digital Hits for Radio" 
              active={activeView === 'DigitalHitsForRadio'} 
              onClick={() => { setActiveView('DigitalHitsForRadio'); onClose(); }} 
            />
          </nav>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.8rem 1rem',
      borderRadius: '8px',
      background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
      color: active ? 'white' : 'rgba(255,255,255,0.85)',
      transition: 'all 0.2s',
      width: '100%',
      textAlign: 'left',
      fontSize: '1.05rem',
      fontWeight: active ? 600 : 400
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.color = 'white';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
      }
    }}
  >
    <Icon size={20} />
    {label}
  </button>
);

export default Sidebar;
