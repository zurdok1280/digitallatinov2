import React, { useState, useEffect, useMemo } from 'react';
import { X, BarChart3, ListMusic, Video, TrendingUp, MapPin, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { getVsSongs, getVsSongPlaylists, getVsSongTiktoks } from '../services/api';

const SongCompareModal = ({ isOpen, onClose, song1, song2 }) => {
  const [activeTab, setActiveTab] = useState('table');
  const [loading, setLoading] = useState(true);
  const [vsData, setVsData] = useState([]);
  const [playlistsData, setPlaylistsData] = useState([]);
  const [tiktoksData, setTiktoksData] = useState([]);
  
  // Sorting and Filtering states
  const [playlistSort, setPlaylistSort] = useState({ key: 'followers_count', direction: 'desc' });
  const [playlistFilter, setPlaylistFilter] = useState('all');
  const [tiktokSort, setTiktokSort] = useState({ key: 'tiktok_user_followers', direction: 'desc' });
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      fetchData();
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vs, playlists, tiktoks] = await Promise.all([
        getVsSongs(song1.cs_song, song2.cs_song),
        getVsSongPlaylists(song1.cs_song, song2.cs_song),
        getVsSongTiktoks(song1.cs_song, song2.cs_song)
      ]);
      setVsData(vs);
      setPlaylistsData(playlists);
      setTiktoksData(tiktoks);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !mounted) return null;

  const formatNum = (n) => {
    if (n === null || n === undefined) return '0';
    if (n >= 1000000000) return (n / 1000000000).toFixed(0) + 'B';
    if (n >= 1000000) return (n / 1000000).toFixed(0) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  };

  const metrics = useMemo(() => {
    if (!vsData.length) return null;
    const s1Total = vsData.reduce((acc, item) => acc + (item.first_streams || 0), 0);
    const s2Total = vsData.reduce((acc, item) => acc + (item.second_streams || 0), 0);
    const s1Wins = vsData.filter(item => item.first_streams > item.second_streams).length;
    const s2Wins = vsData.filter(item => item.second_streams > item.first_streams).length;
    
    return {
      s1Total,
      s1Wins,
      s2Total,
      s2Wins,
      diff: s1Total - s2Total
    };
  }, [vsData]);
  
  const playlistTypes = useMemo(() => {
    const types = new Set(playlistsData.map(p => p.playlist_type).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [playlistsData]);

  const filteredSortedPlaylists = useMemo(() => {
    let result = [...playlistsData];
    if (playlistFilter !== 'all') {
      result = result.filter(p => p.playlist_type === playlistFilter);
    }
    result.sort((a, b) => {
      const valA = a[playlistSort.key] || 0;
      const valB = b[playlistSort.key] || 0;
      return playlistSort.direction === 'desc' ? valB - valA : valA - valB;
    });
    return result;
  }, [playlistsData, playlistFilter, playlistSort]);

  const sortedTiktoks = useMemo(() => {
    return [...tiktoksData].sort((a, b) => {
      const valA = a[tiktokSort.key] || 0;
      const valB = b[tiktokSort.key] || 0;
      return tiktokSort.direction === 'desc' ? valB - valA : valA - valB;
    });
  }, [tiktoksData, tiktokSort]);

  return (
    <div className={`compare-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="compare-modal-glass slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="compare-header">
          <div className="header-titles">
            <div className="tab-icon-box">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3>Comparación de Track</h3>
              <p>Analizando métricas cruzadas en tiempo real</p>
            </div>
          </div>
          <button className="close-btn-circle" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Versus Cards */}
        <div className="vs-cards-row">
          <div className="v-card song1-accent">
            <div className="v-card-img">
              <img src={song1.spotifyid || song1.img || song1.image_url || song1.url || song1.avatar || '/logo.png'} alt="" />
              <div className="v-rank">#{song1.rk}</div>
            </div>
            <div className="v-card-info">
              <h4>{song1.song}</h4>
              <p>{song1.artists || song1.artist}</p>
              <div className="v-score">Score: {song1.score}</div>
            </div>
          </div>

          <div className="vs-divider">
            <div className="vs-circle">VS</div>
          </div>

          <div className="v-card song2-accent">
            <div className="v-card-info align-right">
              <h4>{song2.song}</h4>
              <p>{song2.artists || song2.artist}</p>
              <div className="v-score">Score: {song2.score}</div>
            </div>
            <div className="v-card-img">
              <img src={song2.spotifyid || song2.img || song2.image_url || song2.url || song2.avatar || '/logo.png'} alt="" />
              <div className="v-rank">#{song2.rk}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="vs-metrics-strip">
            <div className="metric-item">
              <span>Streams Total S1</span>
              <p className="song1-text">{formatNum(metrics.s1Total)}</p>
            </div>
            <div className="metric-item">
              <span>Diferencia</span>
              <p>
                <span className={metrics.diff >= 0 ? 'vs-pos' : 'vs-neg'} style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  {metrics.diff > 0 ? '+' : metrics.diff < 0 ? '-' : ''}{formatNum(Math.abs(metrics.diff))}
                </span>
              </p>
            </div>
            <div className="metric-item">
              <span>Streams Total S2</span>
              <p className="song2-text">{formatNum(metrics.s2Total)}</p>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="compare-tabs-nav">
          <button className={activeTab === 'table' ? 'active' : ''} onClick={() => setActiveTab('table')}>
            <MapPin size={16} /> Ciudades
          </button>
          <button className={activeTab === 'playlists' ? 'active' : ''} onClick={() => setActiveTab('playlists')}>
            <ListMusic size={16} /> Playlists
          </button>
          <button className={activeTab === 'tiktok' ? 'active' : ''} onClick={() => setActiveTab('tiktok')}>
            <Video size={16} /> TikTok
          </button>
          <button className={activeTab === 'charts' ? 'active' : ''} onClick={() => setActiveTab('charts')}>
            <TrendingUp size={16} /> Gráfico
          </button>
        </div>

        {/* Tab Content */}
        <div className="compare-content custom-scrollbar">
          {loading ? (
            <div className="compare-loading-state">
              <div className="loading-pulse-ring" />
              <p>Analizando datos comparativos...</p>
            </div>
          ) : (
            <>
              {activeTab === 'table' && (
                <div className="tab-pane animate-fade-in">
                  <table className="vs-table">
                    <thead>
                      <tr>
                        <th>Ciudad</th>
                        <th className="song1-text">{song1.song}</th>
                        <th className="song2-text">{song2.song}</th>
                        <th>Dif.</th>
                        <th>Ganador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vsData.map((row, idx) => (
                        <tr key={idx} style={{ animationDelay: `${idx * 0.03}s` }} className="animate-slide-up">
                          <td>
                            <div className="city-cell">
                              <MapPin size={12} />
                              {row.city_name}
                              <span className="country-tag">{row.country_code}</span>
                            </div>
                          </td>
                          <td className="bold">{formatNum(row.first_streams)}</td>
                          <td className="bold">{formatNum(row.second_streams)}</td>
                          <td>
                            <span className={row.dif_streams >= 0 ? 'vs-pos' : 'vs-neg'} style={{ fontWeight: 800 }}>
                              {row.dif_streams > 0 ? '+' : row.dif_streams < 0 ? '-' : ''}{formatNum(Math.abs(row.dif_streams))}
                            </span>
                          </td>
                          <td>
                            <div className={`winner-tag ${row.first_streams > row.second_streams ? 's1' : 's2'}`}>
                              {row.first_streams > row.second_streams ? song1.song : song2.song}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'playlists' && (
                <div className="tab-pane animate-fade-in">
                  <div className="tab-controls">
                    <div className="control-group">
                      <label>Tipo:</label>
                      <select value={playlistFilter} onChange={(e) => setPlaylistFilter(e.target.value)}>
                        {playlistTypes.map(t => (
                          <option key={t} value={t}>{t === 'all' ? 'Todos' : t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="control-group">
                      <button 
                        className={`sort-btn ${playlistSort.direction === 'asc' ? 'asc' : 'desc'}`}
                        onClick={() => setPlaylistSort(prev => ({ ...prev, direction: prev.direction === 'desc' ? 'asc' : 'desc' }))}
                      >
                        Followers {playlistSort.direction === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                      </button>
                    </div>
                  </div>
                  <table className="vs-table">
                    <thead>
                      <tr>
                        <th>Playlist</th>
                        <th>Followers</th>
                        <th>Pos. S1</th>
                        <th>Pos. S2</th>
                        <th>Tipo</th>
                        <th>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSortedPlaylists.map((row, idx) => (
                         <tr key={idx} style={{ animationDelay: `${idx * 0.02}s` }} className="animate-slide-up">
                            <td>
                              <div className="playlist-cell">
                                <p className="p-name">{row.playlist_name}</p>
                                <p className="p-owner">{row.owner_name}</p>
                              </div>
                            </td>
                            <td>{formatNum(row.followers_count)}</td>
                            <td className="bold song1-text">#{row.first_current_position || '-'}</td>
                            <td className="bold song2-text">#{row.second_current_position || '-'}</td>
                            <td><span className="type-badge">{row.playlist_type}</span></td>
                            <td>
                              <a href={row.external_url} target="_blank" rel="noreferrer" className="link-icon">
                                <ExternalLink size={14} />
                              </a>
                            </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'tiktok' && (
                <div className="tab-pane animate-fade-in">
                  <div className="tab-controls">
                    <div className="control-group">
                      <button 
                        className={`sort-btn ${tiktokSort.direction === 'asc' ? 'asc' : 'desc'}`}
                        onClick={() => setTiktokSort(prev => ({ ...prev, direction: prev.direction === 'desc' ? 'asc' : 'desc' }))}
                      >
                        Followers {tiktokSort.direction === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                      </button>
                    </div>
                  </div>
                  <table className="vs-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Followers</th>
                        <th>Videos (S1/S2)</th>
                        <th>Views (S1/S2)</th>
                        <th>Likes (S1/S2)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTiktoks.map((row, idx) => (
                         <tr key={idx} style={{ animationDelay: `${idx * 0.02}s` }} className="animate-slide-up">
                            <td>
                              <div className="user-cell">
                                <p className="u-name">{row.user_name}</p>
                                <p className="u-handle">@{row.user_handle}</p>
                              </div>
                            </td>
                            <td className="bold">{formatNum(row.tiktok_user_followers)}</td>
                            <td>
                              <span className="song1-text">{row.first_no_videos}</span> / <span className="song2-text">{row.second_no_videos}</span>
                            </td>
                            <td>
                              <span className="song1-text">{formatNum(row.first_views_total)}</span> / <span className="song2-text">{formatNum(row.second_views_total)}</span>
                            </td>
                            <td>
                              <span className="song1-text">{formatNum(row.first_likes_total)}</span> / <span className="song2-text">{formatNum(row.second_likes_total)}</span>
                            </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'charts' && (
                <div className="tab-pane animate-fade-in">
                  <div className="bar-chart-container">
                    {vsData.slice(0, 10).map((row, idx) => {
                      const max = Math.max(vsData[0].first_streams, vsData[0].second_streams);
                      const w1 = (row.first_streams / max) * 100;
                      const w2 = (row.second_streams / max) * 100;

                      return (
                        <div key={idx} className="chart-row-vs animate-slide-right" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <div className="chart-city-label">{row.city_name}</div>
                          <div className="bars-wrapper">
                            <div className="bar-s1" style={{ width: `${w1}%` }}>
                              <span className="bar-val">{formatNum(row.first_streams)}</span>
                            </div>
                            <div className="bar-s2" style={{ width: `${w2}%` }}>
                              <span className="bar-val">{formatNum(row.second_streams)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .compare-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(0px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .compare-overlay.active {
          opacity: 1;
          pointer-events: auto;
          backdrop-filter: blur(20px);
        }

        .compare-modal-glass {
          width: 95%;
          max-width: 1000px;
          height: 90vh;
          background: rgba(15, 15, 20, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          transform: translateY(40px) scale(0.95);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .compare-overlay.active .compare-modal-glass {
          transform: translateY(0) scale(1);
        }

        .compare-header {
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .header-titles {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .tab-icon-box {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--accent-primary), #6366f1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(138, 136, 255, 0.3);
        }

        .header-titles h3 { font-size: 1.4rem; color: white; margin: 0; }
        .header-titles p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }

        .close-btn-circle {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .close-btn-circle:hover {
          background: rgba(255, 0, 0, 0.2);
          border-color: rgba(255, 0, 0, 0.3);
          transform: rotate(90deg);
        }

        .vs-cards-row {
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
        }

        .v-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1.2rem;
          padding: 1.2rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }

        .song1-accent { border-left: 4px solid var(--accent-primary); }
        .song2-accent { border-right: 4px solid #00f0ff; }

        .v-card-img { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
        .v-card-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
        .v-rank {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: white;
          color: black;
          font-weight: 800;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .v-card-info h4 { font-size: 1.1rem; color: white; margin: 0 0 0.2rem 0; }
        .v-card-info p { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 0.5rem 0; }
        .v-score { font-size: 0.75rem; font-weight: 700; color: white; opacity: 0.6; }

        .align-right { text-align: right; }

        .vs-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .vs-circle {
          width: 50px;
          height: 50px;
          background: #1a1a24;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1rem;
          color: white;
          box-shadow: 0 0 30px rgba(138, 136, 255, 0.2);
        }

        .vs-metrics-strip {
          display: flex;
          justify-content: space-around;
          padding: 0.8rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .metric-item { text-align: center; }
        .metric-item span { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
        .metric-item p { font-size: 1.2rem; font-weight: 800; margin: 0.2rem 0 0 0; }



        .tab-controls {
          display: flex;
          align-items: center;
          padding: 0 0 1rem 0;
          gap: 0.5rem;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .control-group select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 4px 12px;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
        }

        .sort-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 14px;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .sort-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .compare-tabs-nav {
          display: flex;
          gap: 0.5rem;
          padding: 1.2rem 2rem;
        }

        .compare-tabs-nav button {
          padding: 0.6rem 1.2rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s;
        }

        .compare-tabs-nav button.active {
          background: rgba(138, 136, 255, 0.15);
          border-color: var(--accent-primary);
          color: white;
        }

        .compare-content {
          flex: 1;
          padding: 0 2rem 2rem 2rem;
          overflow-y: auto;
        }

        .vs-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 0.6rem;
        }

        .vs-table th {
          text-align: left;
          padding: 0.5rem 1rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 1px;
        }

        .vs-table tr { background: transparent; }

        .vs-table td {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 0.9rem;
          color: white;
        }

        .vs-table td:first-child { border-left: 1px solid rgba(255, 255, 255, 0.04); border-radius: 12px 0 0 12px; }
        .vs-table td:last-child { border-right: 1px solid rgba(255, 255, 255, 0.04); border-radius: 0 12px 12px 0; }

        .city-cell { display: flex; align-items: center; gap: 0.6rem; font-weight: 600; }
        .country-tag { font-size: 0.6rem; background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; color: var(--text-muted); }

        .bold { font-weight: 800; font-size: 1rem; }
        .vs-pos { color: #4ade80 !important; font-weight: 700; }
        .vs-neg { color: #f87171 !important; font-weight: 700; }

        .song1-text { color: var(--accent-primary) !important; }
        .song2-text { color: #00f0ff !important; }

        .winner-tag {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          text-align: center;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .winner-tag.s1 { background: rgba(138, 136, 255, 0.2); color: var(--accent-primary); border: 1px solid rgba(138, 136, 255, 0.3); }
        .winner-tag.s2 { background: rgba(0, 240, 255, 0.1); color: #00f0ff; border: 1px solid rgba(0, 240, 255, 0.2); }

        .type-badge { font-size: 0.7rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; }
        .link-icon { color: var(--text-muted); transition: color 0.2s; }
        .link-icon:hover { color: white; }

        .loading-pulse-ring {
          width: 60px;
          height: 60px;
          border: 3px solid var(--accent-primary);
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
          margin-bottom: 1.5rem;
        }

        .compare-loading-state {
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .bar-chart-container {
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chart-row-vs {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .chart-city-label {
          width: 140px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bars-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bar-s1, .bar-s2 {
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 0.6rem;
          min-width: 40px;
          position: relative;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bar-s1 { background: linear-gradient(90deg, transparent, var(--accent-primary)); border: 1px solid rgba(138, 136, 255, 0.3); }
        .bar-s2 { background: linear-gradient(90deg, transparent, #00f0ff); border: 1px solid rgba(0, 240, 255, 0.2); }

        .bar-val { font-size: 0.65rem; font-weight: 800; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SongCompareModal;
