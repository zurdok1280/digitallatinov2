import React, { useMemo, useState, useEffect } from 'react';
import { Play, Pause, ArrowUp, ArrowDown, Minus, Loader2, Info, Search, X } from 'lucide-react';
import { useAudioPreview } from '../hooks/useAudioPreview.jsx';
import { getTrendingTopPlatforms } from '../services/api';

const rankColors = [
  '#8a88ff', '#ff9eee', '#00f0ff', '#c193ff', '#ffb700',
  '#00e676', '#ff3366', '#74b9ff', '#a29bfe', '#fdcb6e',
  '#1db954', '#e056fd', '#00cec9', '#fd79a8', '#ffeaa7'
];

const Sparkline = ({ data, color }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 140;
  const height = 36;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return { x, y, val: d };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  const fillPoints = `${pointsString} ${width},${height} 0,${height}`;
  const gradientId = `spark-${color.replace('#', '')}`;
  const colWidth = width / data.length;

  return (
    <div
      className="sparkline-wrapper"
      onClick={(e) => e.stopPropagation()}
      style={{ width: `${width}px`, height: `${height}px`, opacity: 0.8, position: 'relative' }}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <svg width={width} height={height} viewBox={`0 -5 ${width} ${height + 10}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polyline points={fillPoints} fill={`url(#${gradientId})`} />

        {/* Render Hover Indicator Lines Below the Main Stroke */}
        {hoveredIdx !== null && (
          <>
            <line x1={points[hoveredIdx].x} y1="-5" x2={points[hoveredIdx].x} y2={height} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2" />
          </>
        )}

        <polyline points={pointsString} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Default end dot if no hover */}
        {hoveredIdx === null && (
          <circle cx={width} cy={points[points.length - 1].y} r="3.5" fill={color} stroke="#050508" strokeWidth="1.5" />
        )}

        {/* Hover Active Dot */}
        {hoveredIdx !== null && (
          <circle cx={points[hoveredIdx].x} cy={points[hoveredIdx].y} r="4.5" fill={color} stroke="#fff" strokeWidth="2" style={{ transition: 'all 0.1s' }} />
        )}

        {/* Invisible Hit Area Columns for Cursor Tracking */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - colWidth / 2}
            y={-5}
            width={colWidth}
            height={height + 10}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
            style={{ cursor: 'crosshair' }}
          />
        ))}
      </svg>

      {/* Dynamic Popover Overlay */}
      {hoveredIdx !== null && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: `${points[hoveredIdx].x}px`,
          transform: 'translateX(-50%) translateY(-8px)',
          background: 'rgba(15,15,20,0.95)',
          border: '1px solid var(--glass-border)',
          padding: '0.4rem 0.6rem',
          borderRadius: '6px',
          color: 'white',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 50,
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ color: color, fontWeight: '700', fontSize: '1rem', lineHeight: '1.2' }}>
            {Number(points[hoveredIdx].val.toFixed(1))}M
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Week {hoveredIdx + 1}
          </div>
        </div>
      )}
    </div>
  );
};

