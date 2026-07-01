import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bell, CheckCircle, XCircle, Truck, Printer, Phone, Clock, ClipboardList, ChefHat, Package, Target } from 'lucide-react';
import '../orders.css';
import '../dashboard.css'; // Ensure bottom nav matches other pages
import { useLanguage } from '../contexts/LanguageContext';

const Orders = () => {
  const { orders } = useOutletContext();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useLanguage();

  const activeSelectedId = orders.some(o => o.id === selectedOrderId) 
    ? selectedOrderId 
    : (orders.length > 0 ? orders[0].id : null);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setErrorMessage('');
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      
      if (newStatus === 'rejected' || newStatus === 'delivered') {
        const remaining = orders.filter(o => o.id !== orderId);
        setSelectedOrderId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setErrorMessage(`Failed to update order to ${newStatus}. Please check connection.`);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const selectedOrder = orders.find(o => o.id === activeSelectedId);

  return (
    <div className="ord-main-wrapper" style={{ padding: '0 0 40px 0' }}>
      <main className="ord-content">
        
        {/* Error Feedback Banner */}
        {errorMessage && (
          <div style={{ backgroundColor: 'var(--ord-error-container)', color: 'var(--ord-on-error-container)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', textAlign: 'center', border: '1px solid var(--ord-error)' }}>
            {errorMessage}
          </div>
        )}
        
        {/* High Visibility Header */}
        {selectedOrder && selectedOrder.status === 'pending' && (
          <div className="ord-alert animate-slide-down layered-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="pulse-effect" style={{ color: 'var(--ord-primary)' }}>
                <Bell size={32} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'var(--ord-text-main)' }}>{t.newOrderReceived}</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ord-text-muted)', fontWeight: '600' }}>Table {selectedOrder.table_number} • {t.instantUpdate}</p>
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--ord-error-container)', color: 'var(--ord-on-error-container)', padding: '4px 12px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', animation: 'pulse-ring 2s infinite' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--ord-error)', borderRadius: '50%' }}></span>
              {t.highPriority}
            </div>
          </div>
        )}

        <div className="ord-grid">
          {/* Left Column: Order Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedOrder ? (
              <div className="ord-card animate-slide-down layered-card" style={{ animationDelay: '0.1s' }}>
                <div className="ord-card-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ord-text-muted)', textTransform: 'uppercase' }}>{t.orderId}</span>
                    <h2 style={{ margin: 0, color: 'var(--ord-text-main)', fontWeight: '900', fontSize: '1.5rem' }}>{selectedOrder.order_number}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ord-text-muted)', textTransform: 'uppercase' }}>Table</span>
                    <h2 style={{ margin: 0, color: 'var(--ord-primary)', fontWeight: '900', fontSize: '1.5rem' }}>{selectedOrder.table_number}</h2>
                  </div>
                </div>

                <div className="ord-card-body">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ord-text-muted)' }}>Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {(() => {
                      // Parse customizations from notes
                      const parseCustomizationsFromNotes = (notesText) => {
                        if (!notesText) return {};
                        const match = notesText.match(/\[CUSTOMIZATIONS: (.*?)\]/);
                        if (!match) return {};
                        const customsText = match[1];
                        const itemsList = customsText.split('; ');
                        const result = {};
                        itemsList.forEach(itemStr => {
                          const idx = itemStr.indexOf(' (');
                          if (idx !== -1) {
                            const name = itemStr.slice(0, idx).trim().toLowerCase();
                            const options = itemStr.slice(idx + 2, -1); // remove " (" and ")"
                            result[name] = options;
                          }
                        });
                        return result;
                      };

                      const customs = parseCustomizationsFromNotes(selectedOrder.notes);

                      return selectedOrder.order_items && selectedOrder.order_items.map((item) => {
                        const itemCustomization = customs[item.item_name.toLowerCase()];
                        
                        return (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--ord-surface-low)', borderRadius: '8px', border: '1px solid var(--ord-outline)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: '800', color: 'var(--ord-primary)', fontSize: '1.1rem' }}>{item.quantity}x</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: '600', color: 'var(--ord-text-main)' }}>{item.item_name}</span>
                                {itemCustomization && (
                                  <span style={{ fontSize: '0.78rem', color: 'var(--ord-primary)', fontWeight: '600' }}>
                                    {itemCustomization}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span style={{ fontWeight: '700', color: 'var(--ord-text-main)' }}>₹{item.price_at_time * item.quantity}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Notes */}
                  {(() => {
                    if (!selectedOrder.notes) return null;
                    const displayNotes = selectedOrder.notes.replace(/\[CUSTOMIZATIONS:.*?\]/, '').trim();
                    if (!displayNotes) return null;

                    return (
                      <div style={{ backgroundColor: 'rgba(255, 109, 0, 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--ord-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--ord-text-main)' }}>Order Notes</span>
                        </div>
                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--ord-text-muted)' }}>"{displayNotes}"</p>
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div className="ord-actions">
                    {updatingOrderId === selectedOrder.id ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '16px', color: 'var(--ord-primary)', fontWeight: 'bold', gap: '8px' }}>
                        <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid var(--ord-outline)', borderTop: '2px solid var(--ord-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Updating Status...
                      </div>
                    ) : (
                      <>
                        {selectedOrder.status === 'pending' && (
                          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                            <button onClick={() => updateOrderStatus(selectedOrder.id, 'accepted')} className="btn-interactive" style={{ flex: 1, backgroundColor: 'var(--ord-success)', color: 'white', padding: '16px 8px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)', fontSize: '0.85rem' }}>
                              <CheckCircle size={20} /> ACCEPT
                            </button>
                            <button onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')} className="btn-interactive" style={{ flex: 1, backgroundColor: 'transparent', border: '2px solid var(--ord-primary)', color: 'var(--ord-primary)', padding: '16px 8px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                              <ChefHat size={20} /> {t.markPreparing}
                            </button>
                            <button onClick={() => updateOrderStatus(selectedOrder.id, 'rejected')} className="btn-interactive" style={{ flex: 1, backgroundColor: 'var(--ord-error)', color: 'white', padding: '16px 8px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)', fontSize: '0.85rem' }}>
                              <XCircle size={20} /> REJECT
                            </button>
                          </div>
                        )}
                        
                        {selectedOrder.status === 'accepted' && (
                          <button onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')} className="btn-interactive" style={{ flex: 1, backgroundColor: 'transparent', border: '2px solid var(--ord-primary)', color: 'var(--ord-primary)', padding: '20px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <ChefHat size={24} /> {t.markPreparing}
                          </button>
                        )}
                        
                        {selectedOrder.status === 'preparing' && (
                          <button onClick={() => updateOrderStatus(selectedOrder.id, 'ready')} className="btn-interactive" style={{ flex: 1, backgroundColor: 'var(--ord-primary)', color: 'white', padding: '20px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(255, 109, 0, 0.3)' }}>
                            <Package size={24} /> {t.markReady}
                          </button>
                        )}

                        {selectedOrder.status === 'ready' && (
                          <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} className="btn-interactive" style={{ flex: 1, backgroundColor: 'var(--ord-success)', color: 'white', padding: '20px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}>
                            <Truck size={24} /> {t.markCompleted}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="ord-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--ord-text-muted)' }}>
                <ClipboardList size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--ord-text-main)' }}>{t.noActiveOrders}</h3>
                <p>{t.noOrdersMsg}</p>
              </div>
            )}
          </div>

          {/* Right Column: Widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Active Orders Widget */}
            <div className="ord-widget">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontWeight: '600', color: 'var(--ord-text-main)' }}>{t.activeOrders}</h3>
                <span style={{ backgroundColor: 'var(--ord-primary)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>{orders.length} {t.statusPending.toUpperCase()}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map((o) => {
                  const isSelected = o.id === selectedOrderId;
                  const minsAgo = Math.floor((new Date() - new Date(o.created_at)) / 60000);
                  return (
                    <div 
                      key={o.id} 
                      onClick={() => setSelectedOrderId(o.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: isSelected ? 'rgba(255, 109, 0, 0.1)' : 'var(--ord-surface-low)', borderRadius: '8px', border: isSelected ? '1px solid var(--ord-primary)' : '1px solid var(--ord-outline)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: o.status === 'pending' ? 'var(--ord-primary)' : 'var(--ord-secondary)', boxShadow: o.status === 'pending' ? '0 0 8px rgba(255, 109, 0, 0.6)' : 'none' }}></div>
                        <span style={{ fontWeight: '700', color: isSelected ? 'var(--ord-primary)' : 'var(--ord-text-main)' }}>Table {o.table_number}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ord-text-muted)' }}>{minsAgo} mins ago</span>
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--ord-text-muted)', fontSize: '0.85rem', padding: '12px 0' }}>{t.noActiveOrders}</div>
                )}
              </div>
            </div>

            {/* Kitchen Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--ord-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ord-outline)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Clock size={24} style={{ color: 'var(--ord-tertiary)' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '700', color: 'var(--ord-tertiary)' }}>14m</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--ord-text-muted)', textTransform: 'uppercase' }}>{t.avgPrep}</span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--ord-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ord-outline)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Target size={24} style={{ color: 'var(--ord-primary)' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '700', color: 'var(--ord-primary)' }}>98%</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--ord-text-muted)', textTransform: 'uppercase' }}>{t.accuracy}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div style={{ position: 'fixed', bottom: '112px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 40 }}>
        <button className="btn-interactive" style={{ width: '56px', height: '56px', backgroundColor: 'var(--ord-surface)', color: 'var(--ord-text-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid var(--ord-outline)' }}>
          <Printer size={24} />
        </button>
        <button className="btn-interactive" style={{ width: '64px', height: '64px', backgroundColor: 'var(--ord-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(255, 109, 0, 0.4)' }}>
          <Phone size={28} />
        </button>
      </div>
    </div>
  );
};

export default Orders;
