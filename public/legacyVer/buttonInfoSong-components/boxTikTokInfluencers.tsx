import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, CircularProgress, Stack, useMediaQuery, useTheme } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import { digitalLatinoApi, TikTokUse } from "@/lib/api";
import tiktokIcon from '/src/assets/covers/icons/tiktok-icon.png';

export interface BoxTikTokInfluencersProps {
    csSong: number;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

export default function BoxTikTokInfluencers({ csSong }: BoxTikTokInfluencersProps) {
    const [tiktokUses, setTiktokUses] = useState<TikTokUse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    const fetchTikTokUses = async () => {
        if (!csSong) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await digitalLatinoApi.getTikTokUses(csSong);
            setTiktokUses(response.data);
        } catch (err) {
            console.error('Error fetching TikTok uses:', err);
            setError("No se pudieron cargar los videos de TikTok");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTikTokUses();
    }, [csSong]);

    const handleOpenVideo = (userHandle: string, videoId: string) => {
        const url = `https://www.tiktok.com/@${userHandle}/video/${videoId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleOpenProfile = (userHandle: string) => {
        const url = `https://www.tiktok.com/@${userHandle}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const containerStyles = {
        border: "1px solid #E0E0E0",
        borderRadius: "12px",
        p: isMobile ? 2 : 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        backgroundColor: "white",
        mb: isMobile ? 2 : 3,
        width: '100%',
    };

    if (loading) {
        return (
            <Box sx={containerStyles}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box
                        component="img"
                        src={tiktokIcon}
                        alt="TikTok"
                        sx={{ width: isMobile ? 20 : 24, height: isMobile ? 20 : 24 }}
                    />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#000000",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
                    >
                        Videos con mi canción
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", py: isMobile ? 3 : 4 }}>
                    <CircularProgress
                        size={isMobile ? 20 : 24}
                        sx={{ color: "#000000" }}
                    />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    ...containerStyles,
                    border: "1px solid #ffcdd2",
                    backgroundColor: "#ffebee"
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box
                        component="img"
                        src={tiktokIcon}
                        alt="TikTok"
                        sx={{ width: isMobile ? 20 : 24, height: isMobile ? 20 : 24 }}
                    />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#d32f2f",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
                    >
                        Videos used my song
                    </Typography>
                </Box>
                <Typography
                    color="error"
                    variant="body2"
                    sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                >
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={containerStyles}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: isMobile ? 2 : 3,
                    width: '100%'
                }}
            >
                <Box
                    component="img"
                    src={tiktokIcon}
                    alt="TikTok"
                    sx={{ width: isMobile ? 20 : 24, height: isMobile ? 20 : 24 }}
                />
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: "#000000",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                >
                    Videos con mi canción
                </Typography>
            </Box>

