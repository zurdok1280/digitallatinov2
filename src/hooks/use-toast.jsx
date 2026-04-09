import { useState, useEffect } from 'react';

const TOAST_TIMEOUT = 8000;
let memoryState = [];
let listeners = [];

function dispatch(action) {
  if (action.type === "ADD_TOAST") {
    memoryState = [{ ...action.toast }];
  } else if (action.type === "DISMISS_TOAST") {
    memoryState = memoryState.filter(t => t.id !== action.toastId);
  }
  listeners.forEach(listener => listener(memoryState));
}

export function toast({ title, description, variant = "default" }) {
  const id = Date.now().toString() + Math.random().toString(36).substring(2);
  dispatch({ type: "ADD_TOAST", toast: { id, title, description, variant } });
  
  setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  }, TOAST_TIMEOUT);
}

export function dismissToast(toastId) {
  dispatch({ type: "DISMISS_TOAST", toastId });
}

export function useToast() {
  const [state, setState] = useState(memoryState);
  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter(l => l !== setState);
    };
  }, []);
  return { toasts: state, toast, dismissToast };
}
