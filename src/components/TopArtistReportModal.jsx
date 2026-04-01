import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Music, Activity, TrendingUp, Heart, Map, Loader2, Share2, MessageCircle, Play, Info, Disc, Video, Film, Headphones, Globe, MapPin, Calendar } from 'lucide-react';
import ArtistMap from './ArtistMap';
import { getArtistData, getMapData, getSongsArtistBySpotifyId, getSongById } from '../services/api';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const Instagram = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Youtube = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"></path>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
  </svg>
);
const TiktokIcon = ({ size = 20, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);


const TopArtistReportModal = ({ artist, countries = [], onClose }) => {
  const [activeTab, setActiveTab] = useState('panorama');
  const [songs, setSongs] = useState([]);
  const [songDetails, setSongDetails] = useState({}); // { [cs_song]: { song, label, ... } }
  const [audienceData, setAudienceData] = useState([]);
  const [platformsData, setPlatformsData] = useState(null);
  
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  
  const [selectedMapCountry, setSelectedMapCountry] = useState(0);
  const tabsRef = useRef(null);

  useEffect(() => {
    // Bloquear el scroll de la página de fondo
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Horizontal scroll for tabs
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

  // Fetch Songs (pestaña Canciones) + secondary detail fetch per song (name/label)
  useEffect(() => {
    if (activeTab === 'canciones' && artist?.spotifyid) {
      const fetchSongs = async () => {
        setIsLoadingSongs(true);
        setSongDetails({});
        const data = await getSongsArtistBySpotifyId(artist.spotifyid, artist.countryId || 0);
        setSongs(data || []);
        setIsLoadingSongs(false);
        // Secondary: fetch name/label for each song (staggered like legacy)
        if (data && data.length > 0) {
          data.forEach((song, index) => {
            if (song.cs_song) {
              setTimeout(async () => {
                const details = await getSongById(song.cs_song);
                if (details) {
                  setSongDetails(prev => ({ ...prev, [song.cs_song]: details }));
                }
              }, index * 80);
            }
          });
        }
      };
      fetchSongs();
    }
  }, [activeTab, artist]);

  // Fetch Audience (Audiencia)
  useEffect(() => {
    if (activeTab === 'audiencia' && artist?.spotifyid) {
      const fetchAudience = async () => {
        setIsLoadingAudience(true);
        const data = await getMapData(selectedMapCountry, artist.spotifyid);
        setAudienceData(data || []);
        setIsLoadingAudience(false);
      };
      fetchAudience();
    }
  }, [activeTab, artist, selectedMapCountry]);

  // Fetch Platforms
  useEffect(() => {
    if (activeTab === 'panorama' && artist?.spotifyid) {
      const fetchPlatforms = async () => {
        setIsLoadingPlatforms(true);
        const data = await getArtistData(artist.spotifyid);
        setPlatformsData(data || null);
        setIsLoadingPlatforms(false);
      };
      fetchPlatforms();
    }
  }, [activeTab, artist]);

  const topCities = (audienceData || [])
    .sort((a, b) => b.current_listeners - a.current_listeners)
    .slice(0, 10);

  return (
    <div className="modal-overlay animate-fade-in" style={{ 
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', 
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' 
    }}>
      <div className="modal-content glass-panel animate-zoom-in" style={{ 
        width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', 
        display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid var(--glass-border)' 
      }}>
        
        {/* Header — cover image style (same as PlatformsDetailsModal) */}
        <div style={{ position: 'relative', height: '200px', width: '100%', flexShrink: 0 }}>
          <img
            src={artist.img || artist.avatar || artist.url || '/logo.png'}
            alt={artist.artist}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-dark, #0a0b14), rgba(0,0,0,0.15))' }} />
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '50%', color: 'white', zIndex: 20, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', zIndex: 10 }}>
            <img
              src={artist.img || artist.avatar || artist.url || '/logo.png'}
              alt={artist.artist}
              style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid var(--accent-primary)', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
            />
            <div style={{ paddingBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, lineHeight: 1.1, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{artist.artist}</h2>
              <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.4rem' }}>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  <Users size={13} /> {formatNumber(artist.followers_total)} Seguidores
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  <TrendingUp size={13} /> Rank #{artist.rk}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — underline style (same as PlatformsDetailsModal) */}
        <div
          ref={tabsRef}
          style={{
            display: 'flex', borderBottom: '1px solid var(--glass-border)',
            padding: '0 2rem', gap: '2rem',
            overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
            flexShrink: 0, background: 'var(--bg-dark, #0a0b14)', zIndex: 10
          }}
        >
          {[
            { id: 'panorama', label: 'Panorama', icon: TrendingUp },
            { id: 'canciones', label: 'Canciones', icon: Music },
            { id: 'audiencia', label: 'Audiencia', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1.2rem 0',
                color: activeTab === tab.id ? 'var(--text-main, white)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                fontWeight: activeTab === tab.id ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                background: 'transparent', cursor: 'pointer',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                fontSize: '0.9rem'
              }}
            >
              <tab.icon size={15} />{tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1.5rem' }} className="custom-scrollbar">
          
          {activeTab === 'panorama' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Platform Overview Cards (TOP) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <PlatformOverviewCard 
                  title="TikTok Presence" 
                  icon={TiktokIcon} 
                  color="#ff0050" 
                  metrics={[
                    { label: 'Followers', value: platformsData?.followers_total_tiktok },
                    { label: 'Videos', value: platformsData?.videos_total_tiktok }
                  ]}
                />
                <PlatformOverviewCard 
                  title="YouTube Growth" 
                  icon={Youtube} 
                  color="#ff0000" 
                  metrics={[
                    { label: 'Subscribers', value: platformsData?.subscribers_total_youtube },
                    { label: 'Engagement', value: platformsData?.engagement_rate_youtube ? `${(platformsData.engagement_rate_youtube * 100).toFixed(1)}%` : 'N/A' }
                  ]}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center', borderTop: '3px solid #E4405F' }}>
                  <Instagram size={24} color="#E4405F" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatNumber(platformsData?.followers_total_instagram)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Instagram Followers</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center', borderTop: '3px solid #1877F2' }}>
                  <Facebook size={24} color="#1877F2" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatNumber(platformsData?.followers_total_facebook)}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facebook Followers</div>
                </div>
              </div>

              {/* Radar Chart Section (BOTTOM) */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Balance de Influencia</h4>
                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-45deg)' }}>
                    {/* Grid Lines */}
                    {[20, 40, 60, 80, 100].map(r => (
                      <circle key={r} cx="50" cy="50" r={r/2} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    ))}
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    
                    {/* Data Shape */}
                    {(() => {
                      const getVal = (val, max) => Math.min(45, (val / max) * 45);
                      const t = getVal(platformsData?.followers_total_tiktok || 500000, 1000000);
                      const y = getVal(platformsData?.subscribers_total_youtube || 300000, 1000000);
                      const i = getVal(platformsData?.followers_total_instagram || 200000, 1000000);
                      const f = getVal(platformsData?.followers_total_facebook || 100000, 1000000);
                      
                      const points = [
                        [50, 50 - t], [50 + y, 50], [50, 50 + i], [50 - f, 50]
                      ].map(p => p.join(',')).join(' ');

                      return (
                        <polygon points={points} fill="rgba(138, 136, 255, 0.4)" stroke="var(--accent-primary)" strokeWidth="1.5" />
                      );
                    })()}
                  </svg>
                  <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', color: '#ff0050', fontWeight: 700 }}>TIKTOK</div>
                  <div style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: '#ff0000', fontWeight: 700 }}>YOUTUBE</div>
                  <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', color: '#E4405F', fontWeight: 700 }}>INSTAGRAM</div>
                  <div style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: '#1877F2', fontWeight: 700 }}>FACEBOOK</div>
                </div>
              </div>
            </div>
          )}

          {/* CANCIONES TAB */}
          {activeTab === 'canciones' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(138, 136, 255, 0.1)' }}>
                  <Music size={20} color="var(--accent-primary)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Top de Canciones</h3>
              </div>
              
              {isLoadingSongs ? (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {[1,2,3,4,5].map(i => <SongSkeleton key={i} />)}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {songs.map((song, idx) => (
                    <div key={idx} className="glass-panel-interactive song-row-container" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', minWidth: 0, opacity: 0, animation: `slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`, animationDelay: `${idx * 0.08}s`, position: 'relative', overflow: 'hidden' }}>
                      <div className="neon-watermark">#{idx + 1}</div>
                      
                      {/* Left: cover + metadata */}
                      <div className="song-row-content" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                            <img src={song.image_url || '/logo.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            <div className="eq-container">
                              <div className="eq-bar" style={{ height: '16px' }} />
                              <div className="eq-bar" style={{ height: '24px' }} />
                              <div className="eq-bar" style={{ height: '12px' }} />
                            </div>
                          </div>
                          <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--accent-primary)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: 'white', border: '2px solid var(--bg-dark)' }}>
                            {idx + 1}
                          </div>
                        </div>
                        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                          <h4 style={{ margin: '0 0 0.3rem 0', color: 'white', fontSize: '0.9rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                            {songDetails[song.cs_song]?.song || songDetails[song.cs_song]?.title || song.song || song.title || song.track_name || `Track ${idx + 1}`}
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              <Disc size={10} /> {songDetails[song.cs_song]?.label || songDetails[song.cs_song]?.crg || song.label || ''}
                            </span>
                            {song.release_date && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <Calendar size={10} /> {new Date(song.release_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: streams + campaign button */}
                      <div className="song-row-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                        </div>
                        <button
                          onClick={() => { if (song.spotifyid) window.open(`/campaign?spotifyId=${song.spotifyid}`, '_blank'); }}
                          disabled={!song.spotifyid}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none',
                            background: song.spotifyid ? 'linear-gradient(135deg, #475569 0%, #1d4ed8 100%)' : 'rgba(255,255,255,0.05)',
                            color: song.spotifyid ? 'white' : 'var(--text-muted)',
                            fontSize: '0.7rem', fontWeight: 600,
                            cursor: song.spotifyid ? 'pointer' : 'not-allowed',
                            opacity: song.spotifyid ? 1 : 0.4,
                            transition: 'opacity 0.2s, transform 0.15s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={e => { if (song.spotifyid) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.03)'; } }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <Play size={10} fill="white" /> Ver Campaña
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* AUDIENCIA TAB (Combined Mapa & Oyentes) */}
          {activeTab === 'audiencia' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Map Section (TOP) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={20} color="var(--accent-primary)" /> Mapa de Oyentes
                  </h3>
                  <select 
                    value={selectedMapCountry}
                    onChange={(e) => setSelectedMapCountry(Number(e.target.value))}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', outline: 'none' }}
                  >
                    <option value={0}>Global</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.country_name}</option>)}
                  </select>
                </div>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <ArtistMap data={audienceData.map(c => ({ ...c, city_name: c.city_name || c.cityname, current_listeners: c.current_listeners || c.listeners, city_lat: c.city_lat || c.citylat, city_lng: c.city_lng || c.citylng }))} />
                </div>
              </div>

              {/* City List Section (BOTTOM) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255, 158, 238, 0.1)' }}>
                    <Users size={20} color="var(--accent-secondary)" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Distribución por Ciudades</h3>
                </div>

                {isLoadingAudience ? (
                  <div className="flex-center" style={{ height: '200px' }}><Loader2 className="loading-spinner" /></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {topCities.map((city, idx) => (
                      <CityCard key={idx} city={city} idx={idx} />
                    ))}
                    {topCities.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', gridColumn: '1/-1' }}>No hay datos geográficos disponibles.</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{customScrollbarCSS}</style>
    </div>
  );
};

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.2rem', 
      borderRadius: '8px', background: active ? 'rgba(138, 136, 255, 0.2)' : 'transparent', 
      color: active ? 'white' : 'var(--text-muted)', border: '1px solid', 
      borderColor: active ? 'rgba(138, 136, 255, 0.4)' : 'transparent',
      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', fontWeight: active ? 600 : 400
    }}
  >
    <Icon size={18} />
    {label}
  </button>
);

const SongSkeleton = () => (
  <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', minWidth: 0, position: 'relative', overflow: 'hidden', height: '80px' }}>
    <div className="shimmer-effect"></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, position: 'relative', zIndex: 1 }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ height: '10px', width: '25%', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />
      </div>
    </div>
    <div style={{ width: '100px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', position: 'relative', zIndex: 1 }} />
  </div>
);

const CityCard = ({ city, idx }) => {
  const isTop3 = idx < 3;
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const rankColor = isTop3 ? colors[idx] : 'var(--accent-primary)';
  
  return (
    <div className="glass-panel-interactive" style={{ padding: '1rem', borderLeft: `3px solid ${rankColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{city.city_name || city.cityname}</h4>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: rankColor }}>#{idx + 1}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin size={12} color="var(--text-muted)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatNumber(city.current_listeners || city.listeners)} Oyentes</span>
      </div>
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, (city.current_listeners / 100000) * 100)}%`, height: '100%', background: rankColor, boxShadow: `0 0 10px ${rankColor}44` }} />
      </div>
    </div>
  );
};

const PlatformOverviewCard = ({ title, icon: Icon, color, metrics }) => (
  <div className="glass-panel-interactive" style={{ padding: '1.5rem', borderTop: `4px solid ${color}`, background: `linear-gradient(180deg, ${color}11 0%, transparent 100%)` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <Icon size={20} color={color} />
      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{title}</h4>
    </div>
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      {metrics.map((m, i) => (
        <div key={i}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{typeof m.value === 'number' ? formatNumber(m.value) : (m.value || '0')}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
        </div>
      ))}
    </div>
  </div>
);

const PlatformSection = ({ title, icon: Icon, color, metrics }) => (
  <div style={{ border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
      <Icon size={24} color={color} />
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
      {metrics.map((m, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            <m.icon size={12} /> {m.label}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{typeof m.value === 'number' ? formatNumber(m.value) : m.value}</div>
        </div>
      ))}
    </div>
  </div>
);

export default TopArtistReportModal;

/* Final visual adjustments for scrollbar and tab layout */
const customScrollbarCSS = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(138, 136, 255, 0.3);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(138, 136, 255, 0.5);
  }
`;

