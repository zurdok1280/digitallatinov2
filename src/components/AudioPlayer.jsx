import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { useAudioPreview } from '../hooks/useAudioPreview.jsx';

const AudioPlayer = () => {
  const {
    trackMeta,
    isPaused,
    isVisible,
    progress,
    duration,
    volume,
    togglePlayPause,
    changeVolume,
    seekTo,
    closePlayer,
  } = useAudioPreview();

  const [showVolume, setShowVolume] = useState(false);
  const progressBarRef = useRef(null);
  const playerRef = useRef(null);

  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, tX: 0, tY: 0 });

  // Responsive scale factor
  // Escala fija (1x) como solicitó el usuario
  const scale = 1;

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    seekTo(pct * duration);
  };

  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault(); // Bloquea el scroll de la página
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      changeVolume(newVolume);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [volume, changeVolume]);

  const handleMouseDown = (e) => {
    // Only allow drag if we don't click on an interactive element
    if (e.target.closest('button') || e.target.closest('.ap-progress-bar') || e.target.closest('.ap-volume-slider')) {
      return;
    }
    
    // Calculate boundaries to prevent the player from being dragged off-screen
    const rect = playerRef.current.getBoundingClientRect();
    const baseLeft = rect.left - transform.x;
    const baseTop = rect.top - transform.y;
    
    const minX = -baseLeft;
    const maxX = window.innerWidth - rect.width - baseLeft;
    
    const minY = -baseTop;
    const maxY = window.innerHeight - rect.height - baseTop;
    
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      tX: transform.x,
      tY: transform.y,
      minX,
      maxX,
      minY,
      maxY
    };

    const handleMouseMove = (ev) => {
      if (!isDragging.current) return;
      
      let newX = dragStart.current.tX + (ev.clientX - dragStart.current.x);
      let newY = dragStart.current.tY + (ev.clientY - dragStart.current.y);
      
      // Clamp values so it doesn't overflow screen
      newX = Math.max(dragStart.current.minX, Math.min(dragStart.current.maxX, newX));
      newY = Math.max(dragStart.current.minY, Math.min(dragStart.current.maxY, newY));
      
      setTransform({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!isVisible || !trackMeta) return null;

  return (
    <>
      <style>{`
        @keyframes playerSlideUp {
          from { transform: translateY(100%) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(138, 136, 255, 0.3), 0 8px 32px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 30px rgba(138, 136, 255, 0.5), 0 8px 32px rgba(0,0,0,0.5); }
        }
        .audio-player-root {
          position: fixed;
          bottom: calc(24px * var(--scale));
          left: calc(24px * var(--scale)); /* Changed to left align */
          z-index: 9000;
          animation: playerSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .audio-player-card {
          display: flex;
          align-items: center;
          gap: calc(14px * var(--scale));
          padding: calc(10px * var(--scale)) calc(14px * var(--scale));
          background: rgba(18, 18, 28, 0.85);
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: calc(16px * var(--scale));
          min-width: calc(340px * var(--scale));
          max-width: calc(420px * var(--scale));
          box-shadow: 0 0 20px rgba(138, 136, 255, 0.3), 0 8px 32px rgba(0,0,0,0.5);
          transition: box-shadow 0.3s;
          cursor: grab;
          user-select: none;
        }
        .audio-player-card:active {
          cursor: grabbing;
        }
        .audio-player-card:hover {
          box-shadow: 0 0 30px rgba(138, 136, 255, 0.45), 0 12px 40px rgba(0,0,0,0.6);
        }
        .ap-cover {
          width: calc(52px * var(--scale));
          height: calc(52px * var(--scale));
          border-radius: calc(10px * var(--scale));
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .ap-cover-playing {
          animation: pulseGlow 2.5s ease-in-out infinite;
          border-radius: calc(10px * var(--scale));
        }
        .ap-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: calc(2px * var(--scale));
        }
        .ap-title {
          font-size: calc(0.85rem * var(--scale));
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }
        .ap-artist {
          font-size: calc(0.72rem * var(--scale));
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ap-progress-bar {
          width: 100%;
          height: calc(4px * var(--scale));
          background: rgba(255,255,255,0.08);
          border-radius: calc(2px * var(--scale));
          cursor: pointer;
          position: relative;
          margin-top: calc(4px * var(--scale));
          transition: height 0.15s;
        }
        .ap-progress-bar:hover {
          height: calc(6px * var(--scale));
        }
        .ap-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8a88ff, #c193ff);
          border-radius: calc(2px * var(--scale));
          position: relative;
          transition: width 0.1s linear;
        }
        .ap-progress-fill::after {
          content: '';
          position: absolute;
          right: calc(-4px * var(--scale));
          top: 50%;
          transform: translateY(-50%) scale(0);
          width: calc(10px * var(--scale));
          height: calc(10px * var(--scale));
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(138, 136, 255, 0.6);
          transition: transform 0.15s;
        }
        .ap-progress-bar:hover .ap-progress-fill::after {
          transform: translateY(-50%) scale(1);
        }
        .ap-times {
          display: flex;
          justify-content: space-between;
          font-size: calc(0.6rem * var(--scale));
          color: rgba(255,255,255,0.35);
          margin-top: 1px;
          font-variant-numeric: tabular-nums;
        }
        .ap-controls {
          display: flex;
          align-items: center;
          gap: calc(6px * var(--scale));
          flex-shrink: 0;
        }
        .ap-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          background: transparent;
          color: rgba(255,255,255,0.7);
          padding: calc(4px * var(--scale));
          border-radius: 50%;
          transition: all 0.2s;
        }
        .ap-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }
        .ap-play-btn {
          width: calc(36px * var(--scale));
          height: calc(36px * var(--scale));
          border-radius: 50%;
          background: linear-gradient(135deg, #8a88ff, #c193ff);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(138, 136, 255, 0.35);
        }
        .ap-play-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(138, 136, 255, 0.5);
        }
        .ap-play-btn:active {
          transform: scale(0.95);
        }
        .ap-close-btn {
          position: absolute;
          top: calc(-6px * var(--scale));
          right: calc(-6px * var(--scale));
          width: calc(20px * var(--scale));
          height: calc(20px * var(--scale));
          border-radius: 50%;
          background: rgba(40, 40, 55, 0.95);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.2s;
        }
        .audio-player-root:hover .ap-close-btn {
          opacity: 1;
          transform: scale(1);
        }
        .ap-close-btn:hover {
          background: rgba(255, 51, 102, 0.8);
          color: white;
          border-color: rgba(255, 51, 102, 0.5);
        }
        .ap-volume-slider {
          position: absolute;
          bottom: calc(100% + 10px);
          right: 0;
          background: rgba(18, 18, 28, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: calc(12px * var(--scale));
          padding: calc(12px * var(--scale)) calc(10px * var(--scale));
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: calc(6px * var(--scale));
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          animation: playerSlideUp 0.2s ease-out forwards;
        }
        .ap-volume-track {
          width: calc(4px * var(--scale));
          height: calc(80px * var(--scale));
          background: rgba(255,255,255,0.08);
          border-radius: calc(2px * var(--scale));
          position: relative;
          cursor: pointer;
        }
        .ap-volume-fill {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: linear-gradient(to top, #8a88ff, #c193ff);
          border-radius: calc(2px * var(--scale));
          transition: height 0.1s;
        }
        .ap-volume-knob {
          position: absolute;
          left: 50%;
          transform: translateX(-50%) translateY(50%);
          width: calc(12px * var(--scale));
          height: calc(12px * var(--scale));
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(138, 136, 255, 0.5);
        }
        .ap-volume-pct {
          font-size: calc(0.6rem * var(--scale));
          color: rgba(255,255,255,0.45);
          font-variant-numeric: tabular-nums;
        }
        @media (max-width: 600px) {
          .audio-player-root {
            left: 12px;
            bottom: 12px;
            right: 12px;
          }
          .audio-player-card {
            min-width: auto;
            max-width: none;
            width: 100%;
            transform: none !important; /* disable drag on mobile */
          }
        }
      `}</style>

      <div className="audio-player-root" style={{ '--scale': scale }}>
        <div 
          ref={playerRef}
          className="audio-player-card" 
          style={{ transform: `translate(${transform.x}px, ${transform.y}px)` }}
          onMouseDown={handleMouseDown}
        >
          {/* Close button */}
          <button className="ap-close-btn" onClick={closePlayer} title="Cerrar reproductor">
            <X size={12} />
          </button>

          {/* Cover art */}
          <div className={!isPaused ? 'ap-cover-playing' : ''}>
            <img
              className="ap-cover"
              src={trackMeta.image}
              alt={trackMeta.title}
              onError={(e) => { e.target.src = '/logo.png'; }}
            />
          </div>

          {/* Song info + progress */}
          <div className="ap-info">
            <div className="ap-title">{trackMeta.title}</div>
            <div className="ap-artist">{trackMeta.artist}</div>
            <div
              className="ap-progress-bar"
              ref={progressBarRef}
              onClick={handleProgressClick}
            >
              <div
                className="ap-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="ap-times">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="ap-controls" style={{ position: 'relative' }}>
            {/* Volume */}
            <button
              className="ap-btn"
              onClick={() => setShowVolume(!showVolume)}
              title="Volumen"
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {showVolume && (
              <div className="ap-volume-slider">
                <div
                  className="ap-volume-track"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = rect.bottom - e.clientY;
                    const pct = Math.max(0, Math.min(1, y / rect.height));
                    changeVolume(pct);
                  }}
                >
                  <div className="ap-volume-fill" style={{ height: `${volume * 100}%` }}>
                    <div className="ap-volume-knob" style={{ top: 0 }} />
                  </div>
                </div>
                <div className="ap-volume-pct">{Math.round(volume * 100)}%</div>
              </div>
            )}

            {/* Play / Pause */}
            <button className="ap-play-btn" onClick={togglePlayPause}>
              {isPaused ? (
                <Play size={18} style={{ marginLeft: '2px' }} />
              ) : (
                <Pause size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
