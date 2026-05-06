import React, { useState, useEffect, useRef, useCallback } from "react";
import { Lock, Loader2, Music, BarChart3, Disc } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getArtistSongs, getSongsArtistBySpotifyId, getChartDigital, getSongById } from "../services/api";
import ArtistDetailsModal from "../components/ArtistDetailsModal";


export default function MyArtist() {
    const { user } = useAuth();
    const [artistProp, setArtistProp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState([]);
    const [allRawSongs, setAllRawSongs] = useState([]);
    const [chartDataState, setChartDataState] = useState([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [view, setView] = useState('panel');

    const fetchBatch = async (batchRaw, currentChart, isInitial = false) => {
        setLoadingMore(true);
        const newDetailedSongs = await Promise.all(batchRaw.map(async (rawSong) => {
            const cs_song = rawSong.cs_song;
            const chartMatch = currentChart.find(c => c.cs_song === cs_song);
            const songDetails = await getSongById(cs_song).catch(() => null);
            
            const exactArtists = songDetails && songDetails.artist ? songDetails.artist : (chartMatch ? chartMatch.artists : user?.allowedArtistName || 'Artista');
            
            return {
                ...rawSong,
                id: cs_song,
                title: songDetails && songDetails.title ? songDetails.title : 'Sin título',
                release_year: rawSong.release_date ? String(rawSong.release_date).split('-')[0] : null,
                rk: chartMatch ? chartMatch.rk : null,
                artists: exactArtists,
                label: songDetails && songDetails.label ? songDetails.label : null
            };
        }));
        
        if (isInitial) {
            setSongs(newDetailedSongs);
        } else {
            setSongs(prev => [...prev, ...newDetailedSongs]);
        }
        setLoadingMore(false);
    };

    const observer = useRef();
    const lastElementRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && songs.length < allRawSongs.length) {
                 const nextBatch = allRawSongs.slice(songs.length, songs.length + 20);
                 fetchBatch(nextBatch, chartDataState, false);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingMore, songs.length, allRawSongs, chartDataState]);

    useEffect(() => {
        const prepareArtistData = async () => {
            if (!user?.allowedArtistId) {
                // Si aún no hay ID pero el usuario está cargando, mantenemos loading
                // Si definitivamente no hay ID, mostramos error
                return;
            }

            const cachedImage = localStorage.getItem(`artistImage_${user.allowedArtistId}`) || "/placeholder.png";

            // 1. Mostrar el panel de Estadísticas DE INMEDIATO con la imagen cacheada
            setArtistProp(prev => prev || {
                id: user.allowedArtistId,
                spotifyid: user.allowedArtistId,
                name: user.allowedArtistName || "Artista",
                imageUrl: cachedImage,
                initialTab: 'mapa'
            });
            setLoading(false);

            // Búsqueda rápida de imagen para actualizar la UI en menos de 1 segundo (si no estaba en caché)
            getArtistSongs(user.allowedArtistId).then(songsData => {
                if (songsData && songsData.length > 0) {
                    const songWithImage = songsData.find(s => s.image_url || s.avatar || s.url);
                    if (songWithImage) {
                        const betterImageUrl = songWithImage.image_url || songWithImage.avatar || songWithImage.url;
                        localStorage.setItem(`artistImage_${user.allowedArtistId}`, betterImageUrl);
                        setArtistProp(prev => ({ ...prev, imageUrl: betterImageUrl }));
                    }
                }
            }).catch(() => {});

            // 2. Cargar las canciones en segundo plano para la pestaña "Mis Canciones"
            try {
                const [detailsData, chartResp] = await Promise.all([
                    getSongsArtistBySpotifyId(user.allowedArtistId, 'All'),
                    getChartDigital('All', 'All', 'All', 'C')
                ]).catch(err => {
                    console.error("Error fetching song details", err);
                    return [[], []];
                });

                const chartArray = Array.isArray(chartResp) ? chartResp : [];
                setChartDataState(chartArray);

                if (detailsData && detailsData.length > 0) {
                    const uniqueSongsMap = new Map();
                    detailsData.forEach(s => {
                        if (s.cs_song && !uniqueSongsMap.has(s.cs_song)) {
                            uniqueSongsMap.set(s.cs_song, s);
                        }
                    });
                    const uniqueSongs = Array.from(uniqueSongsMap.values());
                    
                    setAllRawSongs(uniqueSongs);

                    // Actualizar la imagen del artista si encontramos una mejor
                    const songWithImage = uniqueSongs.find(s => s.image_url || s.avatar || s.url);
                    if (songWithImage) {
                        const betterImageUrl = songWithImage.image_url || songWithImage.avatar || songWithImage.url;
                        setArtistProp(prev => ({
                            ...prev,
                            imageUrl: betterImageUrl
                        }));
                    }

                    // Cargar los detalles del primer lote (20 canciones) en segundo plano
                    const initialBatch = uniqueSongs.slice(0, 20);
                    fetchBatch(initialBatch, chartArray, true).catch(console.error);
                    
                } else {
                    setAllRawSongs([]);
                    setSongs([]);
                }

            } catch (error) {
                console.error('Error preparando datos del artista:', error);
            }
        };

        prepareArtistData();
    }, [user]);

    // Opcional: Si pasa demasiado tiempo y user sigue sin allowedArtistId
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading && (!user || !user.allowedArtistId)) {
                setLoading(false);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [user, loading]);

    if (!user || user.role !== 'ARTIST') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center p-8">
                <Lock className="w-16 h-16 text-[#c193ff] opacity-50" />
                <h2 className="text-2xl font-bold text-white">Acceso Restringido</h2>
                <p className="text-gray-400 max-w-md">
                    Esta sección es exclusiva para artistas con una cuenta verificada.
                    Por favor inicia sesión con tu cuenta de artista.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#c193ff] animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Preparando panel del artista...</p>
            </div>
        );
    }

    if (!artistProp) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <p className="text-gray-400 font-medium">No se pudo cargar la información del artista.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="relative z-40 flex justify-center gap-4 p-6 bg-[#0A0A0A] border-b border-gray-800">
                <button
                    onClick={() => setView('panel')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${view === 'panel'
                            ? 'bg-[#c193ff] text-black shadow-[0_0_15px_rgba(193,147,255,0.4)]'
                            : 'bg-transparent text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
                        }`}
                >
                    <BarChart3 className="w-5 h-5" />
                    Estadísticas
                </button>

                <button
                    onClick={() => setView('canciones')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 ${view === 'canciones'
                            ? 'bg-[#c193ff] text-black shadow-[0_0_15px_rgba(193,147,255,0.4)]'
                            : 'bg-transparent text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
                        }`}
                >
                    <Music className="w-5 h-5" />
                    Mis Canciones
                </button>
            </div>

            {view === 'panel' ? (
                <div className="flex-grow">
                    <ArtistDetailsModal
                        artist={artistProp}
                        countries={[]}
                        isModal={false}
                    />
                </div>
            ) : (
                <div className="w-full px-6" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
                    {songs.length > 0 ? (
                        <>
                            <div 
                                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 max-w-7xl mx-auto" 
                                style={{ gap: '48px 24px' }}
                            >
                                {songs.map((song, index) => {
                                    const isLastElement = index === songs.length - 1;
                                    return (
                                    <div
                                        key={song.id || index}
                                        ref={isLastElement ? lastElementRef : null}
                                        className="bg-[#1A1A1A] rounded-xl p-4 flex flex-col transition-all border border-gray-800 relative shadow-lg hover:shadow-xl"
                                    >
                                        {song.rk && (
                                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(245,158,11,0.5)] z-10 flex items-center gap-1 border border-yellow-300/30">
                                                <span>🏆</span> Chart #{song.rk}
                                            </div>
                                        )}
                                        <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center relative group">
                                            <img
                                                src={song.image_url || song.avatar || song.url || '/placeholder.png'}
                                                alt={song.title || song.name || 'Canción'}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder.png';
                                                }}
                                            />
                                            {song.release_year && (
                                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-xs px-2 py-1 rounded text-gray-300 font-medium">
                                                    {song.release_year}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-white font-semibold text-sm truncate" title={song.title || song.name}>
                                            {song.title || song.name || 'Sin título'}
                                        </h3>
                                        <p className="text-[#c193ff] opacity-80 text-xs truncate mt-1 font-medium mb-2" title={song.artists}>
                                            {song.artists}
                                        </p>
                                        
                                        {song.label && (
                                            <div className="mt-auto pt-3 border-t border-gray-800/50 flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
                                                <Disc className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate" title={song.label}>{song.label}</span>
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                            {loadingMore && (
                                <div className="col-span-full flex justify-center py-6">
                                    <Loader2 className="w-8 h-8 text-[#c193ff] animate-spin" />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Music className="w-16 h-16 text-gray-600 mb-4" />
                            <p className="text-gray-400 text-lg">No se encontraron canciones para este artista.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}