import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * SearchableSelect — A premium dropdown with keyboard search via React Portals.
 */
const SearchableSelect = ({ options = [], value, onChange, placeholder = 'Selecciona...', disabled = false, searchable = true, style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  const selectedOption = options.find(o => String(o.value) === String(value));

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Calculate position when opening
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Handle window resize/scroll to update position or close
  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Open dropdown
  const open = () => {
    if (disabled) return;
    setIsOpen(true);
    setQuery('');
    setHighlightedIdx(0);
  };

  // Close & reset
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setHighlightedIdx(0);
  }, []);

  // Select an option
  const select = (opt, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange(opt.value);
    close();
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // Also check if the portal element contains the target
        const portalEl = document.getElementById('ss-portal-container');
        if (portalEl && portalEl.contains(e.target)) return;
        close();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      // Small timeout to ensure portal is mounted and focused correctly
      const timer = setTimeout(() => inputRef.current.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightedIdx(0);
  }, [query]);

  // Scroll highlighted into view
  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      if (items[highlightedIdx]) {
        items[highlightedIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIdx]);

  const handleKeyDown = (e) => {
    if (!isOpen) { 
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
      return; 
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIdx(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightedIdx]) select(filtered[highlightedIdx], e);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      default:
        break;
    }
  };

  const dropdownList = (
    <div 
      id="ss-portal-container"
      className="ss-dropdown" 
      role="listbox" 
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: `${coords.top + 6}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        minWidth: '200px'
      }}
    >
      {/* Search input - only if searchable */}
      {searchable && (
        <div className="ss-search-wrapper" onMouseDown={(e) => e.stopPropagation()}>
          <Search size={14} color="var(--accent-primary)" style={{ flexShrink: 0, opacity: 0.8 }} />
          <input
            ref={inputRef}
            className="ss-search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar opción"
            autoFocus
          />
          {query && (
            <button 
              className="ss-clear" 
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
              }} 
              tabIndex={-1}
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Options list */}
      <div ref={listRef} className="ss-list">
        {filtered.length === 0 ? (
          <div className="ss-empty">Sin resultados para "{query}"</div>
        ) : (
          filtered.map((opt, idx) => (
            <div
              key={opt.value}
              data-option
              role="option"
              aria-selected={String(opt.value) === String(value)}
              className={[
                'ss-option',
                idx === highlightedIdx ? 'highlighted' : '',
                String(opt.value) === String(value) ? 'selected' : ''
              ].join(' ')}
              onMouseEnter={() => setHighlightedIdx(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                select(opt, e);
              }}
            >
              {opt.label}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef} 
      className="ss-container"
      style={{ position: 'relative', width: '100%' }} 
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .ss-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          background-color: #1a1c24;
          color: var(--text-main);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          cursor: pointer;
          font-size: 0.85rem;
          font-family: inherit;
          text-align: left;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .ss-trigger:hover:not(:disabled) {
          border-color: rgba(255,255,255,0.22);
          background-color: #232533;
        }
        .ss-trigger.open {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(138,136,255,0.25);
          background-color: #232533;
        }
        .ss-trigger:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .ss-trigger-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        .ss-chevron {
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-dim);
        }
        .ss-chevron.open {
          transform: rotate(180deg);
          color: var(--accent-primary);
        }
        .ss-dropdown {
          background: #0f111a !important; /* Totalmente Opaco */
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 12px;
          box-shadow: 0 30px 90px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05);
          overflow: hidden;
          z-index: 200000; /* Super high for Portal */
          animation: ss-open 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes ss-open {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .ss-search-wrapper {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .ss-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-family: inherit;
          font-size: 0.82rem;
          padding: 0;
        }
        .ss-search-input::placeholder {
          color: var(--text-dim);
        }
        .ss-clear {
          color: var(--text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          border: none;
        }
        .ss-list {
          max-height: 240px;
          overflow-y: auto;
          padding: 6px 0;
        }
        .ss-option {
          padding: 8px 14px;
          font-size: 0.85rem;
          color: #c9d1d9;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 2px 6px;
          border-radius: 8px;
        }
        .ss-option:hover, .ss-option.highlighted {
          background: rgba(138,136,255,0.18);
          color: #fff;
          transform: translateX(3px);
        }
        .ss-option.selected {
          color: white;
          background: rgba(138,136,255,0.3);
          font-weight: 700;
          position: relative;
        }
        .ss-option.selected::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 14px;
          background: var(--accent-primary);
          border-radius: 2px;
        }
        .ss-empty {
          padding: 16px;
          text-align: center;
          color: var(--text-dim);
          font-size: 0.8rem;
          font-style: italic;
        }
      `}</style>

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className={`ss-trigger ${isOpen ? 'open' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          isOpen ? close() : open();
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="ss-trigger-label">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`ss-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {/* Dropdown - Portal rendered at body root */}
      {isOpen && createPortal(dropdownList, document.body)}
    </div>
  );
};

export default SearchableSelect;
