import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Paper, Tooltip, Stack } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { digitalLatinoApi, Country } from "@/lib/api";

export interface SpinData {
    country?: string;
    market?: string;
    spins: number;
    rank: number;
    audience: number;
    sts: number;
}

export interface BoxElementsDisplaySpinsProps {
    csSong: number;
    countryId?: number;
    title: string;
    label: string;
    type: 'countries' | 'markets'; // Para determinar qué endpoint usar
}

// Función para truncar texto si es muy largo
const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Función opcional para obtener emoji/abreviación de bandera basado en el país
const getCountryFlag = (countryName: string): string => {
    const flagEmojis: { [key: string]: string } = {
        'USA': '🇺🇸',
        'Mexico': '🇲🇽',
        'Honduras': '🇭🇳',
        'Colombia': '🇨🇴',
        'Argentina': '🇦🇷',
        'Chile': '🇨🇱',
        'Brazil': '🇧🇷',
        'Peru': '🇵🇪',
        'Ecuador': '🇪🇨',
        'Venezuela': '🇻🇪',
        'Spain': '🇪🇸',
        'RD': '🇩🇴',
        'Centroamerica': '🌎', // Para Centroamérica usamos un emoji genérico
    };

    return flagEmojis[countryName] || '📍';
};

const formatNumber = (audience: number | undefined | null): string => {
    // Validar que audience existe y es un número válido
    if (audience === undefined || audience === null || isNaN(audience)) {
        return '0';
    }

    if (audience >= 1000000000) {
        return (audience / 1000000000).toFixed(1) + 'B';
    } else if (audience >= 1000000) {
        return (audience / 1000000).toFixed(1) + 'M';
    } else if (audience >= 1000) {
        return (audience / 1000).toFixed(1) + 'K';
    }
    return audience.toString();
};

//Función para mandar a link de aplicación web de radio
const handleVerMas = () => {
    const verMasUrl = 'https://smart.monitorlatino.com/';
    window.open(verMasUrl, '_blank');
};

// Componente para mostrar cada item (país o mercado)
const SpinItem = ({ item, rank }: { item: SpinData, rank: number }) => {
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return "#FFD700"; // Oro
            case 2: return "#C0C0C0"; // Plata
            case 3: return "#CD7F32"; // Bronce
            default: return "#6C63FF"; // Morado por defecto
        }
    };

    const displayName = item.country || item.market || 'N/A';
    const truncatedName = truncateText(displayName, 20);
    const isCountry = !!item.country;

    return (
        <Tooltip
            title={displayName}
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: 'white',
                        color: 'text.primary',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: '12px',
                        fontWeight: '450',
                        '& .MuiTooltip-arrow': {
                            color: 'white',
                        }
                    }
                }
            }}
        >
            <Paper
                elevation={1}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    border: `2px solid ${getRankColor(rank)}`,
                    minWidth: '140px',
                    maxWidth: '190px',
                    width: '100%',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }
                }}
            >
                {/* Badge de rank */}
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: getRankColor(rank),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    #{rank}
                </Box>

                {/* Contenido */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 700,
                                color: "#333",
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.85rem',
                            }}
                        >
                            {isCountry ? getCountryFlag(displayName) : '🏙️'} {truncatedName}
                        </Typography>
                    </Box>
                    <Box className="flex items-start gap-1">
                        <Typography
                            variant="caption"
                            onClick={handleVerMas}
                            sx={{
                                color: '#666',
                                fontWeight: 600,
                                display: 'block',
                                fontSize: '0.75rem',
                            }}
                        >
                            {`${item.sts} Estaciones`}
                        </Typography>
                    </Box>
                    <Box className="flex items-start gap-1">
                        <OpenInNewIcon fontSize="small" sx={{ color: '#666' }} />
                        <Typography
                            variant="caption"
                            onClick={handleVerMas}
                            sx={{
                                color: '#666',
                                fontWeight: 600,
                                display: 'block',
                                fontSize: '0.75rem',
                            }}
                        >
                            Ver más
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Tooltip>
    );
};

export default function BoxElementsDisplayAudience({
    csSong,
    countryId,
    title,
    label,
    type
}: BoxElementsDisplaySpinsProps) {
    const [spinData, setSpinData] = useState<SpinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para obtener datos de spins
    const fetchSpinData = async () => {
        if (!csSong) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let response;

            if (type === 'countries') {
                // Endpoint para países
                response = await digitalLatinoApi.getTopRadioCountries(csSong);
            } else {
                // Endpoint para mercados (requiere countryId)
                if (!countryId) {
                    throw new Error('countryId es requerido para mercados');
                }
                response = await digitalLatinoApi.getTopMarketRadio(csSong, countryId);
            }

            // Ordenar por rank y tomar los top 8
            const sortedData = response.data
                .sort((a: SpinData, b: SpinData) => a.rank - b.rank)
                .slice(0, 8);

            setSpinData(sortedData);
        } catch (err) {
            console.error(`Error fetching ${type} spin data:`, err);
            setError(`No se pudieron cargar los datos de ${label}`);
        } finally {
            setLoading(false);
        }
    };

    // UseEffect para cargar datos cuando cambian las props
    useEffect(() => {
        if (csSong) {
            fetchSpinData();
        }
    }, [csSong, countryId, type]);

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
                    <EmojiEventsIcon sx={{ color: "#6C63FF" }} />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#6C63FF",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {title}
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <EmojiEventsIcon sx={{ color: "#d32f2f" }} />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "#d32f2f",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </Box>
        );
    }

    // Dividir datos en dos filas para mejor visualización
    const firstRow = spinData.slice(0, 4);
    const secondRow = spinData.slice(4, 8);

    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                p: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                backgroundColor: "white",
                mb: 3,
                width: '100%'
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <EmojiEventsIcon sx={{ color: "#6C63FF" }} />
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: "#6C63FF",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    {title}
                </Typography>
            </Box>

            {/* Lista de items */}
            <Box sx={{ width: '100%' }}>
                {/* Primera fila - Top 4 */}
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        justifyContent: 'center',
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    {firstRow.map((item) => (
                        <SpinItem key={item.rank} item={item} rank={item.rank} />
                    ))}
                </Stack>

                {/* Segunda fila - Items 5-8 */}
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    {secondRow.map((item) => (
                        <SpinItem key={item.rank} item={item} rank={item.rank} />
                    ))}
                </Stack>

                {spinData.length === 0 && (
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            color: '#666',
                            py: 4,
                            fontStyle: 'italic'
                        }}
                    >
                        No se encontró información de {label}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}