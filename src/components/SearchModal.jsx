import { X, Search, Loader2, Play, User, BarChart2, ExternalLink, BarChart, Music } from 'lucide-react';
import { searchSpotify } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatFollowers = (n) => {
  if (!n || n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)    return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

// ─── Song Result Row ─────────────────────────────────────────────────────────
const SongRow = ({ track, onMetricsClick }) => {
  const hasMetrics = !!track.my_song_id;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.9rem',
        padding: '0.6rem 0.8rem', borderRadius: '10px',
        transition: 'background 0.15s',
      }}
      className="glass-panel-interactive"
    >
      {/* Artwork */}
      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.07)' }}>
        {track.image_url
          ? <img src={track.image_url} alt={track.song_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Play size={20} color="var(--text-dim)" style={{ margin: '14px' }} />
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
          {track.song_name}
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {track.artist_name}
        </div>
      </div>

      {/* DB Badge */}
      {hasMetrics && (
        <span style={{
          fontSize: '0.6rem', background: 'rgba(29,185,84,0.12)', color: '#1DB954',
          padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(29,185,84,0.25)',
          whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600, letterSpacing: '0.3px',
        }}>
          DB
        </span>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
        {/* Métricas */}
        <button
          onClick={(e) => { e.stopPropagation(); if (hasMetrics) onMetricsClick(track); }}
          disabled={!hasMetrics}
          title={hasMetrics ? 'Ver métricas de la canción' : 'Sin métricas en DB todavía'}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 11px', borderRadius: '6px', border: 'none',
            background: hasMetrics
              ? 'linear-gradient(135deg, #1DB954 0%, #17a74a 100%)'
              : 'rgba(255,255,255,0.06)',
            color: hasMetrics ? 'white' : 'var(--text-dim)',
            fontSize: '0.75rem', fontWeight: 600,
            cursor: hasMetrics ? 'pointer' : 'not-allowed',
            opacity: hasMetrics ? 1 : 0.45,
            transition: 'transform 0.15s, opacity 0.2s',
          }}
          onMouseEnter={e => { if (hasMetrics) e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <BarChart2 size={12} />
          Métricas
        </button>

        {/* Campaña */}
        {track.spotify_id && (
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`/campaign?spotifyId=${track.spotify_id}`, '_blank'); }}
            title="Ver Campaña"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 11px', borderRadius: '6px', border: 'none',
              background: 'linear-gradient(135deg, #334155 0%, #1d4ed8 100%)',
              color: 'white', fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer', transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ExternalLink size={12} />
            Campaña
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Artist Result Card (Horizontal Carousel) ────────────────────────────────
const ArtistCard = ({ artist, onMetricsClick }) => {
  const followers = formatFollowers(artist.followers);

  return (
    <div
      onClick={() => onMetricsClick(artist)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
        padding: '1rem 0.8rem', borderRadius: '12px', minWidth: '130px', maxWidth: '140px',
        transition: 'background 0.2s, transform 0.2s', cursor: 'pointer',
        textAlign: 'center', flexShrink: 0
      }}
      className="glass-panel-interactive group"
    >
      {/* Avatar */}
      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.07)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        {artist.image_url
          ? <img src={artist.image_url} alt={artist.artist_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <User size={30} color="var(--text-dim)" style={{ margin: '25px' }} />
        }
        {/* Hover Overlay */}
        <div 
          className="flex-center"
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onMetricsClick(artist); }}
            style={{
              width: '36px', height: '36px', borderRadius: '50%', border: 'none',
              background: 'var(--accent-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(108, 99, 255, 0.4)'
            }}
          >
            <BarChart size={16} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
          {artist.artist_name}
        </div>
        {followers && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {followers} Seg.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main SearchModal ─────────────────────────────────────────────────────────
const SearchModal = ({ isOpen, onClose, onArtistClick, onSongClick, onLoginClick }) => {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        const data = await searchSpotify(query);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) { setQuery(''); setResults(null); }
  }, [isOpen]);

  if (!isOpen) return null;

  // ---- handlers ----
  const handleArtistMetrics = (artist) => {
    if (!user) {
      onLoginClick();
      return;
    }
    if (onArtistClick) {
      onClose(); // Dismiss search so ArtistDetailsModal isn't behind the overlay
      // Use setTimeout to ensure the modal unmounts visually before triggering the heavy render
      setTimeout(() => {
        onArtistClick({
          id:              artist.spotify_id,
          spotifyid:       artist.spotify_id,
          name:            artist.artist_name,
          imageUrl:        artist.image_url,
          img:             artist.image_url,
          followers:       artist.followers,
          monthlyListeners: 0,
          countryId:       0,
        });
      }, 10);
    }
  };

  const handleSongMetrics = (track) => {
    if (!user) {
      onLoginClick();
      return;
    }
    onClose();
    if (onSongClick) {
      setTimeout(() => {
        onSongClick({
          cs_song:   track.my_song_id,
          id:        track.my_song_id,
          song:      track.song_name,
          artists:   track.artist_name,
          spotifyid: track.spotify_id,
          image_url: track.image_url,
          avatar:    track.image_url,
          img:       track.image_url,
        });
      }, 10);
    }
  };

  const hasTracks  = (results?.tracks?.length  ?? 0) > 0;
  const hasArtists = (results?.artists?.length ?? 0) > 0;

  return (
    <>
      {/* ── Overlay ── */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 2000, backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '8vh 1rem 2rem',
        }}
        onClick={onClose}
      >
        {/* ── Panel ── */}
        <div
          className="glass-panel animate-fade-in"
          style={{
            width: '100%', maxWidth: '860px',
            maxHeight: '82vh',
            background: 'var(--bg-dark)',
            display: 'flex', flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Search bar ── */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar artistas o canciones en Spotify..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                  fontSize: '0.95rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px', color: 'white', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e  => { e.target.style.borderColor = 'var(--accent-primary)'; }}
                onBlur={e   => { e.target.style.borderColor = 'var(--glass-border)';   }}
              />
              {isLoading && (
                <Loader2 className="loading-spinner" size={18} color="var(--accent-primary)"
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              )}
            </div>
            <button
              onClick={onClose}
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Results Area ── */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 0 1rem 0' }}>
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
            `}</style>
            
            {/* Empty state */}
            {!query && (
              <div className="flex-center" style={{ height: '180px', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Search size={30} style={{ opacity: 0.25 }} />
                <span style={{ fontSize: '0.88rem' }}>Escribe para buscar artistas y canciones</span>
              </div>
            )}

            {/* Loading */}
            {query && isLoading && (
              <div className="flex-center" style={{ height: '160px' }}>
                <Loader2 className="loading-spinner" size={30} color="var(--accent-primary)" />
              </div>
            )}

            {/* Results */}
            {!isLoading && results && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                
                {/* ── Artists (Top Match or Horizontal Scroll) ── */}
                {hasArtists && (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} color="var(--accent-primary)" />
                      Artistas
                    </h3>
                    
                    <div 
                      className="custom-scrollbar"
                      style={{ 
                        display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', 
                        paddingLeft: '0.5rem', paddingRight: '0.5rem'
                      }}
                    >
                      {results.artists.map(artist => (
                        <ArtistCard
                          key={artist.spotify_id}
                          artist={artist}
                          onMetricsClick={handleArtistMetrics}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Tracks (Vertical List) ── */}
                {hasTracks && (
                  <div style={{ width: '100%' }}>
                     <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Music size={16} color="var(--accent-tertiary)" />
                      Canciones
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.5rem' }}>
                      {results.tracks.map((track, i) => (
                        <SongRow
                          key={`${track.spotify_id}-${i}`}
                          track={track}
                          onMetricsClick={handleSongMetrics}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {!hasTracks && !hasArtists && (
                  <div className="flex-center" style={{ height: '160px', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.5rem' }}>
                    <Search size={26} style={{ opacity: 0.25 }} />
                    <span style={{ fontSize: '0.87rem' }}>Sin resultados para "{query}"</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;
