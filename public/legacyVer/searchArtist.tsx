import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Music, Search, Info, Lock, Users, Play, X } from "lucide-react";
import { digitalLatinoApi, SpotifyTrackResult, Song, SpotifyArtistResult } from "@/lib/api";
import ChartSongDetails from "./ChartSongDetails";
import ChartArtistDetails from "./ChartArtistDetails";
import { useAuth } from "@/hooks/useAuth";
import { ArtistSongs } from "./artistSongs";
import { log } from "console";
import { ArtistSimilarRecomendations } from "./artistSimilarRecomendations";

interface SearchResultProps {
    track: SpotifyTrackResult;
    onSelect: (track: SpotifyTrackResult) => void;
}
interface ArtistDetails {
    spotifyid?: string;
    artist: string;
    img?: string;
    followers_total?: number;
    monthly_listeners?: number;
    rk?: number;
    score?: number;
}

function SearchResult({ track, onSelect }: SearchResultProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [songDetails, setSongDetails] = useState<Song | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();

    const handleClick = () => {
        onSelect(track);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(track);
    };

    const handleDetailsClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        setLoadingDetails(true);
        try {
            if (track.my_song_id) {
                const csSong = track.my_song_id;
                console.log('✅ cs_song encontrado directamente:', csSong);

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
                    score: 0,
                    rk_total: 0,
                    tw_spins: 0,
                    tw_aud: 0,
                    rk: 0,
                    spotify_streams: 0,
                    entid: 0,
                    length_sec: 0,
                    song: track.song_name || 'Canción no disponible',
                    artists: track.artist_name || 'Artista no disponible',
                    label: ' ',
                    crg: '',
                    avatar: track.image_url || '',
                    url: track.url || '',
                    spotifyid: track.spotify_id || ''
                };

                setSongDetails(defaultSongData);
                setIsDetailsOpen(true);
            } else {
                try {
                    const logResponse = await digitalLatinoApi.setLogSong({
                        userid: user.id,
                        spotifyid: track.spotify_id,
                        isartist: false
                    });
                    if (logResponse.success) {
                        console.log("Log registrado exitosamente:", logResponse.data);
                    }
                } catch (error) {
                    console.error("Error al registrar el log de la cancion:", error);
                }

                console.log(' No se encontró my_song_id en la respuesta');
                toast({
                    title: "Información no disponible",
                    description: "Esta canción aún no tiene métricas disponibles en nuestro sistema",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(' Error obteniendo métricas de la canción:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información detallada de la canción",
                variant: "destructive"
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSongDetails(null);
    };

    return (
        <>
            <Card className="p-3 sm:p-4 cursor-pointer hover:bg-accent/50 transition-all border border-white/20 bg-white/40 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4" >
                    <div className="relative self-center sm:self-auto">
                        <img
                            src={track.image_url}
                            alt={track.song_name}
                            className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <Music className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base truncate sm:self-center">
                            {track.song_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mb-2 truncate sm:self-center">
                            {track.artist_name}
                        </p>
                    </div>
                    {/* Botones Songs */}
                    <div className="flex flex-row sm:flex-col gap-2 justify-end">
                        {user ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={loadingDetails}
                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                onClick={handleDetailsClick}
                            >
                                <Info className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">{loadingDetails ? "Cargando..." : "Métricas"}</span>
                                <span className="sm:hidden">{loadingDetails ? "..." : "Met."}</span>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                onClick={() => setShowLoginDialog(true)}
                            >
                                <Lock className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">Métricas</span>
                                <span className="sm:hidden">Met.</span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                            onClick={handleButtonClick}
                        >
                            <span className="hidden sm:inline">Ver Campaña</span>
                            <span className="sm:hidden">Campaña</span>
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Modal de Detalles/Métricas */}
            {isDetailsOpen && songDetails && (
                <ChartSongDetails
                    song={songDetails}
                    selectedCountry="0"
                    selectedFormat="0"
                    countries={[]}
                    isOpen={isDetailsOpen}
                    onClose={handleCloseDetails}
                />
            )}
        </>
    );
}

// Mostrar resultados de artistas
interface ArtistResultProps {
    artist: {
        id: string;
        name: string;
        image_url: string;
        followers?: number;
    };
    onShowTracks: (artistId: string, artistName: string) => void;
}

function ArtistResult({ artist, onShowTracks }: ArtistResultProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [artistDetails, setArtistDetails] = useState<ArtistDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();

    const handleDetailsClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        setLoadingDetails(true);
        try {

            // Crear objeto ArtistDetails con la información básica
            const artistData: ArtistDetails = {
                spotifyid: artist.id,
                artist: artist.name,
                img: artist.image_url,
                followers_total: artist.followers,
                rk: 0, // Puedes obtener este dato de una API si está disponible
                score: 0 // Puedes obtener este dato de una API si está disponible
            };

            setArtistDetails(artistData);
            setIsDetailsOpen(true);

        } catch (error) {
            //Si no hay datos del artista:
            const logResponse = await digitalLatinoApi.setLogSong({
                userid: user.id,
                spotifyid: artist.id,
                isartist: true
            });

            console.error('Error obteniendo métricas del artista:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información detallada del artista",
                variant: "destructive"
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setArtistDetails(null);
    };

    return (
        <>
            <Card className="p-3 sm:p-4 cursor-pointer hover:bg-accent/50 transition-all border border-white/20 bg-white/40 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="relative self-center sm:self-auto">
                        <img
                            src={artist.image_url}
                            alt={artist.name}
                            className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base truncate">
                            {artist.name}
                        </h3>
                        {artist.followers && (
                            <p className="text-xs text-slate-500">
                                {artist.followers.toLocaleString()} seguidores
                            </p>
                        )}
                    </div>
                    {/* Botones Songs */}
                    <div className="flex flex-row sm:flex-col gap-2 justify-end">
                        {/* Botón de Métricas */}
                        {user ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={loadingDetails}
                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                onClick={handleDetailsClick}
                            >
                                <Info className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">{loadingDetails ? "Cargando..." : "Métricas"}</span>
                                <span className="sm:hidden">{loadingDetails ? "..." : "Met."}</span>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                onClick={() => setShowLoginDialog(true)}
                            >
                                <Lock className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">Métricas</span>
                                <span className="sm:hidden">Met.</span>
                            </Button>
                        )}
                        {/* Botón para mostrar Recomendaciones/ Promo */}
                        <ArtistSimilarRecomendations
                            spotifyId={artist.id}
                            artistName={artist.name}
                            artistImage={artist.image_url}
                        />

                        {/* Botón para mostrar canciones */}
                        {user ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none hover:from-purple-700 hover:to-pink-700 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                onClick={() => onShowTracks(artist.id, artist.name)}
                            >
                                <Play className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">Ver Canciones</span>
                                <span className="sm:hidden">Canci</span>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none hover:from-purple-700 hover:to-pink-700 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                                onClick={() => setShowLoginDialog(true)}
                            >
                                <Lock className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">Ver Canciones</span>
                                <span className="sm:hidden">Canciones</span>
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Modal de Métricas del Artista */}
            {isDetailsOpen && artistDetails && (
                <ChartArtistDetails
                    artist={artistDetails}
                    selectedCountry="0"
                    countries={[]}
                    isOpen={isDetailsOpen}
                    onClose={handleCloseDetails}
                />
            )}
        </>
    );
}

export function SearchArtist() {
    const { toast } = useToast();

    // Spotify search state
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<{
        tracks: SpotifyTrackResult[];
        artists: Array<{
            id: string;
            name: string;
            image_url: string;
            followers?: number;
        }>;
    }>({ tracks: [], artists: [] });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [activeTab, setActiveTab] = useState<'tracks' | 'artists'>('tracks');
    const [artistSongsModal, setArtistSongsModal] = useState<{
        isOpen: boolean;
        spotifyId: string;
        artistName: string;
    }>({
        isOpen: false,
        spotifyId: '',
        artistName: ''
    });


    // Debouncing para limitar las búsquedas por API al usuario
    const useDebounce = (value: string, delay: number) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);
        return debouncedValue;
    };

    // Usar el hook de debounce con 250ms de delay
    const debouncedSearchQuery = useDebounce(searchQuery, 250);

    // Search tracks y artists on Spotify
    const searchTracksAndArtists = useCallback(async (query: string) => {
        console.log('🔍 Buscando:', query);

        if (!query.trim()) {
            setSearchResults({ tracks: [], artists: [] });
            setShowSearchResults(false);
            return;
        }

        setLoadingSearch(true);
        try {
            const response = await digitalLatinoApi.getSearchSpotify(query);

            const tracks = response.data.tracks || [];
            const allArtists = response.data.artists || [];

            // Mapear los artistas
            const artists = allArtists.map(artist => ({
                id: artist.spotify_id,
                name: artist.artist_name,
                image_url: artist.image_url,
                followers: artist.followers
            }));

            setSearchResults({ tracks, artists });
            setShowSearchResults(true);

            // Determinar tab activo por defecto basado en qué hay más resultados
            if (artists.length > tracks.length) {
                setActiveTab('artists');
            } else {
                setActiveTab('tracks');
            }

            if (tracks.length === 0 && artists.length === 0) {
                toast({
                    title: "Sin resultados",
                    description: `No se encontraron canciones o artistas para "${query}" en Spotify`,
                });
            }
        } catch (error) {
            console.error('❌ Error buscando en Spotify:', error);
            toast({
                title: "Error",
                description: "No se pudo buscar. Intenta de nuevo.",
                variant: "destructive"
            });
            setSearchResults({ tracks: [], artists: [] });
        } finally {
            setLoadingSearch(false);
        }
    }, [toast]);

    // Handle search result selection - MODIFICADO para usar spotify_id real
    const handleSearchResultSelect = (track: SpotifyTrackResult) => {
        // Abrir en nueva pestaña con el spotify_id real
        if (track.spotify_id) {
            const campaignUrl = `/campaign?spotifyId=${track.spotify_id}`;
            window.open(campaignUrl, '_blank');
        } else {
            // Fallback si no hay spotify_id
            const params = new URLSearchParams({
                artist: track.artist_name,
                track: track.song_name,
                coverUrl: track.image_url || '',
                spotifyUrl: track.url || ''
            });
            const campaignUrl = `/campaign?${params.toString()}`;
            window.open(campaignUrl, '_blank');
        }
    };

    // Handle artist selection - buscar canciones del artista
    const handleArtistSelect = (artistId: string, artistName: string) => {
        setArtistSongsModal({
            isOpen: true,
            spotifyId: artistId,
            artistName: artistName
        });
    };
    // Función para cerrar el modal
    const handleCloseArtistSongs = () => {
        setArtistSongsModal({
            isOpen: false,
            spotifyId: '',
            artistName: ''
        });
    };

    // useEffect para buscar cuando el query cambia
    useEffect(() => {
        if (debouncedSearchQuery.trim()) {
            searchTracksAndArtists(debouncedSearchQuery);
        } else {
            setSearchResults({ tracks: [], artists: [] });
            setShowSearchResults(false);
        }
    }, [debouncedSearchQuery, searchTracksAndArtists]);

    const hasTracks = searchResults.tracks.length > 0;
    const hasArtists = searchResults.artists.length > 0;

    return (
        <>
            {/* Search Section */}
            <div className="space-y-4 px-3 sm:px-0">
                <div className="flex items-center justify-between">
                    {/*<div className="flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    <h2 className="text-lg font-semibold text-slate-700">¿No encuentras tu artista en los charts?</h2>
                </div>*/}
                </div>

                <div className="relative flex flex-col items-center">
                    <div className="flex flex-row gap-3 items-center w-full lg:w-[500px] xl:w-[500px] 2xl:w-[800px] mx-auto">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Buscar artista o canción..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl lg:rounded-2xl border-0 bg-white/90 backdrop-blur-sm px-4 lg:px-6 py-2 text-sm lg:text-base shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 lg:focus:ring-offset-2 pr-12 h-10 lg:h-[44px] placeholder:text-gray-500 placeholder:text-sm lg:placeholder:text-base"
                            />
                            {/* Loading */}
                            {loadingSearch && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={() => searchQuery.trim() && searchTracksAndArtists(searchQuery)}
                            disabled={loadingSearch || !searchQuery.trim()}
                            className="rounded-xl lg:rounded-2xl bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 px-4 lg:px-5 py-2 text-white hover:from-slate-700 hover:via-gray-800 hover:to-blue-800 h-10 lg:h-[44px] min-w-[50px] sm:min-w-[55px] lg:min-w-[60px] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <Search className="w-5 h-5 lg:w-5 lg:h-5" />
                        </Button>
                    </div>

                    {/* Search Results en tiempo real */}
                    {showSearchResults && (
                        <div className="absolute z-50 mt-2 sm:mt-3 w-full max-w-8xl bg-gray-50 border border-gray-300 rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden top-full">
                            {/* Cabecera fija con tabs */}
                            <div className="p-4 lg:p-5 border-b border-gray-300 bg-white">
                                <div className="flex items-center justify-between">
                                    {(hasTracks && hasArtists) && (
                                        <div className="flex border-b border-gray-200 flex-1">
                                            <button
                                                className={`flex-1 py-3 lg:py-4 text-sm lg:text-base font-medium ${activeTab === 'tracks'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                                onClick={() => setActiveTab('tracks')}
                                            >
                                                <span className="truncate hidden sm:inline">Canciones ({searchResults.tracks.length})</span>
                                                <span className="sm:hidden">Can. ({searchResults.tracks.length})</span>
                                            </button>
                                            <button
                                                className={`flex-1 py-3 lg:py-4 text-sm lg:text-base font-medium ${activeTab === 'artists'
                                                    ? 'text-purple-600 border-b-2 border-purple-600 font-semibold'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                                onClick={() => setActiveTab('artists')}
                                            >
                                                <span className="truncate hidden sm:inline">Artistas ({searchResults.artists.length})</span>
                                                <span className="sm:hidden">Art. ({searchResults.artists.length})</span>
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            setShowSearchResults(false);
                                            setSearchQuery('');
                                            setSearchResults({ tracks: [], artists: [] });
                                        }}
                                        className="text-slate-600 hover:text-slate-800 transition-colors text-sm lg:text-base flex items-center gap-2 hover:bg-gray-200 rounded-lg px-3 py-2 ml-2 shrink-0"
                                    >
                                        <X className="w-4 h-4 lg:w-4 lg:h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Contenedor con altura máxima y scroll */}
                            <div className="max-h-[70vh] sm:max-h-[60vh] md:max-h-[50vh] lg:max-h-[60vh] overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                {activeTab === 'tracks' && hasTracks ? (
                                    searchResults.tracks.map((track) => (
                                        <div key={track.spotify_id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                            <SearchResult
                                                track={track}
                                                onSelect={handleSearchResultSelect}
                                            />
                                        </div>
                                    ))
                                ) : activeTab === 'artists' && hasArtists ? (
                                    searchResults.artists.map((artist) => (
                                        <div key={artist.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                            <ArtistResult
                                                artist={artist}
                                                onShowTracks={handleArtistSelect}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-sm lg:text-base text-gray-600 bg-white">
                                        {loadingSearch
                                            ? 'Buscando en Spotify...'
                                            : `No se encontraron ${activeTab === 'tracks' ? 'canciones' : 'artistas'} en Spotify`
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Modal de canciones del artista */}
            <ArtistSongs
                spotifyId={artistSongsModal.spotifyId}
                artistName={artistSongsModal.artistName}
                isOpen={artistSongsModal.isOpen}
                onClose={handleCloseArtistSongs}
            />
        </>
    )
}