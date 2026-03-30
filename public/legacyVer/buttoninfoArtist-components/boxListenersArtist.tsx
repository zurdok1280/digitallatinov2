import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Stack, Paper, Tooltip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { DataArtistCountry, digitalLatinoApi } from "@/lib/api";

export interface ListenerItem {
    cityName: string;
    rank: number;
    currentListeners: number;
    peakListeners: number;
    part: number;
}

export interface BoxListenersArtistProps {
    label: string;
    spotifyId: string;
    selectedCountryId: string;
    onDataLoaded?: (data: ListenerItem[]) => void;
}

// Función para truncar el texto de las ciudades si es muy largo
const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};

// Componente para mostrar cada ciudad como chip con información de listeners
const ListenerCityChip = ({ city, rank }: { city: ListenerItem; rank: number }) => {
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return "#FFD700"; // Oro
            case 2: return "#C0C0C0"; // Plata
            case 3: return "#CD7F32"; // Bronce
            default: return "#6C63FF"; // Morado por defecto
        }
    };

    const truncatedName = truncateText(city.cityName, 20);

    return (
        <Tooltip
            title={
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>{city.cityName}</Typography>
                    <Typography variant="body2">Ranking: <strong>#{city.rank}</strong></Typography>
                    {/*<Typography variant="body2">Audiencia actual: <strong>{city.currentListeners.toLocaleString()}</strong></Typography>
                    <Typography variant="body2">Pico de audiencia: <strong>{city.peakListeners.toLocaleString()}</strong></Typography>*/}
                </Box>
            }
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: "white",
                        color: "text.primary",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                        border: "1px solid",
                        borderColor: "divider",
                        fontSize: "12px",
                        fontWeight: "500",
                        "& .MuiTooltip-arrow": { color: "white" }
                    }
                }
            }}
        >
            <Paper
                elevation={1}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor: "white",
                    border: `2px solid ${getRankColor(rank)}`,
                    minWidth: "180px",
                    maxWidth: "220px",
                    width: "100%",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mb: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: getRankColor(rank), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.8rem", fontWeight: "bold", flexShrink: 0 }}>
                        #{rank}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#333", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ml: 1 }}>
                        {truncatedName}
                    </Typography>
                </Box>

                {/*<Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 14, color: "#4CAF50" }} />
                        <Typography variant="caption" sx={{ color: "#4CAF50", fontWeight: "bold" }}>
                            {city.currentListeners > 999 ? `${(city.currentListeners / 1000).toFixed(1)}K` : city.currentListeners}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: "#FF9800" }} />
                        <Typography variant="caption" sx={{ color: "#FF9800", fontWeight: "bold" }}>
                            {city.peakListeners > 999 ? `${(city.peakListeners / 1000).toFixed(1)}K` : city.peakListeners}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ width: "100%", height: 4, backgroundColor: "#E0E0E0", borderRadius: 2, mt: 1, overflow: "hidden" }}>
                    <Box sx={{ width: `${city.part * 100}%`, height: "100%", backgroundColor: getRankColor(rank), borderRadius: 2 }} />
                </Box>*/}
            </Paper>
        </Tooltip>
    );
};

export default function BoxListenersArtist({
    label,
    spotifyId,
    selectedCountryId,
    onDataLoaded
}: BoxListenersArtistProps) {
    const [listeners, setListeners] = useState<ListenerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para obtener datos de listeners por ciudad
    const fetchArtistCityData = async () => {
        if (!spotifyId || !selectedCountryId) {
            console.log("❌ Faltan datos: spotifyId o selectedCountryId");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Llamar a la API para obtener datos de listeners del artista por país
            const response = await digitalLatinoApi.getDataArtistCountry(
                parseInt(selectedCountryId),
                spotifyId
            );

            // Transformar los datos de la API al formato que necesita el componente
            const listenerData: ListenerItem[] = Array.isArray(response.data)
                ? response.data.map((city: DataArtistCountry) => ({
                    cityName: city.city_name || "Ciudad desconocida",
                    rank: city.rk || 0,
                    currentListeners: city.current_listeners || 0,
                    peakListeners: city.peak_listeners || 0,
                    part: city.part || 0
                }))
                :
                response.data
                    ? [{
                        cityName: response.data.city_name || "Ciudad desconocida",
                        rank: response.data.rk || 0,
                        currentListeners: response.data.current_listeners || 0,
                        peakListeners: response.data.peak_listeners || 0,
                        part: response.data.part || 0
                    }]
                    : [];

            // Ordenar por ranking
            const sortedData = listenerData.sort((a, b) => a.rank - b.rank);
            const top6Cities = sortedData.slice(0, 6); // Mostrar solo las top 6 ciudades
            setListeners(top6Cities);

            if (onDataLoaded) {
                onDataLoaded(listenerData);
            }
        } catch (err) {
            console.error("❌ Error en fetchArtistCityData:", err);
            setError("No se pudieron cargar los datos de audiencia del artista");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("🔄 useEffect triggered:", { selectedCountryId, spotifyId });
        if (selectedCountryId && spotifyId) {
            fetchArtistCityData();
        } else {
            console.log("❌ Faltan datos: selectedCountryId o spotifyId");
            setLoading(false);
        }
    }, [selectedCountryId, spotifyId]);

    // Dividir elementos en dos filas
    const firstRow = listeners.slice(0, 3);
    const secondRow = listeners.slice(3, 6);

    if (loading) {
        return (
            <Box sx={{ border: "1px solid #E0E0E0", borderRadius: "12px", p: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "white", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PeopleIcon sx={{ color: "#6C63FF" }} />
                    <Typography variant="subtitle2" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {label}
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
            <Box sx={{ border: "1px solid #ffcdd2", borderRadius: "12px", p: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "#ffebee", mb: 3 }}>
                <Typography color="error" variant="body2">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ border: "1px solid #E0E0E0", borderRadius: "12px", p: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "white", mb: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon sx={{ color: "#6C63FF" }} />
                    <Typography variant="subtitle2" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {label}
                    </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "#666", display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 14 }} />
                    Top ciudades por Audiencia
                </Typography>
            </Box>

            {/* Lista horizontal de ciudades con listeners */}
            <Box sx={{ width: "100%" }}>
                {/* Primera fila - Top 3 ciudades */}
                <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
                    {firstRow.map((city) => (
                        <ListenerCityChip key={`${city.cityName}-${city.rank}`} city={city} rank={city.rank} />
                    ))}
                </Stack>

                {/* Segunda fila - Ciudades 4-6 */}
                <Stack direction="row" spacing={2} sx={{ justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
                    {secondRow.map((city) => (
                        <ListenerCityChip key={`${city.cityName}-${city.rank}`} city={city} rank={city.rank} />
                    ))}
                </Stack>

                {/*{listeners.length === 0 && (
                    <Typography variant="body2" sx={{ textAlign: "center", color: "#666", py: 2 }}>
                        No hay datos de audiencia disponibles para este artista
                    </Typography>
                )}*/}

                {/* Leyenda 
                {listeners.length > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 3, pt: 2, borderTop: "1px solid #f0f0f0" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PeopleIcon sx={{ fontSize: 14, color: "#4CAF50" }} />
                            <Typography variant="caption" sx={{ color: "#666" }}>Audiencia actual</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 14, color: "#FF9800" }} />
                            <Typography variant="caption" sx={{ color: "#666" }}>Pico de audiencia</Typography>
                        </Box>
                    </Box>
                )}*/}
            </Box>
        </Box>
    );
}