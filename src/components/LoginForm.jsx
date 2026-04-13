import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { Mail, Lock, User, Sparkles, Music, Phone, X } from "lucide-react";
import { PasswordStrength } from "./PasswordStrength";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LoginForm.css";

export function LoginForm({ onClose }) {
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
           const response = await fetch('https://security.digital-latino.com/api/auth/login', {
    //  const response = await fetch('http://localhost:8085/api/auth/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión.");
      }

      const data = await response.json();
      login(data.token);

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      onClose();
    } catch (error) {
      let errorMessage = "Ocurrió un error desconocido.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
           const response = await fetch('https://security.digital-latino.com/api/auth/register', {
     // const response = await fetch('http://localhost:8085/api/auth/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear cuenta");
      }
      const data = await response.json();
      toast({
        title: "¡Cuenta creada!",
        description: data.message,
      });
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setConfirmPassword("");
      onClose();
      toast({
        title: "Verifica tu email",
        description: "¡Revisa tu bandeja de entrada para continuar!",
      });
    } catch (error) {
      let errorMessage = "Ocurrió un error desconocido.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error al crear cuenta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSignUpDisabled =
    loading ||
    password.length < 10 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password) ||
    password !== confirmPassword;

  return (
    <div className="login-modal-wrapper">
      {/* Botón de cerrar interno */}
      <button
        onClick={onClose}
        className="login-close-btn"
        aria-label="Cerrar modal"
      >
        <X size={24} />
      </button>

      {/* Header */}
      <div className="login-header-group">
        <div className="login-music-icon-wrapper">
          <Music style={{ width: '2rem', height: '2rem', color: '#ffffff' }} />
        </div>
        <img
          src="/logo.png"
          alt="Digital Latino"
          className="login-logo"
        />
        <p className="login-subtitle">
          Accede a tu cuenta para gestionar tus campañas musicales
        </p>
      </div>

      <div style={{ width: '100%' }}>
        {/* TabsList */}
        <div className="login-tabs-list">
          <button
            type="button"
            onClick={() => setActiveTab("signin")}
            className={`login-tab-trigger ${activeTab === "signin" ? "active" : ""}`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`login-tab-trigger ${activeTab === "signup" ? "active" : ""}`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* TabsContent - Sign In */}
        {activeTab === "signin" && (
          <div className="login-form-container">
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signin-email" className="login-label">
                  Email
                </label>
                <div className="login-input-wrapper">
                  <Mail className="login-input-icon" />
                  <input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signin-password" className="login-label">
                  Contraseña
                </label>
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" />
                  <input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="login-forgot-link"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="login-loading-spinner"></div>
                    <span>Iniciando...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles style={{ width: '1rem', height: '1rem' }} />
                    <span>Iniciar Sesión</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TabsContent - Sign Up */}
        {activeTab === "signup" && (
          <div className="login-form-container">
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-firstname" className="login-label">
                  Nombre
                </label>
                <div className="login-input-wrapper">
                  <User className="login-input-icon" />
                  <input
                    id="signup-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="login-input"
                    placeholder="Nombre"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-lastname" className="login-label">
                  Apellidos
                </label>
                <div className="login-input-wrapper">
                  <User className="login-input-icon" />
                  <input
                    id="signup-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="login-input"
                    placeholder="Apellidos"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-phone" className="login-label">
                  Teléfono (Opcional)
                </label>
                <div className="login-input-wrapper">
                  <Phone className="login-input-icon" />
                  <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="login-input"
                    placeholder="Tu número de teléfono"
                  />
                </div>
              </div>

              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-email" className="login-label">
                  Email
                </label>
                <div className="login-input-wrapper">
                  <Mail className="login-input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-password" className="login-label">
                  Contraseña
                </label>
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" />
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="login-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-confirm-password" className="login-label">
                  Confirmar Contraseña
                </label>
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" />
                  <input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="login-input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div style={{ marginTop: '-0.5rem' }}>
                <PasswordStrength password_string={password} />
              </div>

              {/* Error message if passwords do not match */}
              {passwordError && (
                <p className="login-error-msg">{passwordError}</p>
              )}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSignUpDisabled}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="login-loading-spinner"></div>
                    <span>Creando...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles style={{ width: '1rem', height: '1rem' }} />
                    <span>Crear Cuenta</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="login-footer">
        <p>Al crear una cuenta, aceptas nuestros términos y condiciones</p>
      </div>
    </div>
  );
}
