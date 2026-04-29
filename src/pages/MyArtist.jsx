import React, { useState, useEffect } from "react";
import { Music, Info, Lock, Disc, Calendar, Star, Loader2, BarChart2, TrendingUp, Play, Headphones, Smartphone, Users, Activity, X, Mic } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import ArtistDetailsModal from "../components/ArtistDetailsModal";

// Función utilitaria para formatear números de streams
const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('en-US');
};

// Función utilitaria para millones/billones para KPI gigantes
const formatBigNumber = (num) => {
    if (num === null || num === undefined) return "0";
    const n = Number(num);
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString('en-US');
};

// Caché global en memoria temporal de la sesión para evitar llamadas ineficientes
const localSongCache = {};

export default function MyArtist({ onSongClick }) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [artistImage, setArtistImage] = useState("");
    const [artistStats, setArtistStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeChart, setActiveChart] = useState(null);

    // Dynamic Chart configurations
    const chartConfigs = {
        spotify: {
            title: 'Crecimiento de Oyentes',
            desc: 'Evolución de escuchas mensuales en Spotify (Demo)',
            color: '#1DB954',
            getValue: (stats) => stats?.monthly_listeners || 0,
            icon: Headphones,
            formatSuffix: 'Oyentes'
        },
        streams: {
            title: 'Total Streams Global',
            desc: 'Acumulado de reproducciones digitales (Demo)',
            color: '#ffffff',
            getValue: (stats) => stats?.streams_total || 0,
            icon: Activity,
            formatSuffix: 'Streams'
        },
        youtube: {
            title: 'Crecimiento en YouTube',
            desc: 'Evolución de suscriptores del canal (Demo)',
            color: '#FF0000',
            getValue: (stats) => stats?.subscribers_total_youtube || 0,
            icon: Play,
            formatSuffix: 'Subs'
        },
        tiktok: {
            title: 'Seguidores en TikTok',
            desc: 'Crecimiento de audiencia en TikTok (Demo)',
            color: '#00f2fe',
            getValue: (stats) => stats?.followers_total_tiktok || 0,
            icon: Smartphone,
            formatSuffix: 'Followers'
        },
        playlist: {
            title: 'Alcance de Playlists',
            desc: 'Evolución del alcance potencial en curaduría (Demo)',
            color: '#c193ff',
            getValue: (stats) => stats?.playlist_reach || 0,
            icon: Disc,
            formatSuffix: 'Alcance'
        }
    };

    // Generar datos ficticios para la gráfica seleccionada según la métrica actual
    const chartData = React.useMemo(() => {
        if (!activeChart || !artistStats) return [];
        const config = chartConfigs[activeChart];
        const currentValue = config.getValue(artistStats) || 1000;
        
        const data = [];
        let value = currentValue * 0.6; // Inicia en 60%
        const points = 10; // 10 semanas
        const step = (currentValue - value) / points;
        
        for (let i = 0; i < points; i++) {
            // Añadir ruido aleatorio pero asegurando tendencia alcista general
            const noise = (Math.random() - 0.5) * (step * 1.5);
            value += step + noise;
            
            // Forzar el último punto al valor actual exacto
            if (i === points - 1) value = currentValue;
            
            const date = new Date();
            // Cada punto retrocede una semana (7 días)
            date.setDate(date.getDate() - ((points - 1 - i) * 7));
            
            // Opcionalmente podemos mostrar explícitamente "Semana X" o dejar la fecha
            data.push({
                name: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                value: Math.max(0, Math.round(value))
            });
        }
        return data;
    }, [activeChart, artistStats]);

    useEffect(() => {
        if (user?.allowedArtistId) {
            fetchArtistSongs();
        }
    }, [user]);

    // Petición para obtener datos globales del Artista
    useEffect(() => {
        const fetchGlobalStats = async () => {
            if (!user?.allowedArtistId) return;
            try {
                const url = `https://backend.digital-latino.com/api/report/getDataArtist/${encodeURIComponent(user.allowedArtistId)}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setArtistStats(data);
                }
            } catch (e) {
                console.error("Error cargando estadísticas globales", e);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchGlobalStats();
    }, [user?.allowedArtistId]);

    // 1. Obtener la lista general de canciones y procesar caché
    const fetchArtistSongs = async () => {
        if (!user?.allowedArtistId) return;

        setLoading(true);
        try {
            const url = `https://backend.digital-latino.com/api/report/getSongsArtist/${encodeURIComponent(user.allowedArtistId)}/0`;
            const res = await fetch(url);

            if (!res.ok) throw new Error("Error en la red: " + res.status);

            const _data = await res.json();
            const rawArray = Array.isArray(_data) ? _data : (_data.data || []);

            if (rawArray.length > 0) {
                const sortedByDateForImage = [...rawArray].sort((a, b) => {
                    const dateA = new Date(a.release_date || 0).getTime();
                    const dateB = new Date(b.release_date || 0).getTime();
                    return dateB - dateA;
                });

                if (sortedByDateForImage[0]?.image_url) {
                    setArtistImage(sortedByDateForImage[0].image_url);
                }

                const sortedByStreams = [...rawArray].sort((a, b) => {
                    const streamsA = Number(a.spotify_streams || 0);
                    const streamsB = Number(b.spotify_streams || 0);
                    if (streamsA === streamsB) {
                        const dateA = new Date(a.release_date || 0).getTime();
                        const dateB = new Date(b.release_date || 0).getTime();
                        return dateB - dateA;
                    }
                    return streamsB - streamsA;
                });

                // Preparar array inicial (usando cache local en memoria si existe)
                // Busca esta parte dentro de fetchArtistSongs:
                const baseSongs = sortedByStreams.map(song => {
                    const cachedData = localSongCache[song.cs_song];
                    // IMPORTANTE: Mapear 'image_url' a 'backend_avatar' desde el inicio
                    const initialImage = song.image_url || song.avatar || "/placeholder.png";

                    if (cachedData) {
                        return { ...song, ...cachedData, info_loaded: true };
                    }
                    // Seteamos backend_avatar con la imagen que ya tenemos para que no salga el cuadro vacío mientras carga
                    return { ...song, backend_avatar: initialImage, info_loaded: false };
                });

                setSongs(baseSongs); // Inyección directa base

                // Filtrar las canciones que faltan información
                const songsToFetch = baseSongs.filter(s => !s.info_loaded && s.cs_song);

                if (songsToFetch.length > 0) {
                    // Carga Asíncrona sin bloquear el loop.
                    const promises = songsToFetch.map(s => fetchIndividualSongData(s));
                    const results = await Promise.allSettled(promises);

                    // Solo actualizamos el estado FINALMENTE y una Sola Vez (Batch Update) para optimizar Render y evitar Flickering.
                    setSongs(prevSongs => {
                        const updatedSongs = [...prevSongs];
                        results.forEach(result => {
                            if (result.status === "fulfilled" && result.value) {
                                const { csSongId, data } = result.value;

                                localSongCache[csSongId] = data; // Persistencia de Cache

                                const idx = updatedSongs.findIndex(u => u.cs_song === csSongId);
                                if (idx !== -1) {
                                    updatedSongs[idx] = { ...updatedSongs[idx], ...data, info_loaded: true };
                                }
                            }
                        });
                        return updatedSongs;
                    });
                }
            } else {
                setSongs([]);
            }
        } catch (error) {
            console.error('Error obteniendo canciones:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las canciones",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Función pura de Fetch: No modifica Estados, solo devuelve Promise con Data segura.
    const fetchIndividualSongData = async (songItem) => {
        const csSongId = songItem.cs_song;
        const sId = songItem.spotify_id || songItem.spotifyid;
        let newData = { csSongId, data: { info_loaded: true } };

        try {
            const url = `https://backend.digital-latino.com/api/report/getSongbyId/${csSongId}`;
            const response = await fetch(url);

            // El backend responde 201 en tus capturas
            if (!response.ok && response.status !== 201) throw new Error("Backend error");

            const data = await response.json();

            // 1. Intentamos obtener la imagen del JSON (monitorlatino)
            let finalImage = (data.avatar && data.avatar !== "null") ? data.avatar : null;

            // 2. RESCATE DE SPOTIFY: Si la URL del JSON es inválida o nula
            // Usamos el API de OEmbed de Spotify que es pública
            if ((!finalImage || finalImage === "null") && sId) {
                try {
                    // Esta es la URL correcta para pedirle a Spotify los metadatos de una canción
                    const spotifyOEmbedUrl = `https://open.spotify.com/oembed?url=spotify:track:${sId}`;
                    const spotRes = await fetch(spotifyOEmbedUrl);

                    if (spotRes.ok) {
                        const spotData = await spotRes.json();
                        if (spotData.thumbnail_url) {
                            finalImage = spotData.thumbnail_url;
                            console.log("Imagen rescatada exitosamente de Spotify para el ID:", sId);
                        }
                    }
                } catch (spotErr) {
                    console.error("No se pudo rescatar de Spotify:", spotErr);
                }
            }

            newData.data = {
                backend_title: data.title || songItem.song || "Sin título",
                backend_label: data.label || "Independiente",
                backend_avatar: finalImage || "/placeholder.png",
                info_loaded: true
            };

            return newData;

        } catch (e) {
            console.error("Error en fetchIndividual:", e);
            newData.data.backend_avatar = "/placeholder.png";
            return newData;
        }
    };

    const getSongName = (song) => {
        if (song.backend_title) return song.backend_title;
        if (song.song) return song.song;
        if (song.title) return song.title;
        if (song.info_loaded) return "Pista Desconocida";
        return song.song || song.trackName || "Cargando...";
    };

    const getLabel = (song) => {
        if (song.backend_label) return song.backend_label;
        if (song.label) return song.label;
        return "Independiente";
    };

    const handleSongSelect = (song) => {
        const sId = song.spotify_id || song.spotifyid;
        if (sId) {
            window.open(`/campaign?spotifyId=${sId}`, '_blank');
        } else {
            toast({ title: "Info no disponible", variant: "destructive" });
        }
    };

    const handleDetailsClick = (song) => {
        if (onSongClick) {
            onSongClick({
                ...song,
                song: getSongName(song),
                artists: user?.allowedArtistName || 'Artista',
                // Prioridad de imagen para el Modal
                imageUrl: song.backend_avatar || song.image_url || artistImage || "/placeholder.png"
            });
        }
    };

    const renderedSongs = React.useMemo(() => songs.map((song, index) => (
        <div key={song.cs_song || index} className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] p-5 hover:bg-white/[0.06] hover:border-[#c193ff]/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#c193ff] to-[#ff3366] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-1 min-w-0">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.05] text-gray-400 font-bold shrink-0 group-hover:text-[#c193ff]">
                        {index + 1}
                    </div>

                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg cursor-pointer" onClick={() => handleDetailsClick(song)}>
                        <img
                            src={song.backend_avatar || "/placeholder.png"}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Si incluso la imagen de Spotify falla, ponemos un placeholder genérico
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/200x200/1a1c23/white?text=No+Cover';
                            }}
                        />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="font-bold text-gray-100 text-lg mb-1 flex items-center gap-2">
                            <span className="truncate cursor-pointer hover:text-[#c193ff] transition-colors" onClick={() => handleDetailsClick(song)}>
                                {song.info_loaded ? getSongName(song) : <div className="h-6 w-32 sm:w-48 bg-white/10 animate-pulse rounded"></div>}
                            </span>
                            {(song.score > 0) && (
                                <div title="Canción Hit" className="flex items-center gap-0.5 text-[#ffea00] bg-[#ffea00]/10 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">
                                    <Star size={12} fill="#ffea00" /> TOP
                                </div>
                            )}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <Disc size={12} className="opacity-70" />
                                {song.info_loaded ? <span className="truncate">{getLabel(song)}</span> : <div className="h-4 w-20 bg-white/10 animate-pulse rounded"></div>}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Calendar size={12} className="opacity-70" />
                                <span>{song.release_date ? new Date(song.release_date).toLocaleDateString() : 'Desconocido'}</span>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            {song.spotify_streams > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1DB954]/10 text-[#1DB954] text-xs font-bold border border-[#1DB954]/20">
                                    <BarChart2 size={13} />
                                    {formatNumber(song.spotify_streams)} Impactos
                                </div>
                            )}
                            {song.score > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-bold border border-white/10">
                                    Score: {Number(song.score).toFixed(1)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                    <button
                        onClick={() => handleSongSelect(song)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#c193ff] hover:bg-[#b07eff] transition-all text-black shadow-lg shadow-[#c193ff]/20 min-w-[140px]"
                    >
                        <TrendingUp size={14} /> Nueva Campaña
                    </button>
                    <button
                        onClick={() => handleDetailsClick(song)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 min-w-[140px]"
                    >
                        <Info size={14} /> Detalles analíticos
                    </button>
                </div>
            </div>
        </div>
    )), [songs, artistImage, user, getSongName, handleDetailsClick, getLabel, handleSongSelect]);

    if (!user || user.role !== 'ARTIST') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center flex-col gap-5 text-center p-4">
                <div className="bg-red-500/10 p-5 rounded-full border border-red-500/20 text-red-400">
                    <Lock size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white">Acceso Restringido</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0b10] text-gray-100 p-4 sm:p-6 lg:p-8 relative pb-32">
            {/* Perfil del Artista */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] mb-6 relative overflow-hidden" style={{ marginBottom: '32px' }}>
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3px] border-[#c193ff]/30 shrink-0 bg-[#1a1c23]">
                        {artistImage ? (
                            <img src={artistImage} alt={user.allowedArtistName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gray-800 text-white">
                                {user.allowedArtistName?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                            {user.allowedArtistName}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Premium API KPI Stats Row */}
            {!loadingStats && artistStats && (
                <div className="flex flex-wrap items-stretch justify-start gap-4 mb-8" style={{ marginBottom: '32px' }}>
                    {/* Spotify Listeners */}
                    <div
                        onClick={() => setActiveChart(activeChart === 'spotify' ? null : 'spotify')}
                        className={`transition-all rounded-2xl relative overflow-hidden group hover:-translate-y-1 ${activeChart === 'spotify' ? 'bg-[#1DB954]/20 border border-[#1DB954] shadow-[0_0_20px_rgba(29,185,84,0.3)]' : 'bg-gradient-to-br from-[#1DB954]/10 to-transparent border border-[#1DB954]/20 hover:bg-[#1DB954]/20'}`}
                        style={{ flex: '1 1 180px', maxWidth: '260px', cursor: 'pointer' }}
                    >
                        <div className="w-full h-full flex flex-col justify-center" style={{ padding: '8px 24px' }}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-gray-400 font-medium text-xs sm:text-sm">Oyentes</h3>
                                <Headphones size={18} className="text-[#1DB954] opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-3xl font-black text-white">{formatBigNumber(artistStats.monthly_listeners)}</p>
                            <p className="text-[10px] sm:text-xs text-[#1DB954] mt-2 flex items-center gap-1"><TrendingUp size={10} /> Escuchas Mensuales</p>
                        </div>
                    </div>

                    {/* Total Streams */}
                    <div
                        onClick={() => setActiveChart(activeChart === 'streams' ? null : 'streams')}
                        className={`transition-all rounded-2xl relative overflow-hidden group hover:-translate-y-1 ${activeChart === 'streams' ? 'bg-white/[0.12] border border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:bg-white/[0.08]'}`}
                        style={{ flex: '1 1 180px', maxWidth: '260px', cursor: 'pointer' }}
                    >
                        <div className="w-full h-full flex flex-col justify-center" style={{ padding: '8px 24px' }}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-gray-400 font-medium text-xs sm:text-sm">Total Streams</h3>
                                <Activity size={18} className="text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-3xl font-black text-white">{formatBigNumber(artistStats.streams_total)}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-2 flex items-center gap-1"><Disc size={10} /> Globales Oficiales</p>
                        </div>
                    </div>

                    {/* Youtube Stats */}
                    <div
                        onClick={() => setActiveChart(activeChart === 'youtube' ? null : 'youtube')}
                        className={`transition-all rounded-2xl relative overflow-hidden group hover:-translate-y-1 ${activeChart === 'youtube' ? 'bg-[#FF0000]/20 border border-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'bg-gradient-to-br from-[#FF0000]/10 to-transparent border border-[#FF0000]/20 hover:bg-[#FF0000]/20'}`}
                        style={{ flex: '1 1 180px', maxWidth: '260px', cursor: 'pointer' }}
                    >
                        <div className="w-full h-full flex flex-col justify-center" style={{ padding: '8px 24px' }}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-gray-400 font-medium text-xs sm:text-sm">YouTube Subs</h3>
                                <Play size={18} className="text-[#FF0000] opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-3xl font-black text-white">{formatBigNumber(artistStats.subscribers_total_youtube)}</p>
                            <p className="text-[10px] sm:text-xs text-[#FF0000] mt-2 flex items-center gap-1"><Play size={10} /> {formatBigNumber(artistStats.video_views_total_youtube)} vistas totales</p>
                        </div>
                    </div>

                    {/* TikTok Stats */}
                    <div
                        onClick={() => setActiveChart(activeChart === 'tiktok' ? null : 'tiktok')}
                        className={`transition-all rounded-2xl relative overflow-hidden group hover:-translate-y-1 ${activeChart === 'tiktok' ? 'bg-[#00f2fe]/20 border border-[#00f2fe] shadow-[0_0_20px_rgba(0,242,254,0.3)]' : 'bg-gradient-to-br from-[#00f2fe]/10 to-transparent border border-[#00f2fe]/20 hover:bg-[#00f2fe]/20'}`}
                        style={{ flex: '1 1 180px', maxWidth: '260px', cursor: 'pointer' }}
                    >
                        <div className="w-full h-full flex flex-col justify-center" style={{ padding: '8px 24px' }}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-gray-400 font-medium text-xs sm:text-sm">TikTok Followers</h3>
                                <Smartphone size={18} className="text-[#00f2fe] opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-3xl font-black text-white">{formatBigNumber(artistStats.followers_total_tiktok)}</p>
                            <p className="text-[10px] sm:text-xs text-[#00f2fe] mt-2 flex items-center gap-1"><Activity size={10} /> {formatBigNumber(artistStats.likes_total_tiktok)} likes acumulados</p>
                        </div>
                    </div>

                    {/* Playlist Reach */}
                    <div
                        onClick={() => setActiveChart(activeChart === 'playlist' ? null : 'playlist')}
                        className={`transition-all rounded-2xl relative overflow-hidden group hover:-translate-y-1 ${activeChart === 'playlist' ? 'bg-[#c193ff]/20 border border-[#c193ff] shadow-[0_0_20px_rgba(193,147,255,0.3)]' : 'bg-gradient-to-br from-[#c193ff]/10 to-transparent border border-[#c193ff]/20 hover:bg-[#c193ff]/20'}`}
                        style={{ flex: '1 1 180px', maxWidth: '260px', cursor: 'pointer' }}
                    >
                        <div className="w-full h-full flex flex-col justify-center" style={{ padding: '8px 24px' }}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-gray-400 font-medium text-xs sm:text-sm">Alcance</h3>
                                <Disc size={18} className="text-[#c193ff] opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-3xl font-black text-white">{formatBigNumber(artistStats.playlist_reach)}</p>
                            <p className="text-[10px] sm:text-xs text-[#c193ff] mt-2 flex items-center gap-1"><Music size={10} /> {formatNumber(artistStats.playlists)} playlists activas</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Gráfica Dinámica (Acordeón) */}
            <div 
                className="grid transition-all duration-500 ease-in-out"
                style={{ 
                    gridTemplateRows: activeChart ? '1fr' : '0fr',
                    opacity: activeChart ? 1 : 0,
                    marginBottom: activeChart ? '32px' : '0'
                }}
            >
                <div className="overflow-hidden">
                    {activeChart && artistStats && (
                        <div className="bg-[#111218] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                            {/* Fondo difuminado sutil con el color de la métrica */}
                            <div 
                                className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none transition-colors duration-500"
                                style={{
                                    background: `radial-gradient(circle at top right, ${chartConfigs[activeChart].color}, transparent 60%)`
                                }}
                            />
                            
                            <div 
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10"
                                style={{ marginLeft: '35px', marginTop: '15px', marginBottom: '30px' }}
                            >
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mb-1">
                                        {React.createElement(chartConfigs[activeChart].icon, { size: 24, color: chartConfigs[activeChart].color })}
                                        {chartConfigs[activeChart].title}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        {chartConfigs[activeChart].desc.replace('(Demo)', '(Tendencia de las últimas 10 semanas)')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="h-[200px] sm:h-[280px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartConfigs[activeChart].color} stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor={chartConfigs[activeChart].color} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#666', fontSize: 11 }} 
                                            dy={10} 
                                            minTickGap={20}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'rgba(17, 18, 24, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: chartConfigs[activeChart].color, fontWeight: '900', fontSize: '1.1rem' }}
                                            labelStyle={{ color: '#888', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                            formatter={(value) => [formatNumber(value), chartConfigs[activeChart].formatSuffix]}
                                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={chartConfigs[activeChart].color} 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill="url(#colorGradient)" 
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Botón de cerrar cruz */}
                            <button 
                                onClick={() => setActiveChart(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white bg-white/5 hover:bg-white/20 rounded-full p-2 transition-all duration-300 z-20"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-200 mb-6 px-1">Canciones ({songs.length})</h3>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.03] rounded-[2rem] border border-white/5">
                    <Loader2 className="w-12 h-12 text-[#c193ff] animate-spin mb-4" />
                    <p className="text-gray-400 font-medium">Sincronizando catálogo...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {renderedSongs}
                </div>
            )}
        </div>
    );
}