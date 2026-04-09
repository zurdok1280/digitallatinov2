import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Music, Activity, SquarePlay, Headphones, TrendingUp, Heart, Globe, Map, Loader2, Share2, MessageCircle, ThumbsUp, Disc, Trophy, ExternalLink, ChevronUp, ChevronDown, MapPin, Video } from 'lucide-react';
import ArtistMap from './ArtistMap';
import BoxDisplayInfoPlatform from './buttonSongInfo/BoxDisplayInfoPlatform';
import { getSongPlatformData, getCityDataForSong, getSongTopPlaylists, getPlaylistTypes } from '../services/api';
import SearchableSelect from './SearchableSelect';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const InstagramIcon = ({ size=16, color="currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size=16, color="currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TiktokIcon = ({ size=16, color="#ff0050" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.41-5.46.02-2.33 1.56-4.33 3.65-5.26 1.43-.63 3.06-.7 4.54-.25.08.02.16.05.24.08V15.4c-.03-.01-.06-.02-.09-.03-.89-.3-1.87-.2-2.68.25-.85.47-1.45 1.34-1.45 2.29-.01 1.05.69 1.98 1.66 2.34.82.32 1.77.21 2.5-.27.87-.58 1.4-1.57 1.38-2.61-.01-5.83-.01-11.66-.01-17.48l1.19-.06z"/>
  </svg>
);

const PlatformsDetailsModal = ({ song, countries = [], onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [platformData, setPlatformData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mapData, setMapData] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [selectedMapCountry, setSelectedMapCountry] = useState(0);
  
  const [playlists, setPlaylists] = useState([]);
  const [playlistTypes, setPlaylistTypes] = useState([]);
  const [selectedPlaylistType, setSelectedPlaylistType] = useState(1); // Default to Editorial (id=1)
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  
  const tabsRef = useRef(null);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    // Bloquear el scroll de la página de fondo
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getSongPlatformData(song?.cs_song || song?.csSong || song?.id);
      if (isMounted) {
        setPlatformData(data && Object.keys(data).length > 0 ? data : null);
        setIsLoading(false);
      }
    };
    if (song) fetchData();
    return () => { isMounted = false; };
  }, [song]);

  useEffect(() => {
    let isMounted = true;
    const fetchMap = async () => {
      setIsMapLoading(true);
      const data = await getCityDataForSong(song?.cs_song || song?.csSong || song?.id, selectedMapCountry);
      if (isMounted) {
        // Transform the song map fields to match what ArtistMap expects
        const formattedData = (data || []).map(city => ({
          ...city,
          city_name: city.cityname,
          current_listeners: city.listeners,
          city_lat: city.citylat,
          city_lng: city.citylng
        }));
        setMapData(formattedData);
        setIsMapLoading(false);
      }
    };
    if (song) fetchMap();
    return () => { isMounted = false; };
  }, [song, selectedMapCountry]);

  // Fetch Playlist Types
  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getPlaylistTypes();
      if (types && types.length > 0) {
        setPlaylistTypes(types);
      } else {
        // Fallback for types if API fails
        setPlaylistTypes([
          { id: 0, name: "General" },
          { id: 1, name: "Editorial" },
          { id: 2, name: "Chart" },
          { id: 4, name: "Listener" },
          { id: 5, name: "Personalized" },
          { id: 6, name: "Artist Radio" }
        ]);
      }
    };
    fetchTypes();
  }, []);

  // Fetch Playlists when song or selectedPlaylistType changes
  useEffect(() => {
    let isMounted = true;
    const fetchPlaylists = async () => {
      if (!song?.cs_song && !song?.id) return;
      setIsLoadingPlaylists(true);
      const data = await getSongTopPlaylists(song?.cs_song || song?.id, selectedPlaylistType);
      if (isMounted) {
        setPlaylists(data || []);
        setIsLoadingPlaylists(false);
      }
    };
    fetchPlaylists();
    return () => { isMounted = false; };
  }, [song, selectedPlaylistType]);

  if (!song) return null;

  const imageUrl = song.image_url || song.img || song.avatar || 'https://via.placeholder.com/150';

  return (
    <div 
      className="flex-center modal-overlay-padding" 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, padding: '2rem', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="glass-panel animate-fade-in modal-container" 
        style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-hero-header" style={{ position: 'relative', height: '200px', width: '100%', flexShrink: 0 }}>
          <img src={imageUrl} alt={song.song} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-dark), rgba(0,0,0,0.2))' }} />
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '50%', color: 'white', zIndex: 20, cursor: 'pointer', border: 'none' }}
          >
            <X size={24} />
          </button>
          
          <div className="modal-hero-info" style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', zIndex: 10 }}>
            <img className="modal-hero-avatar" src={imageUrl} style={{ width: '100px', height: '100px', borderRadius: '12px', border: '3px solid var(--accent-primary)', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }} />
            <div>
              <h1 className="modal-hero-title" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1.1, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{song.song}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, margin: '0.4rem 0 0 0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {song.artists || song.artist}
              </p>
              {platformData && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Headphones size={14}/> {formatNumber(platformData.spotify_streams_total)} Spotify</span>
                  <span style={{ color: '#ff0050', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><SquarePlay size={14}/> {formatNumber(platformData.tiktok_views_total)} TikTok</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div 
          ref={tabsRef}
          className="custom-scrollbar modal-tab-bar"
          style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--glass-border)', 
            padding: '0 2rem', 
            gap: '2rem',
            overflowX: 'auto',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            background: 'var(--bg-dark)',
            zIndex: 100
          }}
        >
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
          `}</style>
          {[
            { id: 'overview', label: 'Panorama', icon: Activity },
            { id: 'mapa', label: 'Mapa', icon: Map },
            { id: 'info_plataformas', label: 'Info de Plataformas', icon: Globe },
            { id: 'playlists', label: 'Top Playlists', icon: Trophy }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                padding: '1.5rem 0', 
                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                fontWeight: activeTab === tab.id ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: 'transparent',
                cursor: 'pointer',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none'
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="modal-content-area" style={{ padding: '2rem', flex: 1, minHeight: '300px' }}>
          {isLoading && activeTab !== 'mapa' ? (
            <div className="flex-center" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
              <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando inteligencia multiplataforma...</p>
            </div>
          ) : !platformData && activeTab !== 'mapa' ? (
            <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-muted)' }}>
              No se encontraron datos de plataformas para esta canción.
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid-base" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {/* TikTok Specific Metrics - Rendered FIRST if coming from TikTok Picks */}
                  {(song.no_videos !== undefined || song.likes_total !== undefined) && (
                    <>
                      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 80, 0.05)', borderLeft: '4px solid #ff0050' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Video size={16} color="#ff0050" /> Videos Creados
                        </h3>
                        <p className="text-gradient-secondary" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(song.no_videos || 0)}</p>
                      </div>

                      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 80, 0.05)', borderLeft: '4px solid #ff0050' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ThumbsUp size={16} color="#ff0050" /> Likes Totales
                        </h3>
                        <p className="text-gradient-secondary" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(song.likes_total || 0)}</p>
                      </div>

                      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 80, 0.05)', borderLeft: '4px solid #ff0050' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MessageCircle size={16} color="#ff0050" /> Comentarios
                        </h3>
                        <p className="text-gradient-secondary" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(song.comments_total || 0)}</p>
                      </div>

                      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 80, 0.05)', borderLeft: '4px solid #ff0050' }}>
                        <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Share2 size={16} color="#ff0050" /> Compartidos
                        </h3>
                        <p className="text-gradient-secondary" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(song.shares_total || 0)}</p>
                      </div>
                    </>
                  )}

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(29, 185, 84, 0.05)', borderLeft: '4px solid #1DB954' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Headphones size={16} color="#1DB954" /> Streams Spotify
                    </h3>
                    <p className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(platformData.spotify_streams_total)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 80, 0.05)', borderLeft: '4px solid #ff0050' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TiktokIcon size={16} /> TikTok Views
                    </h3>
                    <p className="text-gradient-secondary" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(platformData.tiktok_views_total)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 0, 0.05)', borderLeft: '4px solid #FF0000' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <SquarePlay size={16} color="#FF0000" /> YouTube Vistas
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(platformData.youtube_video_views_total || 0)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(0, 136, 255, 0.05)', borderLeft: '4px solid #0088FF' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={16} color="#0088FF" /> Shazams
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(platformData.shazam_shazams_total || 0)}</p>
                  </div>
                  
                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-tertiary)' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} color="var(--accent-tertiary)" /> Reproducciones
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(song.data_res || song.score || 0)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Heart size={16} color="#ffb700" /> Popularidad
                    </h3>
                    <p className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{platformData.spotify_popularity_current || 0}/100</p>
                  </div>
                </div>
              )}

              {activeTab === 'playlists' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Summary & Filter Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div className="glass-panel" style={{ padding: '0.8rem 1.2rem', background: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.2)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Playlists Totales</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#6C63FF' }}>{playlists.length}</p>
                      </div>
                      <div className="glass-panel" style={{ padding: '0.8rem 1.2rem', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Seguidores Totales</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--accent-primary)' }}>
                          {formatNumber(playlists.reduce((acc, p) => acc + (p.followers || 0), 0))}
                        </p>
                      </div>
                    </div>

                    <div style={{ minWidth: '180px' }}>
                      <SearchableSelect
                        options={playlistTypes.map(type => ({ value: String(type.id), label: type.name }))}
                        value={String(selectedPlaylistType)}
                        onChange={(val) => setSelectedPlaylistType(val)}
                        searchable={false}
                        placeholder="Seleccionar Tipo"
                      />
                    </div>
                  </div>

                  {isLoadingPlaylists ? (
                    <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
                      <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
                      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando ranking de playlists...</p>
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className="glass-panel flex-center" style={{ padding: '4rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      <p>No se encontraron playlists para esta categoría en este momento.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                      {playlists.map((playlist, idx) => (
                        <div 
                          key={playlist.spotify_id || idx}
                          className="glass-panel-interactive"
                          style={{ 
                            padding: '1rem', 
                            display: 'flex', 
                            gap: '1rem', 
                            alignItems: 'center',
                            background: idx < 3 ? 'rgba(108, 99, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                            borderColor: idx < 3 ? 'rgba(108, 99, 255, 0.2)' : 'var(--glass-border)',
                          }}
                        >
                          {/* Rank & Artwork */}
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img 
                              src={playlist.artwork || '/logo.png'} 
                              alt={playlist.playlist_name}
                              style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <div style={{ 
                              position: 'absolute', 
                              top: '-8px', 
                              left: '-8px', 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%',
                              background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--bg-dark)',
                              color: idx < 3 ? '#000' : 'var(--text-main)',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid rgba(255,255,255,0.2)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}>
                              #{playlist.rank || idx + 1}
                            </div>
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {playlist.playlist_name}
                            </h4>
                            <p style={{ margin: '0.1rem 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              by {playlist.owner_name}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>
                                {playlist.type_name}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#4caf50', fontWeight: 600 }}>
                                <Users size={12} /> {formatNumber(playlist.followers)}
                              </div>
                            </div>
                          </div>

                          {/* Stats & Link */}
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,152,0,0.2)' }}>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Posición</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                {playlist.current_position} <ChevronUp size={12} style={{ opacity: 0.5 }} />
                              </div>
                            </div>
                            <a 
                              href={playlist.external_url} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-center"
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                background: 'rgba(29, 185, 84, 0.1)', 
                                border: '1px solid rgba(29, 185, 84, 0.2)',
                                color: '#1DB954',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'info_plataformas' && (
                <BoxDisplayInfoPlatform data={platformData} />
              )}
            </>
          )}

          {activeTab === 'mapa' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Map size={20} color="var(--accent-primary)" /> Top Ciudades/Países de Consumo Generales
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Visualiza la presencia de la canción en los mercados y ciudades a nivel global.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Filtrar por país:</span>
                  <SearchableSelect
                    options={[
                      { value: '0', label: 'Global (Todos)' },
                      ...countries.map(c => ({ value: String(c.id), label: c.country_name }))
                    ]}
                    value={String(selectedMapCountry)}
                    onChange={(val) => setSelectedMapCountry(Number(val) || val)}
                    placeholder="Global (Todos)"
                  />
                </div>
              </div>
              
              {isMapLoading ? (
                <div className="flex-center" style={{ height: '400px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
                </div>
              ) : (
                <>
                  <ArtistMap data={mapData} />
                  
                  {/* Top 10 Cities Cards */}
                  <div style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      <Trophy size={18} color="#ffb700" /> Top 10 Ciudades de Consumo
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                      gap: '1rem' 
                    }}>
                      {[...mapData]
                        .sort((a, b) => b.current_listeners - a.current_listeners)
                        .slice(0, 10)
                        .map((city, idx) => (
                          <div 
                            key={idx} 
                            className="glass-panel-interactive animate-fade-in"
                            style={{ 
                              padding: '1rem', 
                              position: 'relative',
                              borderLeft: idx < 3 ? `3px solid ${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'}` : '1px solid var(--glass-border)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem',
                              animationDelay: `${idx * 0.05}s`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 900, 
                                color: idx < 3 ? (idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32') : 'var(--text-dim)' 
                              }}>
                                #{idx + 1}
                              </span>
                              <MapPin size={12} color="var(--text-dim)" opacity={0.5} />
                            </div>
                            <h5 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {city.city_name}
                            </h5>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                              {formatNumber(city.current_listeners)} <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}>oyentes</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformsDetailsModal;
