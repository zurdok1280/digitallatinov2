import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const FloatingScrollButtons = () => {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      setShowTop(scrollTop > 300);
      setShowBottom(scrollTop + clientHeight < scrollHeight - 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        .floating-scroll-btn {
          position: fixed;
          right: 1.5rem;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(20, 20, 30, 0.85);
          backdrop-filter: blur(12px);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 900;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0;
          pointer-events: none;
          transform: scale(0.7);
        }
        .floating-scroll-btn.visible {
          opacity: 1;
          pointer-events: auto;
          transform: scale(1);
        }
        .floating-scroll-btn:hover {
          background: rgba(138, 136, 255, 0.3);
          border-color: var(--accent-primary);
          box-shadow: 0 4px 24px rgba(138, 136, 255, 0.35);
          transform: scale(1.1);
        }
        .floating-scroll-btn:active {
          transform: scale(0.95);
        }
        .floating-scroll-btn-up {
          bottom: 5.5rem;
        }
        .floating-scroll-btn-down {
          bottom: 2rem;
        }
        @media (max-width: 600px) {
          .floating-scroll-btn {
            width: 38px;
            height: 38px;
            right: 1rem;
          }
          .floating-scroll-btn-up {
            bottom: 5rem;
          }
          .floating-scroll-btn-down {
            bottom: 1.5rem;
          }
        }
      `}</style>

      <button
        className={`floating-scroll-btn floating-scroll-btn-up ${showTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Ir al inicio"
        aria-label="Scroll to top"
      >
        <ChevronUp size={22} />
      </button>

      <button
        className={`floating-scroll-btn floating-scroll-btn-down ${showBottom ? 'visible' : ''}`}
        onClick={scrollToBottom}
        title="Ir al final"
        aria-label="Scroll to bottom"
      >
        <ChevronDown size={22} />
      </button>
    </>
  );
};

export default FloatingScrollButtons;
