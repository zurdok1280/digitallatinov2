import React, { useMemo, useState, useEffect } from 'react';
import { User, ArrowUp, ArrowDown, Minus, Loader2, Info, Users, Activity, Headphones, ListMusic } from 'lucide-react';
import { getTrendingTopArtists } from '../services/api';

const rankColors = [
  '#8a88ff', '#ff9eee', '#00f0ff', '#c193ff', '#ffb700',
  '#00e676', '#ff3366', '#74b9ff', '#a29bfe', '#fdcb6e',
  '#1db954', '#e056fd', '#00cec9', '#fd79a8', '#ffeaa7'
];

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

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
  const gradientId = `spark-art-${color.replace('#', '')}`;
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
        
        {hoveredIdx !== null && (
          <line x1={points[hoveredIdx].x} y1="-5" x2={points[hoveredIdx].x} y2={height} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2" />
        )}

        <polyline points={pointsString} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        
        {hoveredIdx === null && (
          <circle cx={width} cy={points[points.length - 1].y} r="3.5" fill={color} stroke="#050508" strokeWidth="1.5" />
        )}

        {hoveredIdx !== null && (
          <circle cx={points[hoveredIdx].x} cy={points[hoveredIdx].y} r="4.5" fill={color} stroke="#fff" strokeWidth="2" style={{ transition: 'all 0.1s' }} />
        )}

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
            {Number(points[hoveredIdx].val.toFixed(1))}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Score Hist.
          </div>
        </div>
      )}
    </div>
  );
};

const TopArtistsChart = ({ selectedCountry, selectedGenre, onArtistClick }) => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchArtists = async () => {
      setIsLoading(true);
      
      const safeFormat = (selectedGenre === 'All' || selectedGenre === 0 || selectedGenre === '0') ? 0 : selectedGenre;
      const safeCountry = (selectedCountry === 'All' || selectedCountry === 0 || selectedCountry === '0') ? 1 : selectedCountry;

      const data = await getTrendingTopArtists(safeFormat, safeCountry, 0); // No city by default for top artists
      if (isMounted) {
        setArtists(data || []);
        setIsLoading(false);
      }
    };
    fetchArtists();
    return () => { isMounted = false; };
  }, [selectedGenre, selectedCountry]);

  const enrichedArtists = useMemo(() => {
    if (!artists) return [];
    return artists.map((a, idx) => {
      let val = 100 - (a.rk * 0.3);
      const trend = [];
      for (let i = 0; i < 20; i++) {
        val = val + (Math.sin(a.rk * 1.3 + i * 0.8) * 8) + (Math.cos(idx + i) * 6);
        trend.push(Math.max(10, val));
      }
      return { ...a, trend };
    });
  }, [artists]);

  if (isLoading) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '5rem', flexDirection: 'column', minHeight: '300px' }}>
        <Loader2 className="loading-spinner" size={48} color="var(--accent-primary)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '1rem' }}>Cargando analítica de artistas...</p>
      </div>
    );
  }

  if (!enrichedArtists || enrichedArtists.length === 0) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No se encontraron artistas en este género/país.</p>
      </div>
    );
  }

  const renderMovement = (mo) => {
    if (!mo) return null;
    const mov = String(mo).toUpperCase();
    if (mov.includes('UP')) return <ArrowUp size={16} color="#00e676" title="Subió" />;
    if (mov.includes('DOWN')) return <ArrowDown size={16} color="#ff3366" title="Bajó" />;
    if (mov.includes('NEW')) return <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent-primary)', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>NEW</span>;
    return <Minus size={16} color="var(--text-muted)" title="Sin cambio" />;
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem' }}>
      <style>{`
        .sparkline-wrapper { display: none; margin: 0 3rem 0 auto; pointer-events: auto; flex-shrink: 0; }
        @media (min-width: 900px) {
          .sparkline-wrapper { display: block; }
        }
        
        .artist-metrics-container { 
          display: flex; 
          gap: 1.5rem; 
          align-items: center;
          text-align: right;
        }
        .metric-item {
          position: relative;
          min-width: 80px;
        }
        .artist-score-tooltip {
          position: absolute;
          right: 0;
          bottom: 100%;
          transform: translateY(-10px);
          background: rgba(25, 25, 35, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.8rem;
          margin-bottom: 8px;
          border-radius: 12px;
          width: 220px;
          color: var(--text-muted);
          font-size: 0.8rem;
          line-height: 1.4;
          box-shadow: 0 12px 32px rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          text-align: left;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          z-index: 100;
        }
        
        .metric-item:hover .artist-score-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      `}</style>
      <div className="grid-base" style={{ gap: '0.5rem' }}>
        {enrichedArtists.map((artist, index) => {
          const rowColor = rankColors[index % rankColors.length];
          return (
            <div
              key={artist.rk || index}
              className="chart-row glass-panel-interactive"
              onClick={() => onArtistClick(artist)}
              style={{
                background: index === 0 ? 'rgba(162, 155, 254, 0.05)' : undefined,
                borderColor: index === 0 ? 'rgba(162, 155, 254, 0.3)' : undefined,
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
                    {artist.rk}
                  </span>
                  <div style={{ marginTop: '0.15rem' }}>
                    {renderMovement(artist.movement)}
                  </div>
                </div>

                <div className="chart-img-wrapper" style={{ borderRadius: '50%', border: '2px solid var(--glass-border)' }}>
                  <img src={artist.img || artist.avatar || artist.url || '/logo.png'} alt={artist.artist} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="flex-center" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                    <User size={20} color="#fff" />
                  </div>
                </div>

                <div className="chart-title-wrapper" style={{ minWidth: 0 }}>
                  <h3 className="chart-title" style={{ marginBottom: '0.1rem' }}>{artist.artist}</h3>
                  <p className="chart-artist" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', opacity: 0.7 }}>
                    <Users size={12} /> {formatNumber(artist.followers_total)} Followers
                  </p>
                </div>
              </div>

              <Sparkline data={artist.trend} color={rowColor} />

              <div className="artist-metrics-container">
                {/* Monthly Listeners Metric */}
                <div className="metric-item">
                  <div className="text-gradient chart-score" style={{ fontSize: '1.3rem' }}>
                    {formatNumber(artist.monthly_listeners)}
                  </div>
                  <span className="chart-score-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', fontSize: '0.7rem' }}>
                    <Headphones size={10} /> Oyentes <Info size={10} style={{ opacity: 0.5 }} />
                  </span>
                  <div className="artist-score-tooltip">
                    Cantidad de <strong style={{ color: '#fff' }}>Oyentes mensuales</strong> únicos que escuchan al artista en la plataforma.
                  </div>
                </div>

                {/* Playlists Metric */}
                <div className="metric-item">
                  <div className="text-gradient chart-score" style={{ fontSize: '1.3rem' }}>
                    {formatNumber(artist.playlists)}
                  </div>
                  <span className="chart-score-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', fontSize: '0.7rem' }}>
                    <ListMusic size={10} /> Playlists <Info size={10} style={{ opacity: 0.5 }} />
                  </span>
                  <div className="artist-score-tooltip">
                    Cantidad de veces que el artista ha sido <strong style={{ color: '#fff' }}>añadido a playlists</strong>.
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopArtistsChart;
