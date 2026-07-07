import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import SEOHelper from '../components/SEOHelper';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Simulate submission delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', padding: '4rem 2rem 2rem 2rem' }}>
      <SEOHelper 
        title="Contact Us" 
        description="Get in touch with the QConnect team for technical support, integration requests, or sales questions. We are here to help." 
      />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation */}
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--color-accent)', 
            fontWeight: '600', 
            marginBottom: '2rem',
            transition: 'color var(--transition-fast)'
          }}
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>

        {/* Title */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Get in Touch</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Have questions about setting up your restaurant? Reach out to our support team.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '2rem' }}>
          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-accent)' }}>Contact Details</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--color-accent)' }}><Mail size={20} /></div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Support Email</p>
                  <a href="mailto:support@qconnect.menu" style={{ fontWeight: '500' }}>support@qconnect.menu</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--color-accent)' }}><Phone size={20} /></div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Business Phone</p>
                  <a href="tel:+18005550199" style={{ fontWeight: '500' }}>+1 (800) 555-0199</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--color-accent)' }}><MapPin size={20} /></div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Headquarters</p>
                  <p style={{ fontWeight: '500', margin: 0 }}>San Francisco, CA 94103</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                💡 <strong>Average Response Time:</strong> We generally reply to support inquiries within 2 hours during normal business operating hours (9 AM - 6 PM PST).
              </p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: '#4CAF50', animation: 'scaleUp 0.3s ease-out' }}>
                  <CheckCircle2 size={56} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: 0 }}>Message Received!</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>
                  Thank you for reaching out. A representative will email you shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn-primary" 
                  style={{ marginTop: '1rem', padding: '10px 24px', fontSize: '0.9rem' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name" 
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--color-surface)', 
                      border: '1px solid var(--glass-border)', 
                      color: 'var(--color-text-main)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" 
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--color-surface)', 
                      border: '1px solid var(--glass-border)', 
                      color: 'var(--color-text-main)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help your business?" 
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--color-surface)', 
                      border: '1px solid var(--glass-border)', 
                      color: 'var(--color-text-main)',
                      outline: 'none',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)',
                      resize: 'vertical'
                    }} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    marginTop: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Submitting...' : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
