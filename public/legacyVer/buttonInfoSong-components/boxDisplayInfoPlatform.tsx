import React, { useEffect, useRef, useState } from "react";
import { Box, FormControl, Select, MenuItem, Typography, Paper, Stack, CircularProgress, } from "@mui/material";
import { digitalLatinoApi, Song, SongInfoPlatform } from "@/lib/api";
import Grid from "@mui/material/Grid";
//imports icons
import amazonmusicIcon from '/src/assets/covers/icons/amazonmusic-icon.svg';
import applemusicIcon from '/src/assets/covers/icons/applemusic-icon.png';
import deezerIcon from '/src/assets/covers/icons/deezer-icon.png';
import soundcloudIcon from '/src/assets/covers/icons/soundcloud-icon.svg';
import spotifyIcon from '/src/assets/covers/icons/spotify-icon.png';
import tidalIcon from '/src/assets/covers/icons/tidal-icon.png';
import tiktokIcon from '/src/assets/covers/icons/tiktok-icon.png';
import youtubeIcon from '/src/assets/covers/icons/youtube-icon.svg';
import shazamIcon from '/src/assets/covers/icons/shazam-icon.svg';

export interface BoxDisplayInfoPlatformProps {
    csSong: number;
    formatId: number;
    countryId: number;
}

// Interface para los datos de la plataforma
interface PlatformData {
    [key: string]: number | string | null;
}

