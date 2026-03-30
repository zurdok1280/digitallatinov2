import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert
} from "@mui/material";
import { DataArtistCountry, digitalLatinoApi } from "@/lib/api";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorldMapArtistProps {
    countryId: number;
    spotifyId: string;
    title?: string;
    height?: number;
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

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
};

export default function WorldMapArtist({
    countryId,
    spotifyId,
    title = "📍 Distribución por Ciudades del Artista",
    height = 400
}: WorldMapArtistProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    const [citiesData, setCitiesData] = useState<DataArtistCountry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);

    const checkContainerReady = useCallback(() => {
        if (!mapRef.current) {
            console.log('❌ mapRef.current es null');
            return false;
        }

        const rect = mapRef.current.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;

        return isVisible;
    }, []);

    // Función para inicializar el mapa
    const initializeMap = useCallback(() => {

        if (mapInstanceRef.current || mapLoading) {
            return;
        }

        if (!checkContainerReady()) {
            console.log('❌ Contenedor no está listo');
            return;
        }

        setMapLoading(true);

        try {
            const map = L.map(mapRef.current!, {
                minZoom: 2,
                maxZoom: 18,
                zoomControl: true,
                attributionControl: false
            }).setView([20, 0], 2);

            mapInstanceRef.current = map;

            // Agregar capas base con un pequeño retraso
            setTimeout(() => {
                if (!mapInstanceRef.current) return;

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(mapInstanceRef.current);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(mapInstanceRef.current);

                // Crear grupo de marcadores
                markersRef.current = L.layerGroup().addTo(mapInstanceRef.current);

                setMapInitialized(true);
                setMapLoading(false);

                requestAnimationFrame(() => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize();
                    }
                });
            }, 50);

        } catch (mapError) {
            console.error('❌ Error inicializando mapa:', mapError);
            setError(`Error al inicializar el mapa: ${mapError}`);
            setMapLoading(false);
        }
    }, [checkContainerReady, mapLoading]);

    // Inicializar el mapa 
    useEffect(() => {

        initializeMap();

        // Reintentar inicializar
        let retryInterval: NodeJS.Timeout;
        let retryCount = 0;
        const maxRetries = 10; // Máximo 10 intentos (5 segundos)

        if (!mapInstanceRef.current && !mapLoading) {
            retryInterval = setInterval(() => {
                retryCount++;
                console.log(`🔄 Reintento #${retryCount} de inicialización del mapa`);

                if (checkContainerReady()) {
                    console.log('✅ Contenedor listo en reintento');
                    initializeMap();
                }

                if (retryCount >= maxRetries || mapInstanceRef.current) {
                    console.log('⏹️ Deteniendo reintentos');
                    clearInterval(retryInterval);
                }
            }, 500); // Reintentar cada 500ms
        }

        return () => {
            if (retryInterval) clearInterval(retryInterval);
        };
    }, [initializeMap, checkContainerReady, mapLoading]);

    // Cargar datos de ciudades del artista
    useEffect(() => {
        const loadData = async () => {
            if (!countryId || !spotifyId) {
                console.log('⏭️ Faltan parámetros, saltando carga');
                return;
            }

            try {
                const response = await digitalLatinoApi.getDataArtistCountry(countryId, spotifyId);

                if (response.success && response.data) {
                    const dataArray = Array.isArray(response.data)
                        ? response.data
                        : [response.data];

                    const validCities = dataArray
                        .filter(city => {
                            const hasCoords = city.city_lat != null && city.city_lng != null;
                            return hasCoords;
                        })
                        .map((city, index) => ({
                            ...city,
                            rk: city.rk || index + 1
                        }))
                        .slice(0, 100);

                    setCitiesData(validCities);
                } else {
                    console.warn('⚠️ Respuesta sin datos válidos');
                    setCitiesData([]);
                }
            } catch (error) {
                console.error('❌ Error cargando datos:', error);
                setError('Error al cargar los datos de distribución del artista.');
                setCitiesData([]);
            } finally {
                console.log('✅ Carga de datos completada');
                setLoading(false);
            }
        };

        loadData();
    }, [countryId, spotifyId]);

    useEffect(() => {


        if (!mapInitialized || !mapInstanceRef.current || !markersRef.current) {
            console.log('⏸️ Condiciones no cumplidas para actualizar marcadores');
            return;
        }

        if (citiesData.length === 0) {
            console.log('🏙️ No hay ciudades para mostrar');
            markersRef.current.clearLayers();
            mapInstanceRef.current.setView([20, 0], 2);
            return;
        }

        // RequestAnimationFrame para asegurar que el DOM esté listo
        requestAnimationFrame(() => {
            try {
                // Limpiar marcadores anteriores
                markersRef.current!.clearLayers();

                // Agregar nuevos marcadores
                citiesData.forEach((city, index) => {
                    try {
                        const marker = L.marker([city.city_lat, city.city_lng], {
                            icon: createCustomIcon(city.rk || 1)
                        }).addTo(markersRef.current!);

                        // Tooltip en hover
                        marker.bindTooltip(`
                <div style="font-weight: bold; color: #333;">${city.city_name || 'Ciudad sin nombre'}</div>
                <div style="color: #666;">Rank: #${city.rk || 'N/A'}</div>
                <div style="color: #666;">Oyentes actuales: ${city.current_listeners ? formatNumber(city.current_listeners) : '0'}</div>
                <div style="color: #666;">Pico de oyentes: ${city.peak_listeners ? formatNumber(city.peak_listeners) : '0'}</div>
              `, {
                            permanent: false,
                            direction: 'top'
                        });

                        // Popup al hacer click
                        marker.bindPopup(`
                <div style="min-width: 200px;">
                  <h4 style="margin: 0 0 8px 0; color: #333;">${city.city_name || 'Ciudad sin nombre'}</h4>
                  <p style="margin: 4px 0; color: #666;">
                    <strong>Rank:</strong> #${city.rk || 'N/A'}<br/>
                    <strong>Oyentes actuales:</strong> ${city.current_listeners ? formatNumber(city.current_listeners) : '0'}<br/>
                    <strong>Pico de oyentes:</strong> ${city.peak_listeners ? formatNumber(city.peak_listeners) : '0'}<br/>
                    <strong>Coordenadas:</strong> ${city.city_lat?.toFixed(4)}, ${city.city_lng?.toFixed(4)}
                  </p>
                </div>
              `);

                        if (index < 3) {
                            console.log(`✅ Marcador ${city.city_name} agregado`);
                        }
                    } catch (markerError) {
                        console.error(`❌ Error con ${city.city_name}:`, markerError);
                    }
                });

                console.log('✅ Todos los marcadores agregados');

                // Ajustar el zoom con un pequeño retraso
                setTimeout(() => {
                    try {
                        if (!mapInstanceRef.current) return;

                        const bounds = L.latLngBounds(
                            citiesData.map(city => [city.city_lat, city.city_lng])
                        );

                        if (bounds.isValid()) {
                            mapInstanceRef.current.fitBounds(bounds.pad(0.1), {
                                maxZoom: 18,
                                minZoom: 2
                            });
                        } else {
                            mapInstanceRef.current.setView([20, 0], 2);
                        }
                    } catch (boundsError) {
                        console.error('❌ Error ajustando bounds:', boundsError);
                        if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([20, 0], 2);
                        }
                    }
                }, 100);

            } catch (error) {
                console.error('❌ Error general actualizando marcadores:', error);
            }
        });
    }, [citiesData, mapInitialized]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            setMapInitialized(false);
            setMapLoading(false);
        };
    }, []);

    if (error) {
        return (
            <Box sx={{ mt: 1, mb: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>🌎</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No se pudieron cargar los datos del mapa</Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 1, mb: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: "#6C63FF", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", mb: 2 }}>{title}</Typography>

                {/* Contenedor del mapa con overlay de carga */}
                <Box ref={mapRef} sx={{ width: '100%', height: height, minHeight: height, borderRadius: '8px', overflow: 'hidden', mb: 2, border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5', position: 'relative' }}>
                    {/* Overlay de carga mientras se inicializa el mapa */}
                    {(mapLoading || !mapInitialized) && (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245, 245, 245, 0.95)', zIndex: 1000, borderRadius: '8px' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <CircularProgress size={32} sx={{ color: "#6C63FF", mb: 2 }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{mapLoading ? 'Inicializando mapa...' : 'Preparando mapa...'}</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Leyenda del mapa */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#FFD700', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#1 Oro (Grande)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#C0C0C0', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#2 Plata (Mediano)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#CD7F32', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>#3 Bronce</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#6C63FF', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Otros (Pequeño)</Typography>
                    </Box>
                </Box>

                {/* Información de ciudades */}
                {citiesData.length > 0 && (
                    <>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5 }}>
                            {citiesData.slice(0, 5).map((city) => (
                                <Paper key={`${city.city_name}-${city.rk}`} elevation={0} sx={{ backgroundColor: 'grey.50', borderRadius: '8px', p: 1.5, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%' }} style={{ backgroundColor: getMarkerColor(city.rk || 1) }} />
                                        {city.city_name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>#{city.rk} • {city.current_listeners ? formatNumber(city.current_listeners) : '0'} oyentes</Typography>
                                </Paper>
                            ))}
                        </Box>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mostrando {Math.min(5, citiesData.length)} de {citiesData.length} ciudades</Typography>
                        </Box>
                    </>
                )}

                {citiesData.length === 0 && !loading && (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>🌎</Typography>
                        <Typography variant="body2">No hay datos de distribución por ciudades para este artista</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}