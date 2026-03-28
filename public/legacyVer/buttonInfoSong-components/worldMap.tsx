import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { CityDataForSong } from "@/lib/api";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorldMapProps {
    cities: CityDataForSong[];
    title?: string;
    height?: number;
    loading?: boolean;
}

// Función para determinar el color del marcador basado en el ranking
const getMarkerColor = (rank: number): string => {
    if (rank === 1) return '#FFD700'; // Oro
    if (rank === 2) return '#C0C0C0'; // Plata  
    if (rank === 3) return '#CD7F32'; // Bronce
    return '#6C63FF'; // Morado por defecto
};

// Función para determinar el tamaño del marcador basado en el ranking
const getMarkerSize = (rank: number): number => {
    if (rank === 1) return 32; // Oro - más grande
    if (rank === 2) return 28; // Plata - mediano
    if (rank === 3) return 24; // Bronce - segundo más pequeño
    return 22; // Default - más pequeño
};

// Función para determinar el tamaño de fuente basado en el ranking
const getFontSize = (rank: number): string => {
    if (rank === 1) return '14px';
    if (rank === 2) return '12px';
    if (rank === 3) return '11px';
    return '10px';
};

// Crear panes para diferentes niveles
const createMapPanes = (map: L.Map) => {
    // Pane para marcadores normales (abajo)
    if (!map.getPane('markers-normal')) {
        map.createPane('markers-normal');
        const normalPane = map.getPane('markers-normal');
        if (normalPane) {
            normalPane.style.zIndex = '300';
        }
    }

    // Pane para bronce
    if (!map.getPane('markers-bronze')) {
        map.createPane('markers-bronze');
        const bronzePane = map.getPane('markers-bronze');
        if (bronzePane) {
            bronzePane.style.zIndex = '400';
        }
    }

    // Pane para plata
    if (!map.getPane('markers-silver')) {
        map.createPane('markers-silver');
        const silverPane = map.getPane('markers-silver');
        if (silverPane) {
            silverPane.style.zIndex = '500';
        }
    }

    // Pane para oro (más alto)
    if (!map.getPane('markers-gold')) {
        map.createPane('markers-gold');
        const goldPane = map.getPane('markers-gold');
        if (goldPane) {
            goldPane.style.zIndex = '600';
        }
    }
};

// Función para obtener el nombre del pane según el rank
const getPaneName = (rank: number): string => {
    if (rank === 1) return 'markers-gold';
    if (rank === 2) return 'markers-silver';
    if (rank === 3) return 'markers-bronze';
    return 'markers-normal';
};

