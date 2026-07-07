import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

const MenuHeader = ({ shop, tableNumber, onOrderHistoryClick, isDarkMode, lang, setLang, t }) => {
  return (
    <>
      {/* Holiday Mode / Closed Overlay */}
      {shop.holiday_mode && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          backgroundColor: 'rgba(7, 10, 19, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: '28px',
            padding: '3rem 2rem',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--card-shadow-hover)',
            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: '1px solid var(--card-border)',
            color: 'var(--text-primary)'
          }}>
            <div style={{
              width: '88px', height: '88px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.75rem auto',
              border: '1px solid var(--card-border)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <span style={{ fontSize: '2.75rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🔒</span>
            </div>
            <h2 style={{ margin: '0 0 0.85rem 0', fontSize: '1.65rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{t.closedTitle}</h2>
            <p style={{ margin: '0 0 1.75rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{t.closedMessage}</p>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
              color: '#ef4444', 
              padding: '10px 22px', 
              borderRadius: '99px', 
              fontWeight: '700', 
              fontSize: '0.85rem',
              border: '1px solid rgba(239, 68, 68, 0.15)'
            }}>
              <Clock size={16} />
              {t.restaurantStatusClosed}
            </div>
          </div>
        </div>
      )}

      <header className="customer-header-container" style={{ padding: '1rem 1rem 0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: 'var(--color-accent)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 109, 0, 0.25)',
            flexShrink: 0
          }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h1 className="customer-shop-title" style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.05em' }}>
              {shop.name}
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Table <span style={{ color: 'var(--color-accent)' }}>{tableNumber || 'Unknown'}</span> • <span style={{ color: '#10b981' }}>Now serving</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOrderHistoryClick}
            style={{
              backgroundColor: '#2e4a24',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(46, 74, 36, 0.2)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#385a2c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2e4a24'}
          >
            Order History
          </button>
        </div>
      </header>
    </>
  );
};

export default MenuHeader;
