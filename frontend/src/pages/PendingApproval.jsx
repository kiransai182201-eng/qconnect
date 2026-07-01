import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, RefreshCw, Store, ArrowLeft, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../index.css';

const PendingApproval = () => {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [status, setStatus] = useState('PENDING'); // PENDING | APPROVED | REJECTED
  const [checking, setChecking] = useState(false);
  const [pulseAnim, setPulseAnim] = useState(true);

  useEffect(() => {
    const loadRegistration = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/register');
        return;
      }

      const db = JSON.parse(localStorage.getItem('supabase_mock_db') || '{}');
      const userEmail = session.user.email?.toLowerCase();

      // Check if user already has a shop (approved)
      const userShop = (db.shops || []).find(s => {
        const shopUser = (db.users || []).find(u => u.id === s.user_id);
        return shopUser?.email?.toLowerCase() === userEmail;
      });

      if (userShop) {
        // Already approved! Redirect to dashboard
        navigate('/dashboard');
        return;
      }

      // Find pending registration
      const reg = (db.registrations || []).find(
        r => r.email?.toLowerCase() === userEmail
      );

      if (reg) {
        setRegistration(reg);
        setStatus(reg.status);
        if (reg.status === 'REJECTED') {
          // If rejected, show the rejection screen
        }
      } else {
        // No pending registration found — maybe already approved
        // Check if shop exists for this user
        const existingShop = (db.shops || []).find(s => s.user_id === session.user.id);
        if (existingShop) {
          navigate('/dashboard');
        } else {
          navigate('/register');
        }
      }
    };

    loadRegistration();
  }, [navigate]);

  // Auto-check for approval every 5 seconds
  useEffect(() => {
    if (status !== 'PENDING') return;

    const interval = setInterval(() => {
      checkApprovalStatus(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  // Listen for cross-tab storage changes (admin approving in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'supabase_mock_broadcast' || e.key === 'supabase_mock_db') {
        checkApprovalStatus(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkApprovalStatus = async (silent = false) => {
    if (!silent) setChecking(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const db = JSON.parse(localStorage.getItem('supabase_mock_db') || '{}');
    const userEmail = session.user.email?.toLowerCase();

    // Check if shop was created (registration approved)
    const userShop = (db.shops || []).find(s => {
      const shopUser = (db.users || []).find(u => u.id === s.user_id);
      return shopUser?.email?.toLowerCase() === userEmail;
    });

    if (userShop) {
      // Re-sign-in as the new shop owner user
      const shopOwner = (db.users || []).find(u => u.id === userShop.user_id);
      if (shopOwner) {
        localStorage.setItem('supabase_mock_session', JSON.stringify({ user: shopOwner }));
      }
      setStatus('APPROVED');
      setTimeout(() => navigate('/dashboard'), 2000);
      if (!silent) setChecking(false);
      return;
    }

    // Check if registration was rejected
    const reg = (db.registrations || []).find(
      r => r.email?.toLowerCase() === userEmail
    );
    if (reg) {
      setRegistration(reg);
      setStatus(reg.status);
    } else {
      // Registration record removed (approved and cleaned up)
      setStatus('APPROVED');
      // Find and sign in as new user
      const newUser = (db.users || []).find(u => u.email?.toLowerCase() === userEmail && u.role === 'owner');
      if (newUser) {
        localStorage.setItem('supabase_mock_session', JSON.stringify({ user: newUser }));
      }
      setTimeout(() => navigate('/dashboard'), 2000);
    }

    if (!silent) {
      setTimeout(() => setChecking(false), 800);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkmark-draw {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      <div style={{
        maxWidth: '480px', width: '100%',
        background: 'var(--color-surface)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: 'clamp(28px, 5vw, 44px)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.2)',
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease'
      }}>

        {/* ─── PENDING STATE ─── */}
        {status === 'PENDING' && (
          <>
            {/* Animated Icon */}
            <div style={{
              position: 'relative', width: '100px', height: '100px',
              margin: '0 auto 28px', animation: 'float 3s ease-in-out infinite'
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '3px solid rgba(201, 149, 42, 0.2)',
                animation: pulseAnim ? 'pulse-ring 2s ease-out infinite' : 'none'
              }}></div>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(201, 149, 42, 0.15), rgba(201, 149, 42, 0.05))',
                border: '2px solid rgba(201, 149, 42, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Clock size={42} color="var(--color-accent)" />
              </div>
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif', fontSize: '1.5rem',
              fontWeight: 700, color: 'var(--color-accent)', marginBottom: '12px'
            }}>
              Registration Under Review
            </h1>

            <p style={{
              color: 'var(--color-text-muted)', fontSize: '0.9rem',
              lineHeight: 1.7, marginBottom: '28px', maxWidth: '360px', margin: '0 auto 28px'
            }}>
              Your shop registration has been submitted successfully!
              Our admin team will review and approve your application shortly.
            </p>

            {/* Registration Details Card */}
            {registration && (
              <div style={{
                background: 'rgba(201, 149, 42, 0.04)',
                border: '1px solid rgba(201, 149, 42, 0.15)',
                borderRadius: '16px', padding: '20px',
                textAlign: 'left', marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Store size={16} color="var(--color-accent)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    Registration Details
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    ['Shop Name', registration.shop_name],
                    ['Owner', registration.owner_name],
                    ['Category', registration.category || 'Food Joint'],
                    ['Mobile', registration.mobile],
                    ['Tables', registration.tables],
                    ['Submitted', formatDate(registration.created_at)]
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Status Badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  marginTop: '16px', padding: '8px 16px',
                  background: 'rgba(201, 149, 42, 0.1)', borderRadius: '50px',
                  border: '1px solid rgba(201, 149, 42, 0.25)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse-ring 2s ease-out infinite' }}></span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.05em' }}>
                    PENDING APPROVAL
                  </span>
                </div>
              </div>
            )}

            {/* Check Status Button */}
            <button onClick={() => checkApprovalStatus(false)} disabled={checking}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'var(--color-accent)', color: 'var(--color-bg)',
                border: 'none', fontSize: '0.9rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.04em',
                opacity: checking ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(201, 149, 42, 0.3)'
              }}>
              <RefreshCw size={16} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />
              {checking ? 'Checking...' : 'Check Approval Status'}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '12px', opacity: 0.6 }}>
              Auto-checks every 5 seconds • Open Admin Panel in another tab to approve
            </p>
          </>
        )}

        {/* ─── APPROVED STATE ─── */}
        {status === 'APPROVED' && (
          <>
            <div style={{
              width: '100px', height: '100px', margin: '0 auto 28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))',
              border: '2px solid rgba(76, 175, 80, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'fadeIn 0.5s ease'
            }}>
              <CheckCircle size={48} color="#4CAF50" />
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif', fontSize: '1.5rem',
              fontWeight: 700, color: '#4CAF50', marginBottom: '12px'
            }}>
              Registration Approved! 🎉
            </h1>

            <p style={{
              color: 'var(--color-text-muted)', fontSize: '0.9rem',
              lineHeight: 1.7, marginBottom: '20px'
            }}>
              Your shop has been activated. Redirecting you to the Owner Dashboard...
            </p>

            <div style={{
              width: '24px', height: '24px', margin: '0 auto',
              border: '3px solid rgba(76, 175, 80, 0.3)',
              borderTop: '3px solid #4CAF50',
              borderRadius: '50%', animation: 'spin 1s linear infinite'
            }}></div>
          </>
        )}

        {/* ─── REJECTED STATE ─── */}
        {status === 'REJECTED' && (
          <>
            <div style={{
              width: '100px', height: '100px', margin: '0 auto 28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <XCircle size={48} color="#ef4444" />
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif', fontSize: '1.5rem',
              fontWeight: 700, color: '#ef4444', marginBottom: '12px'
            }}>
              Registration Declined
            </h1>

            <p style={{
              color: 'var(--color-text-muted)', fontSize: '0.9rem',
              lineHeight: 1.7, marginBottom: '8px'
            }}>
              Unfortunately, your registration was not approved.
            </p>

            {registration?.rejection_reason && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '12px', padding: '14px 18px',
                marginBottom: '24px', textAlign: 'left'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reason</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', margin: '6px 0 0', lineHeight: 1.6 }}>
                  {registration.rejection_reason}
                </p>
              </div>
            )}

            <button onClick={() => navigate('/register')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'var(--color-surface)', color: 'var(--color-text-main)',
                border: '1px solid var(--glass-border)',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
              }}>
              <ArrowLeft size={16} /> Try Again with Different Details
            </button>
          </>
        )}

        {/* Footer Actions */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
          marginTop: '24px', paddingTop: '20px',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: 'var(--color-text-muted)',
            fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <ArrowLeft size={14} /> Home
          </button>
          <span style={{ color: 'var(--glass-border)' }}>•</span>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', color: 'var(--color-text-muted)',
            fontSize: '0.82rem', cursor: 'pointer'
          }}>
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
};

export default PendingApproval;
