import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  QrCode, Bell, Store, LayoutTemplate, BookOpen, Clock, 
  ShoppingCart, Shield, UserCircle, Camera, Plus, Download,
  Sun, ChevronRight, LogOut, Trash2, CheckCircle, Palette, Moon, AlertTriangle
} from 'lucide-react';
import '../settings.css';
import '../dashboard.css'; // Reuse bottom nav styles

import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
  const navigate = useNavigate();
  const { shop, setShop } = useOutletContext();
  const [activeSection, setActiveSection] = useState('shop-profile');
  const [showToast, setShowToast] = useState(false);
  const { t } = useLanguage();

  // Form State
  const [shopName, setShopName] = useState(shop?.name || '');
  const [ownerName, setOwnerName] = useState(shop?.owner_name || '');
  const [description, setDescription] = useState(shop?.description || '');
  const [openTime, setOpenTime] = useState(shop?.open_time || '09:00');
  const [closeTime, setCloseTime] = useState(shop?.close_time || '22:00');
  const [holidayMode, setHolidayMode] = useState(shop?.holiday_mode ?? false);
  const [acceptOrders, setAcceptOrders] = useState(shop?.accept_orders ?? true);
  const [autoApproval, setAutoApproval] = useState(shop?.auto_approval ?? false);
  const [themeColor, setThemeColor] = useState(() => {
    let activeTheme = shop?.theme_color;
    if (!activeTheme) {
      const localTheme = localStorage.getItem('themeColor');
      if (localTheme) {
        activeTheme = localTheme;
      } else {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        activeTheme = prefersLight ? 'light' : 'dark';
      }
    }
    return activeTheme;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [shopTables, setShopTables] = useState([]);

  // Fetch shop tables from database
  useEffect(() => {
    if (!shop?.id) return;
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from('shop_tables')
        .select('*')
        .eq('shop_id', shop.id)
        .order('table_number', { ascending: true });
      if (!error && data) {
        setShopTables(data);
      }
    };
    fetchTables();
  }, [shop?.id]);

  useEffect(() => {
    // Apply theme to document
    if (themeColor === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [themeColor]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleSaveProfile = async () => {
    if (!shop?.id) return;
    setIsSaving(true);
    const { error } = await supabase.from('shops').update({
      name: shopName,
      owner_name: ownerName,
      description: description
    }).eq('id', shop.id);
    
    setIsSaving(false);
    if (!error) {
      setShop(prev => ({
        ...prev,
        name: shopName,
        owner_name: ownerName,
        description: description
      }));
      triggerToast();
    }
  };

  const handleToggleChange = (field, setter) => async (e) => {
    const val = e.target.checked;
    setter(val);
    if (shop?.id) {
      const { error } = await supabase.from('shops').update({
        [field]: val
      }).eq('id', shop.id);
      if (!error) {
        setShop(prev => ({
          ...prev,
          [field]: val
        }));
        triggerToast();
      }
    }
  };

  const handleTimeChange = (field, setter) => async (e) => {
    const val = e.target.value;
    setter(val);
    if (shop?.id) {
      const { error } = await supabase.from('shops').update({
        [field]: val
      }).eq('id', shop.id);
      if (!error) {
        setShop(prev => ({
          ...prev,
          [field]: val
        }));
        triggerToast();
      }
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !shop?.id) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size allowed is 2MB.');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${shop.id}/logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('shop-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('shop-logos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('shops').update({
        logo_url: publicUrl
      }).eq('id', shop.id);
      
      if (dbError) throw dbError;

      setShop(prev => ({ ...prev, logo_url: publicUrl }));
      triggerToast();
    } catch (err) {
      console.error(err);
      alert('Failed to upload logo: ' + err.message);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !shop?.id) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size allowed is 2MB.');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${shop.id}/cover-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('shop-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('shop-logos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('shops').update({
        cover_url: publicUrl
      }).eq('id', shop.id);
      
      if (dbError) throw dbError;

      setShop(prev => ({ ...prev, cover_url: publicUrl }));
      triggerToast();
    } catch (err) {
      console.error(err);
      alert('Failed to upload cover image: ' + err.message);
    }
  };

  const handleThemeChange = async (color) => {
    setThemeColor(color);
    
    // Apply theme to document immediately and save locally
    localStorage.setItem('themeColor', color);
    if (color === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    
    if (shop?.id) {
      const { error } = await supabase.from('shops').update({
        theme_color: color
      }).eq('id', shop.id);
      if (!error) {
        setShop(prev => ({
          ...prev,
          theme_color: color
        }));
        triggerToast();
      }
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/register');
  };

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      // Call the database function to delete all data + auth user
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;

      // Sign out locally
      await supabase.auth.signOut();
      navigate('/register');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account: ' + err.message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <main className="set-main">
        <div className="set-grid">
          
          {/* Navigation Sidebar (Desktop) */}
          <aside className="set-sidebar">
            <nav className="set-nav">
              {[
                { id: 'shop-profile', icon: Store, label: t.shopDetails },
                { id: 'appearance', icon: Palette, label: t.themeSettings },
                { id: 'table-management', icon: LayoutTemplate, label: 'Table Management' },
                { id: 'menu-management', icon: BookOpen, label: 'Menu Management' },
                { id: 'business-hours', icon: Clock, label: 'Business Hours' },
                { id: 'order-settings', icon: ShoppingCart, label: 'Order Settings' },
                { id: 'notification-settings', icon: Bell, label: 'Notifications' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    className={`set-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              
              <hr />
              
              <button className={`set-nav-item ${activeSection === 'security' ? 'active' : ''}`} onClick={() => scrollToSection('security')}>
                <Shield size={18} />
                <span>Security</span>
              </button>
              <button className={`set-nav-item ${activeSection === 'account' ? 'active' : ''}`} onClick={() => scrollToSection('account')}>
                <UserCircle size={18} />
                <span>{t.accountSettings}</span>
              </button>
            </nav>
          </aside>

          {/* Settings Content */}
          <div className="set-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Section: Shop Profile */}
            <section className="set-section" id="shop-profile">
              <div className="set-section-header">
                <div className="set-section-icon primary">
                  <Store size={28} />
                </div>
                <div>
                  <h2>{t.shopDetails}</h2>
                  <p>{t.shopDetailsSub}</p>
                </div>
              </div>

              <div className="set-cover-container">
                <img 
                  src={shop?.cover_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop"} 
                  alt="Shop Cover" 
                />
                <div className="set-cover-overlay">
                  <label htmlFor="cover-upload-input" className="set-cover-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera size={16} /> Change Cover
                  </label>
                  <input 
                    id="cover-upload-input" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleCoverUpload} 
                  />
                </div>
                <div className="set-profile-avatar" style={{ position: 'relative' }}>
                  <img 
                    src={shop?.logo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2078&auto=format&fit=crop"} 
                    alt="Shop Logo" 
                  />
                  <label htmlFor="logo-upload-input" className="avatar-edit-badge" style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--color-primary, #ff6b35)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface, #1e293b)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <Camera size={14} color="var(--color-accent, #fff)" />
                  </label>
                  <input 
                    id="logo-upload-input" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleLogoUpload} 
                  />
                </div>
              </div>

              <div className="set-profile-grid">
                <div className="set-input-group">
                  <label htmlFor="set-shop-name" className="set-label">{t.shopName}</label>
                  <input id="set-shop-name" type="text" className="set-input" placeholder={t.shopNamePlaceholder} value={shopName} onChange={handleInputChange(setShopName)} />
                </div>
                <div className="set-input-group">
                  <label htmlFor="set-owner-name" className="set-label">{t.ownerName}</label>
                  <input id="set-owner-name" type="text" className="set-input" placeholder={t.ownerNamePlaceholder} value={ownerName} onChange={handleInputChange(setOwnerName)} />
                </div>
                <div className="set-input-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="set-description" className="set-label">Description</label>
                  <textarea id="set-description" className="set-input" rows="3" placeholder="Tell customers about your cafe..." value={description} onChange={handleInputChange(setDescription)} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="set-btn-primary" onClick={handleSaveProfile} disabled={isSaving} style={{ opacity: isSaving ? 0.7 : 1 }}>
                    {isSaving ? t.saving : t.saveDetails}
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Appearance (Theme) */}
            <section className="set-section" id="appearance">
              <div className="set-section-header">
                <div className="set-section-icon primary">
                  <Palette size={28} />
                </div>
                <div>
                  <h2>{t.themeSettings}</h2>
                  <p>Customize the look and feel of your shop</p>
                </div>
              </div>

              <div>
                <label className="set-label">Display Mode</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                  
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '1rem',
                      padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer',
                      border: themeColor === 'light' ? '2px solid var(--set-primary)' : '1px solid var(--glass-border)',
                      background: themeColor === 'light' ? 'rgba(255, 109, 0, 0.05)' : 'var(--color-surface)',
                      transition: 'all 0.2s ease', textAlign: 'left',
                      boxShadow: themeColor === 'light' ? '0 4px 12px rgba(255, 109, 0, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sun size={24} color="#f59e0b" />
                      </div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: themeColor === 'light' ? '2px solid var(--set-primary)' : '2px solid #94a3b8', background: themeColor === 'light' ? 'var(--set-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {themeColor === 'light' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }}></div>}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: 'var(--color-text-main)' }}>{t.lightMode}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Bright and clear design.</p>
                    </div>
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '1rem',
                      padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer',
                      border: themeColor === 'dark' ? '2px solid var(--set-primary)' : '1px solid var(--glass-border)',
                      background: themeColor === 'dark' ? 'rgba(255, 109, 0, 0.05)' : 'var(--color-surface)',
                      transition: 'all 0.2s ease', textAlign: 'left',
                      boxShadow: themeColor === 'dark' ? '0 4px 12px rgba(255, 109, 0, 0.2)' : '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ background: 'rgba(129, 140, 248, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Moon size={24} color="#818cf8" />
                      </div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: themeColor === 'dark' ? '2px solid var(--set-primary)' : '2px solid #475569', background: themeColor === 'dark' ? 'var(--set-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {themeColor === 'dark' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }}></div>}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: 'var(--color-text-main)' }}>{t.darkMode}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Easy on the eyes.</p>
                    </div>
                  </button>

                </div>
              </div>
            </section>

            {/* Section: Table Management */}
            <section className="set-section" id="table-management">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="set-section-header">
                  <div className="set-section-icon secondary">
                    <LayoutTemplate size={28} />
                  </div>
                  <div>
                    <h2>Table Management</h2>
                    <p>{shopTables.length > 0 ? `Manage ${shopTables.length} active tables` : 'No tables generated yet'}</p>
                  </div>
                </div>
                <button className="set-btn-primary" onClick={() => navigate('/qr-code')}>
                  {shopTables.length > 0 ? <><QrCode size={18} /> Manage QR Codes</> : <><Plus size={18} /> Generate Tables</>}
                </button>
              </div>

              {shopTables.length > 0 ? (
                <>
                  <div className="set-table-grid">
                    {shopTables.map(table => (
                      <div key={table.id} className="set-table-card">
                        <QrCode className="icon" />
                        <span className="name">Table {String(table.table_number).padStart(2, '0')}</span>
                        <span className="set-table-badge">Active</span>
                      </div>
                    ))}
                  </div>
                  <button className="set-btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/qr-code')}>
                    <Download size={18} /> Download All QR Codes
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--set-text-muted)', borderRadius: '1rem', border: '1px dashed var(--glass-border, #334155)', marginTop: '1rem' }}>
                  <QrCode size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--set-text-main)' }}>No tables yet</p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Go to QR Codes to generate table QR codes for your shop.</p>
                </div>
              )}
            </section>

            {/* Section: Business Hours */}
            <section className="set-section" id="business-hours">
              <div className="set-section-header">
                <div className="set-section-icon tertiary">
                  <Clock size={28} />
                </div>
                <div>
                  <h2>Business Hours</h2>
                  <p>Set your operating schedule</p>
                </div>
              </div>

              <div className="set-list-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--color-surface-hover, rgba(255,255,255,0.03))', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="set-input-group">
                      <label htmlFor="shop-open-time" className="set-label" style={{ fontWeight: '600' }}>Opening Time</label>
                      <input 
                        id="shop-open-time"
                        type="time" 
                        className="set-input" 
                        style={{ padding: '0.75rem', width: '100%' }} 
                        value={openTime} 
                        onChange={handleTimeChange('open_time', setOpenTime)} 
                      />
                    </div>
                    <div className="set-input-group">
                      <label htmlFor="shop-close-time" className="set-label" style={{ fontWeight: '600' }}>Closing Time</label>
                      <input 
                        id="shop-close-time"
                        type="time" 
                        className="set-input" 
                        style={{ padding: '0.75rem', width: '100%' }} 
                        value={closeTime} 
                        onChange={handleTimeChange('close_time', setCloseTime)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="set-list-item highlight">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Sun size={28} style={{ color: 'var(--set-primary)' }} />
                  <div className="set-list-text">
                    <span className="set-list-title" style={{ color: 'var(--set-primary)' }}>Holiday Mode</span>
                    <span className="set-list-subtitle" style={{ color: 'var(--set-text-main)' }}>Shop will appear closed to customers</span>
                  </div>
                </div>
                <label className="set-toggle-container">
                  <input type="checkbox" className="set-toggle-input" checked={holidayMode} onChange={handleToggleChange('holiday_mode', setHolidayMode)} aria-label="Toggle holiday mode" />
                  <div className="set-toggle-track"><div className="set-toggle-thumb"></div></div>
                </label>
              </div>
            </section>

            {/* Section: Order Settings */}
            <section className="set-section" id="order-settings">
              <div className="set-section-header">
                <div className="set-section-icon primary">
                  <ShoppingCart size={28} />
                </div>
                <div>
                  <h2>Order Settings</h2>
                  <p>Configure how you receive and process orders</p>
                </div>
              </div>

              <div className="set-order-grid">
                <div className="set-order-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--set-text-main)' }}>Accept New Orders</h3>
                    <label className="set-toggle-container">
                      <input type="checkbox" className="set-toggle-input" checked={acceptOrders} onChange={handleToggleChange('accept_orders', setAcceptOrders)} aria-label="Toggle accept new orders" />
                      <div className="set-toggle-track"><div className="set-toggle-thumb"></div></div>
                    </label>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--set-text-muted)', lineHeight: '1.4' }}>Toggling this off will prevent customers from placing new orders immediately.</p>
                </div>

                <div className="set-order-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--set-text-main)' }}>Auto-Approval</h3>
                    <label className="set-toggle-container">
                      <input type="checkbox" className="set-toggle-input" checked={autoApproval} onChange={handleToggleChange('auto_approval', setAutoApproval)} aria-label="Toggle auto-approval" />
                      <div className="set-toggle-track"><div className="set-toggle-thumb"></div></div>
                    </label>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--set-text-muted)', lineHeight: '1.4' }}>Orders will be automatically confirmed without manual intervention from staff.</p>
                </div>
              </div>
            </section>

            {/* Section: Security */}
            <section className="set-section" id="security">
              <div className="set-section-header">
                <div className="set-section-icon dark">
                  <Shield size={28} />
                </div>
                <div>
                  <h2>Security & Privacy</h2>
                  <p>Keep your account and data safe</p>
                </div>
              </div>

              <div className="set-list-group">
                <div className="set-list-item clickable">
                  <div className="set-list-text">
                    <span className="set-list-title">Change Password</span>
                    <span className="set-list-subtitle">Last updated 3 months ago</span>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--set-text-muted)' }} />
                </div>

                <div className="set-list-item clickable">
                  <div className="set-list-text">
                    <span className="set-list-title">Two-Factor Authentication</span>
                    <span className="set-list-subtitle" style={{ color: 'var(--set-success)', fontWeight: '600' }}>Enabled</span>
                  </div>
                  <ChevronRight size={20} style={{ color: 'var(--set-text-muted)' }} />
                </div>
              </div>

              <div className="set-list-group" style={{ marginTop: '1rem' }}>
                <div className="set-list-item clickable" onClick={handleLogout}>
                  <div className="set-list-text">
                    <span className="set-list-title">{t.logout}</span>
                    <span className="set-list-subtitle">Sign out of your account on this device</span>
                  </div>
                  <LogOut size={20} style={{ color: 'var(--set-text-muted)' }} />
                </div>
                
                <div className="set-list-item clickable" onClick={() => setShowDeleteModal(true)}>
                  <div className="set-list-text">
                    <span className="set-list-title danger">Delete Account</span>
                    <span className="set-list-subtitle">Permanently remove all your restaurant data</span>
                  </div>
                  <Trash2 size={20} style={{ color: 'var(--set-danger)' }} />
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`set-toast ${showToast ? 'show' : ''}`}>
        <CheckCircle size={20} style={{ color: 'var(--set-success)' }} />
        <span style={{ fontWeight: '500' }}>Settings updated successfully</span>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: 'var(--color-surface, #1e293b)', borderRadius: '1.25rem',
            padding: '2rem', maxWidth: '420px', width: '100%',
            border: '1px solid rgba(255,0,0,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(239,68,68,0.15)', padding: '0.75rem', borderRadius: '50%' }}>
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <h3 style={{ margin: 0, color: 'var(--color-text-main, #f8fafc)', fontSize: '1.2rem' }}>Delete Account</h3>
            </div>

            <p style={{ color: 'var(--color-text-muted, #94a3b8)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
              This will <strong style={{ color: '#ef4444' }}>permanently delete</strong> your shop, all menu items, QR codes, orders, and feedback. This action cannot be undone.
            </p>

            <label htmlFor="set-delete-confirm" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted, #94a3b8)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Type <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: 700 }}>DELETE</span> to confirm
            </label>
            <input
              id="set-delete-confirm"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(0,0,0,0.2)',
                color: 'var(--color-text-main, #f8fafc)', fontSize: '1rem',
                outline: 'none', fontFamily: 'monospace', letterSpacing: '2px',
                marginBottom: '1.25rem'
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: '1px solid var(--glass-border, #334155)',
                  background: 'transparent', color: 'var(--color-text-main, #f8fafc)',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: deleteConfirmText === 'DELETE' ? '#ef4444' : '#4b1113',
                  color: '#fff', fontWeight: 600, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem', opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Settings;
