import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowUp, ArrowDown, Minus, Loader2, Search, Music2, Headphones, Radio, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAudioPreview } from '../hooks/useAudioPreview.jsx';
import { getChartByFormatoDigitalName, getCountries } from '../services/api';

const rankColors = [
  '#8a88ff', '#ff9eee', '#00f0ff', '#c193ff', '#ffb700',
  '#00e676', '#ff3366', '#74b9ff', '#a29bfe', '#fdcb6e',
  '#1db954', '#e056fd', '#00cec9', '#fd79a8', '#ffeaa7'
];

const FormatDigitalChartPage = ({ onSongClick }) => {
  const { formatName: rawFormatName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentlyPlaying, handlePlayPreview } = useAudioPreview();

  const formatName = useMemo(() => {
    return rawFormatName ? decodeURIComponent(rawFormatName) : '';
  }, [rawFormatName]);

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('0');
  const [topCount, setTopCount] = useState(100);
  const [countries, setCountries] = useState([]);

  // Load countries catalog
  useEffect(() => {
    getCountries()
      .then((res) => setCountries(Array.isArray(res) ? res : []))
      .catch((err) => console.error('Error fetching countries:', err));
  }, []);

  // Fetch chart data
  const fetchChart = async () => {
    if (!formatName) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getChartByFormatoDigitalName(formatName, selectedCountry, topCount);
      setSongs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching chart for format ${formatName}:`, err);
      setError('No se pudieron cargar los datos del chart. Reintenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
  }, [formatName, selectedCountry, topCount]);

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
        padding: '1.75rem 2rem',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '0.6rem',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Volver"
              >
                <ArrowLeft size={18} />
              </button>

              <span style={{
                background: 'rgba(193, 147, 255, 0.12)',
                border: '1px solid rgba(193, 147, 255, 0.25)',
                color: '#c193ff',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                CHART DIGITAL
              </span>
            </div>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'white',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <Music2 size={32} color="#c193ff" />
              {formatName || 'Formato Digital'}
            </h1>
            <p style={{ color: '#9ca3af', marginTop: '0.4rem', fontSize: '0.92rem', marginBottom: 0 }}>
              Ranking oficial de canciones en el formato <strong style={{ color: 'white' }}>{formatName}</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={fetchChart}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9ca3af',
                padding: '0.6rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Recargar chart"
            >
              <RefreshCw size={18} className={loading ? 'loader-spin-generos' : ''} />
            </button>

            <span style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              color: '#00f0ff',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}>
              {songs.length} Canciones
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Country, Top limit */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
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

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '0.65rem 1rem',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="0" style={{ background: '#12131c' }}>🌐 Todos los Países</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id} style={{ background: '#12131c' }}>
                {c.description || c.country || c.id}
              </option>
            ))}
          </select>

          <select
            value={topCount}
            onChange={(e) => setTopCount(Number(e.target.value))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '0.65rem 1rem',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value={50} style={{ background: '#12131c' }}>Top 50</option>
            <option value={100} style={{ background: '#12131c' }}>Top 100</option>
            <option value={200} style={{ background: '#12131c' }}>Top 200</option>
          </select>
        </div>
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
            Intenta cambiar los filtros de país o búsqueda.
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
    </div>
  );
};

export default FormatDigitalChartPage;
