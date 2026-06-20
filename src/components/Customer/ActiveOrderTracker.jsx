import React from 'react';
import { Utensils } from 'lucide-react';

const ActiveOrderTracker = ({ activeOrder, setActiveOrder, isDarkMode }) => {
  if (!activeOrder) return null;

  return (
    <div className={`customer-page-wrapper ${isDarkMode ? 'customer-dark-mode' : ''}`} style={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#0f172a' : '#fdfbf7', padding: '1.5rem', display: 'flex', flexDirection: 'column', color: isDarkMode ? '#f8fafc' : '#1a1a1a', transition: 'background-color 0.5s ease, color 0.5s ease' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: isDarkMode ? '1px solid #334155' : 'none' }}>
          <Utensils color="#ff6b35" size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>Order Status</h1>
          <p style={{ margin: 0, color: isDarkMode ? '#94a3b8' : '#6b7280', fontSize: '0.875rem' }}>{activeOrder.order_number} • Table {activeOrder.table_number}</p>
        </div>
      </header>

      {/* Status Tracker */}
      <div style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: isDarkMode ? '1px solid #334155' : 'none' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>Live Progress</h2>
        
        <div style={{ position: 'relative', paddingLeft: '1rem' }}>
          <div style={{ position: 'absolute', top: '16px', bottom: '16px', left: '23px', width: '2px', backgroundColor: isDarkMode ? '#334155' : '#f3f4f6' }}></div>
          
          {/* Pending / Received */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: ['pending', 'accepted', 'preparing', 'ready', 'delivered'].includes(activeOrder.status) ? '#22c55e' : '#e5e7eb', zIndex: 10 }}></div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: ['pending', 'accepted', 'preparing', 'ready', 'delivered'].includes(activeOrder.status) ? (isDarkMode ? '#f8fafc' : '#1a1a1a') : '#9ca3af' }}>Order Received</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Waiting for kitchen to accept.</p>
            </div>
          </div>

          {/* Preparing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: ['preparing', 'ready', 'delivered'].includes(activeOrder.status) ? '#3b82f6' : '#e5e7eb', zIndex: 10 }}></div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: ['preparing', 'ready', 'delivered'].includes(activeOrder.status) ? (isDarkMode ? '#f8fafc' : '#1a1a1a') : '#9ca3af' }}>Preparing</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>The chef is cooking your meal!</p>
            </div>
          </div>

          {/* Ready */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: ['ready', 'delivered'].includes(activeOrder.status) ? '#ff6b35' : '#e5e7eb', zIndex: 10 }}></div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: ['ready', 'delivered'].includes(activeOrder.status) ? (isDarkMode ? '#f8fafc' : '#1a1a1a') : '#9ca3af' }}>Ready to Serve</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Your order is coming to Table {activeOrder.table_number}.</p>
            </div>
          </div>

          {/* Delivered */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: activeOrder.status === 'delivered' ? '#8b5cf6' : '#e5e7eb', zIndex: 10 }}></div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: activeOrder.status === 'delivered' ? (isDarkMode ? '#f8fafc' : '#1a1a1a') : '#9ca3af' }}>Delivered</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Enjoy your meal!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: isDarkMode ? '1px solid #334155' : 'none' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>Items Ordered</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeOrder.order_items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f3f4f6' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>{item.item_name}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>₹{item.price_at_time}</p>
              </div>
              <div style={{ fontWeight: 'bold', backgroundColor: isDarkMode ? '#334155' : '#f3f4f6', color: isDarkMode ? '#f8fafc' : '#1a1a1a', padding: '4px 12px', borderRadius: '9999px' }}>
                x{item.quantity}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem' }}>
          <span style={{ fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Total Amount</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>₹{activeOrder.total_amount}</span>
        </div>
      </div>

      <button 
        onClick={() => setActiveOrder(null)} 
        style={{ width: '100%', marginTop: 'auto', padding: '1rem', borderRadius: '12px', border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb', backgroundColor: isDarkMode ? '#1e293b' : 'transparent', color: isDarkMode ? '#f8fafc' : '#1a1a1a', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
        aria-label="Close active order view"
      >
        Close & Back to Menu
      </button>
    </div>
  );
};

export default ActiveOrderTracker;
