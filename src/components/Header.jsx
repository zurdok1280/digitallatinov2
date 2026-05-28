import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, MapPin, Globe, ListMusic, AudioLines, AudioWaveform, User, LogOut, CircleUser } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import { useLocation } from 'react-router-dom';
import AccountModal from './AccountModal';

/* View accent colors map */
const VIEW_CONFIG = {
  Artists:            { color: '#8a88ff', label: 'Artist Analytics' },
  Platforms:          { color: '#1DB954', label: 'Platforms' },
  HeavyHitters:       { color: '#aa63ff', label: 'Heavy Hitters' },
  CuratorPicks:       { color: '#ff3366', label: 'Curator Picks' },
  TiktokerPicks:      { color: '#ff0050', label: 'Tiktoker Picks' },
  DigitalHitsForRadio:{ color: '#00e5ff', label: 'Digital Hits for Radio' },
  Charts:             { color: '#ffd166', label: 'Charts' },
};

const Header = ({
  countries = [], genres = [], cities = [], playlistTypes = [],
  selectedCountry, setSelectedCountry,
  selectedGenre,   setSelectedGenre,
  selectedCity,    setSelectedCity,
  activeView,
  selectedPlatform, setSelectedPlatform,
  selectedPlaylistType, setSelectedPlaylistType,
  selectedCRG,     setSelectedCRG,
  onToggleSidebar, onOpenSearch,
  user, onLoginClick, onLogoutClick,
  isLoading = false
}) => {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();
  const showFilters = !['/my-artist', '/admin', '/auth/callback', '/campaign', '/payment', '/forgot-password', '/reset-password'].some(
    path => location.pathname === path || location.pathname.startsWith(path + '/')
  );

  const viewCfg = VIEW_CONFIG[activeView] || VIEW_CONFIG.Charts;

  /* Detect scroll for sticky glassmorphism intensification */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const countryOptions = [
    { value: '0', label: 'Global' },
    ...countries.map(c => ({ value: String(c.id), label: c.country_name }))
  ];
  const cityOptions = [
    { value: '0', label: cities.length === 0 ? '-' : 'Todas las ciudades' },
    ...cities.filter(c => c.id !== 0).map(c => ({ value: String(c.id), label: c.city_name }))
  ];

  return (
    <header
      ref={headerRef}
      className="header-container"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        background: scrolled
          ? 'rgba(7, 8, 13, 0.88)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
        padding: '0',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* ─── TOP ROW ─────────────────────────────────────────── */}
      <div
        className="header-top-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.65rem 1.25rem',
          width: '100%',
        }}
      >
        {/* Left: menu + logo + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            className="header-menu-btn btn-touch-safe"
            onClick={onToggleSidebar}
            title="Menú"
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.35rem',
              borderRadius: '8px',
              transition: 'color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Menu size={26} strokeWidth={1.75} />
          </button>

          <img
            className="header-logo"
            src="/logo.png"
            alt="DigitalLatino"
            style={{ height: '34px', objectFit: 'contain' }}
          />

          {location.pathname !== '/my-artist' && (
            <button
              onClick={onOpenSearch}
              title="Buscar"
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.35rem',
                borderRadius: '8px',
                marginLeft: '0.1rem',
                transition: 'color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Search size={20} strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* Right: view indicator + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* View Indicator Pill */}
          <div
            className="header-view-indicator animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: `${viewCfg.color}14`,
              border: `1px solid ${viewCfg.color}30`,
              color: viewCfg.color,
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Animated dot */}
            <span
              className="glow-pulse"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: viewCfg.color,
                color: viewCfg.color,
                flexShrink: 0,
                display: 'block',
              }}
            />
            {viewCfg.label}
          </div>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {user ? (
              <>
                <button
                  className="btn-touch-safe"
                  onClick={() => setIsAccountModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: 'var(--text-main)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '8px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <CircleUser size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                  <span
                    className="header-auth-text"
                    style={{ fontSize: '0.85rem', fontWeight: 500 }}
                  >
                    {user.name}
                  </span>
                </button>

                <button
                  onClick={onLogoutClick}
                  className="btn-touch-safe"
                  title="Cerrar sesión"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-muted)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,80,80,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,80,80,0.25)';
                    e.currentTarget.style.color = '#ff6b6b';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <LogOut size={15} strokeWidth={1.75} />
                  <span className="header-auth-text">Salir</span>
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="btn-touch-safe"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #8a88ff, #aa63ff)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.42rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 12px rgba(138,136,255,0.35)',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(138,136,255,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(138,136,255,0.35)';
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              >
                <User size={15} strokeWidth={2} />
                <span className="header-auth-text">Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── FILTER BAR ──────────────────────────────────────── */}
      {showFilters && (
        <div
          className="animate-slide-down"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            padding: '0.6rem 1.25rem',
          }}
        >
          <div
            className="header-filters"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'flex-start',
              width: '100%',
            }}
          >
            {/* ── Country ── */}
            {activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks' && (
              <FilterGroup icon={<Globe size={13} strokeWidth={2} />} label="País" color="#e62479">
                <select
                  value={selectedCountry}
                  onChange={e => {
                    setSelectedCountry(e.target.value);
                  }}
                  disabled={isLoading}
                  style={selectStyle(isLoading)}
                >
                  <option value="All">País...</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.country_name}</option>)}
                </select>
              </FilterGroup>
            )}

            {/* ── Genre ── */}
            <FilterGroup icon={<ListMusic size={13} strokeWidth={2} />} label="Género" color="var(--text-dim)">
              <select
                value={selectedGenre}
                onChange={e => {
                  setSelectedGenre(e.target.value);
                }}
                disabled={selectedCountry === 'All' || isLoading}
                style={selectStyle(selectedCountry === 'All' || isLoading)}
              >
                <option value="All">{selectedCountry === 'All' ? '-' : 'Formato...'}</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.format}</option>)}
              </select>
            </FilterGroup>

            {/* ── Dynamic 3rd filter ── */}
            {activeView === 'Platforms' ? (
              <FilterGroup icon={<AudioLines size={13} strokeWidth={2} />} label="Plataforma" color="#1DB954">
                <SearchableSelect
                  options={[
                    { value: 'spotify', label: 'Spotify' },
                    { value: 'tiktok', label: 'TikTok' },
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'shazam', label: 'Shazam' }
                  ]}
                  value={selectedPlatform}
                  onChange={val => { setSelectedPlatform(val); }}
                  searchable={false}
                  disabled={isLoading}
                />
              </FilterGroup>
            ) : activeView === 'HeavyHitters' || activeView === 'TiktokerPicks' ? null
              : activeView === 'CuratorPicks' ? (
              <FilterGroup icon={<AudioWaveform size={13} strokeWidth={2} />} label="Tipo de Playlist" color="#ff3366">
                <SearchableSelect
                  options={[
                    { value: '0', label: 'Todos los Tipos' },
                    ...playlistTypes.map(t => ({ value: String(t.id), label: t.name }))
                  ]}
                  value={String(selectedPlaylistType)}
                  onChange={val => { setSelectedPlaylistType(val); }}
                  searchable={false}
                  placeholder="Todos los Tipos"
                  disabled={isLoading}
                />
              </FilterGroup>
            ) : activeView === 'Charts' ? (
              <>
                <FilterGroup icon={<MapPin size={13} strokeWidth={2} />} label="Ciudad" color="#f15b29">
                  <SearchableSelect
                    options={cityOptions}
                    value={String(selectedCity)}
                    onChange={val => { setSelectedCity(val); }}
                    placeholder="Todas las ciudades"
                    disabled={cities.length === 0 || isLoading}
                  />
                </FilterGroup>
                <FilterGroup icon={<AudioLines size={13} strokeWidth={2} />} label="Vigencia" color="#ffd166">
                  <select
                    value={selectedCRG}
                    onChange={e => { setSelectedCRG(e.target.value); }}
                    disabled={isLoading}
                    style={selectStyle(isLoading)}
                  >
                    <option value="C">Current</option>
                    <option value="N">Todos</option>
                  </select>
                </FilterGroup>
              </>
            ) : (
              <FilterGroup icon={<MapPin size={13} strokeWidth={2} />} label="Ciudad Target" color="#f15b29">
                <SearchableSelect
                  options={cityOptions}
                  value={String(selectedCity)}
                  onChange={val => { setSelectedCity(val); }}
                  placeholder="Todas las ciudades"
                  disabled={cities.length === 0 || isLoading}
                />
              </FilterGroup>
            )}
          </div>
        </div>
      )}

      {isAccountModalOpen && <AccountModal onClose={() => setIsAccountModalOpen(false)} />}
    </header>
  );
};

/* ── Helpers ─────────────────────────────────────────────────── */

const selectStyle = (disabled) => ({
  background: 'rgba(255,255,255,0.04)',
  color: disabled ? 'var(--text-dim)' : 'var(--text-main)',
  border: '1px solid var(--glass-border)',
  padding: '0.4rem 0.8rem',
  borderRadius: 'var(--radius-sm)',
  outline: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  fontSize: '0.85rem',
  width: '100%',
  minWidth: '140px',
  transition: 'all 0.2s ease',
});

const FilterGroup = ({ icon, label, color, children }) => (
  <div
    className="filter-group"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '0.3rem',
      flex: 1,
      minWidth: '150px',
    }}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      color,
    }}>
      {icon}
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        opacity: 0.9,
      }}>
        {label}
      </span>
    </div>
    {children}
  </div>
);

export default Header;
