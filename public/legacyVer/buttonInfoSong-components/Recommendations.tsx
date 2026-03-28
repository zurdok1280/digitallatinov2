import React, { useState, useEffect } from 'react';
import { X, Music2, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { DataArtist, TopTrendingArtist, digitalLatinoApi, idSongs } from '@/lib/api';
import spotifyIcon from '/src/assets/covers/icons/spotify-icon.png';
import tiktokIcon from '/src/assets/covers/icons/tiktok-icon.png';

interface RecommendationsModalProps {
    csSong: number;
    songName?: string;
    isOpen: boolean;
    onClose: () => void;
    spotifyId?: string; // Este puede venir vacío o ser el de la DB
}

interface CampaignCardProps {
    icon?: React.ElementType;
    iconImage?: string;
    platform: string;
    benefit: string;
    metric: string;
    platformColor: string;
    iconBg: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
    icon: Icon,
    iconImage,
    platform,
    benefit,
    metric,
    platformColor,
    iconBg,
}) => {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-card p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="flex flex-col items-center text-center">
                <div className={`mb-4 rounded-2xl ${iconBg} p-4 transition-transform group-hover:scale-110`}>
                    {iconImage ? (
                        <img src={iconImage} alt={platform} className="h-7 w-7" />
                    ) : Icon ? (
                        <Icon className={`h-7 w-7 ${platformColor}`} />
                    ) : null}
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-foreground">{platform}</h3>
                <p className="mb-4 text-xs text-muted-foreground">{benefit}</p>
                <p className={`text-2xl font-bold ${platformColor}`}>{metric}</p>
            </div>
        </div>
    );
};

const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
    csSong,
    songName,
    isOpen,
    onClose,
    spotifyId // Este es opcional y puede ser el de la DB
}) => {
    const [recommendations, setRecommendations] = useState<TopTrendingArtist | null>(null);
    const [dataSong, setDataSong] = useState<DataArtist | null>(null);
    const [realSpotifyId, setRealSpotifyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadRecommendationsAndSpotifyId();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, csSong]);

    const loadRecommendationsAndSpotifyId = async () => {
        setLoading(true);
        setError(null);
        try {
            // Cargar recomendaciones
            const recommendationsResponse = await digitalLatinoApi.getArtistRecommendations(csSong);
            if (recommendationsResponse.data && recommendationsResponse.data.length > 0) {
                setRecommendations(recommendationsResponse.data[0]);
            }
            // Obtener el spotifyId real usando el nuevo endpoin
            const spotifyIdResponse = await digitalLatinoApi.getIdSongByCsSong(csSong.toString());
            setRealSpotifyId(spotifyIdResponse.data.spotify_id);

            if (spotifyIdResponse.data && spotifyIdResponse.data.spotify_id) {
                //console.log('✅ SpotifyId real obtenido:', spotifyIdResponse.data.spotify_id);
                setRealSpotifyId(spotifyIdResponse.data.spotify_id);
            } else {
                //console.log('❌ No se pudo obtener spotifyId real, usando el de la DB:', spotifyId);
                setRealSpotifyId(spotifyId || null);
            }
            //Obtener rank

        } catch (err) {
            console.error('❌ Error cargando datos:', err);
            setError('Error al cargar las recomendaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToCampaign = () => {
        // Usar el spotifyId real si está disponible, sino usar el que vino como prop
        const idToUse = realSpotifyId || spotifyId;

        console.log('🚀 Abriendo campaña con ID:', idToUse);

        const campaignUrl = `/campaign?spotifyId=${idToUse}`;
        window.open(campaignUrl, '_blank');
    };

    const handleContactExpert = () => {
        const whatsappUrl = `https://wa.me/13104699872?text=Estoy%20interesado%20en%20hacer%20una%20campaña%20personalizada%20para%20${songName ? encodeURIComponent(`la canción "${songName}"`) : 'mi música'}.`;
        window.open(whatsappUrl, '_blank');
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    };

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const campaigns = [
        {
            iconImage: spotifyIcon,
            platform: "Playlists",
            benefit: "Crecimiento orgánico",
            metric: "streams",
            platformColor: "text-green-600",
            iconBg: "bg-green-50",
        },
        {
            iconImage: tiktokIcon,
            platform: "TikTok",
            benefit: "Alcance viral masivo",
            metric: "150,000+ personas",
            platformColor: "text-pink-600",
            iconBg: "bg-pink-50",
        },
        {
            icon: Instagram,
            platform: "Instagram",
            benefit: "Exposición en Reels y Stories",
            metric: "200,000+ cuentas",
            platformColor: "text-purple-600",
            iconBg: "bg-purple-50",
        },
        {
            icon: Facebook,
            platform: "Facebook",
            benefit: "Alcance directo de la cuenta",
            metric: "120,000+ cuentas",
            platformColor: "text-blue-600",
            iconBg: "bg-blue-50",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative bg-background rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                    <X className="w-6 h-6 text-muted-foreground" />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[90vh]">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
                                {error}
                            </div>
                        ) : recommendations ? (
                            <>
                                {/* Header */}
                                <div className="mb-8 text-center">
                                    <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                        <Music2 className="h-8 w-8 text-primary" />
                                    </div>
                                    <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                        Plan de Acción Recomendado
                                    </h1>
                                    <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                                        Estrategias clave para impulsar tu música
                                    </p>
                                </div>

                                {/* Campaign Grid */}
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {campaigns.map((campaign, index) => (
                                        <CampaignCard key={index} {...campaign} />
                                    ))}
                                </div>

                                {/* CTA Section */}
                                <div className="mt-10 text-center">
                                    <p className="mb-4 text-base font-medium text-foreground">
                                        ¿Listo para impulsar tu música?
                                    </p>
                                    <p className="mb-6 text-sm text-muted-foreground">
                                        Nuestros expertos pueden crear una campaña personalizada
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        {/*
                                        <button
                                            onClick={handleGoToCampaign}
                                            className="rounded-full bg-gradient-to-r from-purple-500 to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                                        >
                                            Crear Campaña Ahora
                                        </button>
                                        */}
                                        <button
                                            onClick={handleContactExpert}
                                            className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] hover:bg-green-700"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            Contacta un asesor
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationsModal;