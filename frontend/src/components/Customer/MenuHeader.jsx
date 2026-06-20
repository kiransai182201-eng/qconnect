import React from 'react';
import { Clock } from 'lucide-react';

const MenuHeader = ({ shop, isDarkMode, lang, setLang, t }) => {
  return (
    <>
      {/* Holiday Mode / Closed Overlay */}
      {shop.holiday_mode && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.4s ease-out',
            border: isDarkMode ? '1px solid #334155' : 'none',
            color: isDarkMode ? '#f8fafc' : '#1a1a1a'
          }}>
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}>
              <span style={{ fontSize: '2.5rem' }}>🔒</span>
            </div>
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.5rem', fontWeight: '800' }}>{t.closedTitle}</h2>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: isDarkMode ? '#94a3b8' : '#6b7280', lineHeight: '1.6' }}>{t.closedMessage}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem' }}>
              <Clock size={18} />
              {t.restaurantStatusClosed}
            </div>
          </div>
        </div>
      )}

      <header style={{ padding: '2rem 1rem 1rem 1rem' }}>
        <div className="customer-header-card customer-custom-shadow">
          <div className="customer-header-logo">
            {shop.logo_url ? <img src={shop.logo_url} alt={`${shop.name} logo`} style={{ width: '100%', height: '100%', borderRadius: '0.75rem', objectFit: 'cover' }} loading="lazy" /> : '☕'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="customer-shop-title">{shop.name}</h1>
            <p className="customer-proprietor">Proprietor: {shop.owner_name}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
              <span style={{ fontSize: '10px', fontWeight: '500', color: isDarkMode ? '#22c55e' : '#15803d' }}>Menu live</span>
            </div>
            <button 
              aria-label={`Switch language to ${lang === 'EN' ? 'Telugu' : 'English'}`}
              style={{ display: 'flex', backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6', border: isDarkMode ? '1px solid #334155' : 'none', borderRadius: '30px', padding: '2px', cursor: 'pointer' }} 
              onClick={() => setLang(lang === 'EN' ? 'TE' : 'EN')}
            >
              <div style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: lang === 'TE' ? '#ff6b35' : 'transparent', color: lang === 'TE' ? 'white' : (isDarkMode ? '#94a3b8' : '#6b7280'), fontWeight: 'bold', fontSize: '0.7rem', transition: 'all 0.2s' }}>TE</div>
              <div style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: lang === 'EN' ? '#ff6b35' : 'transparent', color: lang === 'EN' ? 'white' : (isDarkMode ? '#94a3b8' : '#6b7280'), fontWeight: 'bold', fontSize: '0.7rem', transition: 'all 0.2s' }}>EN</div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default MenuHeader;
