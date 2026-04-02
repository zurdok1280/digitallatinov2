import React from 'react';
import { BarChart3, X, Zap } from 'lucide-react';

const ComparisonBar = ({ selectedSongs, onCompare, onClear, onRemoveSong, isActive }) => {
  if (selectedSongs.length === 0 && !isActive) return null;

  return (
    <div className="comparison-bar-container active">
      <div className="comparison-bar-glass">
        <div className="comparison-info">
          <div className="comparison-count-badge">
            <BarChart3 size={16} />
            <span>{selectedSongs.length}/2</span>
          </div>
          
          <div className="selected-songs-mini">
            {selectedSongs.map((song, idx) => (
              <div key={song.cs_song || idx} className="mini-song-card animate-slide-in">
                <img src={song.spotifyid || song.img || song.image_url || song.url || song.avatar || '/logo.png'} alt="" />
                <div className="mini-song-details">
                  <p className="mini-song-name">{song.song}</p>
                  <p className="mini-song-artist">{song.artists || song.artist}</p>
                </div>
                <button className="remove-mini-btn" onClick={() => onRemoveSong(song.cs_song)}>
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {selectedSongs.length < 2 && (
              <div className="mini-song-placeholder">
                <div className="placeholder-pulse" />
                <span>Selecciona otra...</span>
              </div>
            )}
          </div>
        </div>

        <div className="comparison-actions">
          <button className="btn-secondary-glass" onClick={onClear}>
            Limpiar
          </button>
          <button 
            className={`btn-primary-glass ${selectedSongs.length === 2 ? 'pulse-border' : 'disabled'}`}
            disabled={selectedSongs.length !== 2}
            onClick={onCompare}
          >
            <Zap size={16} />
            <span>Comparar</span>
          </button>
        </div>
      </div>

      <style>{`
        .comparison-bar-container {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          z-index: 1000;
          width: 90%;
          max-width: 600px;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .comparison-bar-container.active {
          transform: translateX(-50%) translateY(0);
        }

        .comparison-bar-glass {
          background: rgba(15, 15, 20, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          padding: 0.6rem 0.8rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 
                      0 0 20px rgba(138, 136, 255, 0.1);
        }

        .comparison-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .comparison-count-badge {
          background: var(--accent-primary);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 4px 12px rgba(138, 136, 255, 0.4);
        }

        .selected-songs-mini {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .mini-song-card {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 140px;
          position: relative;
        }

        .mini-song-card img {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          object-fit: cover;
        }

        .mini-song-details {
          overflow: hidden;
        }

        .mini-song-name {
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .mini-song-artist {
          font-size: 0.6rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .remove-mini-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .remove-mini-btn:hover {
          color: #ff4d4d;
        }

        .mini-song-placeholder {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.6rem;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.7rem;
          font-style: italic;
        }

        .placeholder-pulse {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: pulse-ring 1.5s infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }

        .comparison-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary-glass {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.5rem 1.2rem;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }

        .btn-primary-glass:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(138, 136, 255, 0.5);
          filter: brightness(1.1);
        }

        .btn-primary-glass.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-secondary-glass {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary-glass:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .pulse-border {
          animation: border-pulse 2s infinite;
        }

        @keyframes border-pulse {
          0% { box-shadow: 0 0 0 0 rgba(138, 136, 255, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(138, 136, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(138, 136, 255, 0); }
        }

        @media (max-width: 600px) {
          .mini-song-details { display: none; }
          .comparison-bar-glass { padding: 0.4rem 0.6rem; }
        }
      `}</style>
    </div>
  );
};

export default ComparisonBar;
