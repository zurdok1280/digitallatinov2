import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, Star, Plus, Minus, Search, Music, Crown, Play, Pause, Trophy, Zap, ListMusic, ListMusicIcon, AudioWaveform } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { digitalLatinoApi, Country, Format, CuratorPicsData, PlaylistTypeData, Song } from "@/lib/api";
import { Backdrop, CircularProgress, Fab } from '@mui/material';
import { useApiWithLoading } from '@/hooks/useApiWithLoading';
import { ButtonInfoSong, ExpandRow, useExpandableRows } from "@/components/ui/buttonInfoSong";
import FloatingScrollButtons from "@/components/FloatingScrollButtons";
import { LoginButton } from "@/components/LoginButton";
import ChartArtistDetails from "@/components/ui/ChartArtistDetails";
import { ButtonBigNumber } from "@/components/ui/button-big-number";

// Función adaptadora para convertir CuratorPicsData a Song
const adaptCuratorPicsToSong = (curatorItem: CuratorPicsData): Song => {
    return {
        cs_song: curatorItem.cs_song,
        song: curatorItem.song,
        artists: curatorItem.artists,
        label: curatorItem.label || '',
        score: curatorItem.sum_followers, // Usar sum_followers como score para visualización
        rk: curatorItem.rk,
        // Campos con valores por defecto
        spotify_streams_total: 0,
        tiktok_views_total: 0,
        youtube_video_views_total: 0,
        youtube_short_views_total: 0,
        shazams_total: 0,
        soundcloud_stream_total: 0,
        pan_streams: 0,
        audience_total: 0,
        spins_total: 0,
        rk_total: 0,
        tw_spins: 0,
        tw_aud: 0,
        spotify_streams: 0,
        entid: 0,
        length_sec: 0,
        crg: '',
        avatar: curatorItem.image_url || '',
        url: '',
        spotifyid: ''
    };
};

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toString();
};

// Componente para mostrar la posición promedio
const formatAvgPosition = (avgPosition: number): string => {
    return avgPosition % 1 === 0 ? avgPosition.toString() : avgPosition.toFixed(1);
};

