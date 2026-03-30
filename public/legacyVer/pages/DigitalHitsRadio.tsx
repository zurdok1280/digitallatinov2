import React, { useState, useCallback, useEffect, useRef, useMemo, } from "react";
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, Star, Plus, Minus, Search, Filter, Music, Crown, Play, Pause, Trophy, Zap, ArrowDown, ArrowUp, BarChart3, Globe, ListMusic, MapPin, } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LatinAmericaMap } from "@/components/LatinAmericaMap";
import { SpotifyTrack } from "@/types/spotify";
import { useAuth } from "@/hooks/useAuth";
import {
    digitalLatinoApi,
    Country,
    Format,
    City,
    Song,
    CityDataForSong,
    SelectedSong,
} from "@/lib/api";
// Import album covers
import { Backdrop, CircularProgress, Fab } from "@mui/material";
import teddySwimsCover from "@/assets/covers/teddy-swims-lose-control.jpg";
import badBunnyCover from "@/assets/covers/bad-bunny-monaco.jpg";
import karolGCover from "@/assets/covers/karol-g-si-antes.jpg";
import shaboozeyCover from "@/assets/covers/shaboozey-bar-song.jpg";
import sabrinaCarpenterCover from "@/assets/covers/sabrina-carpenter-espresso.jpg";
import pesoPlumaCover from "@/assets/covers/peso-pluma-la-bebe.jpg";
import taylorSwiftCover from "@/assets/covers/taylor-swift-fortnight.jpg";
import eminemCover from "@/assets/covers/eminem-tobey.jpg";
import chappellRoanCover from "@/assets/covers/chappell-roan-good-luck.jpg";
import billieEilishCover from "@/assets/covers/billie-eilish-birds.jpg";
import { time } from "console";
import { useApiWithLoading } from "@/hooks/useApiWithLoading";
import {
    ButtonInfoSong,
    ExpandRow,
    useExpandableRows,
} from "@/components/ui/buttonInfoSong";
import FloatingScrollButtons from "@/components/FloatingScrollButtons";
import { LoginButton } from "@/components/LoginButton";
import ChartArtistDetails from "@/components/ui/ChartArtistDetails";
import { SongCompare } from "@/components/ui/songCompare";
import { ComparisonMode } from "@/components/ui/ComparisonMode";

// Datos actualizados con artistas reales de 2024
const demoRows = [
    {
        rk: 1,
        artists: "Teddy Swims",
        song: "Lose Control",
        coverUrl: teddySwimsCover,
        artistImageUrl: "",
        score: 98,
        movement: "SAME", // "UP", "DOWN", "SAME", "NEW", "RE-ENTRY"
        campaignDescription:
            "Campaña integral de promoción musical con duración de 30 días que incluye pitch con curadores de playlists verificadas, campañas publicitarias en Facebook, TikTok e Instagram, y análisis detallado de performance para maximizar el alcance de tu canción.",
        spotify_streams_total: 24181969,
        tiktok_views_total: 5648611,
        youtube_video_views_total: 2484375,
        youtube_short_views_total: 617455,
        shazams_total: 27031,
        soundcloud_stream_total: 17153,
        pan_streams: 0,
        audience_total: 37633256,
        spins_total: 6038,
    },
];

// Completar hasta el top 40
const extendedDemoRows = [...demoRows, ...demoRows];

// Agregar más entradas para llegar a 40
for (let i = 16; i <= 40; i++) {
    const covers = [
        teddySwimsCover,
        badBunnyCover,
        karolGCover,
        shaboozeyCover,
        sabrinaCarpenterCover,
        pesoPlumaCover,
        taylorSwiftCover,
        eminemCover,
        chappellRoanCover,
        billieEilishCover,
    ];
    const artists = [
        "Miley Cyrus",
        "Harry Styles",
        "Ariana Grande",
        "The Weeknd",
        "Drake",
        "Post Malone",
        "Rihanna",
        "Ed Sheeran",
        "Bruno Mars",
        "Adele",
    ];
    const tracks = [
        "Flowers",
        "As It Was",
        "positions",
        "Blinding Lights",
        "God's Plan",
        "Circles",
        "Umbrella",
        "Shape of You",
        "Uptown Funk",
        "Hello",
    ];
}

// El array final con 40 entradas
const allDemoRows = extendedDemoRows;

interface PlatformChipProps {
    label: string;
    rank: number;
}

function PlatformChip({ label, rank }: PlatformChipProps) {
    const getLogoEmoji = (platform: string) => {
        const logos = {
            Spotify: "🟢",
            TikTok: "⚫",
            YouTube: "🔴",
            Shazam: "🔵",
            SoundCloud: "🟠",
        };
        return logos[platform as keyof typeof logos] || "🎵";
    };

    return (
        <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/70 backdrop-blur-sm px-3 py-1 shadow-sm">
            <span className="text-sm">{getLogoEmoji(label)}</span>
            <span className="text-xs font-medium text-gray-700">{label}</span>
            <span className="ml-1 text-xs text-gray-400 filter blur-[1px] select-none">
                #{rank}
            </span>
        </div>
    );
}

interface BlurBlockProps {
    title: string;
    children: React.ReactNode;
    onNavigate: (path: string) => void;
}

function BlurBlock({ title, children, onNavigate }: BlurBlockProps) {
    return (
        <div className="rounded-2xl border border-white/20 bg-white/40 backdrop-blur-sm p-4 shadow-md">
            <h4 className="mb-3 text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <span className="text-lg">📊</span> {title}
            </h4>
            <div className="relative overflow-hidden rounded-xl">
                <div className="relative z-0 py-2">
                    {children}
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center p-2 bg-green-100/60 rounded">
                            <span className="text-xs text-gray-700">Artista Similar:</span>
                            <span className="text-xs font-bold text-green-600">
                                +892% streams
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-100/60 rounded">
                            <span className="text-xs text-gray-700">Campaña 30 días:</span>
                            <span className="text-xs font-bold text-blue-600">
                                $2.4M revenue
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-100/60 rounded">
                            <span className="text-xs text-gray-700">Nuevos fans:</span>
                            <span className="text-xs font-bold text-purple-600">145,823</span>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-transparent to-background/5" />
            </div>
        </div>
    );
}

interface MovementIndicatorProps {
    movement: string;
    lastWeek: string | number;
    currentRank: number;
}

