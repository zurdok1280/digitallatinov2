import React, { useState, useEffect } from "react";
import BusinessIcon from '@mui/icons-material/Business';


/*
Componente que muestra la información básica de la canción, como:
 título, 
 artista, 
 disquera  
 avatar.
En desuso momentáneamente.
*/


import {
    Box,
    Typography,
    Chip,
    CircularProgress,
    Paper,
} from "@mui/material";
import { digitalLatinoApi } from "@/lib/api";

export interface SongHeaderInfoProps {
    csSong: number;
}

interface SongBasicInfo {
    id: string;
    avatar: string;
    background: string;
    title: string;
    artist: string;
    label: string;
    url: string;
}

export default function SongHeaderInfo({ csSong }: SongHeaderInfoProps) {
    const [songInfo, setSongInfo] = useState<SongBasicInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para obtener datos básicos de la canción
    const fetchSongInfo = async () => {
        if (!csSong) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching song info for:', csSong);

            // Llamar a la API para obtener información básica
            const response = await digitalLatinoApi.getSongById(csSong);
            console.log('Song info response:', response.data);

            setSongInfo(response.data);
        } catch (err) {
            console.error('Error fetching song info:', err);
            setError("No se pudieron cargar los datos de la canción");
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar datos cuando cambia csSong
    useEffect(() => {
        if (csSong) {
            fetchSongInfo();
        }
    }, [csSong]);

    if (loading) {
        return (
            <Paper
                sx={{
                    p: 3,
                    borderRadius: "16px",
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    textAlign: 'center',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
                </Box>
            </Paper>
        );
    }

    if (error || !songInfo) {
        return (
            <Paper
                sx={{
                    p: 3,
                    borderRadius: "16px",
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    textAlign: 'center',
                    border: "1px solid #ffcdd2",
                }}
            >
                <Typography color="error" variant="body2">
                    {error || "No se encontró información de la canción"}
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                p: 4,
                borderRadius: "20px",
                backgroundColor: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                textAlign: 'center',
                border: "1px solid #f0f0f0",
                maxWidth: "1020px",
                mx: 'auto',
                mb: 3,
            }}
        >
            {/* Imagen circular con borde morado */}
            <Box
                sx={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '4px solid',
                        borderColor: 'primary.main',
                        padding: '4px',
                        background: 'linear-gradient(135deg, #6C63FF, #9C27B0)',
                        boxShadow: '0 8px 25px rgba(108, 99, 255, 0.3)',
                    }}
                >
                    <Box
                        component="img"
                        src={songInfo.avatar || songInfo.url}
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid white',
                        }}
                        onError={(e) => {
                            // Fallback si la imagen no carga
                            const target = e.target as HTMLImageElement;

                        }}
                    />
                </Box>

                {/* Efecto de brillo sutil */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-2px',
                        left: '-2px',
                        right: '-2px',
                        bottom: '-2px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.4), transparent)',
                        opacity: 0.6,
                        pointerEvents: 'none',
                    }}
                />
            </Box>

            {/* Nombre de la canción */}
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    mb: 2,
                    lineHeight: 1.3,
                    fontSize: {
                        xs: '1.25rem',
                        md: '1.5rem',
                    },
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                {songInfo.title}
            </Typography>

            {/* Chip del artista */}
            <Chip
                label={songInfo.artist}
                sx={{
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: '22px',
                    mb: 2,
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                        backgroundColor: '#eeeeee',
                    },
                }}
            />

            {/* Disquera (Label) */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    color: '#888',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    maxWidth: '280px',
                    mx: 'auto',
                }}
            >
                <BusinessIcon
                    sx={{
                        color: '#1a1a1a',
                        opacity: 0.7,
                    }}
                />
                <Typography
                    variant="body2"
                    sx={{
                        color: '#1a1a1a',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        borderRadius: '8px',
                        padding: '8px 12px',

                    }}
                >
                    {songInfo.label}
                </Typography>
            </Box>

            {/* Efecto decorativo inferior */}
            <Box
                sx={{
                    mt: 3,
                    height: '4px',
                    background: 'linear-gradient(90deg, transparent, #6C63FF, transparent)',
                    borderRadius: '2px',
                    opacity: 0.6,
                }}
            />
        </Paper>
    );
}