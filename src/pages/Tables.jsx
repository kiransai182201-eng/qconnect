import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  TableProperties, 
  Plus, 
  QrCode, 
  Eye, 
  HelpCircle,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import '../tables.css';

const Tables = () => {
  const { shop, setShop, orders } = useOutletContext();
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTable, setAddingTable] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);

  // Fetch tables list from Supabase
  const fetchTables = async () => {
    if (!shop) return;
    try {
      const { data, error } = await supabase
        .from('shop_tables')
        .select('*')
        .eq('shop_id', shop.id)
        .order('table_number', { ascending: true });

      if (error) throw error;
      if (data) {
        setTables(data);
        // Automatically select the first table if none is selected
        if (data.length > 0 && !selectedTableId) {
          setSelectedTableId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [shop]);

  // Determine Table Status dynamically based on active orders
  const getTableStatus = (tableNum) => {
    const tableOrders = orders.filter(o => String(o.table_number) === String(tableNum));
    if (tableOrders.length === 0) return 'available';

    // Find the latest active order (context is already ordered by created_at desc)
    const latestOrder = tableOrders[0];
    
    if (latestOrder.status === 'pending' || latestOrder.status === 'accepted') {
      return 'occupied';
    }
    if (latestOrder.status === 'preparing') {
      return 'preparing';
    }
    if (latestOrder.status === 'ready') {
      return 'payment-pending';
    }
    if (latestOrder.status === 'delivered') {
      return 'completed';
    }
    return 'available';
  };

  // Add a single table dynamically
  const handleAddTable = async () => {
    if (!shop) return;
    try {
      setAddingTable(true);
      
      const { data: currentTables, error: fetchErr } = await supabase
        .from('shop_tables')
        .select('*')
        .eq('shop_id', shop.id);
        
      if (fetchErr) throw fetchErr;

      const maxTableNumber = currentTables && currentTables.length > 0
        ? Math.max(...currentTables.map(t => t.table_number))
        : 0;

      const tableNum = maxTableNumber + 1;
      const baseUrl = window.location.origin;
      const tableToken = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const tableCode = `${shop.owner_unique_id || shop.id}_table_${tableNum}`;
      const qrUrl = `${baseUrl}/menu/${shop.owner_unique_id || shop.id}?table=${tableNum}`;

      const newTable = {
        shop_id: shop.id,
        table_number: tableNum,
        table_code: tableCode,
        table_token: tableToken,
        qr_url: qrUrl,
        is_active: true
      };

      const { error: insertError } = await supabase
        .from('shop_tables')
        .insert([newTable]);

      if (insertError) throw insertError;

      // Update tables count in shop profile
      const newCount = (currentTables ? currentTables.length : 0) + 1;
      await supabase
        .from('shops')
        .update({ tables: newCount })
        .eq('id', shop.id);

      setShop(prev => ({ ...prev, tables: newCount }));
      
      // Select the new table
      await fetchTables();
    } catch (err) {
      console.error('Error adding table:', err);
      alert(`Failed to add table: ${err.message}`);
    } finally {
      setAddingTable(false);
    }
  };

  // Resolve details of the selected table
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedStatus = selectedTable ? getTableStatus(selectedTable.table_number) : 'available';
  const selectedTableOrders = selectedTable ? orders.filter(o => String(o.table_number) === String(selectedTable.table_number)) : [];
  const latestOrder = selectedTableOrders[0];

  // Calculations for Summary
  const subtotal = selectedTableOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const taxesAndCharges = subtotal * 0.05; // 5% GST
  const totalAmount = subtotal + taxesAndCharges;

  const totalItemsCount = selectedTableOrders.reduce((sum, o) => {
    return sum + (o.order_items ? o.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0);
  }, 0);

  // Status Banner Configurations
  const bannerConfigs = {
    available: {
      title: 'Table is available',
      desc: 'Ready for incoming guests to scan & order.'
    },
    occupied: {
      title: 'Table is occupied',
      desc: 'Guests are currently dining.'
    },
    preparing: {
      title: 'Food is preparing',
      desc: 'Kitchen is processing the order.'
    },
    'payment-pending': {
      title: 'Payment pending',
      desc: 'Waiting for customer bill clearance.'
    },
    completed: {
      title: 'Session completed',
      desc: 'Clear the table for next guests.'
    }
  };

  const currentBanner = bannerConfigs[selectedStatus] || bannerConfigs.available;

  // Stats Counters
  const countAvailable = tables.filter(t => getTableStatus(t.table_number) === 'available').length;
  const countOccupied = tables.filter(t => getTableStatus(t.table_number) !== 'available').length;

  // Recent activity mock/derived feed
  const recentActivities = orders.slice(0, 5).map(o => ({
    id: o.id,
    table: `T0${o.table_number}`,
    status: o.status,
    action: o.status === 'pending' ? 'Order received' : `Order ${o.status}`,
    time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTop: '4px solid var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="tables-page-container">
      
      {/* Header section matching mockup */}
      <div className="tables-header-row">
        <div className="tables-header-title">
          <h2>Tables</h2>
          <p>Manage all tables and view their current status</p>
        </div>
        <div className="tables-header-actions">
          <button className="tables-btn-outline" onClick={() => navigate('/qr-code')}>
            <QrCode size={16} />
            View QR Codes
          </button>
          <button 
            className="tables-btn-primary" 
            onClick={handleAddTable}
            disabled={addingTable}
          >
            <Plus size={16} />
            {addingTable ? 'Adding...' : 'Add Table'}
          </button>
        </div>
      </div>

      {/* Stats Summary Cards Row */}
      <div className="tables-stats-grid">
        <div className="tables-stat-card">
          <div className="tables-stat-icon-container">
            <TableProperties size={22} />
          </div>
          <div className="tables-stat-info">
            <span className="tables-stat-label">Total Tables</span>
            <span className="tables-stat-value">{tables.length}</span>
            <span className="tables-stat-subtext">All tables</span>
          </div>
        </div>

        <div className="tables-stat-card available">
          <div className="tables-stat-icon-container">
            <TableProperties size={22} />
          </div>
          <div className="tables-stat-info">
            <span className="tables-stat-label">Available</span>
            <span className="tables-stat-value">{countAvailable}</span>
            <span className="tables-stat-subtext">Ready for new orders</span>
          </div>
        </div>

        <div className="tables-stat-card occupied">
          <div className="tables-stat-icon-container">
            <TableProperties size={22} />
          </div>
          <div className="tables-stat-info">
            <span className="tables-stat-label">Occupied</span>
            <span className="tables-stat-value">{countOccupied}</span>
            <span className="tables-stat-subtext">Currently dining</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Left (Overview + Activity), Right (Selected Table Details) */}
      <div className="tables-main-grid">
        <div className="tables-content-left">
          
          {/* Table Overview Grid panel */}
          <div className="tables-overview-card">
            <div className="tables-overview-header">
              <h3>Table Overview</h3>
              <div className="tables-legend">
                <div className="legend-item">
                  <span className="legend-dot available"></span> Available
                </div>
                <div className="legend-item">
                  <span className="legend-dot occupied"></span> Occupied
                </div>
                <div className="legend-item">
                  <span className="legend-dot preparing"></span> Preparing
                </div>
                <div className="legend-item">
                  <span className="legend-dot payment-pending"></span> Payment Pending
                </div>
                <div className="legend-item">
                  <span className="legend-dot completed"></span> Completed
                </div>
              </div>
            </div>

            <div className="tables-grid">
              {tables.map(t => {
                const status = getTableStatus(t.table_number);
                const isSelected = t.id === selectedTableId;
                return (
                  <div 
                    key={t.id} 
                    className={`table-card-item ${status} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedTableId(t.id)}
                  >
                    <TableProperties className="table-card-icon" size={24} />
                    <span className="table-card-number">T{t.table_number < 10 ? `0${t.table_number}` : t.table_number}</span>
                    <span className="table-card-status-dot-text">
                      <span className="table-status-dot"></span>
                      {status === 'payment-pending' ? 'Pending' : status}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="tables-tip">
              <span style={{ fontSize: '0.9rem' }}>💡</span> Tip: Click on any table to view details and manage orders.
            </p>
          </div>

          {/* Recent Table Activity panel */}
          <div className="tables-activity-card">
            <div className="activity-header">
              <h3>Recent Table Activity</h3>
              <span className="activity-view-all" onClick={() => navigate('/orders')}>View All</span>
            </div>
            <div className="activity-table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Status</th>
                    <th>Action</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--color-text-muted)', padding: '20px' }}>
                        No recent activity recorded
                      </td>
                    </tr>
                  ) : (
                    recentActivities.map(act => (
                      <tr key={act.id}>
                        <td>{act.table}</td>
                        <td>
                          <span className={`activity-status-pill ${act.status}`}>
                            {act.status}
                          </span>
                        </td>
                        <td>{act.action}</td>
                        <td>{act.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Selected Table details sidebar panel */}
        {selectedTable && (
          <div className="table-detail-panel">
            <div className="table-detail-header">
              <h3>Table T{selectedTable.table_number < 10 ? `0${selectedTable.table_number}` : selectedTable.table_number}</h3>
              <span className={`table-detail-status-pill ${selectedStatus}`}>
                {selectedStatus === 'payment-pending' ? 'Payment Pending' : selectedStatus}
              </span>
            </div>

            {/* Alert Banner */}
            <div className={`table-status-banner ${selectedStatus}`}>
              <p className="banner-title">{currentBanner.title}</p>
              <p className="banner-desc">{currentBanner.desc}</p>
            </div>

            {/* Session details */}
            <div>
              <h4 className="detail-section-title">Session Details</h4>
              <div className="detail-row">
                <span className="detail-label">Session ID</span>
                <span className="detail-value">{latestOrder ? `S1-${latestOrder.order_number}` : '--'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Started At</span>
                <span className="detail-value">
                  {latestOrder ? new Date(latestOrder.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : '--'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Completed At</span>
                <span className="detail-value">--</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Guests</span>
                <span className="detail-value">{latestOrder ? (latestOrder.guests_count || '--') : '--'}</span>
              </div>
            </div>

            {/* Order items lists summary */}
            {selectedTableOrders.length > 0 && (
              <div>
                <h4 className="detail-section-title">Order Items</h4>
                <div className="detail-items-list">
                  {selectedTableOrders.map(o => (
                    <React.Fragment key={o.id}>
                      {o.order_items && o.order_items.map(item => (
                        <div key={item.id} className="detail-item-subrow">
                          <span>{item.item_name} (x{item.quantity})</span>
                          <span>₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Total summary info */}
            <div>
              <h4 className="detail-section-title">Order Summary</h4>
              <div className="detail-row">
                <span className="detail-label">Total Orders</span>
                <span className="detail-value">{selectedTableOrders.length}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Items</span>
                <span className="detail-value">{totalItemsCount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subtotal</span>
                <span className="detail-value">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Taxes & Charges</span>
                <span className="detail-value">₹{taxesAndCharges.toFixed(2)}</span>
              </div>
              <div className="detail-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--glass-border)' }}>
                <span className="detail-label" style={{ fontWeight: '700' }}>Total Amount</span>
                <span className="detail-value price">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Action button */}
            <button 
              className="detail-btn-wide"
              onClick={() => navigate('/orders')}
            >
              <Eye size={16} />
              View Orders
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Tables;
