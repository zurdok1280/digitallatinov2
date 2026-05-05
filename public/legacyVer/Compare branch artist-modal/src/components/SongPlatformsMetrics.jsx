import React, { useState } from 'react';
import { TrendingUp, Trophy, Loader2, Radio } from 'lucide-react';

const SONG_PLATFORMS = [
  {
    key: 'spotify', name: 'Spotify', logo: '/logos/spotify-icon.png', accentColor: '#1DB954',
    rankKey: 'rk_spotify',
    fields: [
      { key: 'spotify_streams_total', label: 'Total Streams' },
      { key: 'spotify_popularity_current', label: 'Popularidad' },
      { key: 'spotify_playlists_current', label: 'Playlists Actuales' },
      { key: 'spotify_playlists_reach_current', label: 'Reach Actual' },
      { key: 'spotify_playlists_reach_total', label: 'Reach Total' },
      { key: 'spotify_charts_total', label: 'Charts Total' },
    ],
  },
  {
    key: 'youtube', name: 'YouTube', logo: '/logos/youtube-icon.svg', accentColor: '#FF0000',
    rankKey: 'rk_youtube',
    fields: [
      { key: 'youtube_video_views_total', label: 'Views Totales' },
      { key: 'youtube_video_likes_total', label: 'Likes Totales' },
      { key: 'youtube_shorts_total', label: 'Shorts Total' },
      { key: 'youtube_short_views_total', label: 'Short Views' },
      { key: 'youtube_engagement_rate_total', label: 'Engagement Rate', isRate: true },
    ],
  },
  {
    key: 'tiktok', name: 'TikTok', logo: '/logos/tiktok-icon.png', accentColor: '#ff0050',
    rankKey: 'rk_tiktok',
    fields: [
      { key: 'tiktok_videos_total', label: 'Videos Total' },
      { key: 'tiktok_views_total', label: 'Views Total' },
      { key: 'tiktok_likes_total', label: 'Likes Total' },
      { key: 'tiktok_shares_total', label: 'Shares Total' },
      { key: 'tiktok_engagement_rate_total', label: 'Engagement Rate', isRate: true },
    ],
  },
  {
    key: 'radio', name: 'Radio', icon: Radio, accentColor: '#FF9800',
    rankKey: 'rk_radio',
    fields: [
      { key: 'radio_spins_total', label: 'Spins' },
      { key: 'radio_score', label: 'Score' },
      { key: 'radio_tw_stations', label: 'No. de emisoras' },
      { key: 'radio_audience_total', label: 'Reach Total' },
      { key: 'radio_tw_audience', label: 'Reach TW' },
      { key: 'radio_tw_spins', label: 'Spins TW' },
    ],
  },
  {
    key: 'shazam', name: 'Shazam', logo: '/logos/shazam-icon.svg', accentColor: '#0A88FF',
    rankKey: 'rk_shazam',
    fields: [
      { key: 'shazam_shazams_total', label: 'Shazams Total' },
      { key: 'shazam_charts_current', label: 'Charts Actuales' },
      { key: 'shazam_charts_total', label: 'Charts Total' },
    ],
  },
  {
    key: 'deezer', name: 'Deezer', logo: '/logos/deezer-icon.png', accentColor: '#A238FF',
    rankKey: 'rk_deezer',
    fields: [
      { key: 'deezer_popularity_current', label: 'Popularidad' },
      { key: 'deezer_playlists_current', label: 'Playlists Actuales' },
      { key: 'deezer_playlists_total', label: 'Playlists Total' },
      { key: 'deezer_charts_current', label: 'Charts Actuales' },
      { key: 'deezer_charts_total', label: 'Charts Total' },
    ],
  },
  {
    key: 'apple', name: 'Apple Music', logo: '/logos/applemusic-icon.png', accentColor: '#fc3c44',
    rankKey: 'rk_apple',
    fields: [
      { key: 'apple_playlists_current', label: 'Playlists Actuales' },
      { key: 'apple_playlists_total', label: 'Playlists Total' },
      { key: 'apple_charts_currents', label: 'Charts Actuales' },
      { key: 'apple_charts_total', label: 'Charts Total' },
    ],
  },
  {
    key: 'amazon', name: 'Amazon Music', logo: '/logos/amazonmusic-icon.svg', accentColor: '#00A8E1',
    rankKey: 'rk_amazon',
    fields: [
      { key: 'amazon_playlists_current', label: 'Playlists Actuales' },
      { key: 'amazon_paylists_total', label: 'Playlists Total' },
      { key: 'amazon_charts_current', label: 'Charts Actuales' },
      { key: 'amazon_charts_total', label: 'Charts Total' },
    ],
  },
  {
    key: 'soundcloud', name: 'SoundCloud', logo: '/logos/soundcloud-icon.svg', accentColor: '#FF5500',
    rankKey: 'rk_soundcloud',
    fields: [
      { key: 'soundcloud_streams_total', label: 'Streams Total' },
      { key: 'soundcloud_favorites_total', label: 'Favoritos Total' },
      { key: 'soundcloud_reposts_total', label: 'Reposts Total' },
      { key: 'soundcloud_engagement_rate_total', label: 'Engagement Rate', isRate: true },
    ],
  },
  {
    key: 'tidal', name: 'Tidal', logo: '/logos/tidal-icon.png', accentColor: '#00FFFF',
    rankKey: 'rk_tidal',
    fields: [
      { key: 'tidal_popularity_current', label: 'Popularidad' },
      { key: 'tidal_playlists_current', label: 'Playlists Actuales' },
      { key: 'tidal_playlists_total', label: 'Playlists Total' },
    ],
  },
];

