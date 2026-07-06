import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Printer, 
  Phone, 
  Clock, 
  ChefHat, 
  Package, 
  Truck,
  TrendingUp,
  TableProperties
} from 'lucide-react';
import '../orders-redesign.css';
import { useLanguage } from '../contexts/LanguageContext';

const Orders = () => {
  const { shop, orders } = useOutletContext();
  const { t } = useLanguage();

  const [allTodayOrders, setAllTodayOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all orders from today (active + delivered/rejected) to calculate summary stats
  const fetchTodayOrders = async () => {
    if (!shop) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('shop_id', shop.id)
        .gte('created_at', todayStr);

      if (error) throw error;
      if (data) {
        setAllTodayOrders(data);
      }
    } catch (err) {
      console.error('Error fetching today orders:', err);
    }
  };

  useEffect(() => {
    fetchTodayOrders();
  }, [shop, orders]);

  // Expand the first order by default if none is selected
  useEffect(() => {
    if (orders.length > 0 && !expandedOrderId) {
      setExpandedOrderId(orders[0].id);
    }
  }, [orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Refresh local statistics
      await fetchTodayOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setErrorMessage(`Failed to update order to ${newStatus}. Please check connection.`);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper to resolve customization text from metadata
  const getItemCustomizations = (item) => {
    if (item.customizations) {
      if (typeof item.customizations === 'object') {
        const parts = [];
        if (item.customizations.spice_level) parts.push(item.customizations.spice_level);
        if (item.customizations.addons) {
          item.customizations.addons.forEach(a => parts.push(a.name));
        }
        return parts.join(', ');
      }
      return String(item.customizations);
    }
    return '';
  };

  // Calculate dynamic stats
  const countPending = orders.filter(o => o.status === 'pending').length;
  const countPreparing = orders.filter(o => o.status === 'preparing').length;
  const countReady = orders.filter(o => o.status === 'ready').length;
  
  // Total completed today
  const completedToday = allTodayOrders.filter(o => o.status === 'delivered').length;
  
  // Total orders today
  const totalOrdersToday = allTodayOrders.length;
  
  // Today's total active revenue
  const todaysRevenue = allTodayOrders
    .filter(o => o.status !== 'rejected')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  // Active unique tables list
  const activeTablesList = Array.from(new Set(orders.map(o => o.table_number))).sort((a, b) => a - b);

  return (
    <div className="ord-redesign-container">
      
      {/* Main Column: Active Orders List */}
      <div>
        <div className="ord-header-row">
          <h2 className="ord-header-title">Active Orders</h2>
          <span className="ord-badge-pending">
            {countPending} Pending
          </span>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontWeight: '600', fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}

        <div className="ord-list-wrapper">
          {orders.map((o) => {
            const isExpanded = o.id === expandedOrderId;
            const timeFormatted = new Date(o.created_at).toLocaleString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <div key={o.id} className="ord-item-card">
                {/* Header Row (Always Visible) */}
                <div 
                  className="ord-item-card-header"
                  onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                >
                  <div className="ord-item-card-left">
                    <span className={`ord-item-status-dot ${o.status}`}></span>
                    <span className="ord-item-table-name">Table {o.table_number}</span>
                  </div>
                  <span className="ord-item-time">{timeFormatted}</span>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="ord-item-card-body animate-slide-down">
                    <div className="ord-details-grid">
                      <div className="ord-details-row">
                        <span className="ord-details-label">Order Number</span>
                        <span className="ord-details-value">#{o.order_number}</span>
                      </div>
                      <div className="ord-details-row">
                        <span className="ord-details-label">Status</span>
                        <span className="ord-details-value" style={{ textTransform: 'capitalize' }}>{o.status}</span>
                      </div>
                      <div className="ord-details-row">
                        <span className="ord-details-label">Guest Capacity</span>
                        <span className="ord-details-value">{o.guests_count || '--'}</span>
                      </div>
                    </div>

                    {/* Ordered Items Row */}
                    <div className="ord-items-list-container">
                      {o.order_items && o.order_items.map((item) => {
                        const customization = getItemCustomizations(item);
                        return (
                          <div key={item.id} className="ord-item-subrow">
                            <div className="ord-item-subrow-left">
                              <span className="ord-item-qty">{item.quantity}x</span>
                              <div>
                                <span className="ord-item-name">{item.item_name}</span>
                                {customization && (
                                  <span className="ord-item-customizations">
                                    {customization}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="ord-item-price-col">₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total billing summary */}
                    <div className="ord-details-row" style={{ marginTop: '4px' }}>
                      <span className="ord-details-label" style={{ fontWeight: '700' }}>Total Amount</span>
                      <span className="ord-details-value" style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}>₹{parseFloat(o.total_amount).toFixed(2)}</span>
                    </div>

                    {/* Order Notes */}
                    {o.notes && (
                      <div style={{ backgroundColor: 'rgba(255, 109, 0, 0.04)', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid var(--color-accent)', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        Notes: "{o.notes}"
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="ord-actions-row">
                      {updatingOrderId === o.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: '700' }}>
                          <div style={{ width: '16px', height: '16px', border: '2px solid var(--glass-border)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Updating Order...
                        </div>
                      ) : (
                        <>
                          {o.status === 'pending' && (
                            <>
                              <button 
                                className="ord-btn-action accept"
                                onClick={() => updateOrderStatus(o.id, 'accepted')}
                              >
                                <CheckCircle size={16} /> Accept
                              </button>
                              <button 
                                className="ord-btn-action preparing"
                                onClick={() => updateOrderStatus(o.id, 'preparing')}
                              >
                                <ChefHat size={16} /> Mark Preparing
                              </button>
                              <button 
                                className="ord-btn-action reject"
                                onClick={() => updateOrderStatus(o.id, 'rejected')}
                              >
                                <XCircle size={16} /> Reject
                              </button>
                            </>
                          )}

                          {o.status === 'accepted' && (
                            <button 
                              className="ord-btn-action preparing"
                              onClick={() => updateOrderStatus(o.id, 'preparing')}
                            >
                              <ChefHat size={16} /> Start Preparing
                            </button>
                          )}

                          {o.status === 'preparing' && (
                            <button 
                              className="ord-btn-action ready"
                              onClick={() => updateOrderStatus(o.id, 'ready')}
                            >
                              <Package size={16} /> Mark Ready
                            </button>
                          )}

                          {o.status === 'ready' && (
                            <button 
                              className="ord-btn-action deliver"
                              onClick={() => updateOrderStatus(o.id, 'delivered')}
                            >
                              <Truck size={16} /> Mark Completed
                            </button>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="mb-empty-state" style={{ padding: '60px' }}>
              <Clock size={40} style={{ opacity: 0.15, marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>No active kitchen orders at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Widgets Column: Sidebar widgets on the right */}
      <div className="ord-widgets-sidebar">
        
        {/* Active Tables widget panel */}
        <div className="ord-sidebar-widget">
          <h3>Active Tables</h3>
          {activeTablesList.length === 0 ? (
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              No active tables
            </span>
          ) : (
            <div className="ord-table-pill-grid">
              {activeTablesList.map((tableNum) => (
                <span key={tableNum} className="ord-table-pill">
                  Table {tableNum}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Summary metric numbers widget panel */}
        <div className="ord-sidebar-widget">
          <h3>Summary</h3>
          <div className="ord-widget-row">
            <span className="ord-widget-row-label">Total Orders Today</span>
            <span className="ord-widget-row-value">{totalOrdersToday}</span>
          </div>
          <div className="ord-widget-row">
            <span className="ord-widget-row-label">Pending Orders</span>
            <span className="ord-widget-row-value pending">{countPending}</span>
          </div>
          <div className="ord-widget-row">
            <span className="ord-widget-row-label">Preparing</span>
            <span className="ord-widget-row-value preparing">{countPreparing}</span>
          </div>
          <div className="ord-widget-row">
            <span className="ord-widget-row-label">Ready</span>
            <span className="ord-widget-row-value ready">{countReady}</span>
          </div>
          <div className="ord-widget-row">
            <span className="ord-widget-row-label">Served</span>
            <span className="ord-widget-row-value served">{completedToday}</span>
          </div>
          <div className="ord-widget-row">
            <span className="ord-widget-row-label">Completed</span>
            <span className="ord-widget-row-value">{completedToday}</span>
          </div>

          <div className="ord-revenue-row">
            <span className="ord-revenue-label">Today's Revenue</span>
            <span className="ord-revenue-value">₹{todaysRevenue.toFixed(0)}</span>
          </div>
        </div>

      </div>

      {/* Floating Action printer / phone buttons */}
      <div className="ord-fab-container">
        <button 
          className="ord-fab-btn print"
          onClick={() => window.print()}
          title="Print Orders Summary"
        >
          <Printer size={22} />
        </button>
        <button 
          className="ord-fab-btn call"
          onClick={() => alert("Connecting to counter support line...")}
          title="Call Support"
        >
          <Phone size={22} />
        </button>
      </div>

    </div>
  );
};

export default Orders;
