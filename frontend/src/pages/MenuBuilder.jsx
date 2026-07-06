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

const DEFAULT_CATEGORIES = [
  '🍽️ Starters',
  '🥗 Soups & Salads',
  '🍟 Snacks',
  '🍕 Fast Food',
  '🍔 Burgers & Sandwiches',
  '🍝 Pasta & Noodles',
  '🍗 Chicken Specials',
  '🥩 Mutton Specials',
  '🐟 Seafood',
  '🍛 Curries',
  '🍚 Rice & Biryani',
  '🍞 Roti, Naan & Bread',
  '🥟 Momos',
  '🌮 Wraps & Rolls',
  '🧀 Vegetarian',
  '🌱 Vegan',
  '🍰 Desserts',
  '🥤 Beverages',
  '☕ Tea & Coffee',
  '🍹 Mocktails & Fresh Juices',
  '⭐ Chef\'s Specials',
  '🔥 Today\'s Specials',
  '🎉 Combo Meals'
];

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [prepTime, setPrepTime] = useState(10);
  const [dietType, setDietType] = useState('veg'); // veg, non-veg, spicy, gluten-free
  const [customizationOptions, setCustomizationOptions] = useState([]); // Legacy
  
  // V2 Customization State
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [localCustomizationGroups, setLocalCustomizationGroups] = useState([]);
  const [localCustomizationOptions, setLocalCustomizationOptions] = useState([]);

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
        if (cats.length > 0) setActiveCategoryId(cats[0].id);
      }

      // Fetch V2 Templates
      const { data: tpls } = await supabase
        .from('customization_templates')
        .select('*')
        .eq('shop_id', shop.id);
      if (tpls) setAvailableTemplates(tpls);

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

  const [selectedDefaults, setSelectedDefaults] = useState(new Set(DEFAULT_CATEGORIES));
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const toggleDefault = (cat) => {
    setSelectedDefaults(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const loadDefaultCategories = async () => {
    if (!shop?.id || selectedDefaults.size === 0) return;
    setLoadingDefaults(true);
    try {
      const rows = [...selectedDefaults].map(name => ({
        shop_id: shop.id,
        name,
        icon: 'grid'
      }));
      const { data, error } = await supabase.from('categories').insert(rows).select();
      if (error) throw error;
      if (data) {
        setCategories(prev => [...prev, ...data]);
        setActiveCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading defaults:', err);
      alert('Failed to load default categories: ' + err.message);
    } finally {
      setLoadingDefaults(false);
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

      try {
          // Upload image if selected
          let uploadedImageUrl = null;
          if (imageFile) {
            setUploadingImage(true);
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `items/${shop.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('shop-logos')
              .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

            if (uploadError) {
              console.error("Image upload failed:", uploadError);
              alert("Image upload failed, continuing without image...");
            } else if (uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('shop-logos')
                .getPublicUrl(fileName);
              uploadedImageUrl = publicUrl;
            }
            setUploadingImage(false);
          }

          if (editingItemId) {
            // Update existing item
            const updatePayload = {
              name: newItem.name, 
              price: parseFloat(newItem.price), 
              description: descToSave,
              is_available: isAvailable
            };
            if (uploadedImageUrl) updatePayload.image_url = uploadedImageUrl;

            const { data, error } = await supabase.from('items').update(updatePayload).eq('id', editingItemId).select();

            if (error) throw error;
            if (data) {
              setItems(items.map(item => item.id === editingItemId ? data[0] : item));
              savedItemId = editingItemId;
              // Clear old customizations for a full replacement
              await supabase.from('item_customization_groups').delete().eq('item_id', savedItemId);
            }
          } else {
            // Insert new item
            const insertPayload = { 
              category_id: activeCategoryId, 
              name: newItem.name, 
              price: parseFloat(newItem.price), 
              description: descToSave,
              is_available: isAvailable
            };
            if (uploadedImageUrl) insertPayload.image_url = uploadedImageUrl;

            const { data, error } = await supabase.from('items').insert([insertPayload]).select();

            if (error) throw error;
            if (data) {
              setItems([...items, data[0]]);
              savedItemId = data[0].id;
            }
          }

        // Save V2 Customizations
        if (savedItemId && localCustomizationGroups.length > 0) {
          // 1. Insert groups
          const groupInsertData = localCustomizationGroups.map(g => ({
            item_id: savedItemId,
            name: g.name,
            selection_type: g.selection_type,
            is_required: g.is_required,
            min_selections: g.min_selections,
            max_selections: g.max_selections,
            display_order: g.display_order
          }));
          
          const { data: insertedGroups, error: groupError } = await supabase
            .from('item_customization_groups')
            .insert(groupInsertData)
            .select();
            
          if (groupError) throw groupError;
          
          // 2. Map temp UUIDs to Real UUIDs
          if (insertedGroups && insertedGroups.length > 0) {
            const optionInsertData = [];
            
            localCustomizationGroups.forEach((tempGroup, index) => {
              const realGroupId = insertedGroups[index].id; // Arrays align because we inserted them in order
              const opts = localCustomizationOptions.filter(o => o.group_id === tempGroup.id);
              
              opts.forEach(opt => {
                optionInsertData.push({
                  group_id: realGroupId,
                  name: opt.name,
                  price_type: opt.price_type,
                  price_value: opt.price_value,
                  max_quantity: opt.max_quantity,
                  is_available: opt.is_available !== false,
                  is_default: opt.is_default,
                  display_order: opt.display_order
                });
              });
            });
            
            if (optionInsertData.length > 0) {
              const { error: optError } = await supabase
                .from('item_customization_options')
                .insert(optionInsertData);
              if (optError) throw optError;
            }
          }
        }

        resetForm();
      } catch (err) {
        console.error("Error saving item:", err);
        alert(`Failed to save item: ${err.message}`);
      }
    } else if (!activeCategoryId) {
      alert("Please select a category first.");
    }
  };

  const handleEditClick = async (item) => {
    setEditingItemId(item.id);
    const meta = parseMetadata(item.description);
    setNewItem({ name: item.name, price: item.price, description: meta.cleanDesc });
    setImageFile(null);
    setImagePreview(item.image_url || '');
    setPrepTime(meta.prep);
    setDietType(meta.diet);
    setCustomizationOptions(meta.customs);
    setIsAvailable(item.is_available !== false);
    
    // Fetch V2 Customizations
    const { data: iGroups } = await supabase
      .from('item_customization_groups')
      .select('*')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });
      
    if (iGroups && iGroups.length > 0) {
      setLocalCustomizationGroups(iGroups);
      
      const groupIds = iGroups.map(g => g.id);
      const { data: iOptions } = await supabase
        .from('item_customization_options')
        .select('*')
        .in('group_id', groupIds)
        .order('display_order', { ascending: true });
        
      if (iOptions) {
        setLocalCustomizationOptions(iOptions);
      }
    } else {
      setLocalCustomizationGroups([]);
      setLocalCustomizationOptions([]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyTemplate = async (templateId) => {
    if (!templateId) return;
    
    // Fetch template groups
    const { data: tGroups } = await supabase
      .from('template_groups')
      .select('*')
      .eq('template_id', templateId);
      
    if (!tGroups || tGroups.length === 0) return;
    
    const groupIds = tGroups.map(g => g.id);
    
    // Fetch template options
    const { data: tOptions } = await supabase
      .from('template_options')
      .select('*')
      .in('group_id', groupIds);
      
    // Map to local state with temporary IDs
    const newLocalGroups = [];
    const newLocalOptions = [];
    
    tGroups.forEach(g => {
      const tempId = crypto.randomUUID();
      newLocalGroups.push({
        id: tempId, // temp id
        name: g.name,
        selection_type: g.selection_type,
        is_required: g.is_required,
        min_selections: g.min_selections,
        max_selections: g.max_selections,
        display_order: g.display_order
      });
      
      const gOpts = (tOptions || []).filter(o => o.group_id === g.id);
      gOpts.forEach(o => {
        newLocalOptions.push({
          id: crypto.randomUUID(), // temp id
          group_id: tempId, // link to temp group id
          name: o.name,
          price_type: o.price_type,
          price_value: o.price_value,
          max_quantity: o.max_quantity,
          is_default: o.is_default,
          display_order: o.display_order
        });
      });
    });
    
    setLocalCustomizationGroups(prev => [...prev, ...newLocalGroups]);
    setLocalCustomizationOptions(prev => [...prev, ...newLocalOptions]);
    setSelectedTemplateId('');
  };

  const deleteLocalGroup = (tempId) => {
    setLocalCustomizationGroups(prev => prev.filter(g => g.id !== tempId));
    setLocalCustomizationOptions(prev => prev.filter(o => o.group_id !== tempId));
  };

  const deleteLocalOption = (tempId) => {
    setLocalCustomizationOptions(prev => prev.filter(o => o.id !== tempId));
  };

  const resetForm = () => {
    setEditingItemId(null);
    setNewItem({ name: '', price: '', description: '' });
    setImageFile(null);
    setImagePreview('');
    setPrepTime(10);
    setDietType('veg');
    setCustomizationOptions([]);
    setLocalCustomizationGroups([]);
    setLocalCustomizationOptions([]);
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
                        supabase.from('categories').update({ name: name.trim() }).eq('id', cat.id);
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

            {/* Load Default Categories (shown when empty) */}
            {categories.length === 0 && (
              <div style={{ padding: '1rem', borderRadius: '12px', border: '1px dashed var(--color-accent)', background: 'rgba(255,109,0,0.05)', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.75rem', textAlign: 'center' }}>Quick Start: Select Default Categories</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.75rem', maxHeight: '260px', overflowY: 'auto' }}>
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleDefault(cat)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        border: selectedDefaults.has(cat) ? '1.5px solid var(--color-accent)' : '1px solid var(--glass-border)',
                        background: selectedDefaults.has(cat) ? 'rgba(255,109,0,0.15)' : 'transparent',
                        color: selectedDefaults.has(cat) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontWeight: selectedDefaults.has(cat) ? 600 : 400
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDefaults.size === DEFAULT_CATEGORIES.length) setSelectedDefaults(new Set());
                      else setSelectedDefaults(new Set(DEFAULT_CATEGORIES));
                    }}
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                  >
                    {selectedDefaults.size === DEFAULT_CATEGORIES.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={loadDefaultCategories}
                    disabled={loadingDefaults || selectedDefaults.size === 0}
                    style={{ flex: 2, padding: '8px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', opacity: selectedDefaults.size === 0 ? 0.5 : 1 }}
                  >
                    {loadingDefaults ? 'Adding...' : `Add ${selectedDefaults.size} Categories`}
                  </button>
                </div>
              </div>
            )}

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
                <div className="mb-upload-area" onClick={() => document.getElementById('item-image-upload').click()}>
                  <input 
                    type="file" 
                    id="item-image-upload" 
                    hidden 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                        setImagePreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                  ) : (
                    <>
                      <div className="mb-upload-icon-circle">
                        <Plus size={24} />
                      </div>
                      <span className="mb-upload-label" style={{ textAlign: 'center' }}>Click to Upload</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', opacity: 0.5 }}>Image</span>
                    </>
                  )}
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

              {/* V2 Customizations Section */}
              <div className="mb-customizations-card" style={{ padding: '20px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--glass-border)', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 className="mb-customizations-title" style={{ margin: 0, fontSize: '1.1rem' }}>Item Customizations</h4>
                  
                  {/* Template Applier */}
                  {availableTemplates.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="mb-input-text" 
                        style={{ padding: '6px 12px', width: '200px' }}
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                      >
                        <option value="">-- Apply Template --</option>
                        {availableTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        className="tables-btn-outline"
                        style={{ padding: '6px 12px' }}
                        onClick={() => applyTemplate(selectedTemplateId)}
                        disabled={!selectedTemplateId}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {localCustomizationGroups.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>No customizations for this item.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {localCustomizationGroups.map((group) => {
                      const opts = localCustomizationOptions.filter(o => o.group_id === group.id);
                      return (
                        <div key={group.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>{group.name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                                ({group.selection_type})
                              </span>
                            </div>
                            <button type="button" className="mb-cat-btn delete" onClick={() => deleteLocalGroup(group.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
                          {opts.length > 0 && (
                            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--glass-border)' }}>
                              {opts.map(opt => (
                                <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem' }}>
                                  <span>{opt.name} {opt.is_default && <span style={{ color: 'var(--color-accent)', fontSize: '0.7rem', marginLeft: '4px' }}>(Default)</span>}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                      {opt.price_value > 0 ? `+₹${opt.price_value}` : 'Free'}
                                    </span>
                                    <button type="button" className="mb-cat-btn delete" onClick={() => deleteLocalOption(opt.id)}>
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Note: Customizations are saved when you click "{editingItemId ? 'Update Item' : '+ Add Item'}".
                </div>
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
                <button 
                  type="submit" 
                  className="tables-btn-primary"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : (editingItemId ? 'Update Item' : '+ Add Item')}
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
