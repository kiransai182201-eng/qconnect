import React from 'react';
import { ShoppingBag, X } from 'lucide-react';

const Cart = ({ 
  cart, 
  items, 
  removeFromCart, 
  getCartTotal, 
  getCartItemCount, 
  isCartOpen, 
  setIsCartOpen, 
  placeOrder, 
  isPlacingOrder, 
  orderNotes, 
  setOrderNotes, 
  tableNumber, 
  manualTableNumber, 
  setManualTableNumber, 
  isDarkMode, 
  t 
}) => {
  if (getCartItemCount() === 0 && !isCartOpen) return null;

  return (
    <>
      {getCartItemCount() > 0 && !isCartOpen && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 3rem)',
          maxWidth: '400px',
          backgroundColor: '#ff6b35',
          color: 'white',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(255, 109, 0, 0.4)',
          cursor: 'pointer',
          zIndex: 100,
          animation: 'slideUp 0.3s ease-out'
        }} onClick={() => setIsCartOpen(true)} aria-label="View Cart">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={24} />
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'white', color: '#ff6b35', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {getCartItemCount()}
              </span>
            </div>
            <span style={{ fontWeight: '600' }}>View Order</span>
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>₹{getCartTotal()}</span>
        </div>
      )}

      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeIn 0.2s' }}>
          <div style={{ height: '85vh', backgroundColor: isDarkMode ? '#1e293b' : 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#6b7280', cursor: 'pointer' }} aria-label="Close cart">
                <X size={28} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {Object.keys(cart).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.keys(cart).map(itemId => {
                    const item = items.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f3f4f6' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>₹{item.price} x {cart[itemId]}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>₹{item.price * cart[itemId]}</span>
                          <button onClick={() => removeFromCart(item.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }} aria-label={`Remove ${item.name}`}>
                            -
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {Object.keys(cart).length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#6b7280', marginBottom: '0.5rem' }}>Add a note for the kitchen (optional)</label>
                  <textarea 
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="E.g., Extra spicy, no onions..."
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb', backgroundColor: isDarkMode ? '#0f172a' : '#fdfbf7', color: isDarkMode ? '#f8fafc' : '#1a1a1a', resize: 'none', height: '80px', fontFamily: 'inherit' }}
                    aria-label="Order notes"
                  />
                  
                  {tableNumber === 'Unknown' && (
                    <div style={{ marginTop: '1.5rem', backgroundColor: 'rgba(255, 109, 0, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #ff6b35' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: isDarkMode ? '#f8fafc' : '#1a1a1a', marginBottom: '0.5rem' }}>
                        Please enter your Table Number
                      </label>
                      <input 
                        type="text"
                        value={manualTableNumber}
                        onChange={(e) => setManualTableNumber(e.target.value)}
                        placeholder="e.g. 5 or Patio-2"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb', backgroundColor: isDarkMode ? '#1e293b' : 'white', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}
                        required
                        aria-label="Table number"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ paddingTop: '1rem', borderTop: isDarkMode ? '1px solid #334155' : '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#6b7280' }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>₹{getCartTotal()}</span>
              </div>
              <button 
                onClick={placeOrder}
                disabled={Object.keys(cart).length === 0 || isPlacingOrder}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: Object.keys(cart).length === 0 ? (isDarkMode ? '#334155' : '#e5e7eb') : '#ff6b35',
                  color: Object.keys(cart).length === 0 ? (isDarkMode ? '#64748b' : '#9ca3af') : 'white',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  border: 'none',
                  cursor: Object.keys(cart).length === 0 || isPlacingOrder ? 'not-allowed' : 'pointer',
                  boxShadow: Object.keys(cart).length > 0 ? '0 10px 20px rgba(255, 109, 0, 0.3)' : 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
                aria-label="Place Order"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Placing Order...
                  </>
                ) : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