            {tiktokUses.length === 0 ? (
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: 'center',
                        color: '#666',
                        py: isMobile ? 3 : 4,
                        fontStyle: 'italic',
                        fontSize: isMobile ? '0.8rem' : '0.875rem'
                    }}
                >
                    No se encontraron videos de TikTok para esta canción
                </Typography>
            ) : (
                <Box
                    sx={{
                        maxHeight: isMobile ? '400px' : '550px',
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': {
                            width: '6px'
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f1f1',
                            borderRadius: '4px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#c1c1c1',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: '#a8a8a8'
                            }
                        },
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#c1c1c1 #f1f1f1'
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tiktokUses.map((tiktokUse) => (
                            <Paper
                                key={tiktokUse.video_id}
                                elevation={1}
                                sx={{
                                    p: isMobile ? 1.5 : 2,
                                    borderRadius: "12px",
                                    backgroundColor: "#f8f9fa",
                                    border: "1px solid #e0e0e0",
                                    transition: "all 0.2s ease",
                                    width: '100%',
                                    '&:hover': {
                                        transform: isMobile ? 'none' : "translateY(-2px)",
                                        boxShadow: isMobile ? 'none' : "0 4px 12px rgba(0,0,0,0.1)",
                                        backgroundColor: "#ffffff"
                                    }
                                }}
                            >
                                {isMobile ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#333",
                                                        mb: 0.5,
                                                        fontSize: '0.9rem',
                                                        lineHeight: 1.2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            color: '#000000',
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                    onClick={() => handleOpenVideo(tiktokUse.user_handle, tiktokUse.video_id)}
                                                >
                                                    #{tiktokUse.rk} - {tiktokUse.username}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                    <PeopleIcon sx={{ fontSize: '0.8rem', color: '#666' }} />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#666",
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {formatNumber(tiktokUse.tiktok_user_followers)} Seguidores
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "#666",
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            color: '#000000',
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                    onClick={() => handleOpenProfile(tiktokUse.user_handle)}
                                                >
                                                    @{tiktokUse.user_handle}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 0.5,
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: "rgba(0, 0, 0, 0.2)"
                                                    }
                                                }}
                                                onClick={() => handleOpenVideo(tiktokUse.user_handle, tiktokUse.video_id)}
                                            >
                                                <OpenInNewIcon sx={{ fontSize: '0.9rem', color: '#000000' }} />
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, width: '100%' }}>
                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(33, 33, 33, 0.1)",
                                                    border: "1px solid rgba(33, 33, 33, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '55px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.3, gap: 0.5 }}>
                                                    <VisibilityIcon sx={{ fontSize: '0.8rem', color: '#000000' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#000000",
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        Vistas
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#000000",
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.views_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(255, 0, 80, 0.1)",
                                                    border: "1px solid rgba(255, 0, 80, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '55px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.3, gap: 0.5 }}>
                                                    <FavoriteIcon sx={{ fontSize: '0.8rem', color: '#ff0050' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#ff0050",
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        Likes
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#ff0050",
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.likes_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(0, 242, 234, 0.1)",
                                                    border: "1px solid rgba(0, 242, 234, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '55px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.3, gap: 0.5 }}>
                                                    <ChatBubbleOutlineIcon sx={{ fontSize: '0.8rem', color: '#00f2ea' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#00a29c",
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        Comentarios
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#00a29c",
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.comments_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(37, 244, 238, 0.1)",
                                                    border: "1px solid rgba(37, 244, 238, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '55px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.3, gap: 0.5 }}>
                                                    <ShareIcon sx={{ fontSize: '0.8rem', color: '#25f4ee' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#25f4ee",
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        Compartidos
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#25f4ee",
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.shares_total)}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                ) : isTablet ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#333",
                                                        mb: 0.5,
                                                        fontSize: '0.95rem',
                                                        lineHeight: 1.2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            color: '#000000',
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                    onClick={() => handleOpenVideo(tiktokUse.user_handle, tiktokUse.video_id)}
                                                >
                                                    #{tiktokUse.rk} - {tiktokUse.username}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <PeopleIcon sx={{ fontSize: '0.9rem', color: '#666' }} />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#666",
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {formatNumber(tiktokUse.tiktok_user_followers)} Seguidores
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "#666",
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            color: '#000000',
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                    onClick={() => handleOpenProfile(tiktokUse.user_handle)}
                                                >
                                                    @{tiktokUse.user_handle}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, width: '100%' }}>
                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(33, 33, 33, 0.1)",
                                                    border: "1px solid rgba(33, 33, 33, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '65px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                    <VisibilityIcon sx={{ fontSize: '0.9rem', color: '#000000' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#000000",
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Vistas
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#000000",
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.views_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(255, 0, 80, 0.1)",
                                                    border: "1px solid rgba(255, 0, 80, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '65px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                    <FavoriteIcon sx={{ fontSize: '0.9rem', color: '#ff0050' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#ff0050",
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Likes
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#ff0050",
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.likes_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(0, 242, 234, 0.1)",
                                                    border: "1px solid rgba(0, 242, 234, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '65px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                    <ChatBubbleOutlineIcon sx={{ fontSize: '0.9rem', color: '#00f2ea' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#00a29c",
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Comentarios
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#00a29c",
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.comments_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(37, 244, 238, 0.1)",
                                                    border: "1px solid rgba(37, 244, 238, 0.2)",
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height: '65px'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.5 }}>
                                                    <ShareIcon sx={{ fontSize: '0.9rem', color: '#25f4ee' }} />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#25f4ee",
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Compartidos
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#25f4ee",
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.shares_total)}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "#333",
                                                    mb: 1,
                                                    fontSize: '1rem',
                                                    lineHeight: 1.3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        color: '#000000',
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                                onClick={() => handleOpenVideo(tiktokUse.user_handle, tiktokUse.video_id)}
                                            >
                                                #{tiktokUse.rk} - {tiktokUse.username}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <PeopleIcon sx={{ fontSize: '1rem', color: '#666' }} />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "#666",
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.tiktok_user_followers)} Seguidores
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "#666",
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        color: '#000000',
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                                onClick={() => handleOpenProfile(tiktokUse.user_handle)}
                                            >
                                                @{tiktokUse.user_handle}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(33, 33, 33, 0.1)",
                                                    border: "1px solid rgba(33, 33, 33, 0.2)",
                                                    textAlign: 'center',
                                                    minWidth: 120,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'left',
                                                    justifyContent: 'flex-start',
                                                    mb: 0.5
                                                }}>
                                                    <VisibilityIcon
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            color: '#000000',
                                                            mb: 0.5,
                                                            mr: 2
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#000000",
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Visualizaciones
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#000000",
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.views_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(255, 0, 80, 0.1)",
                                                    border: "1px solid rgba(255, 0, 80, 0.2)",
                                                    textAlign: 'center',
                                                    minWidth: 120,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'left',
                                                    justifyContent: 'flex-start',
                                                    mb: 0.5
                                                }}>
                                                    <FavoriteIcon
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            color: '#ff0050',
                                                            mb: 0.5,
                                                            mr: 2
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#ff0050",
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Likes
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#ff0050",
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.likes_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(0, 242, 234, 0.1)",
                                                    border: "1px solid rgba(0, 242, 234, 0.2)",
                                                    textAlign: 'center',
                                                    minWidth: 120,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'left',
                                                    justifyContent: 'flex-start',
                                                    mb: 0.5
                                                }}>
                                                    <ChatBubbleOutlineIcon
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            color: '#00f2ea',
                                                            mb: 0.5,
                                                            mr: 2
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#00a29c",
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Comentarios
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#00a29c",
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.comments_total)}
                                                </Typography>
                                            </Paper>

                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: "8px",
                                                    backgroundColor: "rgba(37, 244, 238, 0.1)",
                                                    border: "1px solid rgba(37, 244, 238, 0.2)",
                                                    textAlign: 'center',
                                                    minWidth: 120,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'left',
                                                    justifyContent: 'flex-start',
                                                    mb: 0.5
                                                }}>
                                                    <ShareIcon
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            color: '#25f4ee',
                                                            mb: 0.5,
                                                            mr: 2
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "#25f4ee",
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        Compartidos
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#25f4ee",
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatNumber(tiktokUse.shares_total)}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}

            {tiktokUses.length > 0 && (
                <Box
                    sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: isMobile ? 1 : 0
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#666",
                            fontSize: isMobile ? '0.8rem' : '0.875rem'
                        }}
                    >
                        Total de videos: {tiktokUses.length}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#666",
                            fontSize: isMobile ? '0.8rem' : '0.875rem'
                        }}
                    >
                        Vistas totales: {formatNumber(tiktokUses.reduce((total, video) => total + (video.views_total || 0), 0))}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}