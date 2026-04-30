import React, { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getArtistSongs } from "../services/api";
import ArtistDetailsModal from "../components/ArtistDetailsModal";

export default function MyArtist() {
    const { user } = useAuth();
    const [artistProp, setArtistProp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const prepareArtistData = async () => {
            if (!user?.allowedArtistId) {
                setLoading(false);
                return;
            }

            try {
                // Obtenemos las canciones para sacar la "Top Song" y la imagen del artista
                const songsData = await getArtistSongs(user.allowedArtistId);
                
                let imageUrl = "/placeholder.png";

                if (songsData && songsData.length > 0) {
                    // Buscamos una imagen válida entre las canciones
                    const songWithImage = songsData.find(s => s.image_url || s.avatar || s.url);
                    if (songWithImage) {
                        imageUrl = songWithImage.image_url || songWithImage.avatar || songWithImage.url;
                    }
                }

                setArtistProp({
                    id: user.allowedArtistId,
                    spotifyid: user.allowedArtistId,
                    name: user.allowedArtistName || "Artista",
                    imageUrl: imageUrl,
                    initialTab: 'mapa'
                });

            } catch (error) {
                console.error('Error preparando datos del artista:', error);
                // Fallback básico
                setArtistProp({
                    id: user.allowedArtistId,
                    spotifyid: user.allowedArtistId,
                    name: user.allowedArtistName || "Artista",
                    imageUrl: "/placeholder.png",
                    initialTab: 'mapa'
                });
            } finally {
                setLoading(false);
            }
        };

        prepareArtistData();
    }, [user]);

    if (!user || user.role !== 'ARTIST') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center flex-col gap-5 text-center p-4">
                <div className="bg-red-500/10 p-5 rounded-full border border-red-500/20 text-red-400">
                    <Lock size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white">Acceso Restringido</h2>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#c193ff] animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Preparando panel del artista...</p>
            </div>
        );
    }

    if (!artistProp) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <p className="text-gray-400 font-medium">No se pudo cargar la información del artista.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0b10] p-4 sm:p-6 lg:p-8 relative pb-32">
            <ArtistDetailsModal 
                artist={artistProp} 
                isModal={false} 
            />
        </div>
    );
}