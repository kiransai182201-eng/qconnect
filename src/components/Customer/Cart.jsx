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
          width: 'calc(100% - 2.5rem)',
          maxWidth: '420px',
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          borderRadius: '20px',
          padding: '1.1rem 1.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 12px 28px rgba(var(--color-accent-rgb), 0.35)',
          cursor: 'pointer',
          zIndex: 100,
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transition: 'transform 0.2s, background-color 0.2s',
        }} 
        onClick={() => setIsCartOpen(true)} 
        aria-label="View Cart"
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={24} />
              <span style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px', 
                backgroundColor: 'white', 
                color: 'var(--color-accent)', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.75rem', 
                fontWeight: '800',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                {getCartItemCount()}
              </span>
            </div>
            <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.01em' }}>View Order</span>
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>₹{getCartTotal()}</span>
        </div>
      )}

      {isCartOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(7, 10, 19, 0.65)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 1000, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          animation: 'fadeIn 0.2s ease' 
        }}>
          <div style={{ 
            height: '85vh', 
            backgroundColor: 'var(--card-bg)', 
            borderTopLeftRadius: '32px', 
            borderTopRightRadius: '32px', 
            borderTop: '1px solid var(--card-border)',
            padding: '1.75rem', 
            display: 'flex', 
            flexDirection: 'column', 
            animation: 'slideUp 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
            boxShadow: '0 -15px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Your Order</h2>
              <button 
                onClick={() => setIsCartOpen(false)} 
                style={{ 
                  background: 'rgba(0,0,0,0.03)', 
                  border: 'none', 
                  color: 'var(--text-secondary)', 
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} 
                aria-label="Close cart"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
              >
                <X size={20} />
              </button>
            </div>

            <div className="customer-custom-scrollbar" style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {Object.keys(cart).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.15, marginBottom: '1.25rem', color: 'var(--text-primary)' }} />
                  <p style={{ fontWeight: '600' }}>Your cart is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.keys(cart).map(itemId => {
                    const item = items.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--pill-border)' }}>
                        <div style={{ minWidth: 0, flex: 1, paddingRight: '1rem' }}>
                          <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>₹{item.price} x {cart[itemId]}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                          <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>₹{item.price * cart[itemId]}</span>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            style={{ 
                              width: '30px', 
                              height: '30px', 
                              borderRadius: '50%', 
                              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                              color: '#ef4444', 
                              border: 'none', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              cursor: 'pointer', 
                              fontWeight: '900',
                              fontSize: '1.1rem',
                              transition: 'all 0.2s'
                            }} 
                            aria-label={`Remove one ${item.name}`}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                          >
                            -
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {Object.keys(cart).length > 0 && (
                <div style={{ marginTop: '1.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Add a note for the kitchen (optional)
                  </label>
                  <textarea 
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="E.g., Extra spicy, no onions..."
                    className="customer-textarea"
                    style={{ height: '80px', resize: 'none' }}
                    aria-label="Order notes"
                  />
                  
                  {tableNumber === 'Unknown' && (
                    <div style={{ 
                      marginTop: '1.5rem', 
                      backgroundColor: 'var(--color-accent-light)', 
                      padding: '1.25rem', 
                      borderRadius: '16px', 
                      borderLeft: '4px solid var(--color-accent)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
                        Please enter your Table Number
                      </label>
                      <input 
                        type="text"
                        value={manualTableNumber}
                        onChange={(e) => setManualTableNumber(e.target.value)}
                        placeholder="e.g. 5 or Patio-2"
                        className="customer-input"
                        required
                        aria-label="Table number"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--pill-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Amount</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>₹{getCartTotal()}</span>
              </div>
              <button 
                onClick={placeOrder}
                disabled={Object.keys(cart).length === 0 || isPlacingOrder}
                className="customer-add-btn"
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '20px',
                  backgroundColor: Object.keys(cart).length === 0 ? 'var(--bg-secondary)' : 'var(--color-accent)',
                  color: Object.keys(cart).length === 0 ? 'var(--text-muted)' : 'white',
                  cursor: Object.keys(cart).length === 0 || isPlacingOrder ? 'not-allowed' : 'pointer',
                  boxShadow: Object.keys(cart).length > 0 ? '0 10px 24px rgba(var(--color-accent-rgb), 0.25)' : 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '1.05rem',
                  fontWeight: '800'
                }}
                aria-label="Place Order"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="spinner" style={{ width: '22px', height: '22px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white' }}></div>
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
