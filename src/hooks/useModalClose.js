import { useState, useCallback } from 'react';

/**
 * useModalClose
 * Adds a brief "closing" phase before the real onClose fires,
 * so CSS exit animations can play to completion.
 *
 * Usage:
 *   const { isClosing, handleClose } = useModalClose(onClose);
 *   // overlay → className={`modal-overlay-anim${isClosing ? ' closing' : ''}`}
 *   // panel   → className={`modal-panel-anim${isClosing ? ' closing' : ''}`}
 *   // all close buttons → onClick={handleClose}
 *
 * @param {Function} onClose   – original close callback from parent
 * @param {number}   duration  – ms to wait before calling onClose (match CSS duration)
 */
export function useModalClose(onClose, duration = 260) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    const t = setTimeout(() => {
      setIsClosing(false);
      if (typeof onClose === 'function') onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return { isClosing, handleClose };
}
