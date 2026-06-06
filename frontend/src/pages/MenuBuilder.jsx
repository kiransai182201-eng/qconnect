import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Edit2, Check, LayoutGrid, Coffee, Utensils, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../index.css';
import { useLanguage } from '../contexts/LanguageContext';

const MenuBuilder = () => {
  const navigate = useNavigate();
  const { shop } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const { t } = useLanguage();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (!shop) return;

    const fetchData = async () => {
      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').eq('shop_id', shop.id);
      if (cats) {
        setCategories(cats);
        if (cats.length > 0) setActiveCategoryId(cats[0].id);
      }

      // Fetch items
      const { data: itms } = await supabase.from('items').select('*, categories!inner(shop_id)').eq('categories.shop_id', shop.id);
      if (itms) setItems(itms);
    };
    fetchData();
  }, [shop]);

  const addCategory = async () => {
    if (newCategoryName.trim() && shop?.id) {
      const { data, error } = await supabase.from('categories').insert([
        { shop_id: shop.id, name: newCategoryName, icon: 'grid' }
      ]).select();
      
      if (error) {
        console.error("Error adding category:", error);
        alert(`Failed to add category: ${error.message}. Did you run the SQL schema in Supabase?`);
      } else if (data) {
        setCategories([...categories, data[0]]);
        setNewCategoryName('');
        setActiveCategoryId(data[0].id);
      }
    } else if (!shop?.id) {
      alert("Error: Shop ID is missing. Please make sure you completed the 'Shop Details' step first.");
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name && newItem.price && activeCategoryId) {
      if (editingItemId) {
        // Update existing item
        const { data, error } = await supabase.from('items').update({
          name: newItem.name, 
          price: parseFloat(newItem.price), 
          description: newItem.description
        }).eq('id', editingItemId).select();

        if (error) {
          console.error("Error updating item:", error);
          alert(`Failed to update item: ${error.message}`);
        } else if (data) {
          setItems(items.map(item => item.id === editingItemId ? data[0] : item));
          setNewItem({ name: '', price: '', description: '' });
          setEditingItemId(null);
        }
      } else {
        // Insert new item
        const { data, error } = await supabase.from('items').insert([
          { 
            category_id: activeCategoryId, 
            name: newItem.name, 
            price: parseFloat(newItem.price), 
            description: newItem.description 
          }
        ]).select();

        if (error) {
          console.error("Error adding item:", error);
          alert(`Failed to add item: ${error.message}. Did you run the SQL schema in Supabase?`);
        } else if (data) {
          setItems([...items, data[0]]);
          setNewItem({ name: '', price: '', description: '' });
        }
      }
    } else if (!activeCategoryId) {
      alert("Please select a category first.");
    }
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setNewItem({ name: item.name, price: item.price, description: item.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setNewItem({ name: '', price: '', description: '' });
  };

  const removeItem = async (id) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(item => item.id !== id));
      setItemToDelete(null);
    } else {
      alert("Error deleting item.");
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    // If undefined, default is true, so toggle to false
    const newStatus = currentStatus === false ? true : false;
    const { error } = await supabase.from('items').update({ is_available: newStatus }).eq('id', id);
    if (!error) {
      setItems(items.map(item => item.id === id ? { ...item, is_available: newStatus } : item));
    } else {
      alert("Error updating item status.");
    }
  };

  const handlePublish = async () => {
    if (!shop?.id) return;
    setIsPublishing(true);
    await supabase.from('shops').update({ status: 'published' }).eq('id', shop.id);
    setIsPublishing(false);
    setPublished(true);
  };

  if (published) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem', borderRadius: '24px', maxWidth: '500px' }}>
          <div style={{ background: 'rgba(255,109,0,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Sparkles size={40} color="var(--color-accent)" />
          </div>
          <h2 style={{ marginBottom: '1rem', fontSize: '2rem', color: 'var(--color-text-main)' }}>Menu Published!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Your digital menu is now live. Customers scanning your QR codes will see the latest offerings.
          </p>
          <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>
            {t.dashboard}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-builder-layout">
      
      {/* Sidebar - Categories */}
      <div className="menu-builder-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'var(--color-surface)', border: '1px solid var(--glass-border)', color: 'var(--color-text-main)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', width: '36px', height: '36px', transition: 'var(--transition-fast)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t.menu}</h2>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Desserts" 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <button onClick={addCategory} style={{ background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Plus size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
                  background: activeCategoryId === cat.id ? 'rgba(255, 109, 0, 0.1)' : 'transparent',
                  border: `1px solid ${activeCategoryId === cat.id ? 'var(--color-accent)' : 'transparent'}`,
                  color: activeCategoryId === cat.id ? 'var(--color-accent)' : 'var(--color-text-main)',
                  transition: 'var(--transition-fast)', textAlign: 'left'
                }}
              >
                {cat.icon === 'coffee' ? <Coffee size={18} /> : <LayoutGrid size={18} />}
                <span style={{ fontWeight: '500' }}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Items */}
      <div className="menu-builder-main">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>
              {categories.find(c => c.id === activeCategoryId)?.name || t.selectCategory}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{t.manageItemsMsg}</p>
          </div>
          
          <button onClick={handlePublish} disabled={isPublishing} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isPublishing ? t.publishing : (
              <>{t.publishMenu} <Check size={18} /></>
            )}
          </button>
        </div>

        {/* Add Item Form */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          <form onSubmit={addItem} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t.itemName}</label>
              <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Cappuccino" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }} />
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t.price}</label>
              <input type="number" step="0.01" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="4.50" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none' }} />
            </div>
            <div style={{ flex: '1 1 100%' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{t.description}</label>
              <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="A double shot of espresso with steamed milk foam." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', outline: 'none', resize: 'vertical', minHeight: '80px' }} />
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {editingItemId && (
                <button type="button" onClick={cancelEdit} style={{ background: 'transparent', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: 'var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--glass-border)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {t.cancel}
                </button>
              )}
              <button type="submit" style={{ background: 'var(--color-surface)', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', transition: 'var(--transition-fast)', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--glass-border)'} onMouseOut={e => e.currentTarget.style.background = 'var(--color-surface)'}>
                {editingItemId ? <><Check size={18} /> {t.updateItem}</> : <><Plus size={18} /> {t.addItem}</>}
              </button>
            </div>
          </form>
        </div>

        {/* Item List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {items.filter(item => item.category_id === activeCategoryId).map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{item.name}</h3>
                <span style={{ background: 'rgba(255,109,0,0.15)', color: 'var(--color-accent)', padding: '4px 8px', borderRadius: '6px', fontWeight: '600', fontSize: '0.9rem' }}>
                  ${Number(item.price).toFixed(2)}
                </span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 1.5rem 0', minHeight: '40px' }}>
                {item.description || 'No description'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <button 
                  onClick={() => toggleAvailability(item.id, item.is_available)}
                  style={{ 
                    background: item.is_available !== false ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 83, 80, 0.1)', 
                    color: item.is_available !== false ? '#4CAF50' : '#EF5350', 
                    border: `1px solid ${item.is_available !== false ? '#4CAF50' : '#EF5350'}`, 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'var(--transition-fast)'
                  }}>
                  {item.is_available !== false ? t.available : t.outOfStock}
                </button>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEditClick(item)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--glass-border)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => setItemToDelete(item)} style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 83, 80, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {items.filter(item => item.category_id === activeCategoryId).length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '16px' }}>
              <Utensils size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>{t.noItemsInCategory}</p>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel" style={{ borderRadius: '1.5rem', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(239, 83, 80, 0.1)' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#EF5350' }}>{t.confirmDeletionTitle}</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-main)', fontSize: '1rem' }}>
                {t.confirmDeletionMsg}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setItemToDelete(null)}
                  style={{ flex: 1, background: 'transparent', color: 'var(--color-text-main)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition-fast)' }} 
                  onMouseOver={e => e.currentTarget.style.background = 'var(--glass-border)'} 
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => removeItem(itemToDelete.id)}
                  style={{ flex: 1, background: '#EF5350', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition-fast)' }} 
                  onMouseOver={e => e.currentTarget.style.opacity = '0.9'} 
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  {t.deleteItem}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
  );
};

export default MenuBuilder;
