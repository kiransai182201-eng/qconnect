import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  ArrowLeft, 
  Upload, 
  Clock, 
  Tag, 
  Sparkles,
  Utensils,
  ChevronRight,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../menu-builder.css';
import { useLanguage } from '../contexts/LanguageContext';

const MenuBuilder = () => {
  const navigate = useNavigate();
  const { shop, setShop } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const { t } = useLanguage();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  
  // Item Form Fields
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
  const [prepTime, setPrepTime] = useState(10);
  const [dietType, setDietType] = useState('veg'); // veg, non-veg, spicy, gluten-free
  const [customizationOptions, setCustomizationOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Parse metadata from description string
  const parseMetadata = (descText) => {
    if (!descText) return { cleanDesc: '', prep: 10, diet: 'veg', customs: [] };
    
    const prepMatch = descText.match(/\[PREP:\s*(\d+)\]/);
    const dietMatch = descText.match(/\[DIET:\s*([^\]]+)\]/);
    const customsMatch = descText.match(/\[CUSTOMIZATIONS:\s*([^\]]+)\]/);
    
    const prep = prepMatch ? parseInt(prepMatch[1]) : 10;
    const diet = dietMatch ? dietMatch[1].trim() : 'veg';
    const customs = customsMatch ? customsMatch[1].split('; ').filter(Boolean) : [];
    
    const cleanDesc = descText.replace(/\[.*?\]/g, '').trim();
    
    return { cleanDesc, prep, diet, customs };
  };

  useEffect(() => {
    if (!shop) return;

    const fetchData = async () => {
      // Fetch categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: true });

      if (cats) {
        setCategories(cats);
        if (cats.length > 0 && !activeCategoryId) {
          setActiveCategoryId(cats[0].id);
        }
      }

      // Fetch items
      const { data: itms } = await supabase
        .from('items')
        .select('*, categories!inner(shop_id)')
        .eq('categories.shop_id', shop.id);
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
        alert(`Failed to add category: ${error.message}`);
      } else if (data) {
        setCategories([...categories, data[0]]);
        setNewCategoryName('');
        setActiveCategoryId(data[0].id);
      }
    } else if (!shop?.id) {
      alert("Error: Shop ID is missing.");
    }
  };

  const deleteCategory = async (catId) => {
    // Delete all items in this category first
    const { error: itemsError } = await supabase.from('items').delete().eq('category_id', catId);
    if (itemsError) {
      alert(`Failed to delete items: ${itemsError.message}`);
      return;
    }
    // Delete the category
    const { error: catError } = await supabase.from('categories').delete().eq('id', catId);
    if (catError) {
      alert(`Failed to delete category: ${catError.message}`);
      return;
    }
    // Update local state
    setItems(prev => prev.filter(item => item.category_id !== catId));
    setCategories(prev => prev.filter(c => c.id !== catId));
    if (activeCategoryId === catId) {
      const remaining = categories.filter(c => c.id !== catId);
      setActiveCategoryId(remaining.length > 0 ? remaining[0].id : null);
    }
    setCategoryToDelete(null);
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name && newItem.price && activeCategoryId) {
      // Append metadata to the description field
      const descToSave = newItem.description.trim() + 
        ` [PREP: ${prepTime}]` + 
        ` [DIET: ${dietType}]` + 
        (customizationOptions.length > 0 ? ` [CUSTOMIZATIONS: ${customizationOptions.join('; ')}]` : '');

      if (editingItemId) {
        // Update existing item
        const { data, error } = await supabase.from('items').update({
          name: newItem.name, 
          price: parseFloat(newItem.price), 
          description: descToSave,
          is_available: isAvailable
        }).eq('id', editingItemId).select();

        if (error) {
          console.error("Error updating item:", error);
          alert(`Failed to update item: ${error.message}`);
        } else if (data) {
          setItems(items.map(item => item.id === editingItemId ? data[0] : item));
          resetForm();
        }
      } else {
        // Insert new item
        const { data, error } = await supabase.from('items').insert([
          { 
            category_id: activeCategoryId, 
            name: newItem.name, 
            price: parseFloat(newItem.price), 
            description: descToSave,
            is_available: isAvailable
          }
        ]).select();

        if (error) {
          console.error("Error adding item:", error);
          alert(`Failed to add item: ${error.message}`);
        } else if (data) {
          setItems([...items, data[0]]);
          resetForm();
        }
      }
    } else if (!activeCategoryId) {
      alert("Please select a category first.");
    }
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    const meta = parseMetadata(item.description);
    setNewItem({ name: item.name, price: item.price, description: meta.cleanDesc });
    setPrepTime(meta.prep);
    setDietType(meta.diet);
    setCustomizationOptions(meta.customs);
    setIsAvailable(item.is_available !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingItemId(null);
    setNewItem({ name: '', price: '', description: '' });
    setPrepTime(10);
    setDietType('veg');
    setCustomizationOptions([]);
    setIsAvailable(true);
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

  const handlePublish = async () => {
    if (!shop?.id) return;
    setIsPublishing(true);
    await supabase.from('shops').update({ status: 'published' }).eq('id', shop.id);
    setIsPublishing(false);
    setPublished(true);
  };

  const addCustomizationOption = () => {
    if (newOptionText.trim()) {
      setCustomizationOptions([...customizationOptions, newOptionText.trim()]);
      setNewOptionText('');
    }
  };

  const removeCustomizationOption = (indexToRemove) => {
    setCustomizationOptions(customizationOptions.filter((_, idx) => idx !== indexToRemove));
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  if (published) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--glass-border)', padding: '4rem 2rem', borderRadius: '24px', maxWidth: '500px' }}>
          <div style={{ background: 'rgba(255,109,0,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Sparkles size={40} color="var(--color-accent)" />
          </div>
          <h2 style={{ marginBottom: '1rem', fontSize: '2rem', color: 'var(--color-text-main)', fontWeight: '800' }}>Menu Published!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Your digital menu is now live. Customers scanning your QR codes will see the latest offerings instantly.
          </p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '12px 32px' }}>
            {t.dashboard}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-page-wrapper">
      
      {/* 3 Column Grid Container */}
      <div className="mb-grid-layout">
        
        {/* COLUMN 1: Menu Categories Sidebar */}
        <div className="mb-categories-card">
          <h3>Menu Categories</h3>
          <div className="mb-category-list">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className={`mb-category-item ${activeCategoryId === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryId(cat.id)}
              >
                <div className="mb-category-left">
                  <span className="mb-drag-handle">:::</span>
                  <span className="mb-category-name">{cat.name}</span>
                </div>
                <div className="mb-category-actions">
                  <button 
                    className="mb-cat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = prompt("Edit category name:", cat.name);
                      if (name && name.trim()) {
                        supabase.from('categories').update({ name: name.trim() }).eq('id', cat.id)
                          .then(() => fetchTables());
                        setCategories(categories.map(c => c.id === cat.id ? { ...c, name: name.trim() } : c));
                      }
                    }}
                    title="Edit category"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    className="mb-cat-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryToDelete(cat);
                    }}
                    title="Delete category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Category row */}
            <div className="mb-add-category-box">
              <input 
                type="text" 
                className="mb-add-category-input"
                placeholder="Add New Category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <button className="mb-add-category-btn" onClick={addCategory}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Main Add/Edit Form */}
        <div>
          <div className="mb-form-header">
            <div className="mb-form-header-left">
              <button className="mb-back-circle" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} />
              </button>
              <div className="mb-form-header-title">
                <h2>{editingItemId ? 'Edit Menu Item' : 'Add Menu Item'} ({activeCategory ? activeCategory.name : 'Choose Category'})</h2>
                <p>Comprehensive {editingItemId ? 'Edit' : 'Add'} Menu Item</p>
              </div>
            </div>
            
            <button className="tables-btn-primary" onClick={handlePublish} disabled={isPublishing}>
              Publish Menu
            </button>
          </div>

          <div className="mb-form-card">
            <form onSubmit={addItem}>
              
              {/* Top section: Upload area on the left, Input fields on the right */}
              <div className="mb-form-top-row">
                <div className="mb-upload-area">
                  <div className="mb-upload-icon-circle">
                    <Plus size={24} />
                  </div>
                  <span className="mb-upload-label">Click to Upload Image</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', opacity: 0.5 }}>Image Upload</span>
                </div>

                <div className="mb-form-top-fields">
                  <div className="mb-flex-row">
                    <div className="mb-form-group">
                      <label>Item Name</label>
                      <input 
                        type="text" 
                        required 
                        className="mb-input-text"
                        placeholder="Egg Rice" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-form-group half">
                      <label>Price (₹)</label>
                      <input 
                        type="number" 
                        required 
                        className="mb-input-text"
                        placeholder="₹200" 
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-form-group">
                    <label>Description (Optional)</label>
                    <textarea 
                      className="mb-textarea"
                      placeholder="Full description of the menu item..."
                      maxLength={200}
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                    <span className="mb-char-counter">{newItem.description.length}/200 characters</span>
                  </div>
                </div>
              </div>

              {/* Middle row: Availability Toggle and Prep Time */}
              <div className="mb-middle-row">
                <div className="mb-availability-wrapper">
                  <span className="mb-availability-label">Availability</span>
                  <label className="mb-switch">
                    <input 
                      type="checkbox" 
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                    />
                    <span className="mb-slider"></span>
                  </label>
                  <span className={`mb-availability-status ${isAvailable ? 'available' : 'out'}`}>
                    {isAvailable ? 'Available' : 'Out of Stock'}
                  </span>
                </div>

                <div className="mb-prep-wrapper">
                  <span className="mb-prep-label">Preparation Time (min)</span>
                  <input 
                    type="number" 
                    className="mb-prep-input"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 10)}
                  />
                </div>
              </div>

              {/* Dietary Tags Selector Row */}
              <div className="mb-form-group" style={{ marginBottom: '20px' }}>
                <label>Dietary Tag</label>
                <div className="mb-dietary-selector">
                  {['veg', 'non-veg', 'vegan', 'gluten-free', 'spicy'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`mb-dietary-pill ${dietType === tag ? 'active' : ''}`}
                      onClick={() => setDietType(tag)}
                    >
                      {tag === 'veg' && '🟢 Veg'}
                      {tag === 'non-veg' && '🔴 Non-Veg'}
                      {tag === 'vegan' && '🌱 Vegan'}
                      {tag === 'gluten-free' && '🌾 Gluten-Free'}
                      {tag === 'spicy' && '🔥 Spicy'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizations Section */}
              <div className="mb-customizations-card">
                <h4 className="mb-customizations-title">Customizations</h4>
                <div className="mb-customizations-row">
                  <input 
                    type="text" 
                    className="mb-input-text"
                    placeholder="Option 1" 
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomizationOption())}
                  />
                  <button 
                    type="button" 
                    className="mb-btn-action-small"
                    onClick={addCustomizationOption}
                  >
                    Add Option
                  </button>
                </div>

                {customizationOptions.length > 0 && (
                  <div className="mb-options-tags">
                    {customizationOptions.map((opt, idx) => (
                      <span key={idx} className="mb-option-tag">
                        {opt}
                        <X 
                          size={12} 
                          className="mb-option-tag-remove"
                          onClick={() => removeCustomizationOption(idx)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mb-form-actions">
                <div>
                  {editingItemId && (
                    <button 
                      type="button" 
                      className="tables-btn-outline" 
                      onClick={resetForm}
                      style={{ marginRight: '12px' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <button type="submit" className="tables-btn-primary">
                  {editingItemId ? 'Update Item' : '+ Add Item'}
                </button>
              </div>

            </form>
          </div>

          {/* List of current items in this category */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: '800' }}>Items in Category</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {items.filter(item => item.category_id === activeCategoryId).map(item => {
                const meta = parseMetadata(item.description);
                return (
                  <div key={item.id} className="mb-category-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px', cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>
                          {meta.diet === 'veg' && 'Veg'}
                          {meta.diet === 'non-veg' && 'Non-Veg'}
                          {meta.diet === 'vegan' && 'Vegan'}
                          {meta.diet === 'gluten-free' && 'Gluten-Free'}
                          {meta.diet === 'spicy' && 'Spicy'}
                        </span>
                      </div>
                      <span style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--color-accent)' }}>₹{item.price}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineBreak: 'anywhere' }}>{meta.cleanDesc || 'No description'}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: item.is_available !== false ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                        {item.is_available !== false ? '• Available' : '• Out of Stock'}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="mb-cat-btn" onClick={() => handleEditClick(item)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="mb-cat-btn delete" onClick={() => setItemToDelete(item)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.filter(item => item.category_id === activeCategoryId).length === 0 && (
              <div className="mb-empty-state">
                No items in this category yet. Use the form above to add some!
              </div>
            )}
          </div>

        </div>

        {/* COLUMN 3: Real-Time Preview Card */}
        <div className="mb-preview-sidebar">
          <h3>Preview</h3>
          
          <div className="mb-preview-card">
            <div className="mb-preview-img-container">
              {/* Placeholder image representation matching mockup */}
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1c1512', color: 'var(--color-text-muted)' }}>
                <Utensils size={32} style={{ opacity: 0.15, marginBottom: '6px' }} />
                <span style={{ fontSize: '0.72rem', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Preview Item</span>
              </div>

              {/* Clock Overlay Badge */}
              <div className="mb-preview-card-badge">
                <Clock size={12} />
                <span>prep:{prepTime}</span>
              </div>
            </div>

            <div className="mb-preview-card-body">
              <div className="mb-preview-card-header">
                <h4 className="mb-preview-card-title">{newItem.name || 'Item Name'}</h4>
                <span className="mb-preview-card-price">
                  ₹{newItem.price ? parseFloat(newItem.price).toFixed(2) : '0.00'}
                </span>
              </div>

              <div className="mb-preview-card-tags">
                <span className={`mb-preview-tag veg`}>
                  {dietType === 'veg' && '🟢 Veg'}
                  {dietType === 'non-veg' && '🔴 Non-Veg'}
                  {dietType === 'vegan' && '🌱 Vegan'}
                  {dietType === 'gluten-free' && '🌾 Gluten-Free'}
                  {dietType === 'spicy' && '🔥 Spicy'}
                </span>
                <span className="mb-preview-tag time">
                  {prepTime} min
                </span>
              </div>

              <p className="mb-preview-card-desc">
                {newItem.description || 'Item description will appear here.'}
              </p>

              <button className="mb-preview-card-btn">
                Add to Cart +
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="customer-modal-backdrop" style={{ zIndex: 300 }}>
          <div className="customer-modal" style={{ maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>Delete Menu Item?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>"{itemToDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setItemToDelete(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => removeItem(itemToDelete.id)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', cursor: 'pointer', fontWeight: '600' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="customer-modal-backdrop" style={{ zIndex: 300 }}>
          <div className="customer-modal" style={{ maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>Delete Category?</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>"{categoryToDelete.name}"</strong>?
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.78rem', color: '#ef4444', fontWeight: '600' }}>
              ⚠️ All items in this category will also be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setCategoryToDelete(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', backgroundColor: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteCategory(categoryToDelete.id)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', cursor: 'pointer', fontWeight: '600' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuBuilder;