// Definir las plataformas y sus campos
const platforms = [
    {
        key: "spotify",
        name: "Spotify",
        logo: spotifyIcon,
        rankKey: "rk_spotify" as keyof SongInfoPlatform,
        fields: [
            { key: "spotify_streams_total" as keyof SongInfoPlatform, label: "Total Streams" },
            { key: "spotify_popularity_current" as keyof SongInfoPlatform, label: "Popularity Current" },
            { key: "spotify_playlists_current" as keyof SongInfoPlatform, label: "Playlists Current" },
            { key: "spotify_playlists_reach_current" as keyof SongInfoPlatform, label: "Playlists Reach Current" },
            { key: "spotify_playlists_reach_total" as keyof SongInfoPlatform, label: "Playlists Reach Total" },
            { key: "spotify_charts_total" as keyof SongInfoPlatform, label: "Charts Total" },
        ],
    },
    {
        key: "apple",
        name: "Apple Music",
        logo: applemusicIcon,
        rankKey: "rk_apple" as keyof SongInfoPlatform,
        fields: [
            { key: "apple_playlists_current" as keyof SongInfoPlatform, label: "Playlists Current" },
            { key: "apple_playlists_total" as keyof SongInfoPlatform, label: "Playlists Total" },
            { key: "apple_charts_currents" as keyof SongInfoPlatform, label: "Charts Current" },
            { key: "apple_charts_total" as keyof SongInfoPlatform, label: "Charts Total" },
        ],
    },
    {
        key: "amazon",
        name: "Amazon Music",
        logo: amazonmusicIcon,
        rankKey: "rk_amazon" as keyof SongInfoPlatform,
        fields: [
            { key: "amazon_playlists_current" as keyof SongInfoPlatform, label: "Playlists Current" },
            { key: "amazon_paylists_total" as keyof SongInfoPlatform, label: "Playlists Total" },
            { key: "amazon_charts_current" as keyof SongInfoPlatform, label: "Charts Current" },
            { key: "amazon_charts_total" as keyof SongInfoPlatform, label: "Charts Total" },
        ],
    },
    {
        key: "deezer",
        name: "Deezer",
        logo: deezerIcon,
        rankKey: "rk_deezer" as keyof SongInfoPlatform,
        fields: [
            { key: "deezer_popularity_current" as keyof SongInfoPlatform, label: "Popularity Current" },
            { key: "deezer_playlists_current" as keyof SongInfoPlatform, label: "Playlists Current" },
            { key: "deezer_playlists_total" as keyof SongInfoPlatform, label: "Playlists Total" },
            { key: "deezer_playlist_reach_current" as keyof SongInfoPlatform, label: "Playlist Reach Current" },
            { key: "deezer_playlist_reach_total" as keyof SongInfoPlatform, label: "Playlist Reach Total" },
            { key: "deezer_charts_current" as keyof SongInfoPlatform, label: "Charts Current" },
            { key: "deezer_charts_total" as keyof SongInfoPlatform, label: "Charts Total" },
        ],
    },
    {
        key: "tiktok",
        name: "TikTok",
        logo: tiktokIcon,
        rankKey: "rk_tiktok" as keyof SongInfoPlatform,
        fields: [
            { key: "tiktok_videos_total" as keyof SongInfoPlatform, label: "Videos Total" },
            { key: "tiktok_views_total" as keyof SongInfoPlatform, label: "Views Total" },
            { key: "tiktok_likes_total" as keyof SongInfoPlatform, label: "Likes Total" },
            { key: "tiktok_shares_total" as keyof SongInfoPlatform, label: "Shares Total" },
            { key: "tiktok_comments_total" as keyof SongInfoPlatform, label: "Comments Total" },
            { key: "tiktok_engagement_rate_total" as keyof SongInfoPlatform, label: "Engagement Rate Total" },
        ],
    },
    {
        key: "youtube",
        name: "YouTube",
        logo: youtubeIcon,
        rankKey: "rk_youtube" as keyof SongInfoPlatform,
        fields: [
            { key: "youtube_videos_total" as keyof SongInfoPlatform, label: "Videos Total" },
            { key: "youtube_video_views_total" as keyof SongInfoPlatform, label: "Video Views Total" },
            { key: "youtube_video_likes_total" as keyof SongInfoPlatform, label: "Video Likes Total" },
            { key: "youtube_video_comments_total" as keyof SongInfoPlatform, label: "Video Comments Total" },
            { key: "youtube_shorts_total" as keyof SongInfoPlatform, label: "Shorts Total" },
            { key: "youtube_short_views_total" as keyof SongInfoPlatform, label: "Short Views Total" },
            { key: "youtube_short_likes_total" as keyof SongInfoPlatform, label: "Short Likes Total" },
            { key: "youtube_short_comments_total" as keyof SongInfoPlatform, label: "Short Comments Total" },
            { key: "youtube_engagement_rate_total" as keyof SongInfoPlatform, label: "Engagement Rate Total" },
        ],
    },
    {
        key: "shazam",
        name: "Shazam",
        logo: shazamIcon,
        rankKey: "rk_shazam" as keyof SongInfoPlatform,
        fields: [
            { key: "shazam_shazams_total" as keyof SongInfoPlatform, label: "Shazams Total" },
            { key: "shazam_charts_current" as keyof SongInfoPlatform, label: "Charts Current" },
            { key: "shazam_charts_total" as keyof SongInfoPlatform, label: "Charts Total" },
        ],
    },
    {
        key: "tidal",
        name: "Tidal",
        logo: tidalIcon,
        rankKey: "rk_tidal" as keyof SongInfoPlatform,
        fields: [
            { key: "tidal_popularity_current" as keyof SongInfoPlatform, label: "Popularity Current" },
            { key: "tidal_playlists_current" as keyof SongInfoPlatform, label: "Playlists Current" },
            { key: "tidal_playlists_total" as keyof SongInfoPlatform, label: "Playlists Total" },
        ],
    },
    {
        key: "soundcloud",
        name: "SoundCloud",
        logo: soundcloudIcon,
        rankKey: "rk_soundcloud" as keyof SongInfoPlatform,
        fields: [
            { key: "soundcloud_streams_total" as keyof SongInfoPlatform, label: "Streams Total" },
            { key: "soundcloud_favorites_total" as keyof SongInfoPlatform, label: "Favorites Total" },
            { key: "soundcloud_reposts_total" as keyof SongInfoPlatform, label: "Reposts Total" },
            { key: "soundcloud_engagement_rate_total" as keyof SongInfoPlatform, label: "Engagement Rate Total" },
        ],
    },

];

// Función para formatear números
const formatNumber = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
};

// Función para formatear porcentajes
const formatPercentage = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return (value * 100).toFixed(1) + '%';
};

