import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Share2, ClipboardList, RefreshCw, X, CheckCircle, Trash2, Plus } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
// JSZip removed — Download All now uses PDF format
import '../index.css';
import '../qr-code.css';
import { useLanguage } from '../contexts/LanguageContext';

const QRCodeGeneration = () => {
  const { shop, setShop } = useOutletContext();
  const { t } = useLanguage();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [numTablesInput, setNumTablesInput] = useState(10);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Fetch tables on mount
  useEffect(() => {
    if (!shop?.id) return;
    
    const fetchTables = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shop_tables')
          .select('*')
          .eq('shop_id', shop.id)
          .order('table_number', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setTables(data);
          if (data.length > 0) {
            setNumTablesInput(data.length);
          } else if (shop.tables) {
            setNumTablesInput(shop.tables);
          }
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [shop?.id, shop?.tables]);

  // Bulk generate/update tables in database (non-destructive)
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!shop?.id) return;

    setGenerating(true);
    try {
      // 1. Fetch current tables first to compare
      const { data: currentTables, error: fetchErr } = await supabase
        .from('shop_tables')
        .select('*')
        .eq('shop_id', shop.id)
        .order('table_number', { ascending: true });
      if (fetchErr) throw fetchErr;

      const currentCount = currentTables ? currentTables.length : 0;
      const targetCount = parseInt(numTablesInput, 10);

      // 2. Perform incremental modifications
      if (targetCount > currentCount) {
        // Add new tables starting from max(table_number) + 1
        const maxTableNumber = currentTables && currentTables.length > 0
          ? Math.max(...currentTables.map(t => t.table_number))
          : 0;

        const newTables = [];
        const baseUrl = window.location.origin;
        const tablesToAdd = targetCount - currentCount;

        for (let i = 1; i <= tablesToAdd; i++) {
          const tableNum = maxTableNumber + i;
          const tableToken = crypto.randomUUID();
          const tableCode = `${shop.owner_unique_id}_table_${tableNum}`;
          const qrUrl = `${baseUrl}/menu/${tableToken}`;
          newTables.push({
            shop_id: shop.id,
            table_number: tableNum,
            table_code: tableCode,
            table_token: tableToken,
            qr_url: qrUrl,
            is_active: true
          });
        }
        const { error: insertError } = await supabase.from('shop_tables').insert(newTables);
        if (insertError) throw insertError;
      } else if (targetCount < currentCount) {
        // Delete excess tables (delete the ones with the largest table numbers)
        const sortedTables = [...currentTables].sort((a, b) => b.table_number - a.table_number);
        const tablesToDelete = currentCount - targetCount;
        const idsToDelete = sortedTables.slice(0, tablesToDelete).map(t => t.id);

        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('shop_tables')
            .delete()
            .in('id', idsToDelete);
          if (deleteError) throw deleteError;
        }
      }

      // 3. Update table count on the shop details record
      const { error: shopError } = await supabase
        .from('shops')
        .update({ tables: targetCount })
        .eq('id', shop.id);
      if (shopError) throw shopError;

      // 4. Sync shop context
      setShop(prev => ({ ...prev, tables: targetCount }));

      // 5. Refresh local state
      const { data: updatedTables, error: fetchError } = await supabase
        .from('shop_tables')
        .select('*')
        .eq('shop_id', shop.id)
        .order('table_number', { ascending: true });
      if (fetchError) throw fetchError;
      
      if (updatedTables) {
        setTables(updatedTables);
      }

      setIsEditMode(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);

    } catch (err) {
      console.error('Error generating tables:', err);
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Delete individual table
  const handleDeleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to delete this table QR code? This action cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from('shop_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;

      // Update local tables state
      const updatedTables = tables.filter(t => t.id !== tableId);
      setTables(updatedTables);
      setNumTablesInput(updatedTables.length);

      // Update shop table count
      const { error: shopError } = await supabase
        .from('shops')
        .update({ tables: updatedTables.length })
        .eq('id', shop.id);
      
      if (!shopError) {
        setShop(prev => ({ ...prev, tables: updatedTables.length }));
      }
    } catch (err) {
      console.error('Error deleting table:', err);
      alert('Failed to delete table: ' + (err.message || err.details || JSON.stringify(err)));
    }
  };

  // Add individual table
  const handleAddSingleTable = async () => {
    if (!shop?.id) return;
    setGenerating(true);
    try {
      // 1. Fetch current tables first to find maximum table number
      const { data: currentTables, error: fetchErr } = await supabase
        .from('shop_tables')
        .select('*')
        .eq('shop_id', shop.id)
        .order('table_number', { ascending: true });
      if (fetchErr) throw fetchErr;

      const currentCount = currentTables ? currentTables.length : 0;
      const maxTableNumber = currentTables && currentTables.length > 0
        ? Math.max(...currentTables.map(t => t.table_number))
        : 0;

      const nextTableNum = maxTableNumber + 1;
      const tableToken = crypto.randomUUID();
      const tableCode = `${shop.owner_unique_id}_table_${nextTableNum}`;
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/menu/${tableToken}`;

      const { data: newTable, error: insertError } = await supabase
        .from('shop_tables')
        .insert([
          {
            shop_id: shop.id,
            table_number: nextTableNum,
            table_code: tableCode,
            table_token: tableToken,
            qr_url: qrUrl,
            is_active: true
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local tables state
      const updatedTables = [...(currentTables || []), newTable];
      setTables(updatedTables);
      setNumTablesInput(updatedTables.length);

      // Update shop table count
      const newCount = currentCount + 1;
      const { error: shopError } = await supabase
        .from('shops')
        .update({ tables: newCount })
        .eq('id', shop.id);
      
      if (!shopError) {
        setShop(prev => ({ ...prev, tables: newCount }));
      }

      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } catch (err) {
      console.error('Error adding table:', err);
      alert('Failed to add table: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Toggle table active status
  const toggleTableActive = async (tableId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('shop_tables')
        .update({ is_active: newStatus })
        .eq('id', tableId);

      if (error) throw error;

      setTables(prev =>
        prev.map(t => (t.id === tableId ? { ...t, is_active: newStatus } : t))
      );
    } catch (err) {
      console.error('Error updating table status:', err);
      alert('Failed to update table status');
    }
  };

  // Download a single table QR as PNG
  const downloadSingleQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-canvas-${tableNumber}`);
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${shop?.name || 'cafe'}-table-${tableNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share or copy link for a single table QR
  const shareSingleQR = async (table) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Table ${table.table_number} QR Code`,
          text: `Scan this to view the menu for ${shop?.name} - Table ${table.table_number}`,
          url: table.qr_url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(table.qr_url);
      alert('Table QR URL copied to clipboard!');
    }
  };

  // Download all QRs as a PDF document
  const downloadAllQRs = async () => {
    if (tables.length === 0) return;
    setDownloadingPDF(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const itemsPerPage = 6;
      const cardWidth = 80;
      const cardHeight = 80;
      const xStart = 15;
      const yStart = 15;
      const xGap = 15;
      const yGap = 12;

      for (let index = 0; index < tables.length; index++) {
        // Yield to browser execution thread every 6 items (1 page) to prevent UI freezing
        if (index > 0 && index % 6 === 0) {
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        const table = tables[index];
        const pageIndex = index % itemsPerPage;
        
        if (index > 0 && pageIndex === 0) {
          doc.addPage();
        }

        const row = Math.floor(pageIndex / 2);
        const col = pageIndex % 2;
        const x = xStart + col * (cardWidth + xGap);
        const y = yStart + row * (cardHeight + yGap);

        // Card background
        doc.setDrawColor(215, 204, 200);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardWidth, cardHeight, 6, 6, 'FD');

        // QR image
        const canvas = document.getElementById(`qr-canvas-${table.table_number}`);
        if (canvas) {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          doc.addImage(imgData, 'JPEG', x + 17.5, y + 10, 45, 45);
        }

        // Cafe name
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(62, 39, 35);
        doc.text(shop?.name || 'QConnect Cafe', x + cardWidth / 2, y + 62, { align: 'center' });

        // Table label
        doc.setFontSize(14);
        doc.setTextColor(255, 109, 0);
        doc.text(`TABLE ${table.table_number}`, x + cardWidth / 2, y + 69, { align: 'center' });

        // Instruction
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('SCAN FOR DIGITAL MENU', x + cardWidth / 2, y + 74, { align: 'center' });
      }

      // Manual blob download instead of doc.save() for reliability
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${shop?.name || 'cafe'}-qr-codes.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

    } catch (err) {
      console.error('Error creating PDF:', err);
      alert('Failed to generate PDF file.');
    } finally {
      setDownloadingPDF(false);
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--color-surface)', borderTop: '4px solid var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
        <p style={{ color: 'var(--color-text-muted)' }}>{t.loading}</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const showSetupScreen = tables.length === 0 || isEditMode;

  return (
    <div className="qr-dashboard-container">
      
      {/* 1. Header Section */}
      {!showSetupScreen && (
        <div className="qr-header animate-slide-down">
          <div className="qr-header-title">
            <h2>{t.qrCodeGeneration}</h2>
            <p>Manage and export unique QR codes for your {tables.length} tables.</p>
          </div>
          
          <div className="qr-bulk-actions">
            <button onClick={downloadAllQRs} className="qr-btn-bulk qr-btn-bulk-primary" disabled={downloadingPDF}>
              <Download size={18} /> {downloadingPDF ? t.generatingPDF : t.downloadAll}
            </button>
            <button onClick={handleAddSingleTable} className="qr-btn-bulk" disabled={generating}>
              <Plus size={18} /> Add Table
            </button>
            <button onClick={() => setIsEditMode(true)} className="qr-btn-bulk">
              <RefreshCw size={18} /> Change Table Count
            </button>
          </div>
        </div>
      )}

      {/* 2. Setup / Generation Form Screen */}
      {showSetupScreen && (
        <div className="qr-setup-wrapper animate-slide-down">
          <div className="glass-panel qr-setup-card">
            
            {isEditMode && (
              <button 
                onClick={() => setIsEditMode(false)}
                aria-label="Close edit mode"
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            )}

            <div className="qr-setup-icon">
              <ClipboardList size={36} />
            </div>
            
            <h3>{t.tableSetup}</h3>
            <p>{t.tableSetupSub}</p>

            <form onSubmit={handleGenerate} className="qr-setup-form">
              <div className="qr-setup-input-group">
                <label className="qr-setup-label">{t.numberOfTables}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="500"
                  required
                  value={numTablesInput}
                  onChange={(e) => setNumTablesInput(parseInt(e.target.value, 10) || 1)}
                  className="qr-setup-input"
                />
              </div>

              <button 
                type="submit" 
                disabled={generating} 
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', marginTop: '1rem' }}
              >
                {generating ? (
                  <>Generating...</>
                ) : (
                  <>{t.generateQRCodes}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. QR Cards Grid Dashboard */}
      {!showSetupScreen && (
        <div className="qr-grid animate-slide-down" style={{ animationDelay: '0.1s' }}>
          {tables.map(table => (
            <div key={table.id} className={`qr-card ${table.is_active === false ? 'qr-card-inactive' : ''}`}>
              <div className="qr-card-status-header">
                <span className={`status-badge ${table.is_active !== false ? 'status-active' : 'status-inactive'}`}>
                  {table.is_active !== false ? 'Active' : 'Inactive'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="qr-switch">
                    <input
                      type="checkbox"
                      checked={table.is_active !== false}
                      onChange={() => toggleTableActive(table.id, table.is_active !== false)}
                      aria-label={`Toggle table ${table.table_number} ${table.is_active !== false ? 'inactive' : 'active'}`}
                    />
                    <span className="qr-slider"></span>
                  </label>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteTable(table.id);
                    }}
                    aria-label={`Delete table ${table.table_number}`}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '4px', 
                      borderRadius: '4px', 
                      transition: 'background-color 0.2s',
                      position: 'relative',
                      zIndex: 10
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={16} style={{ pointerEvents: 'none' }} />
                  </button>
                </div>
              </div>

              <div className="qr-image-wrapper">
                {/* Standard canvas element for downloads and PDF rendering */}
                <QRCodeCanvas 
                  id={`qr-canvas-${table.table_number}`} 
                  value={table.qr_url} 
                  size={150} 
                  level="H" 
                  includeMargin={false}
                />
              </div>
              
              <div className="qr-card-info">
                <h4 className="qr-card-title">Table {table.table_number}</h4>
                <p className="qr-card-code">{table.table_code}</p>
                
                <div className="qr-card-actions">
                  <button onClick={() => downloadSingleQR(table.table_number)} className="qr-card-btn">
                    <Download size={15} /> {t.downloadQR}
                  </button>
                  <button onClick={() => shareSingleQR(table)} className="qr-card-btn">
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Status Indicator for ZIP/PDF generation */}
      {downloadingPDF && (
        <div className="qr-generating-toast">
          <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid var(--color-surface)', borderTop: '3px solid var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span>{t.generatingPDF}</span>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="qr-generating-toast" style={{ borderColor: '#22c55e' }}>
          <CheckCircle size={20} color="#22c55e" />
          <span>{t.generateSuccess}</span>
        </div>
      )}

    </div>
  );
};

export default QRCodeGeneration;
