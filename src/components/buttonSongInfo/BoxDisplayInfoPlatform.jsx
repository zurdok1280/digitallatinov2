import React from 'react';
import { 
  Music, Headphones, Monitor, Video, Activity, Globe, ListMusic, 
  BarChart2, ThumbsUp, MessageCircle, Share2, PlaySquare, Heart, TrendingUp, Eye
} from 'lucide-react';

const formatNumber = (num) => {
  if (!num) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return Math.round(n).toLocaleString();
};

const TiktokIcon = ({ size=16, color="#ff0050" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.41-5.46.02-2.33 1.56-4.33 3.65-5.26 1.43-.63 3.06-.7 4.54-.25.08.02.16.05.24.08V15.4c-.03-.01-.06-.02-.09-.03-.89-.3-1.87-.2-2.68.25-.85.47-1.45 1.34-1.45 2.29-.01 1.05.69 1.98 1.66 2.34.82.32 1.77.21 2.5-.27.87-.58 1.4-1.57 1.38-2.61-.01-5.83-.01-11.66-.01-17.48l1.19-.06z"/>
  </svg>
);

const PlatformCard = ({ title, icon: Icon, logo, color, rank, metrics, delay }) => {
  return (
    <div 
      className="glass-panel-interactive animate-fade-in" 
      style={{ 
        padding: '1.5rem', 
        borderTop: `4px solid ${color}`, 
        background: `linear-gradient(180deg, ${color}11 0%, transparent 100%)`,
        opacity: 0,
        animationDelay: `${delay}s`,
        animationFillMode: 'forwards',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            background: `${color}22`, 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            padding: logo ? '0.4rem' : '0'
          }}>
            {logo ? (
              <img src={logo} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Icon size={24} color={color} />
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{title}</h3>
        </div>
        {rank > 0 && (
          <div style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '0.3rem 0.6rem', 
            borderRadius: '6px', 
            border: `1px solid ${color}44`,
            fontSize: '0.75rem',
            fontWeight: 800,
            color: color
          }}>
            Rank #{rank}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
        {metrics.map((m, i) => m.value !== undefined && m.value !== null && (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px' }}>
              {m.icon && <m.icon size={12} />} {m.label}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
              {typeof m.value === 'number' && m.format !== false ? formatNumber(m.value) : m.value}
              {m.suffix || ''}
            </div>
            {m.subtitle && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {m.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BoxDisplayInfoPlatform = ({ data }) => {
  if (!data) return (
    <div className="flex-center" style={{ height: '300px', color: 'var(--text-muted)' }}>
      No hay datos de plataformas disponibles para esta canción.
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(138, 136, 255, 0.15)', border: '1px solid rgba(138, 136, 255, 0.3)' }}>
          <Globe size={20} color="var(--accent-primary)" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Rendimiento Multiplataforma</h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Análisis detallado de métricas distribuidas en los servicios más importantes.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Spotify */}
        <PlatformCard 
          title="Spotify" 
          logo="/logos/spotify-icon.png"
          icon={Headphones} 
          color="#1DB954" 
          rank={data.rk_spotify || 0}
          delay={0.1}
          metrics={[
            { label: 'Streams Totales', value: data.spotify_streams_total, icon: Activity },
            { label: 'Popularidad', value: data.spotify_popularity_current, format: false, suffix: '/100', icon: Heart },
            { label: 'Playlists Activas', value: data.spotify_playlists_current, icon: ListMusic },
            { label: 'Alcance Playlists', value: data.spotify_playlists_reach_current, icon: Globe },
            { label: 'Apariciones Chart', value: data.spotify_charts_total, icon: BarChart2 }
          ]} 
        />

        {/* TikTok */}
        <PlatformCard 
          title="TikTok" 
          logo="/logos/tiktok-icon.png"
          icon={TiktokIcon} 
          color="#ff0050" 
          rank={data.rk_tiktok || 0}
          delay={0.2}
          metrics={[
            { label: 'Views Totales', value: data.tiktok_views_total, icon: Eye },
            { label: 'Videos Creados', value: data.tiktok_videos_total, icon: Video },
            { label: 'Likes Totales', value: data.tiktok_likes_total, icon: ThumbsUp },
            { label: 'Compartidos', value: data.tiktok_shares_total, icon: Share2 },
            { label: 'Comentarios', value: data.tiktok_comments_total, icon: MessageCircle },
            { label: 'Engagement Rate', value: data.tiktok_engagement_rate_total, format: false, suffix: '%', icon: TrendingUp }
          ]} 
        />

        {/* YouTube */}
        <PlatformCard 
          title="YouTube" 
          logo="/logos/youtube-icon.svg"
          icon={PlaySquare} 
          color="#FF0000" 
          rank={data.rk_youtube || 0}
          delay={0.3}
          metrics={[
            { label: 'Video Vistas', value: data.youtube_video_views_total, icon: Eye },
            { label: 'Vistas Shorts', value: data.youtube_short_views_total, icon: Eye },
            { label: 'Videos Totales', value: data.youtube_videos_total, icon: Video },
            { label: 'Likes Totales', value: data.youtube_video_likes_total, icon: ThumbsUp },
            { label: 'Engagement Rate', value: data.youtube_engagement_rate_total, format: false, suffix: '%', icon: TrendingUp }
          ]} 
        />

        {/* Apple Music */}
        <PlatformCard 
          title="Apple Music" 
          logo="/logos/applemusic-icon.png"
          icon={Music} 
          color="#FA243C" 
          rank={0}
          delay={0.4}
          metrics={[
            { label: 'Playlists C.', value: data.apple_playlists_current, icon: ListMusic },
            { label: 'Playlists T.', value: data.apple_playlists_total, icon: ListMusic },
            { label: 'Charts Actual', value: data.apple_charts_currents, icon: BarChart2 },
            { label: 'Charts Total', value: data.apple_charts_total, icon: BarChart2 }
          ]} 
        />

        {/* Shazam */}
        <PlatformCard 
          title="Shazam" 
          logo="/logos/shazam-icon.svg"
          icon={Activity} 
          color="#0088FF" 
          rank={data.rk_shazam || 0}
          delay={0.5}
          metrics={[
            { label: 'Shazams Totales', value: data.shazam_shazams_total, icon: Activity },
            { label: 'Charts Actual', value: data.shazam_charts_current, icon: BarChart2 },
            { label: 'Charts Total', value: data.shazam_charts_total, icon: BarChart2 }
          ]} 
        />

        {/* Deezer */}
        <PlatformCard 
          title="Deezer" 
          logo="/logos/deezer-icon.png"
          icon={Headphones} 
          color="#FEAA2D" 
          rank={0}
          delay={0.6}
          metrics={[
            { label: 'Popularidad', value: data.deezer_popularity_current, format: false, suffix: '/100', icon: Heart },
            { label: 'Playlists', value: data.deezer_playlists_current, icon: ListMusic },
            { label: 'Alcance Playlists', value: data.deezer_playlist_reach_current, icon: Globe },
            { label: 'Charts Total', value: data.deezer_charts_total, icon: BarChart2 }
          ]} 
        />
        
        {/* Amazon Music */}
        <PlatformCard 
          title="Amazon Music" 
          logo="/logos/amazonmusic-icon.svg"
          icon={Music} 
          color="#00A8E1" 
          rank={0}
          delay={0.7}
          metrics={[
            { label: 'Playlists C.', value: data.amazon_playlists_current, icon: ListMusic },
            { label: 'Playlists T.', value: data.amazon_paylists_total, icon: ListMusic },
            { label: 'Charts C.', value: data.amazon_charts_current, icon: BarChart2 },
            { label: 'Charts T.', value: data.amazon_charts_total, icon: BarChart2 }
          ]} 
        />

        {/* SoundCloud & Tidal Panel (combined to save space or separate) */}
        {(data.soundcloud_streams_total || data.rk_soundcloud || data.tidal_playlists_total) && (
          <PlatformCard 
            title="SoundCloud / Tidal" 
            logo={data.soundcloud_streams_total ? "/logos/soundcloud-icon.svg" : "/logos/tidal-icon.png"}
            icon={Headphones} 
            color="#FF5500" 
            rank={data.rk_soundcloud || 0}
            delay={0.8}
            metrics={[
              { label: 'SC Streams', value: data.soundcloud_streams_total, icon: Activity },
              { label: 'SC Favoritos', value: data.soundcloud_favorites_total, icon: Heart },
              { label: 'TD Playlists', value: data.tidal_playlists_total, icon: ListMusic },
              { label: 'TD Popularidad', value: data.tidal_popularity_current, format: false, suffix: '/100', icon: Heart }
            ]} 
          />
        )}
        
        {/* Pandora Metrics if exist */}
        {data.pan_streams > 0 && (
          <PlatformCard 
            title="Pandora" 
            logo="/logos/pandora-icon.png"
            icon={Music} 
            color="#224099" 
            rank={data.rk_pandora || 0}
            delay={0.9}
            metrics={[
              { label: 'Streams Totales', value: data.pan_streams, icon: Activity }
            ]} 
          />
        )}

      </div>
    </div>
  );
};

export default BoxDisplayInfoPlatform;
