import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { createPortal } from 'react-dom';
import RecommendationsModal from './Recommendations';

interface BoxCampaignProps {
    spotifyId?: string;
    csSong?: number;
    songName?: string;
    artistName?: string;
}

const BoxCampaign: React.FC<BoxCampaignProps> = ({ spotifyId, csSong, songName, artistName }) => {
    const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);

    const handleOpenRecommendations = () => {
        setIsRecommendationsOpen(true);
    };

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    borderRadius: "16px",
                    p: 2.5,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    backgroundColor: "white",
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    border: "2px solid #6C63FF",
                    width: '100%',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    zIndex: 1000,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        textAlign: { xs: 'center', sm: 'left' },
                    }}
                >
                    {/* Texto */}
                    <Box sx={{ maxWidth: '800px', flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "#1a1a1a",
                                fontWeight: "bold",
                                fontSize: { xs: '1rem', sm: '1.2rem' },
                                lineHeight: 1.4,
                                mb: 1,
                            }}
                        >
                            Haz que tu música llegue donde nunca antes había llegado
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#666",
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            }}
                        >
                            Descubre estrategias personalizadas para impulsar {songName ? `"${songName}"` : 'tu música'}
                        </Typography>
                    </Box>

                    {/* Botón de Recomendaciones */}
                    <Button
                        variant="contained"
                        onClick={handleOpenRecommendations}
                        sx={{
                            backgroundColor: "#6C63FF",
                            color: "white",
                            borderRadius: "12px",
                            px: 4,
                            py: 1.5,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            fontWeight: 600,
                            textTransform: 'none',
                            minWidth: { xs: '180px', sm: '220px' },
                            boxShadow: '0 4px 16px rgba(108, 99, 255, 0.4)',
                            transition: 'all 0.3s ease',
                            flexShrink: 0,
                            '&:hover': {
                                backgroundColor: "#5a52d5",
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(108, 99, 255, 0.5)',
                            },
                        }}
                    >
                        Ver Recomendaciones
                    </Button>
                </Box>
            </Paper>

            {/* Modal de Recomendaciones - Renderizado con Portal */}
            {csSong && isRecommendationsOpen && createPortal(
                <RecommendationsModal
                    csSong={csSong}
                    songName={songName}
                    spotifyId={spotifyId}
                    isOpen={isRecommendationsOpen}
                    onClose={() => setIsRecommendationsOpen(false)}
                />,
                document.body
            )}
        </>
    );
};

export default BoxCampaign;