function MovementIndicator({
    movement,
    lastWeek,
    currentRank,
}: MovementIndicatorProps) {
    if (movement === "NEW") {
        return (
            <div className="flex items-center justify-center">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                    NEW
                </span>
            </div>
        );
    }

    if (movement === "RE-ENTRY") {
        return (
            <div className="flex items-center justify-center">
                <span className="rounded-full bg-gradient-to-r from-slate-500 to-gray-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                    RE-ENTRY
                </span>
            </div>
        );
    }

    if (movement === "UP") {
        return (
            <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-1">
                    <ChevronUp className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    }

    if (movement === "DOWN") {
        return (
            <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-full p-1">
                    <ChevronDown className="w-4 h-4 text-white" />
                </div>
            </div>
        );
    }

    return <div className="w-4 h-4"></div>; // Same placeholder
}

// Spotify API configuration
const DEFAULT_CLIENT_ID = "5001fe1a36c8442781282c9112d599ca";
const SPOTIFY_CONFIG = {
    client_id: DEFAULT_CLIENT_ID,
    redirect_uri: window.location.origin,
    scope: "user-read-private user-read-email",
};

interface SearchResultProps {
    track: SpotifyTrack;
    onSelect: (track: SpotifyTrack) => void;
}

function SearchResult({ track, onSelect }: SearchResultProps) {
    const handleClick = () => {
        onSelect(track);
    };

    return (
        <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-all border border-white/20 bg-white/40 backdrop-blur-sm">
            <div className="flex items-center gap-4" onClick={handleClick}>
                <div className="relative">
                    <img
                        src={track.album.images[0]?.url}
                        alt={track.album.name}
                        className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <Music className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{track.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">
                        {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                    <p className="text-xs text-slate-500">{track.album.name}</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800"
                >
                    Ver Campaña
                </Button>
            </div>
        </Card>
    );
}

export default function DigitalHitsRadio() {
    const { loading, callApi } = useApiWithLoading();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();
    const { expandedRows, toggleRow, isExpanded } = useExpandableRows();

    // Spotify search state
    const [searchQuery, setSearchQuery] = useState("");
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Countries API state
    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState("2"); // USA ID = 2 por defecto

    // Formats API state
    const [formats, setFormats] = useState<Format[]>([]);
    const [loadingFormats, setLoadingFormats] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState("0"); // General ID = 0 por defecto

    // Cities API state
    const [cities, setCities] = useState<City[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState("0"); // All ID = 0 por defecto

    // Charts API state
    const [songs, setSongs] = useState<Song[]>([]);
    const [loadingSongs, setLoadingSongs] = useState(true);

    // Period API state - CRG siempre será "C" para este reporte
    const CRG = "C";

    const [showGenreOverlay, setShowGenreOverlay] = useState(false);
    const [showCrgOverlay, setShowCrgOverlay] = useState(false);
    const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
    const [chartSearchQuery, setChartSearchQuery] = useState("");
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [mobileView, setMobileView] = useState<'none' | 'search' | 'filter'>('none');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    // Dropdown state keyboard navigation
    const [openDropdown, setOpenDropdown] = useState<
        "country" | "format" | "city" | null
    >(null);
    const [dropdownSearch, setDropdownSearch] = useState("");

    // Almacenar Data de ciudades por pais para el mapa
    const [cityData, setCityData] = useState<CityDataForSong[]>([]);
    const [loadingCityData, setLoadingCityData] = useState(false);

    const [showScoreTooltip, setShowScoreTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    //States para artist details
    const [artistDetailsModal, setArtistDetailsModal] = useState<{
        isOpen: boolean;
        artist: Song | null;
        selectedCountry?: string;
    }>({
        isOpen: false,
        artist: null,
        selectedCountry: selectedCountry
    });

    //States para comparación de canciones
    const [comparisonMode, setComparisonMode] = useState(false);
    const [selectedSongs, setSelectedSongs] = useState<SelectedSong[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [songForComparison, setSongForComparison] = useState<{
        song1: SelectedSong | null;
        song2: SelectedSong | null;
    }>({ song1: null, song2: null });

    //Desplegar Filtros
    const [showFilters, setShowFilters] = useState(false);
    const [cityDropdownPosition, setCityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const cityButtonRef = useRef<HTMLDivElement>(null);
    const [countryDropdownPosition, setCountryDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const countryButtonRef = useRef<HTMLDivElement>(null);
    const [formatDropdownPosition, setFormatDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const formatButtonRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Función para manejar el click en el nombre de la canción/artista
    const handleArtistDetailsClick = (row: Song, selectedCountry: string) => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        if (user?.role === 'ARTIST') {
            const normalize = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const myArtistName = normalize(user.allowedArtistName || "");
            const songArtistName = normalize(row.artists || "");

            if (!songArtistName.includes(myArtistName)) {
                toast({
                    title: "🔒 Acceso Restringido",
                    description: "Este artista no pertenece a tu catálogo.",
                    variant: "destructive",
                });
                return;
            }
        }

        setArtistDetailsModal({
            isOpen: true,
            artist: row,
            selectedCountry: selectedCountry
        });
    };

    const handleCloseArtistDetails = () => {
        setArtistDetailsModal({
            isOpen: false,
            artist: null
        });
    };

    const handleScoreInfoHover = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.right + 8,
            y: rect.top + (rect.height / 2),
        });
        setShowScoreTooltip(true);
    };

    const handleScoreInfoLeave = () => {
        setShowScoreTooltip(false);
    };

    const filteredSongs = useMemo(() => {
        const normalizeText = (text: string) => {
            return text
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();
        };

        if (!chartSearchQuery.trim()) {
            return songs;
        }

        const query = normalizeText(chartSearchQuery);
        return songs.filter((song) => {
            const songName = normalizeText(song.song || "");
            const labelName = normalizeText(song.label || "");
            const artistName = normalizeText(song.artists || "");

            return songName.includes(query) || labelName.includes(query) || artistName.includes(query);
        });
    }, [songs, chartSearchQuery]);

    const songsToDisplay = useMemo(() => {
        if (user) {
            return filteredSongs;
        }
        return filteredSongs.slice(0, 20);
    }, [filteredSongs, user]);

    const toggleSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        if (showSearchBar) {
            setChartSearchQuery("");
        }
    };

    useEffect(() => {
        if (showSearchBar) {
            const searchInput = document.querySelector(
                'input[placeholder="Buscar artista o canción en los charts..."]'
            ) as HTMLInputElement;
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        }
    }, [showSearchBar]);

    const getFilteredOptions = (
        options: any[],
        searchQuery: string,
        type: "country" | "format" | "city"
    ) => {
        if (!searchQuery.trim()) return options;

        const query = searchQuery.toLowerCase().trim();
        return options.filter((option) => {
            if (type === "country") {
                return (
                    option.country_name?.toLowerCase().includes(query) ||
                    option.country?.toLowerCase().includes(query) ||
                    option.description?.toLowerCase().includes(query)
                );
            } else if (type === "format") {
                return option.format?.toLowerCase().includes(query);
            } else if (type === "city") {
                return option.city_name?.toLowerCase().includes(query);
            }
            return false;
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (openDropdown === "country") {
                const countryPortal = document.querySelector('[data-country-portal="true"]');
                if (countryButtonRef.current && !countryButtonRef.current.contains(target) &&
                    countryPortal && !countryPortal.contains(target)) {
                    setOpenDropdown(null);
                    setDropdownSearch("");
                }
            }

            if (openDropdown === "format") {
                const formatPortal = document.querySelector('[data-format-portal="true"]');
                if (formatButtonRef.current && !formatButtonRef.current.contains(target) &&
                    formatPortal && !formatPortal.contains(target)) {
                    setOpenDropdown(null);
                    setDropdownSearch("");
                }
            }

            if (openDropdown === "city") {
                const cityPortal = document.querySelector('[data-city-portal="true"]');
                if (cityButtonRef.current && !cityButtonRef.current.contains(target) &&
                    cityPortal && !cityPortal.contains(target)) {
                    setOpenDropdown(null);
                    setDropdownSearch("");
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    const handleOptionSelect = (
        value: string,
        type: "country" | "format" | "city"
    ) => {
        if (type === "country") {
            setSelectedCountry(value);
        } else if (type === "format") {
            setSelectedFormat(value);
        } else if (type === "city") {
            setSelectedCity(value);
        }
        setOpenDropdown(null);
        setDropdownSearch("");

        if (window.innerWidth < 768) {
            setShowMobileFilter(false);
        }
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpenDropdown(null);
                setDropdownSearch("");
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

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

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        const savedToken = window.localStorage.getItem("spotify_access_token");
        const tokenExpiry = window.localStorage.getItem("spotify_token_expiry");

        if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            setAccessToken(savedToken);
            setIsConnected(true);
        }
    }, []);

    const fetchLastUpdate = async () => {
        try {
            const response = await digitalLatinoApi.getLastUpdate();
            setLastUpdate(response.data.message);
            console.log("LastUpdate:", response.data);
        } catch (error) {
            console.error("Error fetching last update:", error);
        }
    };

    const fetchCountries = async () => {
        try {
            setLoadingCountries(true);
            const response = await digitalLatinoApi.getCountries();
            setCountries(response.data);
        } catch (error) {
            console.error("Error fetching countries:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los países. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setLoadingCountries(false);
        }
    };

    const fetchSongs = useCallback(async () => {
        try {
            setLoadingSongs(true);

            if (!selectedCountry || selectedCountry === "") {
                setSongs([]);
                return;
            }

            const formatId = selectedFormat ? parseInt(selectedFormat) : 0;
            const countryId = selectedCountry ? parseInt(selectedCountry) : 2;
            const cityId = selectedCity ? parseInt(selectedCity) : 0;

            if (isNaN(countryId)) {
                console.error("Invalid country ID:", selectedCountry);
                return;
            }

            const response = await digitalLatinoApi.getChartDigitalHitsRadio(
                formatId,
                countryId,
                CRG,
                cityId,
            );
            setSongs(response.data);
        } catch (error) {
            console.error("Error fetching songs:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las canciones. Intenta de nuevo.",
                variant: "destructive",
            });
            setSongs([]);
        } finally {
            setLoadingSongs(false);
        }
    }, [selectedCountry, selectedFormat, selectedCity, toast]);

    const fetchCityData = async (csSong: string, countryId: string) => {
        if (!csSong || !countryId) {
            setCityData([]);
            return;
        }

        try {
            setLoadingCityData(true);
            console.log("Fetching city data for:", { csSong, countryId });

            const response = await digitalLatinoApi.getCityData(
                parseInt(csSong),
                parseInt(countryId)
            );

            console.log("City data response:", response.data);
            setCityData(response.data);
        } catch (error) {
            console.error("Error fetching city data:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos de ciudades",
                variant: "destructive",
            });
            setCityData([]);
        } finally {
            setLoadingCityData(false);
        }
    };

    const handleToggleRow = (index: number, row: Song) => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        toggleRow(index);

        if (!isExpanded(index)) {
            fetchCityData(row.cs_song.toString(), selectedCountry);
        }
    };

    useEffect(() => {
        fetchCountries();
        fetchLastUpdate();
    }, []);

    // Fetch formats when country changes
    useEffect(() => {
        const fetchFormats = async () => {
            if (!selectedFormat) {
                setFormats([]);
                return;
            }

            try {
                setLoadingFormats(true);
                const response = await digitalLatinoApi.getFormatsByCountry(
                    parseInt(selectedCountry)
                );
                setFormats(response.data);

                const generalFormat = response.data.find(
                    (format) => format.format.toLowerCase() === "general"
                );
                if (generalFormat) {
                    setSelectedFormat(generalFormat.id.toString());
                } else if (response.data.length > 0) {
                    setSelectedFormat(response.data[0].id.toString());
                }
            } catch (error) {
                console.error("Error fetching formats:", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los géneros. Intenta de nuevo.",
                    variant: "destructive",
                });
                setFormats([]);
            } finally {
                setLoadingFormats(false);
            }
        };

        fetchFormats();
    }, [selectedCountry, toast]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedCountry) {
                setCities([]);
                setSelectedCity("0");
                return;
            }

            try {
                setLoadingCities(true);
                const response = await digitalLatinoApi.getCitiesByCountry(
                    parseInt(selectedCountry)
                );
                setCities(response.data);
                setSelectedCity("0");
            } catch (error) {
                console.error("Error fetching cities:", error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar las ciudades. Intenta de nuevo.",
                    variant: "destructive",
                });
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };

        fetchCities();
    }, [selectedCountry, toast]);

    useEffect(() => {
        if (selectedCountry && selectedCountry !== "") {
            const timer = setTimeout(() => {
                fetchSongs();
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [selectedCountry, selectedFormat, selectedCity, fetchSongs]);

    useEffect(() => {
        const handleSpotifyCallback = () => {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const token = params.get("access_token");
            const expiresIn = params.get("expires_in");
            const state = params.get("state");
            const storedState = window.localStorage.getItem("spotify_auth_state");

            if (token && state === storedState) {
                const expiryTime = Date.now() + parseInt(expiresIn || "3600") * 1000;

                window.localStorage.setItem("spotify_access_token", token);
                window.localStorage.setItem(
                    "spotify_token_expiry",
                    expiryTime.toString()
                );
                window.localStorage.removeItem("spotify_auth_state");

                setAccessToken(token);
                setIsConnected(true);
                console.log("Spotify connected, token saved.", token);
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname
                );

                toast({
                    title: "Conectado exitosamente",
                    description: "Ya puedes buscar artistas en Spotify.",
                });
            }
        };

        handleSpotifyCallback();
    }, [toast]);

    const connectToSpotify = () => {
        console.log("connectToSpotify called");
        const state = Math.random().toString(36).substring(2, 15);
        window.localStorage.setItem("spotify_auth_state", state);

        const authUrl = new URL("https://accounts.spotify.com/authorize");
        authUrl.searchParams.append("client_id", DEFAULT_CLIENT_ID);
        authUrl.searchParams.append("response_type", "token");
        authUrl.searchParams.append("redirect_uri", window.location.origin);
        authUrl.searchParams.append("scope", SPOTIFY_CONFIG.scope);
        authUrl.searchParams.append("state", state);

        console.log("Redirecting to Spotify auth:", authUrl.toString());
        window.location.href = authUrl.toString();
    };

    const handlePromote = (
        artist: string,
        track: string,
        spotifyId: string,
        coverUrl?: string,
        artistImageUrl?: string
    ) => {
        const params = new URLSearchParams({
            artist,
            track,
            spotifyId: spotifyId,
            ...(coverUrl && { coverUrl }),
            ...(artistImageUrl && { artistImageUrl }),
        });

        navigate(`/campaign?${params.toString()}`);
    };

    const handleToggleComparisonMode = () => {
        setComparisonMode(!comparisonMode);
        if (!comparisonMode) {
            setSelectedSongs([]);
        }
    };

    const handleSelectSong = (song: Song) => {
        if (!comparisonMode) return;

        const selectedSong: SelectedSong = {
            cs_song: song.cs_song,
            spotifyid: song.spotifyid,
            song: song.song,
            artists: song.artists,
            label: song.label,
            avatar: song.avatar,
            rk: song.rk,
            score: song.score,
        };

        const isAlreadySelected = selectedSongs.some(s => s.cs_song === song.cs_song);

        if (isAlreadySelected) {
            setSelectedSongs(prev => prev.filter(s => s.cs_song !== song.cs_song));
        } else if (selectedSongs.length < 2) {
            setSelectedSongs(prev => [...prev, selectedSong]);
        } else {
            toast({
                title: 'Límite alcanzado',
                description: 'Solo puedes comparar 2 canciones a la vez. Remueve una selección para agregar otra.',
                variant: 'destructive',
            });
        }
    };

    const handleClearSelection = () => {
        setSelectedSongs([]);
    };

    const handleCompareSelected = () => {
        if (selectedSongs.length === 2) {
            setSongForComparison({
                song1: selectedSongs[0],
                song2: selectedSongs[1],
            });
            setShowComparison(true);
            setComparisonMode(false);
            setSelectedSongs([]);
        }
    };

    const handlePlayPreview = useCallback(
        (trackRank: number, audioUrl: string) => {
            console.log("handlePlayPreview called for:", trackRank, audioUrl);

            if (currentlyPlaying === trackRank) {
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

            audio
                .play()
                .then(() => {
                    setCurrentlyPlaying(trackRank);
                })
                .catch((err) => {
                    console.error("Error al reproducir el audio:", err);
                    setCurrentlyPlaying(null);
                    audioRef.current = null;
                });
        },
        [currentlyPlaying]
    );

    const handleRestrictedToggle = (index: number, row: Song) => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }
        if (user?.role === 'ARTIST') {
            const normalize = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const myArtistName = normalize(user.allowedArtistName || "");
            const songArtistName = normalize(row.artists || "");

            if (!songArtistName.includes(myArtistName)) {
                toast({
                    title: "🔒 Acceso Restringido",
                    description: "Esta canción no pertenece a tu catálogo de artista.",
                    variant: "destructive",
                });
                return;
            }
        }
        handleToggleRow(index, row);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
            <FloatingScrollButtons
                rightOffset={24}
                topOffset={100}
                bottomOffset={100}
                showTopThreshold={300}
                hideBottomThreshold={100}
                className="your-custom-classes"
            />
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-300/15 to-gray-400/15 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-slate-400/15 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-gray-300/10 to-blue-300/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-2">
                <div className="">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-2 bg-gradient-to-r from-slate-400 to-blue-500 rounded-2xl opacity-15 blur-lg"></div>
                            </div>
                        </div>
                    </div>

                    {user?.role === 'ARTIST' && (
                        <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-3 mb-3 shadow-sm flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                    <Crown className="w-6 h-6 text-purple-600" />
                                    Panel de Artista
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Métricas exclusivas para tu artista seleccionado.
                                </p>
                            </div>

                            {user.name && (
                                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="font-semibold text-gray-700">{user.allowedArtistName}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filtros */}
                    <div className="mb-4 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 overflow-hidden">
                        {/* Versión móvil con filtro oculto */}
                        <div className="block md:hidden">
                            {showMobileFilter && (
                                <div className="animate-in slide-in-from-top duration-300">
                                    <div className="p-4 border-t border-white/30">
                                        <div className="grid grid-cols-1 gap-3">
                                            {/* Filtro por País/Región */}
                                            <div className="space-y-1 sm:space-y-2">
                                                <label className="text-xs font-bold text-pink-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                                                    {/*
                                                    <span className="text-sm sm:text-base">🌎</span>
                                                    */}
                                                    <Globe size={16} />
                                                    <span className="truncate">País/Región</span>
                                                </label>
                                                <div className="relative" ref={countryButtonRef}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (loadingCountries) return;
                                                            setOpenDropdown(openDropdown === "country" ? null : "country");
                                                            setDropdownSearch("");

                                                            if (countryButtonRef.current) {
                                                                const rect = countryButtonRef.current.getBoundingClientRect();
                                                                setCountryDropdownPosition({
                                                                    top: rect.bottom + window.scrollY,
                                                                    left: rect.left + window.scrollX,
                                                                    width: rect.width,
                                                                });
                                                            }
                                                        }}
                                                        className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-pink-400 flex items-center justify-between transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={loadingCountries}
                                                    >
                                                        <span className="truncate pr-2">
                                                            {loadingCountries ? (
                                                                "Cargando países..."
                                                            ) : selectedCountry && countries.find(c => c.id.toString() === selectedCountry) ? (
                                                                countries.find(c => c.id.toString() === selectedCountry)?.country_name
                                                            ) : (
                                                                "Selecciona un país"
                                                            )}
                                                        </span>
                                                        <ChevronDown
                                                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openDropdown === "country" ? "rotate-180" : ""}`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* DROPDOWN PAÍS */}
                                            {openDropdown === "country" && !loadingCountries && createPortal(
                                                <div
                                                    data-country-portal="true"
                                                    className="fixed z-[999999] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                                                    style={{
                                                        top: countryDropdownPosition.top,
                                                        left: countryDropdownPosition.left,
                                                        width: countryDropdownPosition.width,
                                                        maxHeight: '300px',
                                                    }}
                                                >
                                                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/95">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Buscar país..."
                                                                className="w-full pl-7 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-white/80 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                                                value={dropdownSearch}
                                                                onChange={(e) => setDropdownSearch(e.target.value)}
                                                                autoFocus
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="max-h-60 overflow-y-auto">
                                                        {getFilteredOptions(countries, dropdownSearch, "country").map((country) => (
                                                            <button
                                                                key={country.id}
                                                                onClick={() => {
                                                                    handleOptionSelect(country.id.toString(), "country");
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-pink-50 transition-colors ${selectedCountry === country.id.toString()
                                                                    ? "bg-pink-100 text-pink-700 font-semibold"
                                                                    : "text-gray-700"
                                                                    }`}
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <span>🌍</span>
                                                                    <span className="truncate">
                                                                        {country.country_name || country.country || country.description}
                                                                    </span>
                                                                </span>
                                                            </button>
                                                        ))}

                                                        {getFilteredOptions(countries, dropdownSearch, "country").length === 0 && (
                                                            <div className="px-3 py-4 text-xs sm:text-sm text-gray-500 text-center">
                                                                No se encontraron países
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>,
                                                document.body
                                            )}

                                            {/* Filtro por Género */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                                                    {/*
                                                    <span className="text-sm">📊</span>
                                                    */}
                                                    <ListMusic size={16} />
                                                    <span className="truncate">Género</span>
                                                </label>
                                                <select
                                                    className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 text-xs font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-pink-400 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    value={selectedFormat}
                                                    onChange={(e) => {
                                                        if (!user) {
                                                            setShowLoginDialog(true);
                                                            return;
                                                        }
                                                        setSelectedFormat(e.target.value);
                                                    }}
                                                    disabled={loadingFormats || !selectedCountry}
                                                    onClick={(e) => {
                                                        if (!user) {
                                                            e.preventDefault();
                                                            setShowLoginDialog(true);
                                                        }
                                                    }}
                                                >
                                                    {loadingFormats ? (
                                                        <option value="">Cargando géneros...</option>
                                                    ) : !selectedCountry ? (
                                                        <option value="">Selecciona un país primero</option>
                                                    ) : (
                                                        <>
                                                            {formats.map((format) => (
                                                                <option key={format.id} value={format.id.toString()}>
                                                                    {format.format}
                                                                </option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            {/* Filtro por Ciudad */}
                                            <div className="space-y-1 sm:space-y-2 relative">
                                                <label className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                                                    {/*
                                                    <span className="text-sm">🏙️</span>
                                                    */}
                                                    <MapPin size={16} />
                                                    <span className="truncate">Ciudad Target</span>
                                                </label>
                                                <div className="relative" ref={cityButtonRef}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!user) {
                                                                setShowLoginDialog(true);
                                                                return;
                                                            }
                                                            if (loadingCities || !selectedCountry || cities.length === 0) return;
                                                            setOpenDropdown(openDropdown === "city" ? null : "city");
                                                            setDropdownSearch("");
                                                            if (cityButtonRef.current) {
                                                                const rect = cityButtonRef.current.getBoundingClientRect();
                                                                setCityDropdownPosition({
                                                                    top: rect.bottom + window.scrollY,
                                                                    left: rect.left + window.scrollX,
                                                                    width: rect.width,
                                                                });
                                                            }
                                                        }}
                                                        className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-orange-400 flex items-center justify-between transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={loadingCities || !selectedCountry || cities.length === 0}
                                                    >
                                                        <span className="truncate pr-2">
                                                            {loadingCities
                                                                ? "Cargando..."
                                                                : !selectedCountry
                                                                    ? "Selecciona país primero"
                                                                    : selectedCity !== "0" && cities.length > 0
                                                                        ? cities.find((c) => c.id.toString() === selectedCity)
                                                                            ?.city_name || "Todas las ciudades"
                                                                        : "Todas las ciudades"}
                                                        </span>
                                                        <ChevronDown
                                                            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openDropdown === "city" ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Dropdown de ciudades */}
                                            {openDropdown === "city" && cities.length > 0 && createPortal(
                                                <div
                                                    data-city-portal="true"
                                                    className="fixed z-[999999] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                                                    style={{
                                                        top: cityDropdownPosition.top,
                                                        left: cityDropdownPosition.left,
                                                        width: cityDropdownPosition.width,
                                                        maxHeight: '240px',
                                                    }}
                                                >
                                                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/95">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Buscar ciudad..."
                                                                className="w-full pl-7 pr-3 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                                value={dropdownSearch}
                                                                onChange={(e) => setDropdownSearch(e.target.value)}
                                                                autoFocus
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="max-h-48 overflow-y-auto">
                                                        <button
                                                            onClick={() => {
                                                                handleOptionSelect("0", "city");
                                                                setOpenDropdown(null);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-orange-50 transition-colors ${selectedCity === "0"
                                                                ? "bg-orange-100 text-orange-700 font-semibold"
                                                                : "text-gray-700"
                                                                }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span>🌍</span>
                                                                <span className="truncate">Todas las ciudades</span>
                                                            </span>
                                                        </button>

                                                        {getFilteredOptions(cities, dropdownSearch, "city").map((city) => (
                                                            <button
                                                                key={city.id}
                                                                onClick={() => {
                                                                    handleOptionSelect(city.id.toString(), "city");
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className={`w-full px-3 py-2 text-left text-xs hover:bg-orange-50 transition-colors ${selectedCity === city.id.toString()
                                                                    ? "bg-orange-100 text-orange-700 font-semibold"
                                                                    : "text-gray-700"
                                                                    }`}
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <span>🏙️</span>
                                                                    <span className="truncate">{city.city_name}</span>
                                                                </span>
                                                            </button>
                                                        ))}

                                                        {getFilteredOptions(cities, dropdownSearch, "city").length === 0 && (
                                                            <div className="px-3 py-4 text-xs text-gray-500 text-center">
                                                                No se encontraron ciudades
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>,
                                                document.body
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowMobileFilter(false)}
                                                className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
                                            >
                                                Cerrar filtros
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Versión desktop */}
                        <div className="hidden md:block">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-pink-50/50 hover:from-purple-100/50 hover:to-pink-100/50 transition-all duration-300"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-gray-800 text-sm sm:text-base">
                                        Filtros
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>
                            </button>

                            <div
                                className={`
                                    transition-all duration-300 ease-in-out overflow-hidden
                                    ${showFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                                `}
                            >
                                <div className="p-4 border-t border-white/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        {/* Filtro por País/Región */}
                                        <div className="space-y-1 sm:space-y-2">
                                            <label className="text-xs font-bold text-pink-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                                                {/*
                                                <span className="text-sm sm:text-base">🌎</span>
                                                */}
                                                <Globe />
                                                <span className="truncate">País/Región</span>
                                            </label>
                                            <div className="relative" ref={countryButtonRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (loadingCountries) return;
                                                        setOpenDropdown(openDropdown === "country" ? null : "country");
                                                        setDropdownSearch("");

                                                        setTimeout(() => {
                                                            if (countryButtonRef.current) {
                                                                const rect = countryButtonRef.current.getBoundingClientRect();
                                                                setCountryDropdownPosition({
                                                                    top: rect.bottom + window.scrollY,
                                                                    left: rect.left + window.scrollX,
                                                                    width: rect.width,
                                                                });
                                                            }
                                                        }, 10);
                                                    }}
                                                    className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-pink-400 flex items-center justify-between transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={loadingCountries}
                                                >
                                                    <span className="truncate pr-2">
                                                        {loadingCountries ? (
                                                            "Cargando países..."
                                                        ) : selectedCountry && countries.find(c => c.id.toString() === selectedCountry) ? (
                                                            countries.find(c => c.id.toString() === selectedCountry)?.country_name ||
                                                            countries.find(c => c.id.toString() === selectedCountry)?.country ||
                                                            countries.find(c => c.id.toString() === selectedCountry)?.description
                                                        ) : (
                                                            "Selecciona un país"
                                                        )}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openDropdown === "country" ? "rotate-180" : ""}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>



                                        {/* Filtro por Género */}
                                        <div className="space-y-1 sm:space-y-2">
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                                                {/*
                                                <span className="text-sm sm:text-base">📊</span>
                                                */}
                                                <ListMusic />
                                                <span className="truncate">Género</span>
                                            </label>
                                            <select
                                                className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-pink-400 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                value={selectedFormat}
                                                onChange={(e) => {
                                                    if (!user) {
                                                        setShowLoginDialog(true);
                                                        return;
                                                    }
                                                    setSelectedFormat(e.target.value);
                                                }}
                                                onClick={(e) => {
                                                    if (!user) {
                                                        e.preventDefault();
                                                        setShowLoginDialog(true);
                                                    }
                                                }}
                                                disabled={loadingFormats || !selectedCountry}
                                            >
                                                {loadingFormats ? (
                                                    <option value="">Cargando géneros...</option>
                                                ) : !selectedCountry ? (
                                                    <option value="">Selecciona un país primero</option>
                                                ) : (
                                                    <>
                                                        {formats.map((format) => (
                                                            <option key={format.id} value={format.id.toString()}>
                                                                {format.format}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        {/* Filtro por Ciudad */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center gap-1">
                                                {/*
                                                <span className="text-sm sm:text-base">🏙️</span>
                                                */}
                                                <MapPin />
                                                <span className="truncate">Ciudad Target</span>
                                            </label>
                                            <div className="relative" ref={cityButtonRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!user) {
                                                            setShowLoginDialog(true);
                                                            return;
                                                        }
                                                        if (loadingCities || !selectedCountry || cities.length === 0) return;
                                                        setOpenDropdown(openDropdown === "city" ? null : "city");
                                                        setDropdownSearch("");
                                                        if (cityButtonRef.current) {
                                                            const rect = cityButtonRef.current.getBoundingClientRect();
                                                            setCityDropdownPosition({
                                                                top: rect.bottom + window.scrollY,
                                                                left: rect.left + window.scrollX,
                                                                width: rect.width,
                                                            });
                                                        }
                                                    }}
                                                    className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-3 py-2.5 text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-orange-400 flex items-center justify-between transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={loadingCities || !selectedCountry || cities.length === 0}
                                                >
                                                    <span className="truncate pr-2">
                                                        {loadingCities
                                                            ? "Cargando..."
                                                            : !selectedCountry
                                                                ? "Selecciona país primero"
                                                                : selectedCity !== "0" && cities.length > 0
                                                                    ? cities.find((c) => c.id.toString() === selectedCity)
                                                                        ?.city_name || "Todas las ciudades"
                                                                    : "Todas las ciudades"}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-4 h-4 transition-transform flex-shrink-0 ${openDropdown === "city" ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dropdown de ciudades */}
                                        {openDropdown === "city" && cities.length > 0 && createPortal(
                                            <div
                                                data-city-portal="true"
                                                className="fixed z-[999999] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                                                style={{
                                                    top: cityDropdownPosition.top,
                                                    left: cityDropdownPosition.left,
                                                    width: cityDropdownPosition.width,
                                                    maxHeight: '240px',
                                                }}
                                            >
                                                <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/95">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Buscar ciudad..."
                                                            className="w-full pl-7 pr-3 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                            value={dropdownSearch}
                                                            onChange={(e) => setDropdownSearch(e.target.value)}
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-48 overflow-y-auto">
                                                    <button
                                                        onClick={() => {
                                                            handleOptionSelect("0", "city");
                                                            setOpenDropdown(null);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left text-xs hover:bg-orange-50 transition-colors ${selectedCity === "0"
                                                            ? "bg-orange-100 text-orange-700 font-semibold"
                                                            : "text-gray-700"
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span>🌍</span>
                                                            <span className="truncate">Todas las ciudades</span>
                                                        </span>
                                                    </button>

                                                    {getFilteredOptions(cities, dropdownSearch, "city").map((city) => (
                                                        <button
                                                            key={city.id}
                                                            onClick={() => {
                                                                handleOptionSelect(city.id.toString(), "city");
                                                                setOpenDropdown(null);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-xs hover:bg-orange-50 transition-colors ${selectedCity === city.id.toString()
                                                                ? "bg-orange-100 text-orange-700 font-semibold"
                                                                : "text-gray-700"
                                                                }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span>🏙️</span>
                                                                <span className="truncate">{city.city_name}</span>
                                                            </span>
                                                        </button>
                                                    ))}

                                                    {getFilteredOptions(cities, dropdownSearch, "city").length === 0 && (
                                                        <div className="px-3 py-4 text-xs text-gray-500 text-center">
                                                            No se encontraron ciudades
                                                        </div>
                                                    )}
                                                </div>
                                            </div>,
                                            document.body
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Charts */}
                <div className="mb-4 flex flex-col gap-0 border-b border-white/20 pb-2 bg-white/60 backdrop-blur-lg rounded-2xl p-2 md:p-3 shadow-lg relative">
                    <ComparisonMode
                        isActive={comparisonMode}
                        onToggle={handleToggleComparisonMode}
                        selectedCount={selectedSongs.length}
                        onCompare={handleCompareSelected}
                        onClear={handleClearSelection}
                    />
                    <div className="text-xs text-muted-foreground items-end justify-end flex pr-7 pb-2">
                        {`Última actualización: ${lastUpdate ? lastUpdate : "Cargando..."}`}
                    </div>

                    <div className="absolute -top-4 -right-4 z-20">
                        <Fab
                            size="medium"
                            color="primary"
                            aria-label="search"
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    if (!showSearchBar && !showMobileFilter) {
                                        setShowSearchBar(true);
                                        setShowMobileFilter(false);
                                        setMobileView('search');
                                    } else if (showSearchBar && !showMobileFilter) {
                                        setShowSearchBar(false);
                                        setShowMobileFilter(true);
                                        setMobileView('filter');
                                    } else if (!showSearchBar && showMobileFilter) {
                                        setShowSearchBar(false);
                                        setShowMobileFilter(false);
                                        setMobileView('none');
                                    }
                                } else {
                                    toggleSearchBar();
                                }
                            }}
                            sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                                    transform: "scale(1.05)",
                                },
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                            }}
                        >
                            {window.innerWidth < 768 ? (
                                !showSearchBar && !showMobileFilter ? (
                                    <Search className="w-6 h-6 text-white" />
                                ) : showSearchBar ? (
                                    <Filter className="w-6 h-6 text-white" />
                                ) : showMobileFilter ? (
                                    <Minus className="w-6 h-6 text-white" />
                                ) : (
                                    <Search className="w-6 h-6 text-white" />
                                )
                            ) : (
                                showSearchBar ? (
                                    <Minus className="w-6 h-6 text-white" />
                                ) : (
                                    <Search className="w-6 h-6 text-white" />
                                )
                            )}
                        </Fab>
                    </div>

                    <div className="space-y-0">
                        {showSearchBar && (
                            <div className="mb-6 animate-in fade-in duration-300">
                                <div className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <Search className="w-5 h-5 text-blue-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar artista o canción en los charts..."
                                            className="flex-1 bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-sm font-medium text-slate-800"
                                            value={chartSearchQuery}
                                            onChange={(e) => setChartSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        {chartSearchQuery && (
                                            <button
                                                onClick={() => setChartSearchQuery("")}
                                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                                aria-label="Limpiar búsqueda"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {chartSearchQuery && (
                                        <div className="mt-2 text-xs text-slate-600 flex justify-between items-center px-1">
                                            <span className="font-medium">
                                                {songsToDisplay.length} de {songs.length} canciones
                                                encontradas
                                            </span>
                                            {songsToDisplay.length === 0 && (
                                                <span className="text-orange-600 font-medium">
                                                    No hay resultados
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {loadingSongs ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center gap-2 text-slate-600">
                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    Cargando canciones...
                                </div>
                            </div>
                        ) : songsToDisplay.length === 0 && chartSearchQuery ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                    No se encontraron resultados
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    No hay canciones que coincidan con "
                                    <strong>{chartSearchQuery}</strong>"
                                </p>
                                <button
                                    onClick={() => setChartSearchQuery("")}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Ver todas las canciones
                                </button>
                            </div>
                        ) : (
                            songsToDisplay.map((row, index) => (
                                <div
                                    key={`${row.cs_song}-${index}`}
                                    className={`group bg-white/50 backdrop-blur-lg rounded-xl shadow-sm border border-white/30 overflow-hidden hover:shadow-md hover:bg-white/60 transition-all duration-200 hover:scale-[1.002] ${selectedSongs.some(s => s.cs_song === row.cs_song)
                                        ? 'ring-2 ring-purple-500 ring-opacity-50'
                                        : ''
                                        }`}
                                >
                                    <div className="grid grid-cols-9 items-center gap-1 sm:gap-2 pl-2 sm:pl-3 pr-2 sm:pr-3 py-1.5">
                                        <div className="col-span-1 flex items-center justify-start gap-1 min-w-0">
                                            {comparisonMode && (
                                                <button
                                                    onClick={() => handleSelectSong(row)}
                                                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${selectedSongs.some(s => s.cs_song === row.cs_song)
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white'
                                                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                                                        }`}
                                                >
                                                    {selectedSongs.some(s => s.cs_song === row.cs_song) && (
                                                        <span className="text-xs font-bold">✓</span>
                                                    )}
                                                </button>
                                            )}
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <div className="relative group/rank">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 to-gray-300/40 rounded-lg blur-sm group-hover/rank:blur-md transition-all"></div>
                                                    <div className="relative bg-white/95 backdrop-blur-sm border border-white/70 rounded-lg w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center shadow-sm transition-all">
                                                        <span className="text-xs sm:text-base font-bold bg-gradient-to-br from-slate-700 to-gray-800 bg-clip-text text-transparent">
                                                            {row.rk}
                                                        </span>
                                                    </div>
                                                </div>

                                                {row.movement && (
                                                    <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md transition-colors
                                                        ${row.movement === "up"
                                                            ? "bg-green-100/70 hover:bg-green-200/70"
                                                            : row.movement === "down"
                                                                ? "bg-red-100/70 hover:bg-red-200/70"
                                                                : "bg-gray-100/70 hover:bg-gray-200/70"}
                                                    `}>
                                                        {row.movement === "up" && (
                                                            <ArrowUp
                                                                size={12}
                                                                className="sm:w-3.5 sm:h-3.5 text-green-600"
                                                            />
                                                        )}
                                                        {row.movement === "down" && (
                                                            <ArrowDown
                                                                size={12}
                                                                className="sm:w-3.5 sm:h-3.5 text-red-600"
                                                            />
                                                        )}
                                                        {row.movement === "equal" && (
                                                            <Minus
                                                                size={12}
                                                                className="sm:w-3.5 sm:h-3.5 text-gray-500"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-6 flex items-center gap-2 sm:gap-3">
                                            <div className="relative group-hover:scale-105 transition-transform">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400/30 to-blue-400/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></div>
                                                <div className="relative">
                                                    <Avatar className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-lg shadow-sm transition-shadow">
                                                        <AvatarImage
                                                            src={row.spotifyid}
                                                            alt={row.song}
                                                            className="rounded-lg object-cover"
                                                        />
                                                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold text-xs sm:text-sm">
                                                            {row.artists
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePlayPreview(
                                                                    row.rk,
                                                                    `https://audios.monitorlatino.com/Iam/${row.entid}.mp3`
                                                                );
                                                            }}
                                                            className="w-6 h-6 sm:w-8 sm:h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-lg"
                                                            aria-label={`Reproducir preview de ${row.song}`}
                                                        >
                                                            {currentlyPlaying === row.rk ? (
                                                                <Pause className="w-2 h-2 sm:w-3 sm:h-3" />
                                                            ) : (
                                                                <Play className="w-2 h-2 sm:w-3 sm:h-3 ml-0.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors leading-tight">
                                                    {row.song}
                                                </h3>
                                                <p
                                                    className="text-[10px] sm:text-xs font-medium text-gray-600 truncate cursor-pointer hover:text-purple-600 transition-colors"
                                                    onClick={() => handleArtistDetailsClick(row, selectedCountry)}
                                                    title={`Ver detalles de ${row.artists}`}
                                                >
                                                    {row.artists}
                                                </p>
                                                <p className="hidden sm:block col-span-1 truncate text-xs text-gray-400">
                                                    {row.label}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <div className="relative bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg p-1 sm:p-1.5 shadow-sm group-hover:shadow-md group-hover:bg-white/90 transition-all">
                                                <div className="flex flex-col sm:block">
                                                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                                            <span className="text-[8px] sm:text-[9px] font-semibold text-slate-600 uppercase tracking-wide">
                                                                Score
                                                            </span>
                                                            <div className="relative group/info">
                                                                <button
                                                                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-200 hover:bg-purple-500 flex items-center justify-center transition-all duration-200 text-[6px] sm:text-[8px] font-bold text-gray-400 hover:text-white hover:scale-110"
                                                                    aria-label="Información sobre el Score Digital"
                                                                    onMouseEnter={handleScoreInfoHover}
                                                                    onMouseLeave={handleScoreInfoLeave}
                                                                >
                                                                    ?
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm sm:text-lg font-bold bg-gradient-to-br from-slate-800 to-gray-900 bg-clip-text text-transparent">
                                                            {row.score}
                                                        </div>
                                                        <ButtonInfoSong
                                                            index={index}
                                                            row={row}
                                                            isExpanded={isExpanded(index)}
                                                            onToggle={() => handleRestrictedToggle(index, row)}
                                                            selectedCountry={selectedCountry}
                                                            compact={true}
                                                            className="text-xs px-2 py-1 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded(index) && (
                                        <div className="px-2 sm:px-6 pb-4">
                                            <ExpandRow
                                                row={row}
                                                onPromote={() =>
                                                    handlePromote(
                                                        row.artists,
                                                        row.song,
                                                        row.spotifyid,
                                                        row.avatar,
                                                        row.url
                                                    )
                                                }
                                                selectedCountry={selectedCountry}
                                                selectedFormat={selectedFormat}
                                                countries={countries}
                                                isExpanded={isExpanded(index)}
                                                cityDataForSong={cityData}
                                                loadingCityData={loadingCityData}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {!user && (
                    <div className="mt-8 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/50 rounded-xl sm:rounded-3xl p-4 sm:p-8 shadow-lg w-full overflow-hidden">
                        <div className="text-center space-y-6">
                            <div className="flex justify-center items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        ¿Quieres ver más allá del Top 20?
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Accede a rankings completos y métricas avanzadas
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2 opacity-50 pointer-events-none">
                                {[
                                    {
                                        rank: 21,
                                        artist: "Rauw Alejandro",
                                        track: "Touching The Sky",
                                        streams: "2.1M",
                                    },
                                    {
                                        rank: 22,
                                        artist: "Anuel AA",
                                        track: "Mcgregor",
                                        streams: "1.9M",
                                    },
                                    {
                                        rank: 23,
                                        artist: "J Balvin",
                                        track: "Doblexxó",
                                        streams: "1.8M",
                                    },
                                ].map((song) => (
                                    <div
                                        key={song.rank}
                                        className="flex items-center gap-3 p-3 bg-white/30 rounded-xl"
                                    >
                                        <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-sm font-bold text-gray-600">
                                                {song.rank}
                                            </span>
                                        </div>
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-700">
                                                {song.track}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {song.artist}
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-600">
                                            {song.streams}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => setShowLoginDialog(true)}
                                    className="px-10 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <Trophy className="mr-2 h-4 w-4" />
                                    Accede ahora para ver más del top
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!user && (showGenreOverlay || showCrgOverlay) && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">🔒</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-foreground">
                            {showGenreOverlay
                                ? "Filtros por Género"
                                : "Filtros por Plataforma"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Esta función es parte de las herramientas avanzadas. Activa una
                            campaña para desbloquearla.
                        </p>
                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl p-4 text-center">
                                <div className="w-8 h-8 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-2">
                                    <Crown className="w-4 h-4 text-white" />
                                </div>
                                <div className="mb-3">
                                    <div className="text-sm font-bold text-foreground">
                                        Premium
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-1">
                                        Solo Charts & Analytics
                                    </div>
                                    <div className="text-sm font-bold text-foreground">
                                        $14.99/mes
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        console.log("Redirect to premium subscription");
                                        setShowGenreOverlay(false);
                                        setShowCrgOverlay(false);
                                    }}
                                    className="w-full bg-gradient-primary text-white px-4 py-2 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 text-sm"
                                >
                                    Suscribirse
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-cta-primary/30 rounded-xl p-4 text-center relative">
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-cta-primary to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        INCLUYE TODO
                                    </span>
                                </div>

                                <div className="w-8 h-8 mx-auto bg-gradient-to-r from-cta-primary to-orange-500 rounded-full flex items-center justify-center mb-2 mt-1">
                                    <span className="text-white font-bold text-sm">🚀</span>
                                </div>
                                <div className="mb-3">
                                    <div className="text-sm font-bold text-foreground">
                                        Campaña Completa
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-1">
                                        Premium + Promoción
                                    </div>
                                    <div className="text-sm font-bold text-foreground">
                                        Desde $750
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        navigate("/campaign");
                                        setShowGenreOverlay(false);
                                        setShowCrgOverlay(false);
                                    }}
                                    className="w-full bg-gradient-to-r from-cta-primary to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-glow transition-all duration-300 text-sm"
                                >
                                    Crear Campaña
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowGenreOverlay(false);
                                setShowCrgOverlay(false);
                            }}
                            className="w-full px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            <Backdrop open={loading} sx={{ color: "#fff", zIndex: 9999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {showScoreTooltip && (
                <div
                    className="fixed bg-white text-gray-800 text-xs rounded-lg py-2 px-3 shadow-2xl border border-gray-200 whitespace-normal w-48 z-[99999]"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y - 20,
                    }}
                >
                    El <strong>Score Digital</strong> es una métrica del 1 al 100 que evalúa el nivel de exposición de una canción basado en streams, playlists, engagement social y distribución geográfica.
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                </div>
            )}

            {artistDetailsModal.isOpen && artistDetailsModal.artist && (
                <ChartArtistDetails
                    artist={{
                        artist: artistDetailsModal.artist.artists,
                        spotifyid: artistDetailsModal.artist.spotifyartistid || "",
                        img: artistDetailsModal.artist.avatar || "",
                        rk: artistDetailsModal.artist.rk || 0,
                        score: artistDetailsModal.artist.score || 0,
                        followers_total: 0,
                        monthly_listeners: 0,
                    }}
                    selectedCountry={selectedCountry}
                    countries={countries}
                    isOpen={artistDetailsModal.isOpen}
                    onClose={handleCloseArtistDetails}
                />
            )}

            {showComparison && songForComparison.song1 && songForComparison.song2 && (
                <SongCompare
                    isOpen={showComparison}
                    onClose={() => {
                        setShowComparison(false);
                        setSongForComparison({ song1: null, song2: null });
                    }}
                    song1={songForComparison.song1}
                    song2={songForComparison.song2}
                    countries={countries}
                />
            )}
        </div>
    );
}