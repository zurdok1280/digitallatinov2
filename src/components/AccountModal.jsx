import React, { useState, useEffect } from "react";
import { X, User, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import './LoginForm.css';

export default function AccountModal({ onClose }) {
  const { token } = useAuth();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [errorSub, setErrorSub] = useState(null);
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await fetch("https://security.digital-latino.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Error al obtener información");
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [token]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!token) return;
      try {
        setLoadingSub(true);
        const response = await fetch("https://security.digital-latino.com/api/subscriptions/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Error al obtener suscripción");
        }
        const data = await response.json();
        setSubscriptionData(data);
      } catch (err) {
        setErrorSub(err.message);
      } finally {
        setLoadingSub(false);
      }
    };
    fetchSubscriptionData();
  }, [token]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setErrorSub(null);
    try {
      const response = await fetch("https://security.digital-latino.com/api/subscriptions/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "No se pudo cancelar.");
      }
      const updatedSubData = await response.json();
      setSubscriptionData(updatedSubData);
      setShowConfirmCancel(false);
    } catch (err) {
      setErrorSub(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Debe tener al menos 6 caracteres.");
      return;
    }
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const response = await fetch("https://security.digital-latino.com/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudo cambiar la contraseña.");
      }
      setPasswordSuccess("¡Contraseña actualizada con éxito!");
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordSuccess(null);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isCancelled = subscriptionData?.status?.toLowerCase().includes('cancela');
  const isActive = subscriptionData?.status?.toLowerCase() === 'active' || subscriptionData?.status?.toLowerCase() === 'activo';

  return (
    <div className="flex-center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, padding: '1rem' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="login-modal-wrapper" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} className="login-close-btn" aria-label="Cerrar modal">
          <X size={24} />
        </button>

        <div className="login-header-group" style={{ marginBottom: '1.5rem' }}>
          <div className="login-music-icon-wrapper" style={{ width: '3.5rem', height: '3.5rem', marginBottom: '0.5rem' }}>
            <User style={{ width: '1.8rem', height: '1.8rem', color: '#ffffff' }} />
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 'bold' }}>Mi Cuenta</h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {/* USER INFO CARD */}
          <div className="login-form-container" style={{ flex: '1 1 300px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#c084fc', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Perfil</h3>
            
            {loading ? (
              <div className="flex-center" style={{ height: '150px' }}><div className="login-loading-spinner"></div></div>
            ) : error ? (
              <p style={{ color: '#f87171' }}>{error}</p>
            ) : userData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="flex-center" style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'linear-gradient(to right, #9333ea, #db2777)', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {userData.firstName?.charAt(0).toUpperCase() || <User size={24} />}
                  </div>
                  <div>
                    <p style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.1rem' }}>{userData.firstName} {userData.lastName}</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{userData.email}</p>
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  {!showPasswordForm ? (
                    <button onClick={() => setShowPasswordForm(true)} className="login-secondary-btn">
                      Cambiar Contraseña
                    </button>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Cambiar Contraseña</h4>
                      <input type="password" placeholder="Contraseña Actual" className="login-input" required value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} style={{ height: '2.5rem' }} />
                      <input type="password" placeholder="Nueva Contraseña" className="login-input" required minLength={6} value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} style={{ height: '2.5rem' }} />
                      <input type="password" placeholder="Confirmar Nueva Contraseña" className="login-input" required minLength={6} value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={{ height: '2.5rem' }} />
                      
                      {passwordError && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{passwordError}</p>}
                      {passwordSuccess && <p style={{ color: '#34d399', fontSize: '0.8rem' }}>{passwordSuccess}</p>}
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={() => setShowPasswordForm(false)} className="login-secondary-btn" style={{ flex: 1 }}>Cancelar</button>
                        <button type="submit" disabled={isChangingPassword} className="login-submit-btn" style={{ flex: 1, height: '2.5rem' }}>
                          {isChangingPassword ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SUBSCRIPTION CARD */}
          <div className="login-form-container" style={{ flex: '1 1 300px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#c084fc', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Suscripción</h3>
            
            {loadingSub ? (
              <div className="flex-center" style={{ height: '150px' }}><div className="login-loading-spinner"></div></div>
            ) : errorSub ? (
              <p style={{ color: '#f87171' }}>{errorSub}</p>
            ) : subscriptionData ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Plan Actual</p>
                    <p style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.3rem', textTransform: 'capitalize' }}>{subscriptionData.plan}</p>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Estado</p>
                    <span style={{ 
                      display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.25rem', textTransform: 'capitalize',
                      background: isCancelled ? 'rgba(245, 158, 11, 0.2)' : isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: isCancelled ? '#fbbf24' : isActive ? '#34d399' : '#e5e7eb'
                    }}>
                      {subscriptionData.status}
                    </span>
                  </div>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Acceso hasta</p>
                    <p style={{ color: '#ffffff', fontWeight: '500', fontSize: '1.1rem' }}>{subscriptionData.expiresAt}</p>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {!showConfirmCancel ? (
                    <button onClick={() => setShowConfirmCancel(true)} disabled={isCancelled} className="login-danger-btn">
                      {isCancelled ? "Cancelación Programada" : "Cancelar Suscripción"}
                    </button>
                  ) : (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                      <AlertCircle size={24} color="#ef4444" style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '1rem' }}>¿Seguro que deseas cancelar? Tu acceso continuará hasta la fecha de expiración.</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setShowConfirmCancel(false)} className="login-secondary-btn" style={{ flex: 1, fontSize: '0.85rem' }}>Atrás</button>
                        <button onClick={handleCancelSubscription} disabled={isCancelling} className="login-danger-btn" style={{ flex: 1, fontSize: '0.85rem' }}>
                          {isCancelling ? "..." : "Sí, Cancelar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
               <p style={{ color: '#9ca3af' }}>No hay información de suscripción.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
