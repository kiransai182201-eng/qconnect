import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../index.css';
import { useLanguage } from '../contexts/LanguageContext';

const RegisterLogin = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        
        if (data?.user && !data.session) {
          setMessage('Signup successful! A verification email has been sent. Please check your inbox.');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="app-container">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--color-primary)', padding: '12px', borderRadius: '50%', marginBottom: '1rem' }}>
            <Coffee size={32} color="var(--color-accent)" />
          </div>
          <h2 style={{ textAlign: 'center', margin: 0 }}>Q Connect</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {isLogin ? t.loginTitle : t.registerTitle}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div>
              <label htmlFor="reg-fullname" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Full Name</label>
              <input 
                id="reg-fullname"
                type="text" 
                required 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }} 
                placeholder="John Doe" 
              />
            </div>
          )}
          
          <div>
            <label htmlFor="reg-email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t.email}</label>
            <input 
              id="reg-email"
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }} 
              placeholder="owner@cafe.com" 
            />
          </div>

          <div>
            <label htmlFor="reg-password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t.password}</label>
            <input 
              id="reg-password"
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }} 
              placeholder="••••••••" 
            />
          </div>

          <button id="login-submit-btn" type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? (isLogin ? t.loggingIn : t.registering) : (isLogin ? t.login : t.register)} <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            <span style={{ padding: '0 10px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          </div>
          
          <button id="google-login-btn" type="button" onClick={handleGoogleLogin} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '30px', border: 'none', background: 'white', color: '#333', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'transform var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: '20px', height: '20px' }} />
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            id="toggle-auth-mode-btn"
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? t.dontHaveAccount : t.alreadyHaveAccount}
          </button>
        </div>
      </div>
    </main>
  );
};

export default RegisterLogin;
