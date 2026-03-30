import { CityDataForSong, Country, Song, TopTrendingPlatforms } from "@/lib/api";
import { ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxElementsDisplay from "./buttonInfoSong-components/boxElementsDisplay";
import BoxDisplayInfoPlatform from "./buttonInfoSong-components/boxDisplayInfoPlatform";
import BoxPlaylistsDisplay from "./buttonInfoSong-components/boxPlaylistsDisplay";
import BoxCampaign from "./buttonInfoSong-components/boxCampaign";
import BoxTikTokInfluencers from "./buttonInfoSong-components/boxTikTokInfluencers";
import BoxElementsDisplaySpins from "./buttonInfoSong-components/boxElementsDisplaySpins";
import BoxElementsDisplayAudience from "./buttonInfoSong-components/boxElemensDisplayAudience";

export interface ButtonInfoSongProps {
    index: number;
    row: Song | TopTrendingPlatforms;
    selectedCountry?: string;
    isExpanded: boolean;
    onToggle: (index: number) => void;
}

// Componente para la fila expandida
interface ExpandRowProps {
    row?: Song;
    onPromote: () => void;
    selectedCountry?: string;
    selectedFormat?: string;
    countries?: Country[];
    isExpanded?: boolean;
    cityDataForSong?: CityDataForSong[];
    loadingCityData?: boolean;
}

export function ExpandRow({
    row,
    onPromote,
    selectedCountry,
    selectedFormat,
    countries,
    isExpanded,
    cityDataForSong,
    loadingCityData
}: ExpandRowProps) {
    const [cityData, setCityData] = useState<any[]>([]);
    const [loadTimestamp, setLoadTimestamp] = useState(Date.now());

    const handleCityDataLoaded = (data: any[]) => {
        setCityData(data);
    };
    console.log('🔵 ExpandRow rendering with:', {
        csSong: row.cs_song,
        selectedCountry,
        selectedFormat,
        hasRow: !!row
    });

    // Resetear timestamp cuando se expande
    useEffect(() => {
        if (isExpanded) {
            setLoadTimestamp(Date.now());
        }
    }, [isExpanded]);

    return (
        <div className="relative border-t border-white/30 bg-background/50 rounded-lg animate-fade-in">
            {/* Contenedor principal con scroll */}
            <div className="max-h-96 overflow-y-auto p-4 pb-2">
                {/* Top de ciudades */}
                <BoxElementsDisplay
                    label={"Top Ciudades Digital"}
                    csSong={row.cs_song.toString()}
                    selectedCountryId={selectedCountry}
                    onDataLoaded={handleCityDataLoaded}
                />

                {/* Estadísticas de Plataformas */}
                <BoxDisplayInfoPlatform
                    csSong={row.cs_song}
                    formatId={selectedFormat ? parseInt(selectedFormat) : 0}
                    countryId={selectedCountry ? parseInt(selectedCountry) : 1}
                />

                <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* Playlist Info */}
                    <BoxPlaylistsDisplay csSong={row.cs_song} />

                    {/* TikTok Influencers */}
                    <BoxTikTokInfluencers csSong={row.cs_song} />
                </div>

                {/* Estadísticas de Radio */}
                <BoxElementsDisplayAudience
                    csSong={row.cs_song}
                    title="Top Países en Radio"
                    label="países"
                    type="countries"
                />

                {/* Top Mercados en Radio */}
                <BoxElementsDisplaySpins
                    csSong={row.cs_song}
                    countryId={selectedCountry ? parseInt(selectedCountry) : undefined}
                    title="Top Mercados en Radio"
                    label="mercados"
                    type="markets"
                />

            </div>

            {/* BoxCampaign sticky en la parte inferior */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm z-10 mt-4 border-t border-white/20">
                <BoxCampaign
                    spotifyId={row.spotifyid}
                    csSong={row.cs_song}
                    songName={row.song}
                    artistName={row.artists}
                />
            </div>
        </div>
    );
}

// Componente que solo maneja el botón
export function ButtonInfoSong({
    index,
    row,
    selectedCountry,
    isExpanded,
    onToggle
}: ButtonInfoSongProps & {
    isExpanded: boolean;
    onToggle: (index: number) => void;
}) {
    return (
        <button
            onClick={() => onToggle(index)}
            className="bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-white/50 text-slate-600 p-1 rounded-lg text-xs transition-all duration-200 hover:scale-105 shadow-sm ml-2"
        >
            {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
            ) : (
                <Plus className="w-3 h-3" />
            )}
        </button>
    );
}

// Hook personalizado para manejar el estado de expansión
export function useExpandableRows() {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (index: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    const isExpanded = (index: number) => expandedRows.has(index);

    return { expandedRows, toggleRow, isExpanded };
}