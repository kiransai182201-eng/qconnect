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
  Sparkles,
  Utensils,
  Package
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../menu-builder.css';
import { useLanguage } from '../contexts/LanguageContext';

const RESTAURANT_PRESETS = {
  'Restaurant': [
    '🍽️ Starters',
    '🍲 Main Course',
    '🍚 Rice & Biryani',
    '🍞 Breads',
    '🥤 Drinks',
    '🍰 Desserts',
    '🎉 Combos'
  ],
  'Cafe': [
    '☕ Coffee',
    '🫖 Tea',
    '🍰 Desserts',
    '🥤 Beverages',
    '🥪 Snacks & Sandwiches'
  ],
  'Fast Food': [
    '🍔 Burgers',
    '🍕 Pizza',
    '🍟 Fries & Sides',
    '🥤 Soft Drinks',
    '🌮 Wraps & Rolls'
  ],
  'Bakery': [
    '🎂 Cakes',
    '🥐 Pastries',
    '🧁 Cupcakes',
    '🍞 Breads',
    '☕ Coffee & Tea'
  ],
  'Juice Shop': [
    '🧃 Fresh Juices',
    '🥤 Smoothies',
    '🧋 Milkshakes',
    '🍧 Mocktails'
  ],
  'Cloud Kitchen': [
    '🍽️ Starters',
    '🍲 Main Course',
    '🍚 Rice & Biryani',
    '🍞 Breads',
    '🥤 Drinks',
    '🍰 Desserts',
    '🎉 Combos'
  ]
};

