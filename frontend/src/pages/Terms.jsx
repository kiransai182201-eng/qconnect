import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import SEOHelper from '../components/SEOHelper';

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', padding: '4rem 2rem 2rem 2rem' }}>
      <SEOHelper 
        title="Terms of Service" 
        description="Review the terms and conditions for using the QConnect platform. Understand the rights and responsibilities of cafe owners and customers." 
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
            <FileText size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>Terms of Service</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Last updated: June 20, 2026</p>
          </div>
        </div>

        {/* Content Panel */}
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>1. Acceptance of Terms</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              By registering a cafe, configuring a digital menu, or placing orders via the QConnect QR system, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must cease using our software immediately.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>2. Account Responsibilities</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Cafe owners are fully responsible for preserving the confidentiality of their credentials and all active settings:
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>You must supply precise and complete shop information during setup.</li>
              <li>You are solely responsible for all menu listings, pricing accuracy, and taxes.</li>
              <li>Any security breaches or unauthorized login attempts must be reported to us immediately.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>3. Fair & Proper Usage</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              We grant a limited, non-exclusive, non-transferable license to access our platform. You agree not to:
            </p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Launch automated request loops or scraping scripts targeting our API endpoints.</li>
              <li>Impersonate other restaurant brands or publish misleading menu offerings.</li>
              <li>Utilize client-side scripts to bypass ordering limits or rate restrictions.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>4. Platform Availability & Disclaimers</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              QConnect is provided on an "as-is" and "as-available" basis. We make no warranty that our service will be completely uninterrupted, secure, or free from minor network latency. We are not liable for lost restaurant revenue due to local internet outages, power failures, or client device errors.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>5. Revisions to Terms</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              We reserve the right to modify these terms at any time. When we make edits, we will revise the date at the top of this document. Continued usage of our system implies acceptance of the newly revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
