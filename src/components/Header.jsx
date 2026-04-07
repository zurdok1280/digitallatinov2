import React from 'react';
import { Search, Menu, MapPin, Globe, ListMusic, AudioLines, AudioWaveform } from 'lucide-react';

const Header = ({ countries = [], genres = [], cities = [], playlistTypes = [], selectedCountry, setSelectedCountry, selectedGenre, setSelectedGenre, selectedCity, setSelectedCity, activeView, selectedPlatform, setSelectedPlatform, selectedPlaylistType, setSelectedPlaylistType, onToggleSidebar, onOpenSearch }) => {
  return (
    <header className="glass-panel header-container">
      <div className="flex-center" style={{ gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button onClick={onToggleSidebar} style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            <Menu size={28} />
          </button>
          <img src="/logo.png" alt="DigitalLatino Logo" style={{ height: '35px', objectFit: 'contain' }} />
          <button onClick={onOpenSearch} style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', padding: '0.2rem' }}>
            <Search size={24} />
          </button>
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

      <div className="header-filters">
        {/* Country Filter - Hidden in Curator Picks and Tiktoker Picks */
         activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks' && (
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e62479' }}>
              <Globe size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>PAÍS/REGIÓN</span>
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="0">Global</option>
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
            disabled={false}
            style={{
              cursor: 'pointer',
              opacity: 1,
              width: '100%'
            }}
          >
            {activeView !== 'Platforms' && <option value="0">General</option>}
            {genres.map(g => (
              (activeView === 'Platforms' && (g.id === 0 || String(g.id) === '0')) ? null : <option key={g.id} value={g.id}>{g.format}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Third Filter */}
        {activeView === 'Platforms' ? (
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1DB954' }}>
              <AudioLines size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>PLATAFORMA</span>
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="spotify">Spotify</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="shazam">Shazam</option>
            </select>
          </div>
        ) : activeView === 'HeavyHitters' || activeView === 'TiktokerPicks' ? null : activeView === 'CuratorPicks' ? (
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff3366' }}>
              <AudioWaveform size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>TIPO DE PLAYLIST</span>
            </div>
            <select
              value={selectedPlaylistType}
              onChange={(e) => setSelectedPlaylistType(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="0">Todos los Tipos</option>
              {playlistTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        ) : (
          <div className="filter-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f15b29' }}>
              <MapPin size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>CIUDAD TARGET</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={cities.length === 0 && activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks'}
              style={{
                cursor: (cities.length === 0 && activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks') ? 'not-allowed' : 'pointer',
                opacity: (cities.length === 0 && activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks') ? 0.5 : 1,
                width: '100%'
              }}
            >
              <option value="0">{cities.length === 0 ? '-' : 'Todas las ciudades'}</option>
              {cities.filter(c => c.id !== 0).map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
            </select>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
