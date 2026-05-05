import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Sparkles, Music, ArrowLeft, Eye, EyeOff } from "lucide-react";
import '../components/LoginForm.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setError("Token no válido o inexistente.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://security.digital-latino.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocurrió un error al restablecer la contraseña.");
      }

      setMessage("¡Contraseña restablecida con éxito! Redirigiendo...");

      setTimeout(() => {
        navigate("/?login=true");
      }, 3000);

    } catch (err) {
      console.error(err);
      let errorMessage = "Ocurrió un error al restablecer la contraseña.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f111a',
    padding: '1rem',
    fontFamily: "'Outfit', sans-serif"
  };

  if (!token) {
    return (
      <div style={containerStyle}>
        <div className="login-modal-wrapper" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2 style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Enlace inválido</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>No se encontró un token de seguridad en el enlace.</p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className="login-submit-btn" style={{ background: 'rgba(255, 255, 255, 0.1)', boxShadow: 'none' }}>
              <ArrowLeft size={18} /> Volver al inicio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="login-modal-wrapper">
        <div className="login-header-group">
          <div className="login-music-icon-wrapper">
            <Music style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0 0.5rem 0' }}>Restablecer Contraseña</h2>
          <p className="login-subtitle">
            Ingresa tu nueva contraseña a continuación.
          </p>
        </div>

        <div className="login-form-container" style={{ minHeight: 'auto', padding: '1.5rem' }}>
          {message && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#34d399', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="login-form-group" style={{ marginBottom: 0 }}>
              <label className="login-label">Nueva Contraseña</label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 0
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-form-group" style={{ marginBottom: 0 }}>
              <label className="login-label">Confirmar Contraseña</label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 0
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="login-loading-spinner"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles style={{ width: '1rem', height: '1rem' }} />
                  <span>Guardar Nueva Contraseña</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
