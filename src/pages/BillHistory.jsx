import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';
import '../dashboard.css'; // Reuse dashboard styles for layout/nav
import { useLanguage } from '../contexts/LanguageContext';

const BillHistory = () => {
  const { shop } = useOutletContext();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }); // YYYY-MM-DD format
  const [expandedBillId, setExpandedBillId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!shop) return;

    const fetchBills = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('shop_id', shop.id)
          .eq('status', 'delivered')
          .order('created_at', { ascending: false });

        if (dateFilter) {
          const startOfDay = new Date(dateFilter);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateFilter);
          endOfDay.setHours(23, 59, 59, 999);
          
          query = query
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());
        }

        const { data: ordersData, error } = await query;
        
        if (error) {
          console.error('Error fetching bills:', error);
        } else if (ordersData) {
          setBills(ordersData);
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    };

    if (dateFilter) {
      fetchBills();
    }
  }, [dateFilter, shop]);

  // Group bills by date
  const groupedBills = bills.reduce((acc, bill) => {
    const date = new Date(bill.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(bill);
    return acc;
  }, {});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  // Download a single bill as a text receipt
  const downloadBill = (e, bill) => {
    e.stopPropagation();
    const lines = [
      `╔══════════════════════════════╗`,
      `║        ${(shop?.name || 'CAFE').toUpperCase().padStart(14).padEnd(28)}║`,
      `╚══════════════════════════════╝`,
      ``,
      `Order: ${bill.order_number || 'N/A'}`,
      `Date:  ${new Date(bill.created_at).toLocaleDateString()}`,
      `Time:  ${new Date(bill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `Table: ${bill.table_number || 'N/A'}`,
      `──────────────────────────────`,
      `ITEMS`,
      `──────────────────────────────`,
    ];

    if (bill.order_items) {
      bill.order_items.forEach(item => {
        const name = `${item.quantity}x ${item.item_name}`;
        const price = formatCurrency(item.price_at_time * item.quantity);
        lines.push(`${name.padEnd(22)} ${price}`);
      });
    }

    lines.push(`──────────────────────────────`);
    lines.push(`TOTAL${formatCurrency(bill.total_amount).padStart(25)}`);
    lines.push(`══════════════════════════════`);
    if (bill.notes) {
      lines.push(`Note: ${bill.notes}`);
    }
    lines.push(``, `Thank you for dining with us!`);

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill-${bill.order_number || bill.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="dash-main" style={{ paddingBottom: '40px' }}>
      {/* Filter Section */}
      <section style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <label htmlFor="bill-date-filter" style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
            <Calendar size={20} color="var(--color-text-muted)" />
            <span className="sr-only">Filter by date</span>
          </label>
          <input 
            id="bill-date-filter"
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter bills by date"
            style={{ flex: 1, border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '1rem', color: 'var(--color-text)', fontFamily: 'inherit' }}
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              aria-label="Clear date filter"
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Bills List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>{t.loading}</div>
      ) : Object.keys(groupedBills).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
          <FileText size={48} color="var(--color-border)" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>{t.noCompletedOrders}</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupedBills).map(([date, dateBills]) => (
            <div key={date}>
              <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '12px', paddingLeft: '8px' }}>{date}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dateBills.map(bill => (
                  <div key={bill.id} style={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    
                    {/* Bill Header (Click to expand) */}
                    <div 
                      onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
                      style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{bill.order_number}</span>
                          <span style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>PAID</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          <span>Table {bill.table_number}</span>
                          <span>•</span>
                          <span>{new Date(bill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={(e) => downloadBill(e, bill)}
                          title="Download Bill"
                          style={{ background: 'rgba(255,109,0,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Download size={16} color="var(--color-accent)" />
                        </button>
                        <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-text)' }}>
                          {formatCurrency(bill.total_amount)}
                        </span>
                        {expandedBillId === bill.id ? <ChevronUp size={20} color="var(--color-text-muted)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
                      </div>
                    </div>

                    {/* Bill Details (Expanded) */}
                    {expandedBillId === bill.id && (
                      <div style={{ padding: '16px', borderTop: '1px dashed var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Order Items</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {bill.order_items && bill.order_items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <div>
                                <span style={{ fontWeight: '600', marginRight: '8px' }}>{item.quantity}x</span>
                                <span>{item.item_name}</span>
                              </div>
                              <span>{formatCurrency(item.price_at_time * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem' }}>
                          <span>Grand Total</span>
                          <span>{formatCurrency(bill.total_amount)}</span>
                        </div>
                        
                        {bill.notes && (
                          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(255, 109, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 109, 0, 0.2)' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-accent)' }}><strong>Note:</strong> {bill.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default BillHistory;
