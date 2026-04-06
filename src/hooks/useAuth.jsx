import React, { createContext, useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();
  const logoutTimer = useRef(null);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
    navigate('/', { replace: true });
  }, [navigate]);

  const startLogoutTimer = useCallback((expirationTime) => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    const currentTime = Date.now();
    const expiresIn = (expirationTime * 1000) - currentTime;
    if (expiresIn <= 0) {
      logout();
      return;
    }
    const timerDuration = expiresIn - 10000;
    if (timerDuration > 0) {
      logoutTimer.current = setTimeout(() => {
        console.log("Token a punto de expirar. Cerrando sesión automáticamente.");
        logout();
      }, timerDuration);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Verificar validez del token
        if (decoded.exp * 1000 < Date.now()) {
          logout();
          return;
        }

        // Cargar allowedArtistId/Name desde localStorage de manera temporal (si el JWT base no lo trae)
        if (decoded.role === 'ARTIST') {
          const stId = localStorage.getItem(`artistId_${decoded.email}`);
          const stName = localStorage.getItem(`artistName_${decoded.email}`);
          if (stId) {
            decoded.allowedArtistId = stId;
            decoded.allowedArtistName = stName;
          }
        }

        setUser(decoded);
        localStorage.setItem('authToken', token);
      } catch (error) {
        console.error("Error invocando token:", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token, logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error("Token expirado");
        }
        setToken(storedToken);
        startLogoutTimer(decoded.exp);
      } catch (error) {
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      }
    }
  }, [startLogoutTimer]);

  const login = useCallback((newToken) => {
    localStorage.setItem('authToken', newToken);
    try {
      const decoded = jwtDecode(newToken);
      setUser(decoded);
      setToken(newToken);
      startLogoutTimer(decoded.exp);
    } catch (error) {
      console.error("Token JWT inválido:", error);
    }
  }, [startLogoutTimer]);

  const isAuthenticated = !!token;

  const value = useMemo(() => ({
    token, isAuthenticated, user, login, logout, showLoginDialog, setShowLoginDialog, updateUser
  }), [token, isAuthenticated, user, login, logout, showLoginDialog, setShowLoginDialog, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
