import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, ArrowUp, ArrowDown, Minus, Loader2, Search, Music2, Headphones, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAudioPreview } from '../hooks/useAudioPreview.jsx';
import { getChartByFormatoDigitalName } from '../services/api';
import { slugify } from '../utils/seoFilters.js';

const rankColors = [
  '#8a88ff', '#ff9eee', '#00f0ff', '#c193ff', '#ffb700',
  '#00e676', '#ff3366', '#74b9ff', '#a29bfe', '#fdcb6e',
  '#1db954', '#e056fd', '#00cec9', '#fd79a8', '#ffeaa7'
];

const FormatDigitalChartPage = ({ onSongClick }) => {
  const { formatName: rawFormatName } = useParams();
  const { user } = useAuth();
  const { currentlyPlaying, handlePlayPreview } = useAudioPreview();

  const formatName = useMemo(() => {
    return rawFormatName ? decodeURIComponent(rawFormatName) : '';
  }, [rawFormatName]);

  const [songs, setSongs] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch chart data
  const fetchChart = async () => {
    if (!formatName) return;
    setLoading(true);
    setError(null);
    try {
      const responseData = await getChartByFormatoDigitalName(formatName, 0, 100);
      const fetchedSongs = Array.isArray(responseData) ? responseData : (responseData?.results || []);
      const fetchedMeta = responseData?.metadata || null;
      setSongs(fetchedSongs);
      setMetadata(fetchedMeta);
    } catch (err) {
      console.error(`Error fetching chart for format ${formatName}:`, err);
      setError('No se pudieron cargar los datos del chart. Reintenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
  }, [formatName]);

  // Helper function to set or update <meta> tags
  const setMetaTag = (attrName, attrValue, content) => {
    let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attrName, attrValue);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content || '');
  };

  // Helper function to set or update <link rel="canonical">
  const setCanonicalLink = (href) => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href || window.location.href);
  };

  // Inject dynamic SEO Metadata, Canonical link & Open Graph into document head
  useEffect(() => {
    const chartName = metadata?.chart_name || metadata?.format || formatName || 'Chart Digital';
    const metaTitle = metadata?.meta_title;
    const fullTitle = metaTitle || `${chartName}: los que más suenan | Digital Latino`;
    document.title = fullTitle;

    const metaDescription = metadata?.meta_description || `Ranking oficial de canciones en el formato ${chartName}.`;
    const cleanSlug = slugify(chartName || formatName);
    const canonicalUrl = metadata?.canonical_url || `${window.location.origin}/chart/${cleanSlug}`;

    // Standard Meta Tags
    setMetaTag('name', 'description', metaDescription);
    if (metadata?.meta_keywords) {
      setMetaTag('name', 'keywords', metadata.meta_keywords);
    }

    // Canonical URL
    setCanonicalLink(canonicalUrl);

    // Open Graph Meta Tags
    const topSong = songs[0];
    const topSongImgRaw = topSong ? (topSong.avatar || topSong.img || topSong.image_url || '/logo.png') : '/logo.png';
    const ogImage = topSongImgRaw.startsWith('http')
      ? topSongImgRaw
      : `${window.location.origin}${topSongImgRaw.startsWith('/') ? '' : '/'}${topSongImgRaw}`;

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'music.playlist');

    // Dynamic Schema MusicPlaylist JSON-LD
    let schemaScript = document.getElementById('music-playlist-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'music-playlist-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const playlistSchema = {
      "@context": "https://schema.org",
      "@type": "MusicPlaylist",
      "name": `${chartName} — Digital Latino`,
      "description": metaDescription,
      "numTracks": songs.length,
      "track": songs.map((song, idx) => ({
        "@type": "MusicRecording",
        "position": song.posicion || song.rk || (idx + 1),
        "name": song.song || song.cancion || song.title || '',
        "byArtist": {
          "@type": "MusicGroup",
          "name": song.artists || song.artista || song.artist || ''
        }
      }))
    };

    schemaScript.textContent = JSON.stringify(playlistSchema, null, 2);

    return () => {
      const existingScript = document.getElementById('music-playlist-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [metadata, formatName, songs]);

  // Filter songs by search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return songs.filter((s) => {
      const songName = (s.song || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const artistName = (s.artists || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const labelName = (s.label || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return songName.includes(q) || artistName.includes(q) || labelName.includes(q);
    });
  }, [songs, searchQuery]);

  const renderMovement = (mo) => {
    if (!mo) return null;
    const mov = String(mo).toLowerCase();
    if (mov.includes('up')) return <ArrowUp size={16} color="var(--accent-primary, #00f0ff)" title="Subió" />;
    if (mov.includes('down')) return <ArrowDown size={16} color="#ff3366" title="Bajó" />;
    return <Minus size={16} color="#9ca3af" title="Sin cambio" />;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0b10',
      color: '#f3f4f6',
      padding: '2rem 1.5rem 8rem',
      position: 'relative',
    }}>
      {/* Header Banner */}
      <div style={{
        position: 'relative',
        marginBottom: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '2rem',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
      }}>
        {/* Accent Glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #c193ff, #00f0ff, #ff3366)',
          opacity: 0.8,
        }} />

        <span style={{
          background: 'rgba(193, 147, 255, 0.12)',
          border: '1px solid rgba(193, 147, 255, 0.25)',
          color: '#c193ff',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
        }}>
          CHART DIGITAL
        </span>

        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 900,
          color: 'white',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          <Music2 size={32} color="#c193ff" />
          {formatName || 'Formato Digital'}
        </h1>

        <p style={{ color: '#9ca3af', marginTop: '0.5rem', fontSize: '0.95rem', marginBottom: 0 }}>
          {metadata?.meta_description || (
            <>Ranking oficial de canciones en el formato <strong style={{ color: 'white' }}>{formatName}</strong>.</>
          )}
        </p>
      </div>

      {/* Controls Bar: Centered Search & Refresh */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '520px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Buscar por canción, artista o sello..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1rem',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              color: 'white',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>
        <button
          onClick={fetchChart}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#9ca3af',
            padding: '0.75rem',
            borderRadius: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Recargar chart"
        >
          <RefreshCw size={18} className={loading ? 'loader-spin-generos' : ''} />
        </button>
      </div>

      {/* Chart Rows Container */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#c193ff' }}>
          <Loader2 size={36} className="loader-spin-generos" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600 }}>Cargando ranking de canciones...</p>
        </div>
      ) : error ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '1.5rem',
          color: '#ef4444',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={fetchChart}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reintentar
          </button>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '1.5rem',
          color: '#9ca3af',
        }}>
          <Music2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
            No se encontraron canciones para el formato "{formatName}"
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Intenta ingresar otro término de búsqueda.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filteredSongs.map((song, idx) => {
            const rank = song.posicion || song.rk || (idx + 1);
            const rankPrev = song.posicion_anterior || song.rk_lw;
            const streams = song.spotify_streams ? Number(song.spotify_streams).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—';
            const score = song.score ? Number(song.score).toFixed(2) : null;
            const rankColor = rankColors[idx % rankColors.length];

            const songImg = song.avatar || song.img || song.image_url || '/logo.png';
            const isPlayingThis = currentlyPlaying?.id === (song.cs_song || song.fk_track);

            return (
              <div
                key={song.cs_song || idx}
                onClick={() => onSongClick && onSongClick(song)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  background: idx === 0 ? 'rgba(193, 147, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: idx === 0 ? '1px solid rgba(193, 147, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(6px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = idx === 0 ? 'rgba(193, 147, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Rank Number */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '45px',
                }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: rankColor, lineHeight: 1 }}>
                    {rank}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '0.2rem' }}>
                    {renderMovement(song.movement)}
                    {rankPrev && (
                      <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>
                        ({rankPrev})
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar / Cover with Play button */}
                <div
                  style={{
                    position: 'relative',
                    width: '48px',
                    height: '48px',
                    borderRadius: '0.6rem',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPreview(e, { ...song, id: song.cs_song || song.fk_track });
                  }}
                >
                  <img
                    src={songImg}
                    alt={song.song}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isPlayingThis ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                  }}
                    className="play-hover-overlay"
                  >
                    {isPlayingThis ? (
                      <Pause size={20} color="#00f0ff" fill="#00f0ff" />
                    ) : (
                      <Play size={20} color="white" fill="white" style={{ marginLeft: '2px' }} />
                    )}
                  </div>
                </div>

                {/* Song Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'white',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {song.song}
                  </h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#c193ff',
                    margin: '0.2rem 0 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                  }}>
                    {song.artists}
                  </p>
                  {song.label && (
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.label}
                    </span>
                  )}
                </div>

                {/* Streams & Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <Headphones size={14} color="#1DB954" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1DB954' }}>
                      {streams}
                    </span>
                  </div>
                  {score && (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>
                      Score: {score}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer Note (Bottom) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '0.75rem',
        padding: '0.65rem 1rem',
        fontSize: '0.82rem',
        color: '#9ca3af',
        marginTop: '2rem',
        maxWidth: '720px',
        marginInline: 'auto',
      }}>
        <Info size={15} color="#c193ff" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: '#e5e7eb' }}>Nota:</strong> Los charts consideran únicamente canciones en español con una fecha de lanzamiento menor a un año.
        </span>
      </div>
    </div>
  );
};

export default FormatDigitalChartPage;
