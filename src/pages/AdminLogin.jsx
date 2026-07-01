import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import '../admin-dashboard.css';

// Whitelisted admin emails
const ADMIN_EMAILS = [
  'sunnykiran715@gmail.com',
  'revanthrevanth4248@gmail.com'
];

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (ADMIN_EMAILS.includes(session.user.email?.toLowerCase())) {
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. This area is restricted to authorized developers only.');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/admin' }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email is whitelisted before even trying to login
      if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        throw new Error('Access denied. This area is restricted to authorized developers only.');
      }

      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-badge">
          <Shield size={14} />
          Developer Access
        </div>

        <h1 className="admin-login-title">Admin Panel</h1>
        <p className="admin-login-subtitle">Sign in with your authorized developer account</p>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              className="admin-login-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="developer@gmail.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="admin-login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          <span style={{ padding: '0 10px', color: '#64748b', fontSize: '0.8rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="admin-google-btn"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" style={{ width: '18px', height: '18px' }} />
          Sign in with Google
        </button>

        <button className="admin-login-back" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Website
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
