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
                // Obtenemos las canciones para sacar la imagen del artista
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
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center p-8">
                <Lock className="w-16 h-16 text-[#c193ff] opacity-50" />
                <h2 className="text-2xl font-bold text-white">Acceso Restringido</h2>
                <p className="text-gray-400 max-w-md">
                    Esta sección es exclusiva para artistas con una cuenta verificada.
                    Por favor inicia sesión con tu cuenta de artista.
                </p>
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
        <div style={{ width: '100%', minHeight: '100vh' }}>
            <ArtistDetailsModal
                artist={artistProp}
                countries={[]}
                isModal={false}
            />
        </div>
    );
}