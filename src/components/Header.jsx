import React from 'react';
import { Search, Menu, MapPin, Globe, ListMusic, AudioLines, AudioWaveform, User, LogOut } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import { useLocation } from 'react-router-dom';

const Header = ({ countries = [], genres = [], cities = [], playlistTypes = [], selectedCountry, setSelectedCountry, selectedGenre, setSelectedGenre, selectedCity, setSelectedCity, activeView, selectedPlatform, setSelectedPlatform, selectedPlaylistType, setSelectedPlaylistType, onToggleSidebar, onOpenSearch, user, onLoginClick, onLogoutClick }) => {

  // Build option arrays for SearchableSelect
  const countryOptions = [
    { value: '0', label: 'Global' },
    ...countries.map(c => ({ value: String(c.id), label: c.country_name }))
  ];

  const cityOptions = [
    { value: '0', label: cities.length === 0 ? '-' : 'Todas las ciudades' },
    ...cities.filter(c => c.id !== 0).map(c => ({ value: String(c.id), label: c.city_name }))
  ];

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
        <div 
          className="animate-fade-in"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem',
            color: 'var(--text-muted)', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px',
            background: 'rgba(255,255,255,0.03)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)'
          }}
        >
          <div style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: activeView === 'Artists' ? '#8a88ff' : activeView === 'Platforms' ? '#1DB954' : activeView === 'HeavyHitters' ? '#aa63ff' : activeView === 'CuratorPicks' ? '#ff3366' : activeView === 'TiktokerPicks' ? '#ff0050' : activeView === 'DigitalHitsForRadio' ? '#00e5ff' : '#ffb700',
            boxShadow: `0 0 8px ${activeView === 'Artists' ? '#8a88ff' : activeView === 'Platforms' ? '#1DB954' : activeView === 'HeavyHitters' ? '#aa63ff' : activeView === 'CuratorPicks' ? '#ff3366' : activeView === 'TiktokerPicks' ? '#ff0050' : activeView === 'DigitalHitsForRadio' ? '#00e5ff' : '#ffb700'}`
          }} />
          {activeView === 'Artists' ? 'Artist Analytics' : activeView === 'Platforms' ? 'Platforms' : activeView === 'HeavyHitters' ? 'Heavy Hitters' : activeView === 'CuratorPicks' ? 'Curator Picks' : activeView === 'TiktokerPicks' ? 'Tiktoker Picks' : activeView === 'DigitalHitsForRadio' ? 'Digital Hits for Radio' : 'Charts'}
        </div>
      </div>

      {showFilters && (
        <div className="header-filters">
          {/* Country Filter */}
          {activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks' && (
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
           )}

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

        {/* Dynamic Third Filter */}
        {activeView === 'Platforms' ? (
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1DB954' }}>
              <AudioLines size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>PLATAFORMA</span>
            </div>
            <SearchableSelect
              options={[
                { value: 'spotify', label: 'Spotify' },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'youtube', label: 'YouTube' },
                { value: 'shazam', label: 'Shazam' }
              ]}
              value={selectedPlatform}
              onChange={(val) => setSelectedPlatform(val)}
              searchable={false}
            />
          </div>
        ) : activeView === 'HeavyHitters' || activeView === 'TiktokerPicks' ? null : activeView === 'CuratorPicks' ? (
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff3366' }}>
              <AudioWaveform size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>TIPO DE PLAYLIST</span>
            </div>
            <SearchableSelect
              options={[
                { value: '0', label: 'Todos los Tipos' },
                ...playlistTypes.map(t => ({ value: String(t.id), label: t.name }))
              ]}
              value={String(selectedPlaylistType)}
              onChange={(val) => setSelectedPlaylistType(val)}
              searchable={false}
              placeholder="Todos los Tipos"
            />
          </div>
        ) : (
          // Ciudad Target with searchable select
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f15b29' }}>
              <MapPin size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>CIUDAD TARGET</span>
            </div>
            <SearchableSelect
              options={cityOptions}
              value={String(selectedCity)}
              onChange={(val) => setSelectedCity(val)}
              placeholder="Todas las ciudades"
              disabled={cities.length === 0}
            />
          </div>
        )}
        </div>
      )}
    </header>
  );
};


export default Header;
