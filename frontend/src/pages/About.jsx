import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Coffee, Smartphone, Zap, Sparkles } from 'lucide-react';
import SEOHelper from '../components/SEOHelper';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', padding: '4rem 2rem 2rem 2rem' }}>
      <SEOHelper 
        title="About Us" 
        description="Discover the story of QConnect, our vision for digital restaurant management, and how our QR-code Ordering platform empowers cafe owners." 
      />
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', backgroundColor: 'rgba(201, 149, 42, 0.1)', color: 'var(--color-accent)', padding: '16px', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Coffee size={36} />
          </div>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', fontWeight: '700' }}>Our Story</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Bridging the gap between fine dining tradition and modern contactless ordering technology.
          </p>
        </div>

        {/* Grid or Features */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
            <div style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>
              <Smartphone size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Instant QR Scan</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Customers scan a unique QR code at their table to view the menu, select items, and place orders directly without installing any applications.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '20px' }}>
            <div style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Live Kitchen Sync</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Orders sync instantly with the staff's kitchen queue in real-time, reducing customer wait times and minimizing communication errors.
            </p>
          </div>
        </div>

        {/* Narrative Panel */}
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>Empowering Hospitality</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            QConnect was founded in 2026 with a straightforward mission: to eliminate the friction from cafe operations. Traditional ordering can be slow and prone to errors during busy lunch hours. By offering a digital, responsive tabletop menu, we empower servers to focus on hospitality while the order transmission is handled automatically.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Our platform provides menu building tools, live dashboard analytics, QR code builders, customer feedback collectors, and historical bookkeeping. We believe that restaurants of all sizes should have access to state-of-the-art software without paying hefty commissions.
          </p>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', padding: '1.25rem', backgroundColor: 'rgba(201, 149, 42, 0.05)', border: '1px dashed var(--glass-border)', borderRadius: '16px' }}>
            <Sparkles style={{ color: 'var(--color-accent)', flexShrink: 0 }} size={24} />
            <p style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: '500', margin: 0 }}>
              Join thousands of restaurant owners making their service smarter, faster, and contactless today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
