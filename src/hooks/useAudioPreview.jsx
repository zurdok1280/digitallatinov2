import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth.jsx';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [trackMeta, setTrackMeta] = useState(null); // { title, artist, image }
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPreviewLimitReached, setIsPreviewLimitReached] = useState(false);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);

  const { user } = useAuth();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const currentT = audioRef.current.currentTime;
        if (!userRef.current && currentT >= 10) {
          audioRef.current.pause();
          audioRef.current.currentTime = 10;
          setProgress(10);
          setIsPreviewLimitReached(true);
          stopProgressTracking();
          return;
        }
        setProgress(currentT);
        setDuration(audioRef.current.duration || 0);
      }
    }, 250);
  }, [stopProgressTracking]);

  const handlePlayPreview = useCallback((trackId, audioUrl, meta = {}) => {
    // Si la misma canción está sonando, pausar/resumir
    if (currentlyPlaying === trackId) {
      if (audioRef.current) {
        if (!userRef.current && audioRef.current.currentTime >= 10) {
          setIsPreviewLimitReached(true);
          return;
        }
        if (audioRef.current.paused) {
          audioRef.current.play();
          startProgressTracking();
        } else {
          audioRef.current.pause();
          stopProgressTracking();
        }
      }
      return;
    }

    setIsPreviewLimitReached(false);

    // Si hay una canción sonando, detenerla
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      stopProgressTracking();
    }

    // Crear y reproducir nueva canción
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    // Guardar metadata del track
    setTrackMeta({
      title: meta.title || 'Canción desconocida',
      artist: meta.artist || 'Artista desconocido',
      image: meta.image || '/logo.png',
    });

    // Cuando termine el audio, limpiar estado
    audio.addEventListener("ended", () => {
      setCurrentlyPlaying(null);
      stopProgressTracking();
      setProgress(0);
    });

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration || 0);
    });

    // Intentar reproducir
    audio
      .play()
      .then(() => {
        setCurrentlyPlaying(trackId);
        setIsVisible(true);
        startProgressTracking();
      })
      .catch((err) => {
        console.error("Error al reproducir el audio:", err);
        setCurrentlyPlaying(null);
        audioRef.current = null;
        setTrackMeta(null);
      });
  }, [currentlyPlaying, volume, startProgressTracking, stopProgressTracking]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (!userRef.current && audioRef.current.currentTime >= 10) {
      setIsPreviewLimitReached(true);
      return;
    }
    if (audioRef.current.paused) {
      audioRef.current.play();
      startProgressTracking();
      setIsPreviewLimitReached(false);
    } else {
      audioRef.current.pause();
      stopProgressTracking();
    }
  }, [startProgressTracking, stopProgressTracking]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const seekTo = useCallback((time) => {
    if (audioRef.current) {
      let targetTime = time;
      if (!userRef.current && time > 10) {
        targetTime = 10;
        setIsPreviewLimitReached(true);
        audioRef.current.pause();
        stopProgressTracking();
      } else {
        setIsPreviewLimitReached(false);
      }
      audioRef.current.currentTime = targetTime;
      setProgress(targetTime);
    }
  }, [stopProgressTracking]);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setCurrentlyPlaying(null);
    setTrackMeta(null);
    setIsVisible(false);
    setIsPreviewLimitReached(false);
    setProgress(0);
    setDuration(0);
    stopProgressTracking();
  }, [stopProgressTracking]);

  const isPaused = audioRef.current ? audioRef.current.paused : true;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopProgressTracking();
    };
  }, [stopProgressTracking]);

  const value = {
    currentlyPlaying,
    trackMeta,
    volume,
    progress,
    duration,
    isPaused,
    isVisible,
    isPreviewLimitReached,
    handlePlayPreview,
    togglePlayPause,
    changeVolume,
    seekTo,
    closePlayer,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudioPreview = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioPreview must be used within an AudioProvider');
  }
  return context;
};
