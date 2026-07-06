import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Minus, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const isVegItem = (itemName) => {
  const lower = itemName.toLowerCase();
  if (lower.includes('chicken') || lower.includes('egg') || lower.includes('meat') || lower.includes('fish') || lower.includes('mutton') || lower.includes('pork') || lower.includes('nonveg') || lower.includes('non-veg')) {
    return false;
  }
  return true;
};

const ItemDetailModal = ({ item, isOpen, onClose, onAdd, initialQty = 1 }) => {
  if (!isOpen || !item) return null;

  const isVeg = isVegItem(item.name);

  // States
  const [qty, setQty] = useState(initialQty);
  const [groups, setGroups] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // selections state mapping group.id -> selected option IDs (or string for text)
  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (isOpen && item) {
      fetchCustomizations();
    }
  }, [isOpen, item]);

  const fetchCustomizations = async () => {
    setLoading(true);
    // Fetch Groups
    const { data: gData } = await supabase
      .from('item_customization_groups')
      .select('*')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });
      
    if (gData && gData.length > 0) {
      setGroups(gData);
      
      const groupIds = gData.map(g => g.id);
      const { data: oData } = await supabase
        .from('item_customization_options')
        .select('*')
        .in('group_id', groupIds)
        .eq('is_available', true)
        .order('display_order', { ascending: true });
        
      if (oData) {
        setOptions(oData);
        
        // Initialize default selections
        const initSel = {};
        gData.forEach(g => {
          if (g.selection_type === 'text') {
            initSel[g.id] = '';
          } else if (g.selection_type === 'radio' || g.selection_type === 'dropdown') {
            const defOpt = oData.find(o => o.group_id === g.id && o.is_default);
            if (defOpt) initSel[g.id] = [defOpt.id];
            else initSel[g.id] = [];
          } else {
            // checkbox, quantity, toggle
            const defOpts = oData.filter(o => o.group_id === g.id && o.is_default);
            initSel[g.id] = defOpts.map(o => o.id);
          }
        });
        setSelections(initSel);
      }
    } else {
      setGroups([]);
      setOptions([]);
    }
    setLoading(false);
  };

  // Stable Rating and Prep time derived from item ID to stay consistent
  const getStableRating = (id) => {
    if (!id) return '4.8';
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    const rating = (sum % 10) / 10 + 4.0; // between 4.0 and 4.9
    return rating.toFixed(1);
  };

  const getStablePrepTime = (id) => {
    if (!id) return '15';
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return (sum % 15) + 10; // between 10 and 24 mins
  };

  const rating = getStableRating(item.id);
  const prepTime = getStablePrepTime(item.id);

  const basePrice = parseFloat(item.price);

  // Calculate prices dynamically
  const calculateTotal = () => {
    let customTotal = 0;
    
    Object.entries(selections).forEach(([groupId, selData]) => {
      if (Array.isArray(selData)) {
        selData.forEach(optId => {
          const opt = options.find(o => o.id === optId);
          if (opt && opt.price_value > 0) {
            if (opt.price_type === 'fixed') {
              customTotal += parseFloat(opt.price_value);
            } else if (opt.price_type === 'percentage') {
              customTotal += basePrice * (parseFloat(opt.price_value) / 100);
            }
          }
        });
      }
    });
    
    return (basePrice + customTotal) * qty;
  };
  
  const grandTotal = calculateTotal();

  const handleSelection = (groupId, optionId, type) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (type === 'radio' || type === 'dropdown') {
        return { ...prev, [groupId]: [optionId] };
      } else if (type === 'checkbox' || type === 'toggle') {
        const isSelected = current.includes(optionId);
        const group = groups.find(g => g.id === groupId);
        
        if (isSelected) {
          return { ...prev, [groupId]: current.filter(id => id !== optionId) };
        } else {
          // Check max limit
          if (group.max_selections && current.length >= group.max_selections) {
            return prev; // Hit max
          }
          return { ...prev, [groupId]: [...current, optionId] };
        }
      }
      return prev;
    });
  };

  const handleTextSelection = (groupId, text) => {
    setSelections(prev => ({ ...prev, [groupId]: text }));
  };

  const validateSelections = () => {
    for (const g of groups) {
      if (g.is_required) {
        const sel = selections[g.id];
        if (g.selection_type === 'text') {
          if (!sel || sel.trim() === '') return false;
        } else {
          if (!sel || sel.length < (g.min_selections || 1)) return false;
        }
      }
    }
    return true;
  };

  const formatPriceLabel = (opt) => {
    if (opt.price_value === 0 || opt.price_type === 'free') return 'Free';
    if (opt.price_type === 'percentage') return `+${opt.price_value}%`;
    return `+₹${opt.price_value}`;
  };

  const handleAddToCart = () => {
    if (!validateSelections()) {
      alert("Please complete all required customizations.");
      return;
    }
    
    // Build structured cart customizations payload
    const structuredCustomizations = [];
    groups.forEach(g => {
      const sel = selections[g.id];
      if (g.selection_type === 'text') {
        if (sel && sel.trim()) {
          structuredCustomizations.push({
            groupId: g.id,
            groupName: g.name,
            text: sel,
            priceValue: 0
          });
        }
      } else if (Array.isArray(sel) && sel.length > 0) {
        sel.forEach(optId => {
          const opt = options.find(o => o.id === optId);
          if (opt) {
            let finalOptPrice = 0;
            if (opt.price_type === 'fixed') finalOptPrice = parseFloat(opt.price_value);
            else if (opt.price_type === 'percentage') finalOptPrice = basePrice * (parseFloat(opt.price_value) / 100);
            
            structuredCustomizations.push({
              groupId: g.id,
              groupName: g.name,
              optionId: opt.id,
              optionName: opt.name,
              priceType: opt.price_type,
              priceValue: finalOptPrice,
              qty: 1
            });
          }
        });
      }
    });

    onAdd(item, qty, structuredCustomizations, grandTotal / qty); // Pass unit total
    onClose();
  };

  return (
    <div className="customer-modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="customer-modal-panel customer-modal-bottom" 
        onClick={e => e.stopPropagation()}
      >
        <div className="cm-modal-drag-indicator" onClick={onClose}></div>
        
        {/* Cover Image Placeholder */}
        <div style={{ height: '200px', background: 'var(--glass-bg)', position: 'relative' }}>
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1, fontSize: '5rem' }}>
             {item.name.substring(0, 2).toUpperCase()}
           </div>
           
           <button 
             onClick={onClose}
             style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--color-surface)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
           >
             <X size={20} color="var(--color-text-main)" />
           </button>
        </div>

        <div className="cm-modal-content" style={{ padding: '24px 20px', paddingBottom: '100px' }}>
          
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                  width: '14px', height: '14px', 
                  border: `2px solid ${isVeg ? '#22c55e' : '#ef4444'}`, 
                  borderRadius: '3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '1px'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isVeg ? '#22c55e' : '#ef4444' }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{item.name}</h2>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {item.description.replace(/\[.*?\]/g, '').trim() || 'A delicious treat crafted with perfection.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-main)' }}>₹{item.price}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,178,0,0.1)', color: '#FFB200', padding: '4px 10px', borderRadius: '20px' }}>
              <Star size={14} fill="#FFB200" color="#FFB200" /> {rating}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', padding: '4px 10px', borderRadius: '20px' }}>
              <Clock size={14} /> {prepTime} mins
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0 -20px 24px -20px' }}></div>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem 0' }}>Loading customizations...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {groups.map(group => {
                const groupOpts = options.filter(o => o.group_id === group.id);
                const currentSel = selections[group.id] || [];
                
                return (
                  <div key={group.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{group.name}</h3>
                      {group.is_required ? (
                         <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px' }}>Required</span>
                      ) : (
                         <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Optional</span>
                      )}
                    </div>
                    
                    {group.selection_type === 'text' ? (
                      <textarea 
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', minHeight: '80px', fontSize: '0.95rem' }}
                        placeholder="Add your instructions..."
                        value={selections[group.id] || ''}
                        onChange={(e) => handleTextSelection(group.id, e.target.value)}
                      />
                    ) : group.selection_type === 'dropdown' ? (
                      <select 
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--color-surface)', color: 'var(--color-text-main)', fontSize: '0.95rem' }}
                        value={currentSel[0] || ''}
                        onChange={(e) => handleSelection(group.id, e.target.value, 'dropdown')}
                      >
                        <option value="">-- Select {group.name} --</option>
                        {groupOpts.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name} ({formatPriceLabel(opt)})</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {groupOpts.map(opt => {
                          const isSelected = currentSel.includes(opt.id);
                          return (
                            <label key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--glass-border)'}`, background: isSelected ? 'rgba(255,109,0,0.05)' : 'var(--color-surface)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                  width: '20px', height: '20px', 
                                  borderRadius: group.selection_type === 'radio' ? '50%' : '6px',
                                  border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--glass-border)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: isSelected ? 'var(--color-accent)' : 'transparent'
                                }}>
                                  {isSelected && group.selection_type === 'checkbox' && <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '2px' }} />}
                                  {isSelected && group.selection_type === 'radio' && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 500, color: 'var(--color-text-main)' }}>{opt.name}</span>
                              </div>
                              <span style={{ fontSize: '0.9rem', color: opt.price_value > 0 ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                                {formatPriceLabel(opt)}
                              </span>
                              
                              {/* Hidden input to handle click logic cleanly */}
                              <input 
                                type="checkbox" 
                                style={{ display: 'none' }}
                                checked={isSelected}
                                onChange={() => handleSelection(group.id, opt.id, group.selection_type)}
                              />
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom Actions */}
          <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            background: 'var(--color-bg)',
            borderTop: '1px solid var(--glass-border)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            
            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--color-surface)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', color: qty > 1 ? 'var(--color-text-main)' : 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <Minus size={20} />
              </button>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, width: '20px', textAlign: 'center', color: 'var(--color-text-main)' }}>{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)}
                style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', color: 'var(--color-accent)', cursor: 'pointer' }}
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                background: 'var(--color-accent)',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 24px rgba(255,109,0,0.25)'
              }}
            >
              <span>Add to Cart</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
