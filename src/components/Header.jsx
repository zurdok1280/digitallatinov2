import React from 'react';
import { Search, Menu, MapPin, Globe, ListMusic, User, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({
  countries = [],
  genres = [],
  cities = [],
  selectedCountry,
  setSelectedCountry,
  selectedGenre,
  setSelectedGenre,
  selectedCity,
  setSelectedCity,
  onToggleSidebar,
  onOpenSearch,
  user,
  onLoginClick,
  onLogoutClick
}) => {
  const location = useLocation();
  const showFilters = location.pathname === '/';

  return (
    <header className="glass-panel header-container">
      <div className="flex-center" style={{ gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button onClick={onToggleSidebar} style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            <Menu size={28} />
          </button>
          <img src="/logo.png" alt="DigitalLatino Logo" style={{ height: '35px', objectFit: 'contain' }} />
          {location.pathname !== '/my-artist' && (
            <button onClick={onOpenSearch} style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', padding: '0.2rem' }}>
              <Search size={24} />
            </button>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex-center" style={{ gap: '1rem' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  <span style={{ opacity: 0.7 }}>Hola,</span> {user.name}
                </span>
              </div>
              <button
                onClick={onLogoutClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  color: '#8c52ff',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Cerrar sesión</span>
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#8c52ff',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#7c42df'}
              onMouseOut={(e) => e.currentTarget.style.background = '#8c52ff'}
            >
              <User size={16} />
              <span>Log in / Sign in</span>
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="header-filters">
          {/* Country Filter */}
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e62479' }}>
              <Globe size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>PAÍS/REGIÓN</span>
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                width: '100%'
              }}
            >
              <option value="All">País...</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.country_name}</option>)}
            </select>
          </div>

          {/* Genre Filter */}
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#5b6c8d' }}>
              <ListMusic size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>GÉNERO</span>
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              disabled={selectedCountry === 'All'}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                cursor: selectedCountry === 'All' ? 'not-allowed' : 'pointer',
                opacity: selectedCountry === 'All' ? 0.5 : 1,
                fontSize: '0.9rem',
                width: '100%'
              }}
            >
              <option value="All">{selectedCountry === 'All' ? '-' : 'Formato...'}</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.format}</option>)}
            </select>
          </div>

          {/* City Filter */}
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f15b29' }}>
              <MapPin size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>CIUDAD TARGET</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={selectedCountry === 'All'}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                cursor: selectedCountry === 'All' ? 'not-allowed' : 'pointer',
                opacity: selectedCountry === 'All' ? 0.5 : 1,
                fontSize: '0.9rem',
                width: '100%'
              }}
            >
              <option value="All">{selectedCountry === 'All' ? '-' : 'Ciudad...'}</option>
              {cities.filter(c => c.id !== 0).map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
            </select>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
