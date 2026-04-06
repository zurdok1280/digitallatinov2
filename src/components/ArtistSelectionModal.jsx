import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchSpotify } from "../services/api";
import { useToast } from "../hooks/use-toast";
import "./ArtistSelectionModal.css";

export function ArtistSelectionModal({ isOpen, onArtistSelected }) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const searchArtists = useCallback(async (query) => {
    if (!query.trim()) {
      setArtists([]);
      return;
    }
    setLoading(true);
    try {
      const response = await searchSpotify(query);
      const allArtists = response?.artists || response || [];
      const mappedArtists = allArtists.map((a) => ({
        id: a.spotify_id || a.id,
        name: a.artist_name || a.name,
        image_url: a.image_url || a.images?.[0]?.url,
        followers: a.followers,
      }));
      setArtists(mappedArtists);
    } catch (error) {
      console.error("Error buscando artistas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) searchArtists(debouncedQuery);
  }, [debouncedQuery, searchArtists]);

  const handleSelectClick = (artist) => {
    setSelectedArtist(artist);
    setShowConfirm(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedArtist) return;

    setIsSaving(true);
    try {
      await onArtistSelected(selectedArtist.id, selectedArtist.name);
      toast({
        title: "Artista vinculado",
        description: `Estamos recopilando la información de ${selectedArtist.name} y de todas sus canciones.`,
        duration: 5000, 
      });
      setShowConfirm(false);
    } catch (error) {
      toast({
        title: "Error de vinculación",
        description: "Hubo un error al seleccionar el artista. Inténtalo de nuevo.",
      });
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="artist-modal-overlay">
        <div 
           className="artist-modal-content"
           onClick={(e) => e.stopPropagation()}
        >
          <div className="artist-modal-header">
            <h2 className="artist-modal-title">
              Bienvenido al plan Artista
            </h2>
            <div className="artist-modal-subtitle">
              Para comenzar, busca y selecciona el artista que deseas monitorear.
              <br />
              <div className="artist-modal-warning">
                <span>Atención: Esta selección es definitiva para tu periodo mensual activo.</span>
              </div>
            </div>
          </div>

          <div className="artist-modal-search">
            <Search size={20} className="artist-modal-search-icon" />
            <input
              placeholder="Ej. Shakira..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="artist-modal-search-input"
              autoFocus
            />
            {loading && (
              <Loader2 size={20} className="artist-modal-search-loader" />
            )}
          </div>

          <div className="artist-modal-list">
            {artists.length === 0 && searchQuery && !loading && (
              <div className="artist-modal-empty">
                <Search size={32} className="artist-modal-empty-icon" />
                <p>No encontramos artistas con ese nombre en los registros globales.</p>
              </div>
            )}
            <div>
              {artists.map((artist) => (
                <div key={artist.id} className="artist-list-item">
                  <div className="artist-item-info">
                    {artist.image_url ? (
                       <img src={artist.image_url} alt={artist.name} className="artist-item-avatar" />
                    ) : (
                       <div className="artist-item-avatar-fallback">
                         {artist.name.charAt(0)}
                       </div>
                    )}
                    <div className="artist-item-details">
                      <h4 className="artist-item-name">{artist.name}</h4>
                      {artist.followers != null && (
                        <p className="artist-item-followers">
                          {artist.followers.toLocaleString()} seguidores globales
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    className="artist-btn-select"
                    onClick={() => handleSelectClick(artist)}
                  >
                    Vincular
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="artist-modal-overlay artist-modal-overlay-confirm">
          <div className="confirm-modal-content">
            <h2 className="confirm-modal-title">
              ¿Confirmar vinculación con {selectedArtist?.name}?
            </h2>
            <div className="confirm-modal-desc">
              Te recordamos que al seleccionar a {selectedArtist?.name} como tu artista objetivo,
              esta acción será inalterable durante tu periodo de facturación mensual activo.
              
              <div className="confirm-modal-card">
                {selectedArtist?.image_url ? (
                  <img src={selectedArtist.image_url} alt={selectedArtist.name} className="confirm-modal-avatar" />
                ) : (
                  <div className="confirm-modal-fallback">
                    {selectedArtist?.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="confirm-card-name">{selectedArtist?.name}</p>
                  <p className="confirm-card-id">ID: {selectedArtist?.id}</p>
                </div>
              </div>
            </div>
            <div className="confirm-modal-footer">
              <button 
                disabled={isSaving}
                onClick={() => setShowConfirm(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmSelection();
                }}
                disabled={isSaving}
                className="btn-confirm"
              >
                {isSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Verificando...</>
                ) : (
                  "Confirmar Artista"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
