import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { digitalLatinoApi, SongsArtistBySpotifyId, SongBasicInfo, Song } from "@/lib/api";
import { Backdrop, CircularProgress, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import { Play, Pause, Calendar, TrendingUp, Disc, User, Info, Lock, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import ChartSongDetails from '../ChartSongDetails';

interface ExpandRowArtistProps {
    artist: {
        spotifyid?: string;
        artist: string;
        rk: number;
    };
    selectedCountry: string;
    isExpanded: boolean;
}

interface SongWithDetails extends SongsArtistBySpotifyId {
    songDetails?: SongBasicInfo;
}

export function ExpandRowArtist({ artist, selectedCountry, isExpanded }: ExpandRowArtistProps) {
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();
    const [songs, setSongs] = useState<SongWithDetails[]>([]);
    const [loadingSongs, setLoadingSongs] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState<{ [key: number]: boolean }>({});

    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loadingSongDetails, setLoadingSongDetails] = useState(false);

    const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (isExpanded && artist.spotifyid && selectedCountry) {
            fetchArtistSongs();
        }
    }, [isExpanded, artist.spotifyid, selectedCountry]);

    const fetchArtistSongs = async () => {
        if (!artist.spotifyid) return;

        try {
            setLoadingSongs(true);
            const response = await digitalLatinoApi.getSongsArtistBySpotifyId(
                artist.spotifyid,
                parseInt(selectedCountry)
            );

            // Preservar todos los datos originales de las canciones
            const songsData = (response.data || []).map(song => ({
                ...song,
                songDetails: undefined
            }));

            setSongs(songsData);

            // Cargar detalles adicionales para cada canción
            songsData.forEach((song, index) => {
                if (song.cs_song) {
                    setTimeout(() => {
                        fetchSongDetails(song.cs_song, index);
                    }, index * 100);
                }
            });
        } catch (error) {
            console.error('Error fetching artist songs:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las canciones del artista.",
                variant: "destructive"
            });
        } finally {
            setLoadingSongs(false);
        }
    };

    const fetchSongDetails = async (csSong: number, index: number) => {
        setLoadingDetails(prev => ({ ...prev, [csSong]: true }));

        try {
            const response = await digitalLatinoApi.getSongById(csSong);

            setSongs(prev => prev.map(song =>
                song.cs_song === csSong
                    ? {
                        ...song,
                        songDetails: response.data
                    }
                    : song
            ));
        } catch (error) {
            console.error(`Error obteniendo detalles adicionales para canción ${csSong}:`, error);
        } finally {
            setLoadingDetails(prev => ({ ...prev, [csSong]: false }));
        }
    };

    const handlePlayPreview = (trackId: number, audioUrl?: string) => {
        if (!audioUrl) return;

        if (currentlyPlaying === trackId) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            setCurrentlyPlaying(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener("ended", () => {
            setCurrentlyPlaying(null);
            audioRef.current = null;
        });

        audio.play().then(() => {
            setCurrentlyPlaying(trackId);
        }).catch((err) => {
            console.error("Error al reproducir el audio:", err);
            setCurrentlyPlaying(null);
            audioRef.current = null;
        });
    };

    const handleSongSelect = (song: SongWithDetails) => {
        if (song.spotifyid) {
            const campaignUrl = `/campaign?spotifyId=${song.spotifyid}`;
            window.open(campaignUrl, '_blank');
        } else {
            toast({
                title: "Información no disponible",
                description: "No se puede abrir la campaña para esta canción",
                variant: "destructive"
            });
        }
    };

    const handleDetailsClick = async (song: SongWithDetails) => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        if (!song.spotifyid) {
            toast({
                title: "Información no disponible",
                description: "No se puede cargar los detalles - Spotify ID no disponible",
                variant: "destructive"
            });
            return;
        }

        setLoadingSongDetails(true);
        try {
            const csSongResponse = await digitalLatinoApi.getSongBySpotifyId(song.spotifyid);

            if (csSongResponse.data && csSongResponse.data.cs_song) {
                const csSong = csSongResponse.data.cs_song;

                // Crear objeto Song con valores por defecto
                const defaultSongData: Song = {
                    cs_song: csSong,
                    spotify_streams_total: 0,
                    tiktok_views_total: 0,
                    youtube_video_views_total: 0,
                    youtube_short_views_total: 0,
                    shazams_total: 0,
                    soundcloud_stream_total: 0,
                    pan_streams: 0,
                    audience_total: 0,
                    spins_total: 0,
                    score: song.score || 0,
                    rk_total: 0,
                    tw_spins: 0,
                    tw_aud: 0,
                    rk: 0,
                    spotify_streams: song.spotify_streams || 0,
                    entid: 0,
                    length_sec: 0,
                    song: getSongName(song, songs.indexOf(song)),
                    artists: getArtist(song),
                    label: getLabel(song),
                    crg: '',
                    avatar: song.songDetails?.avatar || song.image_url || '',
                    url: song.spotifyid ? `https://open.spotify.com/track/${song.spotifyid}` : '',
                    spotifyid: song.spotifyid
                };

                setSelectedSong(defaultSongData);
                setIsDetailsOpen(true);
            } else {
                toast({
                    title: "Información no disponible",
                    description: "No se encontró el ID de la canción",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error obteniendo detalles de la canción:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información detallada de la canción",
                variant: "destructive"
            });
        } finally {
            setLoadingSongDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedSong(null);
    };

    const getSongName = (song: SongWithDetails, index: number) => {
        if (song.songDetails?.song) return song.songDetails.song;
        if (song.songDetails?.title) return song.songDetails.title;
        return `Canción ${index + 1}`;
    };

    const getLabel = (song: SongWithDetails) => {
        return song.songDetails?.label || 'Disquera no disponible';
    };

    const getArtist = (song: SongWithDetails) => {
        return song.songDetails?.artist || artist.artist;
    };

    const formatStreams = (streams: number): string => {
        if (streams >= 1000000) {
            return (streams / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (streams >= 1000) {
            return (streams / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return streams.toString();
    };

    if (loadingSongs) {
        return (
            <div className="mt-4 border-t border-white/30 pt-4 bg-background/50 rounded-lg p-4">
                <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-slate-600">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Cargando canciones de {artist.artist}...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            border: "1px solid #E0E0E0",
            borderRadius: isMobile ? "8px" : "12px",
            padding: isMobile ? "12px" : isTablet ? "16px" : "24px",
            boxShadow: isMobile ? "0 1px 4px rgba(0,0,0,0.04)" : "0 2px 12px rgba(0,0,0,0.06)",
            backgroundColor: "white",
            marginBottom: isMobile ? "16px" : "24px",
            marginLeft: isMobile ? "-8px" : "0",
            marginRight: isMobile ? "-8px" : "0",
            width: "100%"
        }}>
            <div className="mt-4 border-t border-white/30 pt-4 bg-background/50 rounded-lg p-4 animate-fade-in">
                <Typography variant="subtitle2" sx={{
                    color: "#6C63FF",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    textAlign: isMobile ? "left" : "left"
                }}>
                    <span className="text-lg col-span-2">🎵 </span>
                    Canciones de {artist.artist}
                </Typography>

                {songs.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">
                        No se encontraron canciones para este artista.
                    </div>
                ) : (
                    <div
                        className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
                        }}
                    >
                        {/* Estilos personalizados para el scrollbar */}
                        <style jsx>{`
                            div::-webkit-scrollbar {
                                width: 6px;
                            }
                            div::-webkit-scrollbar-track {
                                background: transparent;
                                border-radius: 3px;
                            }
                            div::-webkit-scrollbar-thumb {
                                background: rgba(156, 163, 175, 0.5);
                                border-radius: 3px;
                            }
                            div::-webkit-scrollbar-thumb:hover {
                                background: rgba(156, 163, 175, 0.7);
                            }
                        `}</style>

                        {songs.map((song, index) => (
                            <Card
                                key={song.cs_song || index}
                                className={`${isMobile ? 'p-2' : 'p-4'} cursor-pointer hover:bg-accent/50 transition-all border border-white/20 bg-white/40 backdrop-blur-sm`}
                            >
                                {/* Layout horizontal */}
                                {!isMobile ? (
                                    <div className="flex items-center gap-4">
                                        {/* Número de ranking */}
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">
                                                {index + 1}
                                            </span>
                                        </div>
                                        {/* Imagen del álbum */}
                                        {song.image_url ? (
                                            <img
                                                src={song.image_url}
                                                alt="Album cover"
                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <Music className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Información de la canción */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-800 mb-1">
                                                {getSongName(song, index)}
                                            </h3>

                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3 h-3 text-slate-500" />
                                                <span className="text-sm text-slate-600">{getArtist(song)}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                                                {/* Disquera/Label */}
                                                <div className="flex items-center gap-1">
                                                    <Disc className="w-3 h-3" />
                                                    <span>{getLabel(song)}</span>
                                                </div>

                                                {/* Fecha de lanzamiento */}
                                                {song.release_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Lanzamiento: {new Date(song.release_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                {/* Loading indicator para detalles */}
                                                {loadingDetails[song.cs_song] && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                        <span>Cargando Métricas...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex flex-col gap-2 flex-shrink-0">

                                            {user ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={loadingSongDetails || !song.spotifyid}
                                                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1"
                                                    onClick={() => handleDetailsClick(song)}
                                                >
                                                    <Info className="w-3 h-3" />
                                                    {loadingSongDetails ? "Cargando..." : "Métricas"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 cursor-pointer"
                                                    onClick={() => setShowLoginDialog(true)}
                                                >
                                                    <Lock className="w-3 h-3" />
                                                    Métricas
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800 flex items-center gap-1"
                                                onClick={() => handleSongSelect(song)}
                                            >
                                                <Play className="w-3 h-3" />
                                                Ver Campaña
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Layout vertical */
                                    <div className="flex flex-col gap-3">
                                        {/* Primera fila en móvil: Número ranking + Imagen + Info básica */}
                                        <div className="flex items-start gap-3">
                                            {/* Número de ranking */}
                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                            </div>

                                            {/* Imagen del álbum */}
                                            {song.image_url ? (
                                                <img
                                                    src={song.image_url}
                                                    alt="Album cover"
                                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <Music className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}

                                            {/* Información de la canción */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 mb-1 text-sm truncate">
                                                    {getSongName(song, index)}
                                                </h3>

                                                <div className="flex items-center gap-1 mb-1">
                                                    <User className="w-3 h-3 text-slate-500" />
                                                    <span className="text-xs text-slate-600 truncate">
                                                        {getArtist(song)}
                                                    </span>
                                                </div>

                                                {/* Información adicional */}
                                                <div className="flex flex-col gap-1 text-slate-600">
                                                    {/* Disquera/Label */}
                                                    <div className="flex items-center gap-1">
                                                        <Disc className="w-3 h-3" />
                                                        <span className="text-xs truncate">{getLabel(song)}</span>
                                                    </div>

                                                    {/* Fecha de lanzamiento */}
                                                    {song.release_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span className="text-xs">
                                                                {new Date(song.release_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Loading indicator para detalles */}
                                                    {loadingDetails[song.cs_song] && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-xs">Cargando...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex flex-row justify-between gap-2 mt-2">

                                            {user ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={loadingSongDetails || !song.spotifyid}
                                                    className="flex-1 text-xs px-2 py-1 bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 justify-center"
                                                    onClick={() => handleDetailsClick(song)}
                                                >
                                                    <Info className="w-3 h-3" />
                                                    {loadingSongDetails ? "Cargando..." : "Métricas"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 text-xs px-2 py-1 bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 justify-center cursor-pointer"
                                                    onClick={() => setShowLoginDialog(true)}
                                                >
                                                    <Lock className="w-3 h-3" />
                                                    Métricas
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs px-2 py-1 bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800 flex items-center gap-1 justify-center"
                                                onClick={() => handleSongSelect(song)}
                                            >
                                                <Play className="w-3 h-3" />
                                                Campaña
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {songs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/30">
                        <div className={`${isMobile ? 'flex flex-col gap-1' : 'flex justify-between items-center'} text-sm text-slate-600`}>
                            <span className={isMobile ? 'text-xs' : ''}>Total de canciones: {songs.length}</span>
                            <span className={isMobile ? 'text-xs' : ''}>
                                Streams totales: {formatStreams(songs.reduce((total, song) => total + (song.spotify_streams || 0), 0))}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Detalles */}
            {isDetailsOpen && selectedSong && (
                <ChartSongDetails
                    song={selectedSong}
                    selectedCountry={selectedCountry}
                    selectedFormat="0"
                    countries={[]}
                    isOpen={isDetailsOpen}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
}