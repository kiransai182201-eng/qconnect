import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  ArrowLeft, 
  ArrowDownLeft, 
  Download, 
  Eye, 
  ChevronRight,
  ChevronDown,
  XCircle,
  FileText
} from 'lucide-react';
import '../history-redesign.css';
import { useLanguage } from '../contexts/LanguageContext';

const BillHistory = () => {
  const { shop } = useOutletContext();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [expandedBillId, setExpandedBillId] = useState(null);

  // Group collapses for month folders
  const [collapsedMonths, setCollapsedMonths] = useState({});

  useEffect(() => {
    if (!shop) return;

    const fetchBills = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('shop_id', shop.id)
          .in('status', ['delivered', 'rejected'])
          .order('created_at', { ascending: false });

        if (dateFilter) {
          // Parse dateFilter (YYYY-MM-DD)
          const [year, month, day] = dateFilter.split('-').map(Number);
          const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
          const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
          
          query = query
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data) {
          setBills(data);
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [dateFilter, shop]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatMonthYear = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Group bills by month-year
  const groupedBills = bills.reduce((acc, bill) => {
    const monthYear = formatMonthYear(bill.created_at);
    if (!acc[monthYear]) {
      acc[monthYear] = {
        bills: [],
        total: 0
      };
    }
    acc[monthYear].bills.push(bill);
    
    // Inflow represents successful transactions (delivered status)
    if (bill.status === 'delivered') {
      acc[monthYear].total += parseFloat(bill.total_amount || 0);
    }
    return acc;
  }, {});

  const toggleMonth = (month) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  // Download receipt builder
  const handleDownloadTxt = (e, bill) => {
    e.stopPropagation();
    const lines = [
      `===============================`,
      `       ${(shop?.name || 'SMART CAFE').toUpperCase()}`,
      `===============================`,
      `Order: #${bill.order_number}`,
      `Table: ${bill.table_number}`,
      `Date: ${formatDate(bill.created_at)}`,
      `Time: ${formatTime(bill.created_at)}`,
      `Status: ${bill.status.toUpperCase()}`,
      `-------------------------------`,
      `ITEMS`,
      `-------------------------------`
    ];

    if (bill.order_items) {
      bill.order_items.forEach(item => {
        lines.push(`${item.quantity}x ${item.item_name.padEnd(20)} ₹${(item.price_at_time * item.quantity).toFixed(2)}`);
      });
    }

    lines.push(`-------------------------------`);
    lines.push(`TOTAL AMOUNT:         ₹${parseFloat(bill.total_amount).toFixed(2)}`);
    lines.push(`===============================`, `Thank you for your visit!`);

    const element = document.createElement("a");
    const file = new Blob([lines.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Receipt-${bill.order_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="hist-container">
      
      {/* Header Row */}
      <div className="hist-header-row">
        <button className="hist-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <h2 className="hist-header-title">History</h2>
      </div>

      {/* Date filter row */}
      <div className="hist-filter-row">
        <div className="hist-date-input-wrapper">
          <Calendar size={18} color="var(--color-text-muted)" />
          <input 
            type="date" 
            className="hist-datepicker"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {dateFilter && (
          <button className="hist-btn-clear" onClick={() => setDateFilter('')}>
            <XCircle size={14} /> Clear
          </button>
        )}
      </div>

      {/* Grouped Month Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTop: '4px solid var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : Object.keys(groupedBills).length === 0 ? (
        <div className="mb-empty-state" style={{ padding: '60px' }}>
          <FileText size={40} style={{ opacity: 0.15, marginBottom: '12px' }} />
          <p style={{ margin: 0 }}>No transaction history found.</p>
        </div>
      ) : (
        Object.keys(groupedBills).map((monthYear) => {
          const isCollapsed = collapsedMonths[monthYear];
          const data = groupedBills[monthYear];
          
          return (
            <div key={monthYear} className="mb-categories-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Month Header Banner */}
              <div 
                className="hist-month-header"
                onClick={() => toggleMonth(monthYear)}
              >
                <span className="hist-month-title">{monthYear}</span>
                <div className="hist-month-total">
                  <span>+ ₹{data.total.toFixed(0)}</span>
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Transactions List */}
              {!isCollapsed && (
                <div className="hist-list">
                  {data.bills.map((bill) => {
                    const isExpanded = bill.id === expandedBillId;
                    const isRejected = bill.status === 'rejected';
                    
                    return (
                      <div key={bill.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <div 
                          className="hist-item-row"
                          onClick={() => setExpandedBillId(isExpanded ? null : bill.id)}
                        >
                          <div className="hist-item-left">
                            <div className="hist-item-icon-box">
                              <ArrowDownLeft size={18} />
                            </div>
                            <div className="hist-item-details">
                              <span className="hist-item-subtext">Received from</span>
                              <div className="hist-item-name-row">
                                <span className="hist-item-name">{bill.order_number}</span>
                                <span className={`hist-status-badge ${bill.status}`}>
                                  {bill.status === 'delivered' ? 'SERVED' : 'REJECTED'}
                                </span>
                              </div>
                              <span className="hist-item-time">{formatDate(bill.created_at)}, {formatTime(bill.created_at)}</span>
                            </div>
                          </div>

                          <span className={`hist-item-amount ${isRejected ? 'outflow' : 'inflow'}`}>
                            {isRejected ? `- ₹${parseFloat(bill.total_amount).toFixed(0)}` : `+ ₹${parseFloat(bill.total_amount).toFixed(0)}`}
                          </span>
                        </div>

                        {/* Bill Details Drawer */}
                        {isExpanded && (
                          <div className="hist-expanded-details animate-slide-down">
                            <div className="hist-details-row">
                              <span className="hist-details-label">Table Number</span>
                              <span className="hist-details-value">Table {bill.table_number}</span>
                            </div>
                            <div className="hist-details-row">
                              <span className="hist-details-label">Bill Status</span>
                              <span className="hist-details-value" style={{ textTransform: 'capitalize' }}>{bill.status}</span>
                            </div>

                            <div className="hist-items-grid">
                              {bill.order_items && bill.order_items.map((item) => (
                                <div key={item.id} className="hist-item-subrow">
                                  <span>{item.item_name} (x{item.quantity})</span>
                                  <span>₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="hist-details-row">
                              <span className="hist-details-label" style={{ fontWeight: '700' }}>Grand Total</span>
                              <span className="hist-details-value" style={{ color: isRejected ? '#ef4444' : '#10b981' }}>₹{parseFloat(bill.total_amount).toFixed(2)}</span>
                            </div>

                            <div className="hist-details-actions">
                              <button 
                                className="tables-btn-outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/receipt/${bill.id}`, '_blank');
                                }}
                                style={{ flex: 1, padding: '8px' }}
                              >
                                <Eye size={14} /> View Receipt
                              </button>
                              <button 
                                className="tables-btn-primary"
                                onClick={(e) => handleDownloadTxt(e, bill)}
                                style={{ flex: 1, padding: '8px' }}
                              >
                                <Download size={14} /> Download TXT
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

    </div>
  );
};

export default BillHistory;
