import React, { useMemo, useState } from 'react';
import { Play, ArrowUp, ArrowDown, Minus, Loader2, Info } from 'lucide-react';

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

const SongChart = ({ songs, isLoading, onArtistClick }) => {
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

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="grid-base" style={{ gap: '0.5rem' }}>
          {[...Array(5)].map((_, i) => <ChartRowSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!enrichedSongs || enrichedSongs.length === 0) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No se encontraron canciones con esos filtros.</p>
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
      `}</style>
      <div className="grid-base" style={{ gap: '0.5rem' }}>
        {enrichedSongs.map((song, index) => {
          const rowColor = rankColors[index % rankColors.length];
          return (
            <div
              key={song.cs_song || index}
              className="chart-row glass-panel-interactive"
              onClick={() => onArtistClick({
                id: song.spotifyartistid || song.cs_song,
                name: song.artists,
                imageUrl: song.spotifyid || song.url || song.avatar || '/logo.png',
                monthlyListeners: song.spotify_streams_total || 0,
                followers: song.audience_total || 0
              })}
              style={{
                background: index === 0 ? 'rgba(0, 240, 255, 0.05)' : undefined,
                borderColor: index === 0 ? 'rgba(0, 240, 255, 0.3)' : undefined,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                opacity: 0,
                animation: 'slideUpFade 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                animationDelay: `${index * 0.06}s`,
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s, background 0.3s'
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
              <div className="neon-watermark">#{index + 1}</div>
              <div className="chart-left" style={{ flex: 1, overflow: 'hidden' }}>
                <div className="chart-rank">
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: rowColor, lineHeight: 1 }}>
                    {song.rk}
                  </span>
                  <div style={{ marginTop: '0.15rem' }}>
                    {renderMovement(song.movement)}
                  </div>
                </div>

                <div className="chart-img-wrapper">
                  <img src={song.spotifyid || song.url || song.avatar || '/logo.png'} alt={song.song} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="eq-container">
                    <div className="eq-bar" style={{ height: '16px' }} />
                    <div className="eq-bar" style={{ height: '24px' }} />
                    <div className="eq-bar" style={{ height: '12px' }} />
                  </div>
                </div>

                <div className="chart-title-wrapper" style={{ minWidth: 0 }}>
                  <h3 className="chart-title">{song.song}</h3>
                  <p className="chart-artist">{song.artists}</p>
                </div>
              </div>

              {/* Responsive Trend Sparkline */}
              <Sparkline data={song.trend} color={rowColor} />

              <div className="score-info-container" style={{ textAlign: 'right', minWidth: '60px' }}>
                <div className="text-gradient chart-score">
                  {song.score != null ? Number(song.score).toFixed(1) : '0.0'}
                </div>
                <span className="chart-score-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  Score <Info size={11} style={{ opacity: 0.7 }} />
                </span>
                
                {/* Score Disclaimer Tooltip based on User Image */}
                <div className="score-tooltip">
                  El <strong style={{ color: '#fff' }}>Score Digital</strong> es una métrica del 1 al 100 que evalúa el nivel de exposición de una canción basado en streams, playlists, engagement social y distribución geográfica.
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SongChart;

const ChartRowSkeleton = () => (
  <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '72px', position: 'relative', overflow: 'hidden' }}>
    <div className="shimmer-effect" />
    <div className="skeleton-block" style={{ width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0 }} />
    <div className="skeleton-block" style={{ width: '48px', height: '48px', borderRadius: '8px', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div className="skeleton-block" style={{ height: '14px', width: '45%' }} />
      <div className="skeleton-block" style={{ height: '10px', width: '28%' }} />
    </div>
    <div className="skeleton-block" style={{ width: '120px', height: '30px', flexShrink: 0 }} />
    <div className="skeleton-block" style={{ width: '42px', height: '42px', flexShrink: 0 }} />
  </div>
);