export default function CuratorPics() {
    const { loading, callApi } = useApiWithLoading();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();
    const { expandedRows, toggleRow, isExpanded } = useExpandableRows();

    // Countries API state
    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('0'); // Global ID = 0 por defecto

    // Formats API state (con país = 0 para obtener todos)
    const [formats, setFormats] = useState<Format[]>([]);
    const [loadingFormats, setLoadingFormats] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('0'); // ID por defecto

    // Playlist Types API state
    const [playlistTypes, setPlaylistTypes] = useState<PlaylistTypeData[]>([]);
    const [loadingPlaylistTypes, setLoadingPlaylistTypes] = useState(false);
    const [selectedPlaylistType, setSelectedPlaylistType] = useState('0'); // ID por defecto

    // Curator Pics data state
    const [curatorPicsData, setCuratorPicsData] = useState<CuratorPicsData[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // UI State
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [chartSearchQuery, setChartSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    // Dropdown state
    const [openDropdown, setOpenDropdown] = useState<'country' | 'format' | 'playlistType' | null>(null);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const [countryDropdownPosition, setCountryDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [formatDropdownPosition, setFormatDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [playlistTypeDropdownPosition, setPlaylistTypeDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const countryButtonRef = useRef<HTMLDivElement>(null);
    const formatButtonRef = useRef<HTMLDivElement>(null);
    const playlistTypeButtonRef = useRef<HTMLDivElement>(null);

    // Artist details modal state
    const [artistDetailsModal, setArtistDetailsModal] = useState<{
        isOpen: boolean;
        artist: CuratorPicsData | null;
    }>({
        isOpen: false,
        artist: null
    });

    // Fetch last update
    const fetchLastUpdate = async () => {
        try {
            const response = await digitalLatinoApi.getLastUpdate();
            setLastUpdate(response.data.message);
        } catch (error) {
            console.error("Error fetching last update:", error);
        }
    };

    // Fetch countries
    const fetchCountries = async () => {
        try {
            setLoadingCountries(true);
            const response = await digitalLatinoApi.getCountries();
            setCountries(response.data);
        } catch (error) {
            console.error('Error fetching countries:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los países. Intenta de nuevo.",
                variant: "destructive"
            });
        } finally {
            setLoadingCountries(false);
        }
    };

    // Fetch playlist types
    const fetchPlaylistTypes = async () => {
        try {
            setLoadingPlaylistTypes(true);
            const response = await digitalLatinoApi.getPlaylistType();
            setPlaylistTypes(response.data);
            if (response.data.length > 0) {
                setSelectedPlaylistType(response.data[0].id.toString());
            }
        } catch (error) {
            console.error('Error fetching playlist types:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los tipos de playlist. Intenta de nuevo.",
                variant: "destructive"
            });
        } finally {
            setLoadingPlaylistTypes(false);
        }
    };

    // Fetch formats (using countryId = 0 for global formats)
    const fetchFormats = async () => {
        try {
            setLoadingFormats(true);
            const response = await digitalLatinoApi.getFormatsByCountry(0);
            setFormats(response.data);
            if (response.data.length > 0) {
                setSelectedFormat(response.data[0].id.toString());
            }
        } catch (error) {
            console.error('Error fetching formats:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los géneros. Intenta de nuevo.",
                variant: "destructive"
            });
        } finally {
            setLoadingFormats(false);
        }
    };

    // Fetch curator pics data
    const fetchCuratorPicsData = useCallback(async () => {
        try {
            setLoadingData(true);

            const formatId = parseInt(selectedFormat) || 0;
            const typeId = parseInt(selectedPlaylistType) || 0;

            const response = await digitalLatinoApi.getCuratorPics(formatId, typeId);
            setCuratorPicsData(response.data);


        } catch (error: any) {
            console.error('Error fetching curator pics:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "No se pudieron cargar los datos. Intenta de nuevo.",
                variant: "destructive"
            });
            setCuratorPicsData([]);
        } finally {
            setLoadingData(false);
        }
    }, [selectedFormat, selectedPlaylistType, toast]);

    // Initial data fetch
    useEffect(() => {
        fetchCountries();
        fetchFormats();
        fetchPlaylistTypes();
        fetchLastUpdate();
    }, []);

    // Fetch data when filters change
    useEffect(() => {
        if (selectedFormat && selectedPlaylistType) {
            const timer = setTimeout(() => {
                fetchCuratorPicsData();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedFormat, selectedPlaylistType, fetchCuratorPicsData]);

    // Filter songs based on search query
    const filteredData = useMemo(() => {
        const normalizeText = (text: string) => {
            return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        };

        if (!chartSearchQuery.trim()) {
            return curatorPicsData;
        }

        const query = normalizeText(chartSearchQuery);
        return curatorPicsData.filter((item) => {
            const songName = normalizeText(item.song || "");
            const artistName = normalizeText(item.artists || "");
            return songName.includes(query) || artistName.includes(query);
        });
    }, [curatorPicsData, chartSearchQuery]);

    // Toggle search bar
    const toggleSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        if (showSearchBar) {
            setChartSearchQuery('');
        }
    };

    // Focus search input when shown
    useEffect(() => {
        if (showSearchBar) {
            const searchInput = document.querySelector('input[placeholder="Buscar artista o canción..."]') as HTMLInputElement;
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        }
    }, [showSearchBar]);

    // Filter options for dropdowns
    const getFilteredOptions = (options: any[], searchQuery: string, type: 'country' | 'format' | 'playlistType') => {
        if (!searchQuery.trim()) return options;

        const query = searchQuery.toLowerCase().trim();
        return options.filter(option => {
            if (type === 'country') {
                return option.country_name?.toLowerCase().includes(query) ||
                    option.country?.toLowerCase().includes(query) ||
                    option.description?.toLowerCase().includes(query);
            } else if (type === 'format') {
                return option.format?.toLowerCase().includes(query);
            } else if (type === 'playlistType') {
                return option.name?.toLowerCase().includes(query);
            }
            return false;
        });
    };

    // Handle option selection
    const handleOptionSelect = (value: string, type: 'country' | 'format' | 'playlistType') => {
        if (type === 'country') {
            setSelectedCountry(value);
        } else if (type === 'format') {
            setSelectedFormat(value);
        } else if (type === 'playlistType') {
            setSelectedPlaylistType(value);
        }
        setOpenDropdown(null);
        setDropdownSearch('');
    };

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpenDropdown(null);
                setDropdownSearch('');
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Handle click outside
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

            if (openDropdown === "playlistType") {
                const playlistTypePortal = document.querySelector('[data-playlistType-portal="true"]');
                if (playlistTypeButtonRef.current && !playlistTypeButtonRef.current.contains(target) &&
                    playlistTypePortal && !playlistTypePortal.contains(target)) {
                    setOpenDropdown(null);
                    setDropdownSearch("");
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    // Handle artist details click
    const handleArtistDetailsClick = (row: CuratorPicsData) => {
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
            artist: row
        });
    };

    const handleCloseArtistDetails = () => {
        setArtistDetailsModal({
            isOpen: false,
            artist: null
        });
    };

    // Handle promote
    const handlePromote = (artist: string, track: string, coverUrl?: string) => {
        const params = new URLSearchParams({
            artist,
            track,
            ...(coverUrl && { coverUrl })
        });
        navigate(`/campaign?${params.toString()}`);
    };

    // Handle restricted toggle for expandable rows
    const handleRestrictedToggle = (index: number, row: CuratorPicsData) => {
        if (user?.role === 'ARTIST') {
            const normalize = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const myArtistName = normalize(user.allowedArtistName || "");
            const rowArtistName = normalize(row.artists || "");

            if (!rowArtistName.includes(myArtistName)) {
                toast({
                    title: "🔒 Acceso Restringido",
                    description: "Solo puedes ver métricas detalladas de tu artista.",
                    variant: "destructive"
                });
                return;
            }
        }
        toggleRow(index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
            {/* Floating navigation buttons */}
            <FloatingScrollButtons
                rightOffset={24}
                topOffset={100}
                bottomOffset={100}
                showTopThreshold={300}
                hideBottomThreshold={100}
            />

            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-300/15 to-gray-400/15 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-slate-400/15 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-gray-300/10 to-blue-300/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-2">
                {/* Filters Section */}
                <div className="mb-4 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 overflow-hidden">
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
                        <ChevronDown
                            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <div className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${showFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
          `}>
                        <div className="p-4 border-t border-white/30">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">

                                {/* Country Filter */}
                                {/*
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="text-xs font-bold text-pink-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                                        <span className="text-sm sm:text-base">🌎</span>
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
                                                ) : (
                                                    selectedCountry && countries.find(c => c.id.toString() === selectedCountry)
                                                        ? `${countries.find(c => c.id.toString() === selectedCountry)?.country_name}`
                                                        : "Global"
                                                )}
                                            </span>
                                            <ChevronDown
                                                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openDropdown === "country" ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                    */}
                                {/* Format Filter */}
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                                        {/*
                                        <span className="text-sm sm:text-base">📊</span>
                                        */}
                                        <ListMusic className="size-4 lg:size-6" />
                                        <span className="truncate">Género</span>
                                    </label>
                                    <div className="relative" ref={formatButtonRef}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (loadingFormats) return;
                                                setOpenDropdown(openDropdown === "format" ? null : "format");
                                                setDropdownSearch("");
                                                if (formatButtonRef.current) {
                                                    const rect = formatButtonRef.current.getBoundingClientRect();
                                                    setFormatDropdownPosition({
                                                        top: rect.bottom + window.scrollY,
                                                        left: rect.left + window.scrollX,
                                                        width: rect.width,
                                                    });
                                                }
                                            }}
                                            className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-pink-400 flex items-center justify-between transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={loadingFormats}
                                        >
                                            <span className="truncate pr-2">
                                                {loadingFormats ? (
                                                    "Cargando géneros..."
                                                ) : (
                                                    selectedFormat && formats.find(f => f.id.toString() === selectedFormat)
                                                        ? formats.find(f => f.id.toString() === selectedFormat)?.format
                                                        : "Selecciona un género"
                                                )}
                                            </span>
                                            <ChevronDown
                                                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openDropdown === "format" ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Playlist Type Filter */}
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1 sm:gap-2">
                                        {/*
                                        <span className="text-sm sm:text-base">🎵</span>
                                        */}
                                        <AudioWaveform className="size-4 lg:size-6" />
                                        <span className="truncate">Tipo de Playlist</span>
                                    </label>
                                    <div className="relative" ref={playlistTypeButtonRef}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (loadingPlaylistTypes) return;
                                                setOpenDropdown(openDropdown === "playlistType" ? null : "playlistType");
                                                setDropdownSearch("");
                                                if (playlistTypeButtonRef.current) {
                                                    const rect = playlistTypeButtonRef.current.getBoundingClientRect();
                                                    setPlaylistTypeDropdownPosition({
                                                        top: rect.bottom + window.scrollY,
                                                        left: rect.left + window.scrollX,
                                                        width: rect.width,
                                                    });
                                                }
                                            }}
                                            className="w-full rounded-lg border-0 bg-white/80 backdrop-blur-sm px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md focus:ring-2 focus:ring-pink-400 flex items-center justify-between transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={loadingPlaylistTypes}
                                        >
                                            <span className="truncate pr-2">
                                                {loadingPlaylistTypes ? (
                                                    "Cargando tipos..."
                                                ) : (
                                                    selectedPlaylistType && playlistTypes.find(t => t.id.toString() === selectedPlaylistType)
                                                        ? playlistTypes.find(t => t.id.toString() === selectedPlaylistType)?.name
                                                        : "Selecciona un tipo"
                                                )}
                                            </span>
                                            <ChevronDown
                                                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${openDropdown === "playlistType" ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Country Dropdown Portal */}
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
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            <button
                                onClick={() => {
                                    handleOptionSelect('0', 'country');
                                    setOpenDropdown(null);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-pink-50 transition-colors ${selectedCountry === '0' ? "bg-pink-100 text-pink-700 font-semibold" : "text-gray-700"}`}
                            >

                            </button>
                            {getFilteredOptions(countries, dropdownSearch, "country").map(
                                (country) => (
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
                                                {country.country || country.description} ({country.country_name})
                                            </span>
                                        </span>
                                    </button>
                                )
                            )}
                            {getFilteredOptions(countries, dropdownSearch, "country").length === 0 && (
                                <div className="px-3 py-4 text-xs sm:text-sm text-gray-500 text-center">
                                    No se encontraron países
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

                {/* Format Dropdown Portal */}
                {openDropdown === "format" && !loadingFormats && createPortal(
                    <div
                        data-format-portal="true"
                        className="fixed z-[999999] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                        style={{
                            top: formatDropdownPosition.top,
                            left: formatDropdownPosition.left,
                            width: formatDropdownPosition.width,
                            maxHeight: '300px',
                        }}
                    >
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/95">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar género..."
                                    className="w-full pl-7 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-white/80 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    value={dropdownSearch}
                                    onChange={(e) => setDropdownSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {getFilteredOptions(formats, dropdownSearch, "format").map(
                                (format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => {
                                            handleOptionSelect(format.id.toString(), "format");
                                            setOpenDropdown(null);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-pink-50 transition-colors ${selectedFormat === format.id.toString()
                                            ? "bg-pink-100 text-pink-700 font-semibold"
                                            : "text-gray-700"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>📊</span>
                                            <span className="truncate">{format.format}</span>
                                        </span>
                                    </button>
                                )
                            )}
                            {getFilteredOptions(formats, dropdownSearch, "format").length === 0 && (
                                <div className="px-3 py-4 text-xs sm:text-sm text-gray-500 text-center">
                                    No se encontraron géneros
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

                {/* Playlist Type Dropdown Portal */}
                {openDropdown === "playlistType" && !loadingPlaylistTypes && createPortal(
                    <div
                        data-playlistType-portal="true"
                        className="fixed z-[999999] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
                        style={{
                            top: playlistTypeDropdownPosition.top,
                            left: playlistTypeDropdownPosition.left,
                            width: playlistTypeDropdownPosition.width,
                            maxHeight: '300px',
                        }}
                    >
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white/95">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar tipo de playlist..."
                                    className="w-full pl-7 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-white/80 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    value={dropdownSearch}
                                    onChange={(e) => setDropdownSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {getFilteredOptions(playlistTypes, dropdownSearch, "playlistType").map(
                                (type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            handleOptionSelect(type.id.toString(), "playlistType");
                                            setOpenDropdown(null);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-pink-50 transition-colors ${selectedPlaylistType === type.id.toString()
                                            ? "bg-pink-100 text-pink-700 font-semibold"
                                            : "text-gray-700"
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>🎵</span>
                                            <span className="truncate">{type.name}</span>
                                        </span>
                                    </button>
                                )
                            )}
                            {getFilteredOptions(playlistTypes, dropdownSearch, "playlistType").length === 0 && (
                                <div className="px-3 py-4 text-xs sm:text-sm text-gray-500 text-center">
                                    No se encontraron tipos de playlist
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

                {/* Data List */}
                <div className="mb-4 flex flex-col gap-3 border-b border-white/20 pb-3 bg-white/60 backdrop-blur-lg rounded-2xl p-2 md:p-3 shadow-lg relative">
                    <div className="text-xs text-muted-foreground items-end justify-end flex pr-7 pb-2">
                        {`Última actualización: ${lastUpdate ? lastUpdate : "Cargando..."}`}
                    </div>

                    {/* Search FAB */}
                    <div className="absolute -top-4 -right-4 z-20">
                        <Fab
                            size="medium"
                            color="primary"
                            aria-label="search"
                            onClick={toggleSearchBar}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                            }}
                        >
                            {showSearchBar ? (
                                <Minus className="w-6 h-6 text-white" />
                            ) : (
                                <Search className="w-6 h-6 text-white" />
                            )}
                        </Fab>
                    </div>

                    <div className="space-y-0">
                        {/* Search Bar */}
                        {showSearchBar && (
                            <div className="mb-3 animate-in fade-in duration-300">
                                <div className="bg-white/60 backdrop-blur-sm border border-blue-200 rounded-xl p-3 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <Search className="w-5 h-5 text-blue-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar artista o canción..."
                                            className="flex-1 bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-sm font-medium text-slate-800"
                                            value={chartSearchQuery}
                                            onChange={(e) => setChartSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        {chartSearchQuery && (
                                            <button
                                                onClick={() => setChartSearchQuery('')}
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
                                                {filteredData.length} de {curatorPicsData.length} resultados encontrados
                                            </span>
                                            {filteredData.length === 0 && (
                                                <span className="text-orange-600 font-medium">
                                                    No hay resultados
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Data List */}
                        {loadingData ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center gap-2 text-slate-600">
                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    Cargando datos...
                                </div>
                            </div>
                        ) : filteredData.length === 0 && chartSearchQuery ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                    No se encontraron resultados
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    No hay elementos que coincidan con "<strong>{chartSearchQuery}</strong>"
                                </p>
                                <button
                                    onClick={() => setChartSearchQuery('')}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Ver todos los resultados
                                </button>
                            </div>
                        ) : (
                            filteredData.map((row, index) => (
                                <div
                                    key={`${row.cs_song}-${index}`}
                                    className="group bg-white/50 backdrop-blur-lg rounded-xl shadow-sm border border-white/30 overflow-hidden hover:shadow-md hover:bg-white/60 transition-all duration-200 hover:scale-[1.002] mb-2"
                                >
                                    <div className="grid grid-cols-12 items-center justify-between gap-1 sm:gap-2 pl-1 sm:pl-3 pr-1 sm:pr-3 py-1 sm:py-1.5">
                                        {/* Rank */}
                                        <div className="col-span-1 flex items-center justify-center">
                                            <div className="relative group/rank">
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 to-gray-300/40 rounded-lg blur-sm group-hover/rank:blur-md transition-all"></div>
                                                <div className="relative bg-white/95 backdrop-blur-sm border border-white/70 rounded w-6 h-6 sm:w-9 sm:h-9 flex items-center justify-center shadow-xs transition-all">
                                                    <span className="text-xs sm:text-lg font-bold text-slate-700 sm:bg-gradient-to-br sm:from-slate-700 sm:to-gray-800 sm:bg-clip-text sm:text-transparent">
                                                        {row.rk}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Track Info */}
                                        <div className="col-span-5 sm:col-span-6 flex items-center gap-1 sm:gap-3">
                                            <div className="relative group-hover:scale-105 transition-transform">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400/30 to-blue-400/30 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity"></div>
                                                <div className="relative">
                                                    <Avatar className="relative h-8 w-8 sm:h-10 sm:w-10 rounded shadow-xs transition-shadow">
                                                        <AvatarImage
                                                            src={row.image_url}
                                                            alt={row.song}
                                                            className="rounded object-cover"
                                                        />
                                                        <AvatarFallback className="rounded bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold text-xs">
                                                            {row.artists?.split(' ').map(n => n[0]).join('').slice(0, 1).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <h3 className="font-bold text-[10px] sm:text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors leading-tight">
                                                    {row.song}
                                                </h3>
                                                <p
                                                    className="text-[9px] sm:text-xs font-medium text-gray-600 truncate cursor-pointer hover:text-purple-600 transition-colors"
                                                    onClick={() => handleArtistDetailsClick(row)}
                                                    title={`Ver detalles de ${row.artists}`}
                                                >
                                                    {row.artists}
                                                </p>
                                                <p className="text-[9px] sm:text-xs font-medium text-gray-400 truncate hidden sm:block">
                                                    {row.label}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="col-span-6 sm:col-span-5 grid flex items-end gap-1">
                                            <div className="w-full px-4 py-3 flex items-end justify-between gap-2">

                                                {/* Sum Followers */}
                                                <ButtonBigNumber
                                                    name="Seguidores"
                                                    quantity={row.sum_followers}
                                                    compact={false}
                                                    className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-1.5 shadow-sm group-hover:shadow-md group-hover:bg-white/90"
                                                />

                                                {/* Avg Position */}
                                                <ButtonBigNumber
                                                    name="Avg. Position"
                                                    quantity={row.avg_position}
                                                    compact={false}
                                                    className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-1.5 shadow-sm group-hover:shadow-md group-hover:bg-white/90"
                                                />


                                                {/* ButtonInfoSong */}
                                                <div className="flex items-center justify-center">
                                                    <ButtonInfoSong
                                                        index={index}
                                                        row={adaptCuratorPicsToSong(row)}
                                                        isExpanded={isExpanded(index)}
                                                        onToggle={() => handleRestrictedToggle(index, row)}
                                                        selectedCountry={selectedCountry}
                                                        compact={true}
                                                        className="text-xs px-1.5 py-0.5 h-6 sm:text-sm sm:px-2 sm:py-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded(index) && (
                                        <div className="px-2 sm:px-4 pb-2">
                                            <ExpandRow
                                                row={adaptCuratorPicsToSong(row)}
                                                onPromote={() => handlePromote(row.artists, row.song, row.image_url)}
                                                selectedCountry={selectedCountry}
                                                selectedFormat={selectedFormat}
                                                countries={countries}
                                                isExpanded={isExpanded(index)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Premium Upsell Section */}
                {!user && (
                    <div className="mt-4 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-4 shadow-lg">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        ¿Quieres ver métricas detalladas de Curator Pics?
                                    </h3>
                                </div>
                            </div>
                            <div className="text-center">
                                <LoginButton />
                            </div>

                            {/* Blurred content preview */}
                            <div className="grid gap-1 opacity-50 pointer-events-none">
                                {[
                                    { rank: 1, artist: "Artista Destacado", track: "Canción Popular", followers: "2.1M" },
                                    { rank: 2, artist: "Artista Emergente", track: "Nuevo Hit", followers: "1.9M" },
                                    { rank: 3, artist: "Artista Consagrado", track: "Clásico Moderno", followers: "1.8M" }
                                ].map((item) => (
                                    <div key={item.rank} className="flex items-center gap-2 p-2 bg-white/30 rounded-lg">
                                        <div className="w-7 h-7 bg-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-600">{item.rank}</span>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-700">{item.track}</div>
                                            <div className="text-sm text-gray-500">{item.artist}</div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-600">{item.followers}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading Overlay */}
            <Backdrop open={loading} sx={{ color: '#fff', zIndex: 9999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Artist Details Modal */}
            {artistDetailsModal.isOpen && artistDetailsModal.artist && (
                <ChartArtistDetails
                    artist={{
                        artist: artistDetailsModal.artist.artists,
                        spotifyid: "", // No hay spotifyid en los datos
                        img: artistDetailsModal.artist.image_url || "",
                        rk: artistDetailsModal.artist.rk || 0,
                        score: artistDetailsModal.artist.sum_followers || 0,
                        followers_total: 0,
                        monthly_listeners: 0,
                    }}
                    selectedCountry={selectedCountry}
                    countries={countries}
                    isOpen={artistDetailsModal.isOpen}
                    onClose={handleCloseArtistDetails}
                />
            )}
        </div>
    );
}