export default function BoxDisplayInfoPlatform({ csSong, formatId, countryId }: BoxDisplayInfoPlatformProps) {
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [platformData, setPlatformData] = useState<SongInfoPlatform[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lastFetchRef = useRef<string>('');


    // Función para obtener datos de la API
    const fetchPlatformData = async () => {
        if (!csSong || formatId === undefined || formatId === null || !countryId) {

            setLoading(false);
            return;
        }

        // Crear una clave única para esta solicitud
        const requestKey = `${csSong}-${formatId}`;

        // Evitar solicitudes duplicadas
        if (lastFetchRef.current === requestKey) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            lastFetchRef.current = requestKey;

            const response = await digitalLatinoApi.getSongPlatformData(csSong, formatId, countryId);

            setPlatformData(response.data);
        } catch (err) {
            console.error('❌ Error:', err);
            setError("No se pudieron cargar los datos de plataformas");
            lastFetchRef.current = ''; // Reset para permitir reintento
        } finally {
            setLoading(false);
        }
    };

    // Effect CORREGIDO: Manejar formatId = 0
    useEffect(() => {

        // CORREGIDO: formatId puede ser 0 (General)
        if (csSong && (formatId === 0 || formatId)) {
            fetchPlatformData();
        } else {
            setLoading(false);
        }
    }, [csSong, formatId]);

    const handlePlatformChange = (event: any) => {
        const platformKey = event.target.value;
        const platform = platforms.find(p => p.key === platformKey) || platforms[0];
        setSelectedPlatform(platform);
    };

    // Obtener el valor del rank
    const rankValue = platformData ? platformData[selectedPlatform.rankKey] as number : null;

    // Función para formatear el valor según el campo
    const formatValue = (key: keyof SongInfoPlatform, value: number): string => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';

        if (key.includes('engagement_rate')) {
            return formatPercentage(value);
        }
        return formatNumber(value);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    border: "1px solid #E0E0E0",
                    borderRadius: "12px",
                    p: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    backgroundColor: "white",
                    mb: 3,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                        {selectedPlatform.logo}
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#6C63FF",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: '1.1rem'
                        }}
                    >
                        {selectedPlatform.name}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} sx={{ color: "#6C63FF" }} />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    border: "1px solid #ffcdd2",
                    borderRadius: "12px",
                    p: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    backgroundColor: "#ffebee",
                    mb: 3,
                }}
            >
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                p: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                backgroundColor: "white",
                mb: 3,
            }}
        >
            {/* Header con selección de plataforma */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2,
                    backgroundColor: 'rgba(248, 249, 250, 0.8)',
                    borderRadius: '12px',
                    p: 2,
                    border: '1px solid rgba(224, 224, 224, 0.5)',
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        component="img"
                        src={selectedPlatform.logo}
                        alt={selectedPlatform.name}
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '10px',
                            objectFit: 'contain',
                            backgroundColor: 'white',
                            padding: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '2px solid #f0f0f0',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                            }
                        }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "#1a1a1a",
                                fontWeight: "bold",
                                fontSize: '1.3rem'
                            }}
                        >
                            {selectedPlatform.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#6C63FF",
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(108, 99, 255, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                display: 'inline-block',
                            }}
                        >
                            Rank #{rankValue ? formatNumber(rankValue) : 'N/A'}
                        </Typography>
                    </Box>
                </Box>

                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <Select
                        value={selectedPlatform.key}
                        onChange={handlePlatformChange}
                        sx={{
                            fontSize: "0.9rem",
                            borderRadius: "10px",
                            backgroundColor: 'white',
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#ddd",
                                borderWidth: '2px',
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#6C63FF",
                            },
                        }}
                    >
                        {platforms.map((platform) => (
                            <MenuItem key={platform.key} value={platform.key}>
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <Box
                                        component="img"
                                        src={platform.logo}
                                        alt={platform.name}
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '6px',
                                            objectFit: 'contain',
                                        }}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                    <Typography variant="inherit" sx={{ fontWeight: 500 }}>
                                        {platform.name}
                                    </Typography>
                                </Stack>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Grid de estadísticas */}
            <Grid container spacing={2}>
                {selectedPlatform.fields.map((field) => {
                    const value = platformData ? platformData[field.key] as number : null;
                    const formattedValue = value !== null && value !== undefined ? formatValue(field.key, value) : 'N/A';


                    return (
                        <Grid item xs={12} sm={6} md={4} key={field.key as string} sx={{ display: 'flex' }}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    borderRadius: "12px",
                                    backgroundColor: "#f8f9fa",
                                    border: "1px solid #e0e0e0",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    },
                                    height: '100%',
                                    display: 'flex',
                                    flex: 1,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    minHeight: '100px',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#666",
                                        fontWeight: 500,
                                        mb: 1,
                                        fontSize: '0.8rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {field.label}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#333",
                                        textAlign: 'center',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {formattedValue}
                                </Typography>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>


            {/* Mensaje si no hay datos */}
            {platformData && selectedPlatform.fields.every(field =>
                platformData[field.key] === null || platformData[field.key] === undefined || platformData[field.key] === 0
            ) && (
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            color: '#666',
                            py: 4,
                            fontStyle: 'italic'
                        }}
                    >
                        No hay datos disponibles para {selectedPlatform.name}
                    </Typography>
                )}
        </Box>
    );
}