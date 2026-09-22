import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Send, RotateCcw, X, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../hooks/useAuth';
import { sendAiChatMessage } from '../services/aiApi';
import './AiChatPanel.css';

const MotionDiv = motion.div;

const EXAMPLE_PROMPTS = [
  '🔥 Top 10 Canciones Digitales',
  '🌟 Top 10 Artistas en Digital',
  '🎯 Top 10 Curator Picks',
  '⚡ Heavy Hitters de la Semana',
  '📱 Top 10 Hits de Radio',
  '🎧 Top 10 Canciones en TikTok'
];

const MarkdownImg = ({ src, alt }) => {
  if (!src) return null;
  const normalizedSrc = (() => {
    const s = String(src).trim();
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    if (s.startsWith('i.scdn.co/')) return `https://${s}`;
    if (/^[a-f0-9]{32,40}$/i.test(s)) return `https://i.scdn.co/image/${s}`;
    return s;
  })();

  return (
    <img
      src={normalizedSrc}
      alt={alt || 'Cover'}
      referrerPolicy="no-referrer"
      className="dl-ai-thumb"
      onError={(e) => {
        if (!e.currentTarget.dataset.fallback) {
          e.currentTarget.dataset.fallback = 'true';
          e.currentTarget.src = '/logo.png';
        } else {
          e.currentTarget.style.display = 'none';
        }
      }}
    />
  );
};

/**
 * Converts any Markdown table block into a simple numbered list.
 * Strips the header row and separator row, then formats each data row
 * as "N. col1 – col2 – col3..." so the narrow chat panel never overflows.
 * Also preserves image covers if present in any table cell.
 */
const stripMarkdownTables = (text) => {
  if (!text || !text.includes('|')) return text;

  return text.replace(
    /(\|[^\n]+\|\n)((?:\|[-: ]+\|[-: |\n]+\n?))((?:\|[^\n]+\|\n?)*)/g,
    (_, headerRow, _sep, bodyRows) => {
      const rows = bodyRows
        .trim()
        .split('\n')
        .filter(r => r.includes('|'));

      let counter = 0;
      const lines = rows.map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(Boolean);
        if (!cells.length) return '';
        counter++;

        // Extract image if present in any cell (including Spotify CDN without file extension)
        let imgMd = '';
        for (const cell of cells) {
          const m = cell.match(/!\[[^\]]*\]\(([^)]+)\)/);
          if (m) {
            imgMd = `\n   ![Cover](${m[1]})`;
            break;
          } else if (/^https?:\/\/\S+/i.test(cell) && (cell.includes('image') || cell.includes('i.scdn.co') || /\.(?:jpg|jpeg|png|webp|gif)/i.test(cell))) {
            imgMd = `\n   ![Cover](${cell})`;
            break;
          }
        }

        // Build "N. val1 – val2 – val3" skipping empty/image-only cells
        const parts = cells
          .map((cell) => {
            if (!cell || cell.startsWith('![') || cell === '—' || cell === '-' || /^https?:\/\//i.test(cell)) return null;
            return cell;
          })
          .filter(Boolean)
          .slice(0, 3); // max 3 values per row

        return `${counter}. ${parts.join(' · ')}${imgMd}`;
      }).filter(Boolean);

      return lines.join('\n') + '\n';
    }
  );
};

/**
 * Prepares the assistant message markdown:
 * 1. Converts tables to lists with image support
 * 2. Normalizes Windows newlines and indents cover images
 *    directly under each song's info.
 */
const formatAiMessageContent = (text) => {
  if (!text) return '';
  let formatted = stripMarkdownTables(text.replace(/\r\n/g, '\n'));

  // If an image markdown is on the next line (or following lines) after a numbered item without indent:
  // e.g. "1. **Title** - Artist\n![](url)" or "1. **Title** - Artist\n\n![](url)"
  formatted = formatted.replace(
    /^(\d+\.\s+[^\n]+)\n+(?: {0,2})(!\[[^\]]*\]\([^)]+\))/gm,
    '$1\n   $2'
  );

  // If an image markdown is at the end of a numbered item line:
  // e.g. "1. **Title** - Artist — metrics ![](url)" -> "1. **Title** - Artist — metrics\n   ![](url)"
  formatted = formatted.replace(
    /^(\d+\.\s+.*?\S)\s*(!\[[^\]]*\]\([^)]+\))$/gm,
    '$1\n   $2'
  );

  return formatted;
};

const MARKDOWN_COMPONENTS = {
  img: MarkdownImg,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-2 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="dl-ai-list-item">{children}</li>,
  // Safety net: if a table somehow gets through, render it as a list
  table: ({ children }) => <div className="dl-ai-table-fallback">{children}</div>,
  thead: () => null,
  tbody: ({ children }) => <ol className="mb-2 list-decimal space-y-2 pl-5">{children}</ol>,
  tr: ({ children }) => {
    const cells = React.Children.toArray(children)
      .map(child => {
        if (!React.isValidElement(child)) return null;
        const text = child.props?.children;
        if (!text || String(text).startsWith('![')) return null;
        return String(text);
      })
      .filter(Boolean)
      .slice(0, 3);
    return <li className="dl-ai-list-item">{cells.join(' · ')}</li>;
  },
  th: () => null,
  td: ({ children }) => <>{children}</>,
};