const DEFAULT_CATEGORIES = RESTAURANT_PRESETS['Restaurant'];

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
  const [selectedPresetType, setSelectedPresetType] = useState('Restaurant');
  
  // Item Form Fields
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [prepTime, setPrepTime] = useState(10);
  const [dietType, setDietType] = useState('veg'); // veg, non-veg, vegan, gluten-free, spicy
  const [customizationOptions, setCustomizationOptions] = useState([]);
  
  // V2 Customization State
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [localCustomizationGroups, setLocalCustomizationGroups] = useState([]);
  const [localCustomizationOptions, setLocalCustomizationOptions] = useState([]);

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
    const { error: itemsError } = await supabase.from('items').delete().eq('category_id', catId);
    if (itemsError) {
      alert(`Failed to delete items: ${itemsError.message}`);
      return;
    }
    const { error: catError } = await supabase.from('categories').delete().eq('id', catId);
    if (catError) {
      alert(`Failed to delete category: ${catError.message}`);
      return;
    }
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
      const descToSave = newItem.description.trim() + 
        ` [PREP: ${prepTime}]` + 
        ` [DIET: ${dietType}]` + 
        (customizationOptions.length > 0 ? ` [CUSTOMIZATIONS: ${customizationOptions.join('; ')}]` : '');

      try {
        let savedItemId = null;
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
            await supabase.from('item_customization_groups').delete().eq('item_id', savedItemId);
          }
        } else {
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

        if (savedItemId && localCustomizationGroups.length > 0) {
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
          
          if (insertedGroups && insertedGroups.length > 0) {
            const optionInsertData = [];
            
            localCustomizationGroups.forEach((tempGroup, index) => {
              const realGroupId = insertedGroups[index].id;
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
    
    const { data: tGroups } = await supabase
      .from('template_groups')
      .select('*')
      .eq('template_id', templateId);
      
    if (!tGroups || tGroups.length === 0) return;
    
    const groupIds = tGroups.map(g => g.id);
    
    const { data: tOptions } = await supabase
      .from('template_options')
      .select('*')
      .in('group_id', groupIds);
      
    const newLocalGroups = [];
    const newLocalOptions = [];
    
    tGroups.forEach(g => {
      const tempId = crypto.randomUUID();
      newLocalGroups.push({
        id: tempId,
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
          id: crypto.randomUUID(),
          group_id: tempId,
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

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  if (published) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--mb-bg)' }}>
        <div style={{ background: 'var(--mb-card-bg)', border: '1px solid rgba(212, 160, 42, 0.25)', padding: '4rem 2rem', borderRadius: '24px', maxWidth: '500px' }}>
          <div style={{ background: 'rgba(212,160,42,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <Sparkles size={40} color="#D4A02A" />
          </div>
          <h2 style={{ marginBottom: '1rem', fontSize: '2rem', color: '#FFFFFF', fontWeight: '800', fontFamily: "'Playfair Display', serif" }}>Menu Published!</h2>
          <p style={{ color: '#A0A0A0', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Your digital menu is now live. Customers scanning your QR codes will see the latest offerings instantly.
          </p>
          <button className="mb-btn-gold" onClick={() => navigate('/dashboard')}>
            {t.dashboard}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-page-wrapper">
      
      {/* 3 Column Grid Layout */}
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

            {/* Quick Presets (Shown when empty) */}
            {categories.length === 0 && (
              <div style={{ padding: '12px', borderRadius: '12px', border: '1px dashed #D4A02A', background: 'rgba(212,160,42,0.05)', marginBottom: '12px' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#D4A02A', marginBottom: '8px', textAlign: 'center' }}>Quick Start Presets</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {(RESTAURANT_PRESETS[selectedPresetType] || DEFAULT_CATEGORIES).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleDefault(cat)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        borderRadius: '6px',
                        border: selectedDefaults.has(cat) ? '1px solid #D4A02A' : '1px solid rgba(255,255,255,0.1)',
                        background: selectedDefaults.has(cat) ? 'rgba(212,160,42,0.15)' : 'transparent',
                        color: selectedDefaults.has(cat) ? '#D4A02A' : '#A0A0A0',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={loadDefaultCategories}
                  disabled={loadingDefaults || selectedDefaults.size === 0}
                  className="mb-btn-gold"
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                >
                  {loadingDefaults ? 'Adding...' : `Add ${selectedDefaults.size} Presets`}
                </button>
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
                <h2>{editingItemId ? 'Edit Menu Item' : 'Add Menu Item'} ({activeCategory ? activeCategory.name : 'Food'})</h2>
                <p>Comprehensive {editingItemId ? 'Edit' : 'Add'} Menu Item</p>
              </div>
            </div>
            
            <button className="mb-btn-gold" onClick={handlePublish} disabled={isPublishing}>
              Publish Menu
            </button>
          </div>

          <div className="mb-form-card">
            <form onSubmit={addItem}>
              
              {/* Top Section: Upload Area Left, Fields Right */}
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
                    <img src={imagePreview} alt="Preview" />
                  ) : (
                    <>
                      <div className="mb-upload-icon-circle">
                        <Plus size={24} />
                      </div>
                      <span className="mb-upload-label">CLICK TO UPLOAD</span>
                      <span style={{ fontSize: '0.68rem', color: '#A0A0A0', opacity: 0.5 }}>Image</span>
                    </>
                  )}
                </div>

                <div className="mb-form-top-fields">
                  <div className="mb-flex-row">
                    <div className="mb-form-group">
                      <label>ITEM NAME</label>
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
                      <label>PRICE (₹)</label>
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
                    <label>DESCRIPTION (OPTIONAL)</label>
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

              {/* Middle Row: Availability Toggle & Prep Time */}
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

              {/* Dietary Tags Row */}
              <div className="mb-dietary-section">
                <div className="mb-dietary-label">DIETARY TAG</div>
                <div className="mb-dietary-selector">
                  {[
                    { key: 'veg', label: '🟢 Veg' },
                    { key: 'non-veg', label: '🔴 Non-Veg' },
                    { key: 'vegan', label: '🌱 Vegan' },
                    { key: 'gluten-free', label: '🌾 Gluten-Free' },
                    { key: 'spicy', label: '🔥 Spicy' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      className={`mb-dietary-pill ${dietType === key ? 'active' : ''}`}
                      onClick={() => setDietType(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizations Section */}
              <div className="mb-customizations-card">
                <div className="mb-customizations-header">
                  <h4 className="mb-customizations-title">Item Customizations</h4>
                  
                  {availableTemplates.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="mb-input-text" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
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
                        className="mb-btn-gold"
                        style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                        onClick={() => applyTemplate(selectedTemplateId)}
                        disabled={!selectedTemplateId}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {localCustomizationGroups.length === 0 ? (
                  <div className="mb-customizations-empty">
                    <Package size={32} style={{ opacity: 0.3 }} />
                    <span style={{ fontSize: '0.88rem' }}>No customizations for this item.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {localCustomizationGroups.map((group) => (
                      <div key={group.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{group.name} ({group.selection_type})</span>
                        <button type="button" className="mb-cat-btn delete" onClick={() => deleteLocalGroup(group.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mb-customizations-note">
                  Note: Customizations are saved when you click "{editingItemId ? 'Update Item' : '+ Add Item'}".
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="mb-form-actions">
                {editingItemId && (
                  <button 
                    type="button" 
                    onClick={resetForm}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', borderRadius: '20px', padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Cancel Edit
                  </button>
                )}
                <button 
                  type="submit" 
                  className="mb-btn-gold"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : (editingItemId ? 'Update Item' : '+ Add Item')}
                </button>
              </div>

            </form>
          </div>

          {/* Category Items List Section */}
          <div className="mb-items-section">
            <h3 className="mb-items-title">Items in Category</h3>
            <div className="mb-items-grid">
              {items.filter(item => item.category_id === activeCategoryId).map(item => {
                const meta = parseMetadata(item.description);
                return (
                  <div key={item.id} className="mb-item-card">
                    <div className="mb-item-card-header">
                      <div>
                        <h4 className="mb-item-card-name">{item.name}</h4>
                        <span className="mb-item-card-veg">
                          {meta.diet === 'veg' && 'VEG'}
                          {meta.diet === 'non-veg' && 'NON-VEG'}
                          {meta.diet === 'vegan' && 'VEGAN'}
                          {meta.diet === 'gluten-free' && 'GLUTEN-FREE'}
                          {meta.diet === 'spicy' && 'SPICY'}
                        </span>
                      </div>
                      <span className="mb-item-card-price">₹{item.price}</span>
                    </div>
                    <p className="mb-item-card-desc">{meta.cleanDesc || 'No description'}</p>
                    
                    <div className="mb-item-card-footer">
                      <span className={`mb-item-status ${item.is_available !== false ? 'available' : 'out'}`}>
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
              <div style={{ textAlign: 'center', padding: '32px', background: 'var(--mb-card-bg)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: '#A0A0A0', fontSize: '0.88rem' }}>
                No items in this category yet. Use the form above to add some!
              </div>
            )}
          </div>

        </div>

        {/* COLUMN 3: Live Preview Panel */}
        <div className="mb-preview-sidebar">
          <h3>Preview</h3>
          
          <div className="mb-preview-card">
            <div className="mb-preview-img-container">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0' }}>
                  <Utensils size={36} style={{ opacity: 0.2, marginBottom: '6px' }} />
                  <span style={{ fontSize: '0.72rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>PREVIEW ITEM</span>
                </div>
              )}

              {/* Prep time badge */}
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
                <span className="mb-preview-tag veg">
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ background: 'var(--mb-card-bg)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', maxWidth: '380px', width: '90%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>Delete Menu Item?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: '#A0A0A0', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>"{itemToDelete.name}"</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setItemToDelete(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#FFFFFF', cursor: 'pointer', fontWeight: '600' }}
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ background: 'var(--mb-card-bg)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', maxWidth: '380px', width: '90%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>Delete Category?</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#FFFFFF', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>"{categoryToDelete.name}"</strong>?
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.78rem', color: '#ef4444', fontWeight: '600' }}>
              ⚠️ All items in this category will also be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setCategoryToDelete(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#FFFFFF', cursor: 'pointer', fontWeight: '600' }}
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
