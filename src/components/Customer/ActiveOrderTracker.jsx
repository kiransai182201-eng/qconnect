import React from 'react';
import { Utensils } from 'lucide-react';

const ActiveOrderTracker = ({ activeOrder, setActiveOrder, isDarkMode }) => {
  if (!activeOrder) return null;

  return (
    <div className={`customer-page-wrapper ${isDarkMode ? 'customer-dark-mode' : ''}`} style={{ 
      minHeight: '100vh', 
      padding: '2rem 1.5rem', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'background-color 0.4s ease, color 0.4s ease' 
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ 
          width: '52px', 
          height: '52px', 
          backgroundColor: 'var(--card-bg)', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: 'var(--card-shadow)', 
          border: '1px solid var(--card-border)' 
        }}>
          <Utensils color="var(--color-accent)" size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Order Status</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
            #{activeOrder.order_number} • Table {activeOrder.table_number}
          </p>
        </div>
      </header>

      {/* Status Tracker */}
      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        padding: '1.75rem', 
        borderRadius: '24px', 
        boxShadow: 'var(--card-shadow)', 
        marginBottom: '1.75rem', 
        border: '1px solid var(--card-border)' 
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Live Progress</h2>
        
        <div className="customer-tracker-timeline">
          <div className="customer-timeline-line"></div>
          
          {/* Pending / Received */}
          <div className="customer-timeline-item">
            <div className={`customer-timeline-dot ${
              ['pending', 'accepted', 'preparing', 'ready', 'delivered'].includes(activeOrder.status) 
                ? (activeOrder.status === 'pending' || activeOrder.status === 'accepted' ? 'active' : 'completed') 
                : ''
            }`}></div>
            <div>
              <p style={{ 
                margin: 0, 
                fontWeight: '700', 
                fontSize: '0.95rem',
                color: ['pending', 'accepted', 'preparing', 'ready', 'delivered'].includes(activeOrder.status) ? 'var(--text-primary)' : 'var(--text-muted)' 
              }}>Order Received</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Waiting for kitchen to accept.</p>
            </div>
          </div>

          {/* Preparing */}
          <div className="customer-timeline-item">
            <div className={`customer-timeline-dot ${
              activeOrder.status === 'preparing' 
                ? 'active' 
                : ['ready', 'delivered'].includes(activeOrder.status) ? 'completed' : ''
            }`}></div>
            <div>
              <p style={{ 
                margin: 0, 
                fontWeight: '700', 
                fontSize: '0.95rem',
                color: ['preparing', 'ready', 'delivered'].includes(activeOrder.status) ? 'var(--text-primary)' : 'var(--text-muted)' 
              }}>Preparing</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>The chef is cooking your meal!</p>
            </div>
          </div>

          {/* Ready */}
          <div className="customer-timeline-item">
            <div className={`customer-timeline-dot ${
              activeOrder.status === 'ready' 
                ? 'active' 
                : activeOrder.status === 'delivered' ? 'completed' : ''
            }`}></div>
            <div>
              <p style={{ 
                margin: 0, 
                fontWeight: '700', 
                fontSize: '0.95rem',
                color: ['ready', 'delivered'].includes(activeOrder.status) ? 'var(--text-primary)' : 'var(--text-muted)' 
              }}>Ready to Serve</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your order is coming to Table {activeOrder.table_number}.</p>
            </div>
          </div>

          {/* Delivered */}
          <div className="customer-timeline-item" style={{ marginBottom: 0 }}>
            <div className={`customer-timeline-dot ${
              activeOrder.status === 'delivered' ? 'active' : ''
            }`}></div>
            <div>
              <p style={{ 
                margin: 0, 
                fontWeight: '700', 
                fontSize: '0.95rem',
                color: activeOrder.status === 'delivered' ? 'var(--text-primary)' : 'var(--text-muted)' 
              }}>Delivered</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enjoy your meal!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        padding: '1.75rem', 
        borderRadius: '24px', 
        boxShadow: 'var(--card-shadow)', 
        border: '1px solid var(--card-border)' 
      }}>
        <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Items Ordered</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeOrder.order_items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--pill-border)' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.item_name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>₹{item.price_at_time}</p>
              </div>
              <div style={{ 
                fontWeight: '800', 
                backgroundColor: 'var(--bg-secondary)', 
                color: 'var(--text-primary)', 
                padding: '4px 14px', 
                borderRadius: '20px',
                fontSize: '0.85rem',
                border: '1px solid var(--pill-border)'
              }}>
                x{item.quantity}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem' }}>
          <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Total Amount</span>
          <span style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>₹{activeOrder.total_amount}</span>
        </div>
      </div>

      <button 
        onClick={() => setActiveOrder(null)} 
        style={{ 
          width: '100%', 
          marginTop: 'auto', 
          padding: '1.1rem', 
          borderRadius: '20px', 
          border: '1px solid var(--pill-border)', 
          backgroundColor: 'var(--card-bg)', 
          color: 'var(--text-primary)', 
          fontWeight: '700', 
          cursor: 'pointer', 
          transition: 'all 0.2s',
          boxShadow: 'var(--card-shadow)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          marginTop: '2.5rem'
        }}
        aria-label="Close active order view"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--card-shadow)';
        }}
      >
        Close & Back to Menu
      </button>
    </div>
  );
};

export default ActiveOrderTracker;
