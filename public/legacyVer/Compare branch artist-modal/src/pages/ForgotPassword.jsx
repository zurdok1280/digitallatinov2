import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Music, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import '../components/LoginForm.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://security.digital-latino.com/api/auth/forgot-password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Hubo un problema al enviar el correo.");
      }

      setIsSubmitted(true);
      toast({
        title: "¡Correo enviado!",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });

    } catch (error) {
      console.error(error);
      let errorMessage = "Hubo un problema al enviar el correo.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  if (isSubmitted) {
    return (
      <div style={containerStyle}>
        <div className="login-modal-wrapper" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div className="login-music-icon-wrapper" style={{ background: 'linear-gradient(to right, #10b981, #059669)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }}>
            <CheckCircle2 style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>¡Revisa tu correo!</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Hemos enviado un enlace de recuperación a <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{email}</span>.
          </p>
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
          <img
            src="/logo.png"
            alt="Digital Latino"
            className="login-logo"
          />
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0 0.5rem 0' }}>Recuperar Contraseña</h2>
          <p className="login-subtitle">
            Ingresa tu email y te enviaremos instrucciones para restablecer tu cuenta.
          </p>
        </div>

        <div className="login-form-container" style={{ minHeight: 'auto', padding: '1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="login-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="email" className="login-label">
                Correo Electrónico
              </label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="login-loading-spinner"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles style={{ width: '1rem', height: '1rem' }} />
                  <span>Enviar enlace de recuperación</span>
                </div>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link
              to="/"
              className="login-forgot-link"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 0 }}
            >
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