const TopPlatformsChart = ({ selectedCountry, selectedGenre, selectedPlatform, onSongClick }) => {
  const { currentlyPlaying, handlePlayPreview } = useAudioPreview();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery('');
  }, [songs]);

  useEffect(() => {
    let isMounted = true;
    const fetchPlatforms = async () => {
      setIsLoading(true);

      // Enforce default values if they are 'All' or 0, as Platforms API strictly requires valid IDs
      const safeFormat = (selectedGenre === 'All' || selectedGenre === 0 || selectedGenre === '0') ? 1 : selectedGenre;
      const safeCountry = (selectedCountry === 'All' || selectedCountry === 0 || selectedCountry === '0') ? 1 : selectedCountry;

      const data = await getTrendingTopPlatforms(selectedPlatform, safeFormat, safeCountry);
      if (isMounted) {
        setSongs(data || []);
        setIsLoading(false);
      }
    };
    fetchPlatforms();
    return () => { isMounted = false; };
  }, [selectedGenre, selectedCountry, selectedPlatform]);

  // Generate deterministic "historical" trend data for demonstration purposes
  const enrichedSongs = useMemo(() => {
    if (!songs) return [];
    return songs.map((s, idx) => {
      let val = 100 - (s.rk * 0.3);
      const trend = [];
      for (let i = 0; i < 20; i++) {
        val = val + (Math.sin(s.rk * 1.3 + i * 0.8) * 8) + (Math.cos(idx + i) * 6);
        trend.push(Math.max(10, val));
      }
      return { ...s, trend };
    });
  }, [songs]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return enrichedSongs;
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return enrichedSongs.filter(song => {
      const songName = (song.song || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const artistName = (song.artists || song.artist || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const labelName = (song.label || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return songName.includes(query) || artistName.includes(query) || labelName.includes(query);
    });
  }, [enrichedSongs, searchQuery]);

  if (isLoading) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '5rem', flexDirection: 'column', minHeight: '300px' }}>
        <Loader2 className="loading-spinner" size={48} color="var(--accent-primary)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '1rem' }}>Cargando analítica digital de plataformas...</p>
      </div>
    );
  }

  if (!enrichedSongs || enrichedSongs.length === 0) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No se encontraron canciones en esta plataforma.</p>
      </div>
    );
  }

  const renderMovement = (mo) => {
    if (!mo) return null;
    const mov = String(mo).toLowerCase();
    if (mov.includes('up')) return <ArrowUp size={16} color="var(--accent-primary)" title="Subió" />;
    if (mov.includes('down')) return <ArrowDown size={16} color="var(--accent-secondary)" title="Bajó" />;
    return <Minus size={16} color="var(--text-muted)" title="Sin cambio" />;
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem' }}>
      <style>{`
        .sparkline-wrapper { display: none; margin: 0 3rem 0 auto; pointer-events: auto; flex-shrink: 0; }
        @media (min-width: 900px) {
          .sparkline-wrapper { display: block; }
        }
        
        /* Tooltip classes */
        .score-info-container { position: relative; }
        .score-tooltip {
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(-10px);
          background: rgba(25, 25, 35, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 1rem;
          margin-right: 15px;
          border-radius: 12px;
          width: 260px;
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.5;
          box-shadow: 0 12px 32px rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          text-align: left;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 100;
        }
        
        .score-tooltip::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -6px;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-style: solid;
          border-color: transparent transparent transparent rgba(25, 25, 35, 0.98);
        }

        .score-info-container:hover .score-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
        }

        /* Search Input Styles */
        .song-search-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          width: 100%;
        }
        
        .song-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 8px 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .song-search-wrapper:focus-within {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 3px rgba(138, 136, 255, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .song-search-wrapper:hover:not(:focus-within) {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .search-icon {
          color: var(--accent-primary);
          margin-right: 10px;
          opacity: 0.8;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        
        .song-search-wrapper:focus-within .search-icon {
          transform: scale(1.1);
          opacity: 1;
        }
        
        .song-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 0.9rem;
          font-family: inherit;
          padding: 0;
          width: 100%;
        }
        
        .song-search-input::placeholder {
          color: var(--text-muted);
          opacity: 0.7;
        }
        
        .song-search-clear {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          margin-left: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .song-search-clear:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: scale(1.05);
        }
        
        .search-results-badge {
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(138, 136, 255, 0.1);
          border: 1px solid rgba(138, 136, 255, 0.2);
          padding: 6px 12px;
          border-radius: 20px;
          white-space: nowrap;
          font-weight: 600;
          letter-spacing: 0.5px;
          animation: searchBadgeFadeIn 0.2s ease-out;
        }
        
        @keyframes searchBadgeFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Buscador de canciones */}
      <div className="song-search-container">
        <div className="song-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="song-search-input"
            placeholder="Buscar por canción, artista o disquera..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="song-search-clear"
              onClick={() => setSearchQuery('')}
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className="search-results-badge">
            {filteredSongs.length} {filteredSongs.length === 1 ? 'resultado' : 'resultados'}
          </div>
        )}
      </div>

      <div className="grid-base" style={{ gap: '0.5rem' }}>
        {filteredSongs.length === 0 ? (
          <div className="flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              No se encontraron canciones que coincidan con "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 1.2rem',
                borderRadius: '20px',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          filteredSongs.map((song, index) => {
          const rowColor = rankColors[index % rankColors.length];
          return (
            <div
              key={song.cs_song || index}
              className="chart-row glass-panel-interactive"
              onClick={() => onSongClick(song)}
              style={{
                background: index === 0 ? 'rgba(0, 240, 255, 0.05)' : undefined,
                borderColor: index === 0 ? 'rgba(0, 240, 255, 0.3)' : undefined,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                if (index !== 0) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
                if (index !== 0) e.currentTarget.style.background = '';
              }}
            >
              <div className="chart-left" style={{ flex: 1, overflow: 'hidden' }}>
                <div className="chart-rank">
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: rowColor, lineHeight: 1 }}>
                    {song.rk}
                  </span>
                  <div style={{ marginTop: '0.15rem' }}>
                    {renderMovement(song.movement)}
                  </div>
                </div>

                <div className="chart-img-wrapper" style={{ position: 'relative' }}>
                  <img src={song.img || song.avatar || song.url || '/logo.png'} alt={song.song} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    className="play-overlay"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayPreview(
                        song.rk,
                        `https://audios.monitorlatino.com/Iam/${song.entid}.mp3`,
                        { title: song.song, artist: song.artists || song.artist, image: song.img || song.avatar || song.url || '/logo.png' }
                      );
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: currentlyPlaying === song.rk ? 1 : 0,
                      transition: 'opacity 0.2s',
                      cursor: 'pointer',
                      borderRadius: 'inherit'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => { if (currentlyPlaying !== song.rk) e.currentTarget.style.opacity = 0; }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "rgba(0,0,0,0.7)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        transition: "transform 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      {currentlyPlaying === song.rk ? (
                        <Pause size={20} />
                      ) : (
                        <Play size={20} style={{ marginLeft: "2px" }} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="chart-title-wrapper" style={{ minWidth: 0 }}>
                  <h3 className="chart-title">{song.song}</h3>
                  <p className="chart-artist">{song.artists || song.artist}</p>
                  {song.label && (
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                      {song.label}
                    </p>
                  )}
                </div>
              </div>

              {/* Responsive Trend Sparkline */}
              {/*<Sparkline data={song.trend} color={rowColor} />*/}

              <div className="score-info-container" style={{ textAlign: 'right', minWidth: '60px' }}>
                <div className="text-gradient chart-score">
                  {song.data_res ? (song.data_res >= 1000000 ? (song.data_res / 1000000).toFixed(1) + 'M' : song.data_res.toLocaleString()) : (song.score != null ? Number(song.score).toFixed(1) : '0')}
                </div>
                <span className="chart-score-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  Reproducciones <Info size={11} style={{ opacity: 0.7 }} />
                </span>

                {/* Score Disclaimer Tooltip */}
                <div className="score-tooltip">
                  El número de <strong style={{ color: '#fff' }}>Reproducciones</strong> indica el rendimiento principal o acumulado de la canción en la plataforma seleccionada.
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};

export default TopPlatformsChart;
