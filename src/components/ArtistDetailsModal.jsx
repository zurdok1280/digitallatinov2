import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Music, Radio, Activity, PlaySquare, Headphones, TrendingUp, Heart, Map, Loader2, ExternalLink, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import NeuronalGraph from './NeuronalGraph';
import SunburstGraph from './SunburstGraph';
import CirclePackGraph from './CirclePackGraph';
import ArtistMap from './ArtistMap';
import { getArtistData, getMapData, getPlaylistTypes, getArtistPlaylists, getArtistTiktokers, getArtistRadioRelated, getArtistGraph } from '../services/api';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const getPlaylistColor = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('editorial')) return '#1DB954';
  if (t.includes('personalized') || t.includes('algori')) return 'var(--accent-primary)';
  if (t.includes('chart') || t.includes('top')) return '#ffb700';
  if (t.includes('user') || t.includes('listener')) return '#ff0050';
  return 'var(--text-muted)';
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

const ArtistDetailsModal = ({ artist, countries = [], onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [artistData, setArtistData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mapData, setMapData] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [selectedMapCountry, setSelectedMapCountry] = useState(artist?.countryId || 0);

  const [playlistTypes, setPlaylistTypes] = useState([{ name: 'Todos', id: 0 }]);
  const [selectedPlaylistType, setSelectedPlaylistType] = useState(0);
  const [playlistsData, setPlaylistsData] = useState([]);
  const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(false);

  const [tiktokersData, setTiktokersData] = useState([]);
  const [isTiktokersLoading, setIsTiktokersLoading] = useState(false);

  const [radioData, setRadioData] = useState([]);
  const [isRadioLoading, setIsRadioLoading] = useState(false);
  const [selectedRadioCountry, setSelectedRadioCountry] = useState(artist?.countryId || 0);

  const [similarArtists, setSimilarArtists] = useState([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchArtist = async () => {
      setIsLoading(true);
      const data = await getArtistData(artist.id);
      if (isMounted) {
        setArtistData(data);
        setIsLoading(false);
      }
    };
    if (artist?.id) {
      fetchArtist();
    }
    return () => { isMounted = false; };
  }, [artist]);

  useEffect(() => {
    let isMounted = true;
    const fetchSimilar = async () => {
      setIsSimilarLoading(true);
      const data = await getArtistGraph(artist.id);
      if (isMounted && data && data.nodes) {
        // Enforce level 1 nodes as Similar Artists
        const level1 = data.nodes.filter(n => n.node_type === 'level1' || n.level === 1);
        // Sort by listeners as metric of relevance
        setSimilarArtists(level1.sort((a,b) => b.monthly_listeners - a.monthly_listeners));
      }
      if (isMounted) setIsSimilarLoading(false);
    };
    if (artist?.id) fetchSimilar();
    return () => { isMounted = false; };
  }, [artist]);

  useEffect(() => {
    let isMounted = true;
    const fetchMap = async () => {
      setIsMapLoading(true);
      const data = await getMapData(selectedMapCountry, artist.id);
      if (isMounted) {
        setMapData(data);
        setIsMapLoading(false);
      }
    };
    if (artist?.id) {
      fetchMap();
    }
    return () => { isMounted = false; };
  }, [artist, selectedMapCountry]);

  useEffect(() => {
    let isMounted = true;
    const fetchTypes = async () => {
      const types = await getPlaylistTypes();
      if (isMounted && types.length > 0) {
        setPlaylistTypes(types);
      }
    };
    fetchTypes();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchPlaylists = async () => {
      setIsPlaylistsLoading(true);
      const data = await getArtistPlaylists(artist.id, selectedPlaylistType);
      if (isMounted) {
        setPlaylistsData(data);
        setIsPlaylistsLoading(false);
      }
    };
    if (artist?.id) {
      fetchPlaylists();
    }
    return () => { isMounted = false; };
  }, [artist, selectedPlaylistType]);

  useEffect(() => {
    let isMounted = true;
    const fetchTiktokers = async () => {
      setIsTiktokersLoading(true);
      const data = await getArtistTiktokers(artist.id);
      if (isMounted) {
        setTiktokersData(data);
        setIsTiktokersLoading(false);
      }
    };
    if (artist?.id) {
      fetchTiktokers();
    }
    return () => { isMounted = false; };
  }, [artist]);

  useEffect(() => {
    let isMounted = true;
    const fetchRadio = async () => {
      setIsRadioLoading(true);
      const data = await getArtistRadioRelated(artist.id, selectedRadioCountry);
      if (isMounted) {
        setRadioData(data);
        setIsRadioLoading(false);
      }
    };
    if (artist?.id) {
      fetchRadio();
    }
    return () => { isMounted = false; };
  }, [artist, selectedRadioCountry]);

  if (!artist) return null;

  return (
    <div 
      className="flex-center" 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, padding: '2rem', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="glass-panel animate-fade-in" 
        style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ position: 'relative', height: '200px', width: '100%' }}>
          <img src={artist.imageUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-dark), transparent)' }} />
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '50%', color: 'white' }}
          >
            <X size={24} />
          </button>
          
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
            <img src={artist.imageUrl} style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--accent-primary)', objectFit: 'cover' }} />
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{artist.name}</h1>
              <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.5rem' }}>
                <Users size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }}/> 
                {(artist.monthlyListeners / 1000000).toFixed(1)}M Monthly Listeners
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="no-scrollbar"
          style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--glass-border)', 
            padding: '0 2rem', 
            gap: '2rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          {[
            { id: 'overview', label: 'Panorama', icon: Activity },
            { id: 'mapa', label: 'Mapa', icon: Map },
            { id: 'playlists', label: 'Playlists Recomendadas', icon: Music },
            { id: 'tiktok', label: 'TikTokers', icon: Users },
            { id: 'radio', label: 'Emisoras Gap', icon: Radio },
            { id: 'neuronal', label: 'Grafo Neuronal', icon: Activity },
            { id: 'sunburst', label: 'Grafo v2 (Sunburst)', icon: Activity },
            { id: 'circlepack', label: 'Grafo v3 (Bubble Pack)', icon: Activity }
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
                flexShrink: 0
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          {activeTab === 'overview' && (
            <div className="grid-base" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {isLoading ? (
                <div className="flex-center" style={{ width: '100%', padding: '3rem', flexDirection: 'column' }}>
                  <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
                  <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando inteligencia y estadísticas...</p>
                </div>
              ) : (
                <>
                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(29, 185, 84, 0.05)' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Headphones size={16} color="#1DB954" /> Mensuales Spotify
                    </h3>
                    <p className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(artistData?.monthly_listeners || artist.monthlyListeners)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 80, 0.05)' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PlaySquare size={16} color="#ff0050" /> TikTok Views
                    </h3>
                    <p className="text-gradient-secondary" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(artistData?.views_total_tiktok || 0)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255, 0, 0, 0.05)' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PlaySquare size={16} color="#FF0000" /> YouTube Vistas
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(artistData?.video_views_total_youtube || 0)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(225, 48, 108, 0.05)' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <InstagramIcon size={16} color="#E1306C" /> Seguidores IG
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(artistData?.followers_total_instagram || 0)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(24, 119, 242, 0.05)' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FacebookIcon size={16} color="#1877F2" /> Seguidores FB
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(artistData?.followers_total_facebook || 0)}</p>
                  </div>

                  <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} color="var(--accent-primary)" /> Streams Totales
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(artistData?.streams_total || 0)}</p>
                  </div>

                   <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Music size={16} color="var(--accent-tertiary)" /> Playlist Reach
                    </h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{formatNumber(artistData?.playlist_reach || 0)}</p>
                  </div>

                   <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Heart size={16} color="#ffb700" /> Popularidad
                    </h3>
                    <p className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{artistData?.popularity || 0}/100</p>
                  </div>
                </>
              )}
            </div>
          )}
            
          {/* Similar Artists Carousel Section */}
          {activeTab === 'overview' && !isLoading && (
            <div style={{ marginTop: '0rem', paddingBottom: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', margin: 0 }}>
                  <UserCircle size={24} color="var(--text-main)" /> Similar Artists
                </h3>
                  
                  {/* Custom Navigation Arrows */}
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button 
                      onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {isSimilarLoading ? (
                  <div className="flex-center" style={{ height: '250px' }}>
                    <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
                  </div>
                ) : similarArtists.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron artistas similares.
                  </div>
                ) : (
                  <div 
                    ref={scrollRef}
                    style={{ 
                      display: 'flex', 
                      gap: '1.2rem', 
                      overflowX: 'auto', 
                      paddingBottom: '1rem',
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE
                    }}
                    className="no-scrollbar"
                  >
                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    
                    {similarArtists.map((sim, i) => {
                      // Deterministic mock variables tailored to the artist label
                      const abstractHue = (sim.label.charCodeAt(0) * 15) % 360;
                      const countries = ['🇲🇽 México', '🇨🇴 Colombia', '🇵🇷 Puerto Rico', '🇦🇷 Argentina', '🇪🇸 España'];
                      const genres = ['Reggaeton', 'Trap Latino', 'Pop Latino', 'Urbano', 'Regional'];
                      const cty = countries[sim.label.length % countries.length];
                      const gen = genres[sim.label.charCodeAt(sim.label.length-1) % genres.length];

                      return (
                        <div 
                          key={i} 
                          style={{ 
                            minWidth: '200px', 
                            height: '260px', 
                            borderRadius: '16px', 
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            // Abstract beautiful gradient background as placeholder since API lacks images
                            background: `linear-gradient(135deg, hsl(${abstractHue}, 60%, 20%), hsl(${(abstractHue + 60) % 360}, 40%, 10%))`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Inner Dark Gradient Overlay to map text visibility reliably */}
                          <div style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.95) 100%)' 
                          }} />
                          
                          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', textAlign: 'center' }}>
                            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sim.label}
                            </h4>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {cty} |
                              <br />
                              <span style={{ color: 'var(--text-dim)' }}>{gen}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
          {activeTab === 'mapa' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Map size={20} color="var(--accent-primary)" /> Distribución Geográfica de Audiencia
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ciudades core ordenadas por concentración y volumen métrico de escuchas activos.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtrar por país:</span>
                  <select
                    value={selectedMapCountry}
                    onChange={(e) => setSelectedMapCountry(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--glass-border)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value={0}>Global (Todos)</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.country_name}</option>)}
                  </select>
                </div>
              </div>
              
              {isMapLoading ? (
                <div className="flex-center" style={{ height: '400px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
                </div>
              ) : (
                <ArtistMap data={mapData} />
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Music size={20} color="var(--accent-tertiary)" /> Playlists Relevantes
                  </h3>
                  {playlistsData.length > 0 ? (() => {
                    const allArtists = playlistsData.flatMap(pl => pl.related_artists_names ? pl.related_artists_names.split(',').map(s => s.trim()) : []).filter(Boolean);
                    const uniqueArtists = [...new Set(allArtists)];
                    const topArtists = uniqueArtists.slice(0, 8).join(', ');
                    return (
                      <p 
                        style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.85rem', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} 
                        title={uniqueArtists.join(', ')}
                      >
                        Artistas relacionados: <span style={{ color: 'var(--text-main)' }}>{topArtists}{uniqueArtists.length > 8 ? '...' : ''}</span>
                      </p>
                    );
                  })() : (
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Apariciones en listas de curación Editorial, Personalized o Chart.</p>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tipo de Playlist:</span>
                  <select
                    value={selectedPlaylistType}
                    onChange={(e) => setSelectedPlaylistType(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--glass-border)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {playlistTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {isPlaylistsLoading ? (
                <div className="flex-center" style={{ height: '300px' }}>
                  <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
                </div>
              ) : playlistsData.length === 0 ? (
                <div className="flex-center" style={{ height: '200px', color: 'var(--text-muted)' }}>
                  No hay playlists disponibles para este filtro.
                </div>
              ) : (
                <div className="grid-base" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {playlistsData.map((pl, i) => {
                    const artistsList = pl.related_artists_names ? pl.related_artists_names.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const top5 = artistsList.slice(0, 5).join(', ');
                    const hasMore = artistsList.length > 5;
                    const typeColor = getPlaylistColor(pl.type_name);
                    
                    return (
                    <div key={i} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: `4px solid ${typeColor}` }}>
                      <img src={pl.artwork || '/logo.png'} alt={pl.playlist_name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>{pl.playlist_name}</h4>
                          {pl.external_url && (
                            <a href={pl.external_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }} title="Abrir en Spotify">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.2rem 0' }}>{pl.owner_name} • {pl.type_name}</p>
                        
                        {artistsList.length > 0 && (
                          <p 
                            style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: '0.3rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={pl.related_artists_names}
                          >
                            <span style={{ color: 'var(--text-main)' }}>Con:</span> {top5}{hasMore ? '...' : ''}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                          <span>Followers: <strong style={{ color: 'var(--text-main)' }}>{formatNumber(pl.followers_count)}</strong></span>
                          <span>Ranking: <strong style={{ color: 'var(--text-main)' }}>#{pl.current_position || pl.rk}</strong></span>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tiktok' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} color="#ff0050" /> Influencers de TikTok
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ranking de creadores usando sonidos o interactuando con este artista.</p>
                </div>
              </div>

              {isTiktokersLoading ? (
                <div className="flex-center" style={{ height: '300px' }}>
                  <Loader2 className="loading-spinner" size={32} color="#ff0050" />
                </div>
              ) : tiktokersData.length === 0 ? (
                <div className="flex-center" style={{ height: '200px', color: 'var(--text-muted)' }}>
                  No se encontraron TikTokers relacionados.
                </div>
              ) : (
                <div className="grid-base" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {tiktokersData.map((tk, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.2rem', borderLeft: '3px solid #ff0050', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {tk.user_name}
                            <a href={`https://www.tiktok.com/@${tk.user_handle}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ff0050', display: 'flex', alignItems: 'center' }} title="Ir a TikTok">
                              <ExternalLink size={14} />
                            </a>
                          </h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0' }}>@{tk.user_handle}</p>
                        </div>
                        <div style={{ background: 'rgba(255, 0, 80, 0.1)', color: '#ff0050', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          #{tk.rk}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.15)', padding: '0.8rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Followers</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(tk.tiktok_user_followers)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vistas</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(tk.total_views_related)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Likes</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(tk.total_likes_related)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Videos</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(tk.total_videos_related)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shares</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(tk.total_shares_related)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comments</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(tk.total_comments_related)}</strong>
                        </div>
                      </div>
                      
                      {tk.related_artists_names && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                          <span style={{ color: 'var(--text-main)' }}>Asociado a:</span> {tk.related_artists_names}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'radio' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Radio size={20} color="#ffb700" /> Oportunidades en Radio
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Emisoras que tocan artistas de tu cluster pero muestran un gap de audiencia para ti.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtrar por país:</span>
                  <select
                    value={selectedRadioCountry}
                    onChange={(e) => setSelectedRadioCountry(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--glass-border)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value={0}>Global (Todos)</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.country_name}</option>)}
                  </select>
                </div>
              </div>

              {isRadioLoading ? (
                <div className="flex-center" style={{ height: '300px' }}>
                  <Loader2 className="loading-spinner" size={32} color="#ffb700" />
                </div>
              ) : radioData.length === 0 ? (
                <div className="flex-center" style={{ height: '200px', color: 'var(--text-muted)' }}>
                  No se encontraron gaps de radio para este artista.
                </div>
              ) : (
                <div className="grid-base" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {radioData.map((rg, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.2rem', borderLeft: '3px solid #ffb700', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                          <img 
                            src={`https://smart.monitorlatino.com/logos_estaciones/${rg.stream_id}.png`} 
                            alt={rg.station_name} 
                            style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', padding: '4px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Radio size={14} color="#ffb700" /> {rg.station_name}
                            </h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0' }}>{rg.market || 'Mercado No Asignado'}</p>
                          </div>
                        </div>

                        <div style={{ background: 'rgba(255, 183, 0, 0.1)', color: '#ffb700', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          #{rg.rk}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.15)', padding: '0.8rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Spins Gap</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(rg.spins_gap)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audience Gap</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(rg.audience_gap)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Artistas Clust. (Spins)</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatNumber(rg.related_spins)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oportunidad (Ratio)</span>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{rg.opportunity_ratio ? rg.opportunity_ratio.toFixed(2) : 0}x</strong>
                        </div>
                      </div>
                      
                      {rg.related_artists_names && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-dim)', 
                          paddingTop: '0.5rem', 
                          borderTop: '1px solid var(--glass-border)',
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis'
                        }} title={rg.related_artists_names}>
                          <span style={{ color: 'var(--text-main)' }}>Tocan a:</span> {rg.related_artists_names}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'neuronal' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Comparativa de Audiencias (Cluster)</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Los nodos representan la magnitud de la audiencia compartida y conexiones artísticas.</p>
              <NeuronalGraph artistId={artist.id} />
            </div>
          )}

          {activeTab === 'sunburst' && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '1rem' }}>Jerarquía Auditiva (Sunburst)</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Explora ramificaciones de descubrimiento radial proporcional al volumen masivo de Listeners.</p>
              <SunburstGraph artistId={artist.id} />
            </div>
          )}

          {activeTab === 'circlepack' && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '1rem' }}>Cosmos de Influencia (Bubble Pack)</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Visualiza las familias musicales empacadas unas dentro de otras basadas en su alcance geográfico y volumen.</p>
              <CirclePackGraph artistId={artist.id} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ArtistDetailsModal;
