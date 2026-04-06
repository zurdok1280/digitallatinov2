import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthCallbackPage.css';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      navigate('/payment', { replace: true });
    } else {
      navigate('/?error=auth_failed', { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="auth-callback-container">
      <div className="auth-spinner-wrapper">
        <div className="auth-spinner"></div>
        <div className="auth-text">Autenticando tu cuenta...</div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
