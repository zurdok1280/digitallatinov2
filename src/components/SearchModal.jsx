import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Play, User } from 'lucide-react';
import { searchSpotify } from '../services/api';

const SearchModal = ({ isOpen, onClose, onArtistClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        const data = await searchSpotify(query);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Reset internal state if unmounted
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="flex-center" 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, padding: '2rem', backdropFilter: 'blur(8px)', alignItems: 'flex-start', paddingTop: '10vh' }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-fade-in" 
        style={{ width: '100%', maxWidth: '1000px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
          <X size={28} />
        </button>

        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <Search size={24} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar artistas o canciones (Spotify)..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '1.2rem 1rem 1.2rem 4rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)', color: 'white', outline: 'none' }}
            />
            {isLoading && <Loader2 className="loading-spinner" size={24} color="var(--accent-primary)" style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }} />}
          </div>
        </div>

        <div style={{ padding: '2rem', flex: 1 }}>
          {!query && (
            <div className="flex-center" style={{ height: '150px', color: 'var(--text-muted)' }}>
              Ingresa tu búsqueda en la barra superior.
            </div>
          )}

          {query && !isLoading && results && (
            <div className="grid-base" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
              
              {/* Artists Column */}
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  Artistas ({results.artists?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {results.artists?.length === 0 ? <p style={{color: 'var(--text-dim)'}}>No hay resultados de artistas</p> : null}
                  {results.artists?.map(artist => (
                    <div 
                      key={artist.spotify_id} 
                      className="glass-panel-interactive"
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => {
                        onArtistClick({
                          id: artist.spotify_id,
                          name: artist.artist_name,
                          imageUrl: artist.image_url,
                          followers: artist.followers,
                          monthlyListeners: 0
                        });
                        onClose();
                      }}
                    >
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)' }}>
                        {artist.image_url ? <img src={artist.image_url} alt={artist.artist_name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <User size={24} color="#fff" style={{margin:'13px'}} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist.artist_name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{(artist.followers / 1000000).toFixed(1)}M Seguidores</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracks Column */}
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  Canciones ({results.tracks?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {results.tracks?.length === 0 ? <p style={{color: 'var(--text-dim)'}}>No hay canciones</p> : null}
                  {results.tracks?.map((track, i) => (
                    <div 
                      key={`${track.spotify_id}-${i}`} 
                      className="glass-panel"
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)' }}>
                        {track.image_url ? <img src={track.image_url} alt={track.song_name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Play size={24} color="#fff" style={{margin:'13px'}} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.song_name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist_name}</p>
                      </div>
                      {track.exists_in_db && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(29, 185, 84, 0.2)', color: '#1DB954', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>En DB</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SearchModal;