export default function AiChatPanel({ selectedCountryCode = 'MX', user: userProp, onLoginClick: onLoginClickProp }) {
  const authContext = useAuth();

  const user = userProp !== undefined ? userProp : authContext?.user;
  const onLoginClick = onLoginClickProp || (() => authContext?.setShowLoginDialog?.(true));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Cerrar panel si el usuario desloguea mientras está abierto
  useEffect(() => {
    if (!user && open) {
      setOpen(false);
    }
  }, [user, open]);

  // Calculate coordinates to anchor popup centered directly below the trigger button
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const updateCoords = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const panelWidth = Math.min(440, viewportWidth - 24);

      // Centrado horizontal exacto respecto al botón
      let left = rect.left + (rect.width / 2) - (panelWidth / 2);

      // Asegurar que no se desborde fuera de la pantalla
      if (left < 12) left = 12;
      if (left + panelWidth > viewportWidth - 12) {
        left = viewportWidth - panelWidth - 12;
      }

      setCoords({
        top: Math.round(rect.bottom + 10),
        left: Math.round(left),
        width: panelWidth
      });
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open]);

  // Close on Escape or click outside
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e) => {
      if (buttonRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  const handleTriggerClick = () => {
    if (!user) {
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }
    setOpen(v => !v);
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const history = messages
      .filter(m => !m.isError)
      .map(({ role, content }) => ({ role, content }));

    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendAiChatMessage(query, history, selectedCountryCode);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'No se pudo obtener respuesta del servidor.'}`,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled
        className="dl-ai-trigger-btn disabled"
        onClick={handleTriggerClick}
        title="DigitalLatino AI (Deshabilitado)"
        style={{
          opacity: 0.5,
          cursor: 'not-allowed',
          pointerEvents: 'none',
          boxShadow: 'none',
          filter: 'grayscale(0.3)'
        }}
      >
        <Sparkles size={16} className="dl-ai-sparkle-icon" style={{ opacity: 0.6, animation: 'none' }} />
        <span>DigitalLatino AI</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && coords && user && (
            <MotionDiv
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width
              }}
              className="dl-ai-panel-overlay"
            >
              {/* Top Header */}
              <div className="dl-ai-panel-header">
                <div className="dl-ai-panel-title">
                  <Sparkles size={18} className="dl-ai-sparkle-icon" />
                  <span>DigitalLatino AI</span>
                  <span className="dl-ai-beta-badge">Live</span>
                </div>
                <div className="dl-ai-actions-group">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      className="dl-ai-icon-btn"
                      onClick={() => setMessages([])}
                      title="Reiniciar conversación"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="dl-ai-icon-btn"
                    onClick={() => setOpen(false)}
                    title="Cerrar"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="dl-ai-chat-body">
                {messages.length === 0 ? (
                  <div className="dl-ai-empty-state">
                    <div className="dl-ai-empty-icon-wrap">
                      <Sparkles size={22} className="dl-ai-sparkle-icon" />
                    </div>
                    <div className="dl-ai-empty-title">¿En qué puedo ayudarte hoy?</div>
                    <div className="dl-ai-empty-desc">
                      Pregúntame sobre canciones, streams en Spotify, tendencias en TikTok, artistas y rankings digitales.
                    </div>
                    <div className="dl-ai-prompt-chips">
                      {EXAMPLE_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="dl-ai-chip"
                          onClick={() => handleSend(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`dl-ai-message-row ${msg.role}`}
                    >
                      {msg.role === 'user' ? (
                        <div className="dl-ai-bubble-user">{msg.content}</div>
                      ) : (
                        <div className={`dl-ai-bubble-assistant ${msg.isError ? 'dl-ai-bubble-error' : ''}`}>
                          <div className="dl-ai-markdown">
                            <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                              {formatAiMessageContent(msg.content)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {loading && (
                  <div className="dl-ai-message-row assistant">
                    <div className="dl-ai-bubble-assistant dl-ai-typing">
                      <span className="dl-ai-dot" />
                      <span className="dl-ai-dot" />
                      <span className="dl-ai-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="dl-ai-panel-footer">
                <form onSubmit={onSubmit} className="dl-ai-form">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe una pregunta sobre música digital..."
                    className="dl-ai-input"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="dl-ai-submit-btn"
                    title="Enviar"
                  >
                    <Send size={15} />
                  </button>
                </form>
                <div className="dl-ai-footnote">
                  Impulsado por OpenAI y métricas oficiales de DigitalLatino
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}