import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPreview = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const audioRef = useRef(null);

  const handlePlayPreview = useCallback((trackId, audioUrl) => {
    // Si la misma canción está sonando, pausar y limpiar
    if (currentlyPlaying === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // reinicia a inicio
        audioRef.current = null;
      }
      setCurrentlyPlaying(null);
      return;
    }

    // Si hay una canción sonando, detenerla
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Crear y reproducir nueva canción
    const audio = new Audio(audioUrl); // aquí se asigna la URL real del MP3
    audioRef.current = audio;

    // Cuando termine el audio, limpiar estado
    audio.addEventListener("ended", () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

    // Intentar reproducir (algunos navegadores requieren interacción de usuario)
    audio
      .play()
      .then(() => {
        setCurrentlyPlaying(trackId);
      })
      .catch((err) => {
        console.error("Error al reproducir el audio:", err);
        setCurrentlyPlaying(null);
        audioRef.current = null;
      });
  }, [currentlyPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { currentlyPlaying, handlePlayPreview };
};
