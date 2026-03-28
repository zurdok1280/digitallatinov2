import React, { useState, useEffect } from "react";
import { Box, FormControl, Select, MenuItem, Typography, Paper, CircularProgress, Chip, Stack, useMediaQuery, useTheme } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { digitalLatinoApi, TopPlaylists, PlaylistType } from "@/lib/api";

export interface BoxPlaylistsDisplayProps { csSong: number; }

const formatFollowers = (followers: number): string => {
    if (followers >= 1000000) return (followers / 1000000).toFixed(1) + 'M';
    else if (followers >= 1000) return (followers / 1000).toFixed(1) + 'K';
    return followers.toString();
};

const getRankColor = (rank: number): string => {
    switch (rank) {
        case 1: return "#FFD700";
        case 2: return "#C0C0C0";
        case 3: return "#CD7F32";
        default: return "#6C63FF";
    }
};

export default function BoxPlaylistsDisplay({ csSong }: BoxPlaylistsDisplayProps) {
    const [playlists, setPlaylists] = useState<TopPlaylists[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<number>(1);
    const [playlistTypes, setPlaylistTypes] = useState<PlaylistType[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    // Cargar tipos de playlist
    useEffect(() => {
        const fetchPlaylistTypes = async () => {
            try {
                setLoadingTypes(true);
                const response = await digitalLatinoApi.getPlaylistType();
                setPlaylistTypes(response.data);
            } catch (err) {
                console.error('Error fetching playlist types:', err);
                // Fallback a tipos por defecto en caso de error
                setPlaylistTypes([
                    { id: 0, name: "General" },
                    { id: 1, name: "Editorial" },
                    { id: 2, name: "Chart" },
                    { id: 4, name: "Listener" },
                    { id: 5, name: "Personalized" },
                    { id: 6, name: "Artist Radio" },
                    { id: 7, name: "Artist Mix" },
                ]);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchPlaylistTypes();
    }, []);

    const fetchPlaylists = async (typeId: number) => {
        if (!csSong) { setLoading(false); return; }
        try {
            setLoading(true); setError(null);
            const response = await digitalLatinoApi.getTopPlaylists(csSong, typeId);
            setPlaylists(response.data);
        } catch (err) {
            console.error('Error fetching playlists:', err);
            setError("No se pudieron cargar las playlists");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchPlaylists(selectedType); }, [csSong, selectedType]);

    const handleTypeChange = (event: any) => { setSelectedType(event.target.value); };
    const handleOpenPlaylist = (url: string) => { window.open(url, '_blank', 'noopener,noreferrer'); };

    const getArtworkSize = () => {
        if (isMobile) return 70;
        if (isTablet) return 75;
        return 80;
    };

    const containerStyles = {
        border: "1px solid #E0E0E0", borderRadius: "12px", padding: isMobile ? "16px" : "24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "white", marginBottom: isMobile ? "16px" : "24px", width: "100%",
    };

    // Mostrar loading mientras se cargan los tipos de playlist
    if (loadingTypes) {
        return (
            <Box sx={containerStyles}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmojiEventsIcon sx={{ color: "#6C63FF", fontSize: isMobile ? '1.2rem' : 'inherit' }} />
                    <Typography variant="subtitle2" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                        Top Playlists
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", py: isMobile ? 3 : 4 }}>
                    <CircularProgress size={isMobile ? 20 : 24} sx={{ color: "#6C63FF" }} />
                </Box>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={containerStyles}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmojiEventsIcon sx={{ color: "#6C63FF", fontSize: isMobile ? '1.2rem' : 'inherit' }} />
                    <Typography variant="subtitle2" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                        Top Playlists
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", py: isMobile ? 3 : 4 }}>
                    <CircularProgress size={isMobile ? 20 : 24} sx={{ color: "#6C63FF" }} />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ ...containerStyles, border: "1px solid #ffcdd2", backgroundColor: "#ffebee" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmojiEventsIcon sx={{ color: "#d32f2f", fontSize: isMobile ? '1.2rem' : 'inherit' }} />
                    <Typography variant="subtitle2" sx={{ color: "#d32f2f", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                        Top Playlists
                    </Typography>
                </Box>
                <Typography color="error" variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}>{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={containerStyles}>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: 2, mb: 3, width: '100%' }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: isMobile ? 1 : 0 }}>
                        <EmojiEventsIcon sx={{ color: "#6C63FF", fontSize: isMobile ? '1.2rem' : 'inherit' }} />
                        <Typography variant="subtitle2" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                            Top Playlists
                        </Typography>
                    </Box>

                    <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 200, maxWidth: isMobile ? '100%' : 'auto' }}>
                        <Select
                            value={selectedType}
                            onChange={handleTypeChange}
                            sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem', borderRadius: "8px", width: '100%' }}
                            disabled={loadingTypes}
                            MenuProps={{
                                disablePortal: false,
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                                getContentAnchorEl: null,
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                        position: 'fixed',
                                        zIndex: 9999,
                                    },
                                },
                                disableScrollLock: false,
                                modifiers: [
                                    {
                                        name: 'preventOverflow',
                                        enabled: true,
                                        options: {
                                            rootBoundary: 'viewport',
                                            tether: true,
                                        },
                                    },
                                    {
                                        name: 'flip',
                                        enabled: true,
                                        options: {
                                            rootBoundary: 'viewport',
                                        },
                                    },
                                    {
                                        name: 'fixed',
                                        enabled: true,
                                        phase: 'main',
                                        fn: ({ state }) => {
                                            state.styles.popper.position = 'fixed';
                                        },
                                    },
                                ],
                            }}
                        >
                            {playlistTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id} sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                    {isMobile && type.name.length > 20 ? `${type.name.substring(0, 20)}...` : type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {playlists.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: '#666', py: isMobile ? 3 : 4, fontStyle: 'italic', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                        No se encontraron playlists para esta categoría
                    </Box>
                ) : (
                    <Box sx={{
                        maxHeight: isMobile ? '500px' : '600px', overflowY: 'auto', pr: 1,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent', borderRadius: '3px' },
                        '&::-webkit-scrollbar-thumb': { background: 'rgba(108, 99, 255, 0.3)', borderRadius: '3px' },
                        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(108, 99, 255, 0.5)' },
                        scrollbarWidth: 'thin', scrollbarColor: 'rgba(108, 99, 255, 0.3) transparent',
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {playlists.map((playlist) => (
                                <Paper key={playlist.spotify_id} elevation={1} sx={{
                                    p: isMobile ? 2 : 2, borderRadius: "12px", backgroundColor: "#f8f9fa", border: "1px solid #e0e0e0", transition: "all 0.2s ease", cursor: 'pointer', width: '100%',
                                    '&:hover': { transform: isMobile ? 'none' : "translateY(-2px)", boxShadow: isMobile ? 'none' : "0 4px 12px rgba(0,0,0,0.1)", backgroundColor: "#ffffff" },
                                }}>
                                    {isMobile ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                                                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                                    <Box
                                                        component="img"
                                                        src={playlist.artwork}
                                                        alt={playlist.playlist_name}
                                                        sx={{
                                                            width: 70,
                                                            height: 70,
                                                            borderRadius: '8px',
                                                            objectFit: 'cover',
                                                            backgroundColor: '#6C63FF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                        onError={
                                                            (e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '';
                                                                target.style.backgroundColor = '#6C63FF';
                                                                target.style.display = 'flex';
                                                                target.style.alignItems = 'center';
                                                                target.style.justifyContent = 'center';
                                                                target.style.color = 'white';
                                                                target.style.fontSize = '0.9rem';
                                                                target.style.fontWeight = 'bold';
                                                                target.textContent = `#${playlist.rank}`;
                                                            }}
                                                    />
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: -6,
                                                        left: -6,
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        backgroundColor: getRankColor(playlist.rank),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold',
                                                        border: '2px solid white',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                    }}>
                                                        #{playlist.rank}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 0.5, fontSize: '0.95rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {playlist.playlist_name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: "#666", fontSize: '0.8rem', fontStyle: 'italic', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        by {playlist.owner_name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Chip label={playlist.type_name} size="small" sx={{ backgroundColor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', fontWeight: 500, fontSize: '0.65rem', height: '18px' }} />
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5, borderRadius: '6px', backgroundColor: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.2)', cursor: 'pointer', ml: 'auto',
                                                            '&:hover': { backgroundColor: "rgba(108, 99, 255, 0.2)" },
                                                        }}
                                                            onClick={(e) => { e.stopPropagation(); handleOpenPlaylist(playlist.external_url); }}>
                                                            <OpenInNewIcon sx={{ fontSize: '0.9rem', color: '#6C63FF' }} />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, width: '100%' }}>
                                                <Paper sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                                                    border: "1px solid rgba(76, 175, 80, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '60px'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                        <PeopleIcon sx={{ fontSize: '0.9rem', color: '#4caf50' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: "bold", color: "#4caf50", fontSize: '0.75rem' }}>Seguidores</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#2e7d32", fontSize: '0.85rem' }}>{formatFollowers(playlist.followers)}</Typography>
                                                </Paper>

                                                <Paper sx={{ p: 1, borderRadius: "8px", backgroundColor: "rgba(255, 152, 0, 0.1)", border: "1px solid rgba(255, 152, 0, 0.2)", textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '60px' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                        <TrendingUpIcon sx={{ fontSize: '0.9rem', color: '#ff9800' }} />
                                                        <Typography variant="caption" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.75rem' }}>Posición</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.85rem' }}>{playlist.current_position}</Typography>
                                                            <Typography variant="caption" sx={{ color: "#666", fontSize: '0.6rem' }}>Actual</Typography>
                                                        </Box>
                                                        <Box sx={{ borderLeft: '1px solid #ffcc80', height: '20px' }} />
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.85rem' }}>{playlist.top_position}</Typography>
                                                            <Typography variant="caption" sx={{ color: "#666", fontSize: '0.6rem' }}>Top</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Box>
                                        </Box>
                                    ) : isTablet ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                                    <Box component="img" src={playlist.artwork} alt={playlist.playlist_name}
                                                        sx={{
                                                            width: 75,
                                                            height: 75,
                                                            borderRadius: '8px',
                                                            objectFit: 'cover',
                                                            backgroundColor: '#6C63FF',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '0.95rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                        onError={
                                                            (e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '';
                                                                target.style.backgroundColor = '#6C63FF';
                                                                target.style.display = 'flex';
                                                                target.style.alignItems = 'center';
                                                                target.style.justifyContent = 'center';
                                                                target.style.color = 'white';
                                                                target.style.fontSize = '0.95rem';
                                                                target.style.fontWeight = 'bold';
                                                                target.textContent = `#${playlist.rank}`;
                                                            }}
                                                    />
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        left: -8,
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        backgroundColor: getRankColor(playlist.rank),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        border: '2px solid white',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                    }}>
                                                        #{playlist.rank}
                                                    </Box>
                                                </Box>

                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 0.5, fontSize: '1rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {playlist.playlist_name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: "#666", fontSize: '0.85rem', fontStyle: 'italic', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        by {playlist.owner_name}
                                                    </Typography>
                                                    <Chip label={playlist.type_name} size="small" sx={{ backgroundColor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', fontWeight: 500, fontSize: '0.7rem', height: '20px' }} />
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, width: '100%' }}>
                                                <Paper sx={{
                                                    p: 1.5, borderRadius: "8px", backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.2)", textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '70px'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                        <PeopleIcon sx={{ fontSize: '1rem', color: '#4caf50' }} />
                                                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#4caf50", fontSize: '0.85rem' }}>Seguidores</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#2e7d32", fontSize: '0.9rem' }}>{formatFollowers(playlist.followers)}</Typography>
                                                </Paper>

                                                <Paper sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                                                    border: "1px solid rgba(255, 152, 0, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '70px'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                        <TrendingUpIcon sx={{ fontSize: '1rem', color: '#ff9800' }} />
                                                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.85rem' }}>Posición</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.9rem' }}>{playlist.current_position}</Typography>
                                                            <Typography variant="caption" sx={{ color: "#666", fontSize: '0.65rem' }}>Actual</Typography>
                                                        </Box>
                                                        <Box sx={{ borderLeft: '1px solid #ffcc80', height: '20px' }} />
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.9rem' }}>{playlist.top_position}</Typography>
                                                            <Typography variant="caption" sx={{ color: "#666", fontSize: '0.65rem' }}>Top</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>

                                                <Paper sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(108, 99, 255, 0.1)",
                                                    border: "1px solid rgba(108, 99, 255, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '70px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': { backgroundColor: "rgba(108, 99, 255, 0.2)" },
                                                }}
                                                    onClick={() => handleOpenPlaylist(playlist.external_url)}>
                                                    <OpenInNewIcon sx={{ fontSize: '1rem', color: '#6C63FF', mb: 0.5 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#6C63FF", fontSize: '0.85rem' }}>Abrir</Typography>
                                                    <Typography variant="caption" sx={{ color: "#666", fontSize: '0.65rem' }}>en Spotify</Typography>
                                                </Paper>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
                                            <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                                <Box component="img" src={playlist.artwork} alt={playlist.playlist_name} sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    backgroundColor: '#6C63FF',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '1.2rem',
                                                    fontWeight: 'bold'
                                                }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '';
                                                        target.style.backgroundColor = '#6C63FF';
                                                        target.style.display = 'flex';
                                                        target.style.alignItems = 'center';
                                                        target.style.justifyContent = 'center';
                                                        target.style.color = 'white';
                                                        target.style.fontSize = '1.2rem';
                                                        target.style.fontWeight = 'bold';
                                                        target.textContent = `#${playlist.rank}`;
                                                    }}
                                                />
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    left: -8,
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    backgroundColor: getRankColor(playlist.rank),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold',
                                                    border: '2px solid white',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}>
                                                    #{playlist.rank}
                                                </Box>
                                            </Box>

                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 0.5, fontSize: '1rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {playlist.playlist_name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#666", fontSize: '0.85rem', fontStyle: 'italic', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    by {playlist.owner_name}
                                                </Typography>
                                                <Chip label={playlist.type_name} size="small" sx={{ backgroundColor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', fontWeight: 500, fontSize: '0.7rem', height: '20px' }} />
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                                <Paper sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                                                    border: "1px solid rgba(76, 175, 80, 0.2)",
                                                    textAlign: 'center',
                                                    minWidth: 150,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'flex-start', mb: 0.5 }}>
                                                        <PeopleIcon sx={{ fontSize: '1.2rem', color: '#4caf50', mb: 0.5, mr: 2 }} />
                                                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#4caf50", fontSize: '0.9rem' }}>Seguidores</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#2e7d32", fontSize: '0.9rem' }}>{formatFollowers(playlist.followers)}</Typography>
                                                    <Typography variant="caption" sx={{ color: "#666", fontSize: '0.7rem' }}>Seguidores</Typography>
                                                </Paper>

                                                <Paper sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                                                    border: "1px solid rgba(255, 152, 0, 0.2)",
                                                    textAlign: 'center',
                                                    minWidth: 150,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'flex-start', mb: 0.5 }}>
                                                        <TrendingUpIcon sx={{ fontSize: '1.2rem', color: '#ff9800', mb: 0.5, mr: 2 }} />
                                                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.9rem' }}>Posición</Typography>
                                                    </Box>
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.9rem' }}>{playlist.current_position}</Typography>
                                                            <Typography variant="caption" sx={{ color: "#666", fontSize: '0.6rem' }}>Actual</Typography>
                                                        </Box>
                                                        <Box sx={{ borderLeft: '1px solid #ffcc80', height: '20px', mx: 0.5 }} />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#ef6c00", fontSize: '0.9rem' }}>{playlist.top_position}</Typography>
                                                            <Typography variant="caption" sx={{ color: "#666", fontSize: '0.6rem' }}>Top</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Paper>

                                                <Paper sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(108, 99, 255, 0.1)",
                                                    border: "1px solid rgba(108, 99, 255, 0.2)",
                                                    textAlign: 'center',
                                                    minWidth: 100,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': { backgroundColor: "rgba(108, 99, 255, 0.2)" },
                                                }}
                                                    onClick={() => handleOpenPlaylist(playlist.external_url)}>
                                                    <OpenInNewIcon sx={{ fontSize: '1.2rem', color: '#6C63FF', mb: 0.5 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#6C63FF", fontSize: '0.8rem' }}>Abrir</Typography>
                                                    <Typography variant="caption" sx={{ color: "#666", fontSize: '0.6rem' }}>en Spotify</Typography>
                                                </Paper>
                                            </Box>
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                )}

                {playlists.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 1 : 0 }}>
                        <Typography variant="body2" sx={{ color: "#666", fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Total de playlists: {playlists.length}</Typography>
                        <Typography variant="body2" sx={{ color: "#666", fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Seguidores totales: {formatFollowers(playlists.reduce((total, playlist) => total + (playlist.followers || 0), 0))}</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}