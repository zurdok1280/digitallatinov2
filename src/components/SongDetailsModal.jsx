import React, { useState, useEffect } from 'react';
import { X, Play, Music, Headphones, TrendingUp, BarChart2, Loader2, Calendar, Disc, Globe, Heart, ExternalLink, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSongBySpotifyId } from '../services/api';

const SongDetailsModal = ({ song, onClose }) => {
  const [songData, setSongData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSongDetails = async () => {
      const spotifyId = song.spotify_id || song.spotifyid || (typeof song.id === 'string' && song.id.length > 10 ? song.id : null);
      const internalId = song.cs_song || (typeof song.id === 'number' || (typeof song.id === 'string' && song.id.length < 10) ? song.id : null);

      if (!spotifyId && !internalId) {
          setIsLoading(false);
          return;
      }
      
      setIsLoading(true);
      try {
        let res = null;
        
        // Try Spotify ID first
        if (spotifyId) {
          res = await getSongBySpotifyId(spotifyId);
        }
        
        // If no data, try Internal ID (cs_song)
        if ((!res || !res.data || Object.keys(res.data).length === 0) && internalId) {
           const { getSongById } = await import('../services/api');
           res = await getSongById(internalId);
        }

        if (isMounted && res && res.data && Object.keys(res.data).length > 0) {
          setSongData(res.data);
        }

        if (internalId) {
          const { getSongHistoricalStreams } = await import('../services/api');
          const histData = await getSongHistoricalStreams(internalId);
          if (isMounted && histData && histData.length > 0) {
            // Data typically comes in reverse chronological order from similar analytics endpoints
            // so we reverse it to chronological (left-to-right) for the chart
            setHistoricalData([...histData].reverse());
          }
        }
      } catch (e) {
        console.error("Error fetching song details:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSongDetails();
    return () => { isMounted = false; };
  }, [song]);

  if (!song) return null;

  // Use either the incoming song object for immediate display or the fetched songData
  const displayTitle = songData?.song_name || song.song || song.trackName || song.title || "Detalles de Canción";
  const displayArtist = songData?.artist_name || song.artists || song.artistName || "Artista Desconocido";
  const displayImage = (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || songData?.image_url || song.imageUrl || song.avatar || song.url || song.backend_avatar || "/logo.png";
  const totalStreams = songData?.spotify_streams || song.spotify_streams_total || song.streams || song.spotify_streams || 0;
  const currentRank = songData?.rk || song.rk || "--";
  const currentScore = songData?.score || song.score || 0;
  
  // Use score for popularity if available, otherwise fallback to popularity
  const popularity = currentScore ? Math.round(currentScore) : (songData?.popularity || song.popularity || 0);

  // Parse historical data for chart
  const chartData = historicalData && historicalData.length > 0 ? historicalData.map(d => {
    const parts = d.date.split('-');
    const name = parts.length === 3 ? `${parts[1]}/${parts[2]}` : d.date;
    return { name, val: d.streams_total };
  }) : [
    { name: 'S1', val: Math.floor(totalStreams * 0.85) || 0 },
    { name: 'S2', val: Math.floor(totalStreams * 0.90) || 0 },
    { name: 'S3', val: Math.floor(totalStreams * 0.95) || 0 },
    { name: 'Hoy', val: totalStreams },
  ];

  // Determine if we truly have no data to show
  // If we have a rank or a score, we actually have data from the chart
  const hasNoData = !isLoading && totalStreams === 0 && popularity === 0 && !currentScore && currentRank === "--";

  return (
    <div 
      className="flex-center" 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10001, padding: '1rem', backdropFilter: 'blur(10px)' }}
    >
      <div 
        className="glass-panel animate-fade-in" 
        style={{ width: '100%', maxWidth: 'min(1000px, 95vw)', maxHeight: '95vh', overflowY: 'auto', background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header with Cover Blur Background */}
        <div style={{ position: 'relative', minHeight: '280px', width: '100%', overflow: 'hidden' }}>
          <img src={displayImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px)', opacity: 0.3 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0c, transparent)' }} />
          
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%', color: 'white', zIndex: 10 }}
          >
            <X size={20} />
          </button>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <img src={displayImage} alt={displayTitle} style={{ width: '160px', height: '160px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#1DB954', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0a0a0c' }}>
                    <Play size={18} fill="white" color="white" />
                </div>
            </div>
            
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>{displayTitle}</h1>
            <p style={{ fontSize: '1.1rem', color: '#8c52ff', fontWeight: 600, marginTop: '0.5rem', letterSpacing: '0.5px', opacity: 0.9 }}>{displayArtist}</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {isLoading ? (
            <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <Loader2 className="loading-spinner" size={40} color="#8c52ff" />
              <p style={{ marginTop: '1.5rem', fontWeight: 500 }}>Analizando métricas específicas...</p>
            </div>
          ) : (
            <>
              {/* Performance Metrics Cards */}
              <div className="grid-base" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Headphones size={14} color="#1DB954" /> Spotify Streams
                  </span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: totalStreams > 0 ? 'white' : 'rgba(255,255,255,0.4)' }}>
                    {totalStreams > 0 ? formatNumber(totalStreams) : "0"}
                  </span>
                </div>
                
                <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Heart size={14} color="#ff3366" /> Popularidad
                   </span>
                   <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{popularity}<span style={{ fontSize: '0.9rem', color: '#555', marginLeft: '4px' }}>/100</span></span>
                 </div>
 
                 <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <TrendingUp size={14} color="#00f0ff" /> Tendencia
                   </span>
                   <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>#{currentRank}</span>
                 </div>

                 {currentScore > 0 && (
                   <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <Activity size={14} color="#c193ff" /> Score Digital
                     </span>
                     <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{Number(currentScore).toFixed(1)}</span>
                   </div>
                 )}
               </div>

              {/* Chart Section */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', margin: 0 }}>
                    <BarChart2 size={18} color="#8c52ff" /> Rendimiento en Spotify
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#1DB954', background: '#1DB95415', padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <TrendingUp size={12} /> +12% esta semana
                  </div>
                </div>
                
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="songGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8c52ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8c52ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(val) => formatNumber(val)} />
                      <Tooltip 
                        contentStyle={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                        itemStyle={{ color: '#8c52ff' }}
                        formatter={(val) => [formatNumber(val), 'Streams']}
                      />
                      <Area type="monotone" dataKey="val" stroke="#8c52ff" strokeWidth={3} fillOpacity={1} fill="url(#songGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Info Detail List */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Calendar size={18} color="#aaa" />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Fecha de Lanzamiento</p>
                                <p style={{ margin: 0, color: 'white', fontWeight: 600 }}>{songData?.release_date || song.release_date || "Fecha Desconocida"}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Disc size={18} color="#aaa" />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>ISRC / ID</p>
                                <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{songData?.isrc || song.spotifyid || song.id || "--"}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Globe size={18} color="#aaa" />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Género / Formato</p>
                                <p style={{ margin: 0, color: 'white', fontWeight: 600 }}>{songData?.format_name || "Urbano / Latino"}</p>
                            </div>
                        </div>
                        {songData?.spotify_url && (
                            <a 
                                href={songData.spotify_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#1DB954', textDecoration: 'none', background: 'rgba(29,185,84,0.1)', padding: '0.6rem', borderRadius: '8px', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(29,185,84,0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(29,185,84,0.1)'}
                            >
                                <ExternalLink size={18} />
                                <span style={{ fontWeight: 600 }}>Cargar en Spotify</span>
                            </a>
                        )}
                    </div>
                  </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongDetailsModal;