// Crear iconos personalizados para cada ranking
const createCustomIcon = (rank: number) => {
    const size = getMarkerSize(rank);
    const fontSize = getFontSize(rank);

    return L.divIcon({
        html: `
      <div style="
        background-color: ${getMarkerColor(rank)};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${fontSize};
      ">
        ${rank}
      </div>
    `,
        className: `custom-marker rank-${rank}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// Formatear números para mostrar
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
};

export default function WorldMap({
    cities,
    title = "📍 Distribución Global de la Canción",
    height = 400,
    loading = false
}: WorldMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    // Filtrar ciudades con coordenadas válidas
    const validCities = cities
        .filter(city => city.citylat && city.citylng && city.cityname)
        .slice(0, 100);

    useEffect(() => {
        if (!mapRef.current) return;

        // Inicializar el mapa
        const map = L.map(mapRef.current, {
            minZoom: 2, // Límite mínimo de zoom (zoom out)
            maxZoom: 18, // Límite máximo de zoom (zoom in)
            zoomControl: true
        }).setView([20, 0], 2);
        mapInstanceRef.current = map;

        // Crear panes para controlar z-index
        createMapPanes(map);

        // Agregar capa de tiles (se puede usar diferentes proveedores, mientras permita uso libre)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Crear grupo de marcadores
        markersRef.current = L.layerGroup().addTo(map);

        // Agregar marcadores si hay ciudades válidas
        if (validCities.length > 0) {
            validCities.forEach(city => {
                const paneName = getPaneName(city.rnk || 1);
                const marker = L.marker([city.citylat!, city.citylng!], {
                    icon: createCustomIcon(city.rnk || 1),
                    pane: paneName
                }).addTo(markersRef.current!);

                // Tooltip en hover
                marker.bindTooltip(`
        <div style="font-weight: bold; color: #333;">${city.cityname}</div>
        <div style="color: #666;">Rank: #${city.rnk}</div>
        <div style="color: #666;">Oyentes: ${city.listeners ? formatNumber(city.listeners) : '0'}</div>
      `, {
                    permanent: false,
                    direction: 'top',
                    className: 'custom-tooltip'
                });

                // Popup al hacer click
                marker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${city.cityname}</h4>
          <p style="margin: 4px 0; color: #666;">
            <strong>Rank:</strong> #${city.rnk}<br/>
            <strong>Oyentes:</strong> ${city.listeners ? formatNumber(city.listeners) : '0'}<br/>
            <strong>Coordenadas:</strong> ${city.citylat?.toFixed(4)}, ${city.citylng?.toFixed(4)}
          </p>
        </div>
      `);
            });

            // Ajustar el zoom para mostrar todos los marcadores
            if (validCities.length > 0) {
                const group = L.featureGroup(
                    validCities.map(city => L.marker([city.citylat!, city.citylng!]))
                );
                map.fitBounds(group.getBounds().pad(0.1));
            }
        }

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Efecto para actualizar marcadores cuando cambian las ciudades
    useEffect(() => {
        if (!mapInstanceRef.current || !markersRef.current) return;

        // Limpiar marcadores anteriores
        markersRef.current.clearLayers();

        // Agregar nuevos marcadores si hay ciudades válidas
        if (validCities.length > 0) {
            addMarkersToMap(mapInstanceRef.current, markersRef.current, validCities);

            // Ajustar el zoom para mostrar todos los marcadores
            const group = L.featureGroup(
                validCities.map(city => L.marker([city.citylat!, city.citylng!]))
            );
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
    }, [validCities]);

    // Función auxiliar para agregar marcadores al mapa
    const addMarkersToMap = (map: L.Map, layerGroup: L.LayerGroup, cities: CityDataForSong[]) => {
        cities.forEach((city) => {
            const paneName = getPaneName(city.rnk || 1);
            const marker = L.marker([city.citylat!, city.citylng!], {
                icon: createCustomIcon(city.rnk || 1),
                pane: paneName
            }).addTo(layerGroup);

            // Tooltip en hover
            marker.bindTooltip(`
        <div style="font-weight: bold;">${city.cityname}</div>
        <div>Rank: #${city.rnk}</div>
        <div>Oyentes: ${city.listeners ? formatNumber(city.listeners) : '0'}</div>
      `, {
                permanent: false,
                direction: 'top',
                className: 'custom-tooltip'
            });

            // Popup al hacer click
            marker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${city.cityname}</h4>
          <p style="margin: 4px 0; color: #666;">
            <strong>Rank:</strong> #${city.rnk}<br/>
            <strong>Oyentes:</strong> ${city.listeners ? formatNumber(city.listeners) : '0'}<br/>
            <strong>Coordenadas:</strong> ${city.citylat?.toFixed(4)}, ${city.citylng?.toFixed(4)}
          </p>
        </div>
      `);
        });
    };

    //Estado de carga
    if (loading) {
        return (
            <Box sx={{ mt: 3 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: "#6C63FF",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 2
                    }}
                >
                    {title}
                </Typography>
                <Paper
                    elevation={1}
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        p: 3,
                        border: '1px solid #E0E0E0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        textAlign: 'center',
                        py: 6
                    }}
                >
                    <CircularProgress size={24} sx={{ color: "#6C63FF", mb: 2 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Cargando datos del mapa...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 1, mb: 3 }}>
            <Paper
                elevation={1}
                sx={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    p: 3,
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: "#6C63FF",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 2
                    }}
                >
                    {title}
                </Typography>
                {/* Mapa Leaflet */}
                <Box
                    ref={mapRef}
                    sx={{
                        width: '100%',
                        height: height,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        mb: 2,
                        border: '1px solid #e0e0e0'
                    }}
                />

                {/* Leyenda del mapa actualizada con tamaños */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    mb: 2,
                    flexWrap: 'wrap'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: '#FFD700',
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#1 Oro (Grande)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: '#C0C0C0',
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#2 Plata (Mediano)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: '#CD7F32',
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#3 Bronce</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: '#6C63FF',
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Otros (Pequeño)</Typography>
                    </Box>
                </Box>

                {/* Información de ciudades */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
                    gap: 1.5
                }}>
                    {validCities.slice(0, 5).map((city) => (
                        <Paper
                            key={city.cityid || city.cityname}
                            elevation={0}
                            sx={{
                                backgroundColor: 'grey.50',
                                borderRadius: '8px',
                                p: 1.5,
                                border: '1px solid',
                                borderColor: 'grey.200',
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 'bold',
                                    color: 'text.primary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 0.5
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                    }}
                                    style={{ backgroundColor: getMarkerColor(city.rnk || 1) }}
                                />
                                {city.cityname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                #{city.rnk} • {city.listeners ? formatNumber(city.listeners) : '0'} oyentes
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                {validCities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>🌎</Typography>
                        <Typography variant="body2">No hay datos de ubicación disponibles</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                            Las ciudades no tienen coordenadas geográficas o no se pudieron cargar
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}