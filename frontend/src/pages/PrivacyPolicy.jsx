import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import SEOHelper from '../components/SEOHelper';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', padding: '4rem 2rem 2rem 2rem' }}>
      <SEOHelper 
        title="Privacy Policy" 
        description="Learn how QConnect collects, uses, and protects your personal and business data. Read our comprehensive Privacy Policy." 
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

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'rgba(201, 149, 42, 0.1)', color: 'var(--color-accent)', padding: '16px', borderRadius: '16px' }}>
            <Shield size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Last updated: June 20, 2026</p>
          </div>
        </div>

        {/* Content Panel */}
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>1. Information We Collect</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              QConnect ("we", "our", or "us") provides a digital menu and table ordering platform. We collect information to deliver and improve our services, including:
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Account Info:</strong> Name, business email, phone number, and password hash when you register as a Cafe Owner.</li>
              <li><strong>Shop Details:</strong> Cafe name, address, menu items, prices, and branding imagery.</li>
              <li><strong>Order Data:</strong> Customer table numbers, selected items, order timestamp, and special instructions.</li>
              <li><strong>Technical Data:</strong> IP address, device model, browser version, and page performance logs.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>2. How We Use Your Information</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              We process data to fulfill contract agreements and maintain the reliability of QConnect:
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>To construct and display digital menus for QR-code scanning.</li>
              <li>To update shop owners with live incoming orders via their dashboard.</li>
              <li>To process and analyze restaurant metrics (e.g. total sales, popular items).</li>
              <li>To protect our database against malicious request spikes and fraud.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>3. Row-Level Security & Data Isolation</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Data security is built directly into our engine. We utilize PostgreSQL Row-Level Security (RLS) to enforce isolation. Anonymous customers scanning a QR code are only permitted to submit order records and retrieve menus linked to that specific shop. Restaurant owners can only view, query, and modify their own catalog, order history, and cafe configurations.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>4. Third-Party Services</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Our database infrastructure is powered by Supabase. Your information is securely stored inside database clusters located in highly compliant, certified cloud hosting environments. We do not sell or trade your data to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>5. Your Rights (GDPR & CCPA)</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Depending on your location, you have the right to request access to, correction of, or deletion of your personal data. Cafe owners can export their transaction histories or delete their account directly through the settings panel. If you need any assistance, contact our data support team at support@qconnect.menu.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