const fmtPlatVal = (val, isRate) => {
  if (val === null || val === undefined || isNaN(Number(val))) return 'N/A';
  const n = Number(val);
  if (isRate) return (n * 100).toFixed(1) + '%';
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Math.round(n).toLocaleString();
};

const SongPlatformsMetrics = ({ songPlatformData, isSongPlatformLoading }) => {
  const [selectedPlatformKey, setSelectedPlatformKey] = useState('spotify');

  return (
    <div>
      {/* Section Title */}
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}>
        <TrendingUp size={18} color="var(--accent-primary)" /> Estadísticas por Plataformas
      </h3>

      {/* Platform Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.2rem' }}>
        {SONG_PLATFORMS.map(p => (
          <button
            key={p.key}
            onClick={() => setSelectedPlatformKey(p.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              border: selectedPlatformKey === p.key ? `2px solid ${p.accentColor}` : '2px solid rgba(255,255,255,0.08)',
              background: selectedPlatformKey === p.key ? `${p.accentColor}22` : 'rgba(255,255,255,0.03)',
              color: selectedPlatformKey === p.key ? p.accentColor : 'var(--text-muted)',
              fontWeight: selectedPlatformKey === p.key ? 700 : 400,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {p.icon ? (
              <p.icon size={16} color={selectedPlatformKey === p.key ? p.accentColor : 'gray'} style={{ filter: selectedPlatformKey !== p.key ? 'opacity(0.6)' : 'none' }} />
            ) : (
              <img src={p.logo} alt={p.name} style={{ width: 16, height: 16, objectFit: 'contain', borderRadius: 3, filter: selectedPlatformKey !== p.key ? 'grayscale(60%) opacity(0.6)' : 'none' }} />
            )}
            {p.name}
          </button>
        ))}
      </div>

      {/* Active Platform Header */}
      {(() => {
        const activePlat = SONG_PLATFORMS.find(p => p.key === selectedPlatformKey);
        const rankVal = songPlatformData ? songPlatformData[activePlat.rankKey] : null;
        return (
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              borderTop: `3px solid ${activePlat.accentColor}`,
              background: `linear-gradient(135deg, ${activePlat.accentColor}0d 0%, rgba(0,0,0,0) 60%)`,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Watermark glow */}
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle, ${activePlat.accentColor}33 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: `1px solid ${activePlat.accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                  {activePlat.icon ? (
                    <activePlat.icon size={32} color={activePlat.accentColor} />
                  ) : (
                    <img src={activePlat.logo} alt={activePlat.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{activePlat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Métricas de la canción</div>
                </div>
              </div>

              {rankVal > 0 && (
                <div style={{ background: `${activePlat.accentColor}22`, border: `1px solid ${activePlat.accentColor}55`, borderRadius: 12, padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trophy size={14} color={activePlat.accentColor} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activePlat.accentColor }}>Rank #{fmtPlatVal(rankVal, false)}</span>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            {isSongPlatformLoading ? (
              <div className="flex-center" style={{ height: 120 }}>
                <Loader2 className="loading-spinner" size={28} color={activePlat.accentColor} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.8rem' }}>
                {activePlat.fields.map(field => {
                  const rawVal = songPlatformData ? songPlatformData[field.key] : null;
                  const formatted = rawVal !== null && rawVal !== undefined ? fmtPlatVal(rawVal, field.isRate) : 'N/A';
                  const hasData = rawVal && Number(rawVal) > 0;
                  return (
                    <div
                      key={field.key}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12,
                        padding: '0.9rem 1rem',
                        display: 'flex', flexDirection: 'column', gap: '0.3rem',
                        transition: 'all 0.2s',
                        cursor: 'default',
                        borderLeft: hasData ? `3px solid ${activePlat.accentColor}` : '3px solid rgba(255,255,255,0.06)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: hasData ? 'var(--text-main)' : 'rgba(255,255,255,0.2)', lineHeight: 1.1 }}>{formatted}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No data message */}
            {!isSongPlatformLoading && songPlatformData && activePlat.fields.every(f => !songPlatformData[f.key] || Number(songPlatformData[f.key]) === 0) && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No hay datos disponibles para {activePlat.name}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default SongPlatformsMetrics;
