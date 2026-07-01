import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Minus, Plus } from 'lucide-react';

const isVegItem = (itemName) => {
  const lower = itemName.toLowerCase();
  if (lower.includes('chicken') || lower.includes('egg') || lower.includes('meat') || lower.includes('fish') || lower.includes('mutton') || lower.includes('pork') || lower.includes('nonveg') || lower.includes('non-veg')) {
    return false;
  }
  return true;
};

// Customizations configuration derived dynamically
const getItemCustomizations = (item) => {
  const isVeg = isVegItem(item.name);
  const lower = item.name.toLowerCase();
  
  // 1. Spice Levels (Only for non-beverages)
  const isBeverage = lower.includes('tea') || lower.includes('coffee') || lower.includes('latte') || lower.includes('espresso') || lower.includes('milk') || lower.includes('drink') || lower.includes('juice') || lower.includes('smoothie');
  
  let spiceLevels = null;
  let sweetnessLevels = null;

  if (!isBeverage) {
    spiceLevels = ['Mild', 'Medium', 'Hot', 'Fire'];
  } else {
    sweetnessLevels = ['Less Sugar', 'Medium Sugar', 'Regular', 'Extra Sugar'];
  }

  // 2. Add-ons based on category/name
  let addons = [];
  if (isBeverage) {
    addons = [
      { id: 'add-espresso', name: 'Extra Espresso Shot', price: 50 },
      { id: 'add-vanilla', name: 'Vanilla Syrup', price: 40 },
      { id: 'add-whip', name: 'Whipped Cream', price: 60 }
    ];
  } else if (lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('macaroni')) {
    addons = [
      { id: 'add-truffle', name: 'Extra Truffle', price: 150 },
      { id: 'add-chicken', name: 'Grilled Chicken', price: 200 }
    ];
  } else {
    addons = [
      { id: 'add-cheese', name: 'Extra Cheese', price: 80 },
      { id: 'add-dip', name: 'Extra Sauce/Dip', price: 30 }
    ];
  }

  return { spiceLevels, sweetnessLevels, addons };
};

const ItemDetailModal = ({ item, isOpen, onClose, onAdd, initialQty = 1 }) => {
  if (!isOpen || !item) return null;

  const { spiceLevels, sweetnessLevels, addons } = getItemCustomizations(item);
  const isVeg = isVegItem(item.name);

  // States
  const [qty, setQty] = useState(initialQty);
  const [selectedSpice, setSelectedSpice] = useState(spiceLevels ? 'Mild' : null);
  const [selectedSweetness, setSelectedSweetness] = useState(sweetnessLevels ? 'Regular' : null);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');

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

  // Calculate prices
  const basePrice = parseFloat(item.price);
  const addonsTotal = addons.reduce((sum, addon) => {
    if (selectedAddons[addon.id]) {
      return sum + addon.price;
    }
    return sum;
  }, 0);
  const singleItemTotal = basePrice + addonsTotal;
  const grandTotal = singleItemTotal * qty;

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  };

  const handleAddClick = () => {
    const activeAddonsList = addons.filter(addon => selectedAddons[addon.id]);
    const customizationDetails = {
      spiceLevel: selectedSpice,
      sweetnessLevel: selectedSweetness,
      addons: activeAddonsList,
      specialInstructions: specialInstructions.trim()
    };
    onAdd(item, qty, customizationDetails);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(7, 10, 19, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div 
        className="customer-custom-scrollbar"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--card-bg)',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          borderTop: '1px solid var(--card-border)',
          padding: '1.5rem 1.25rem 2rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          animation: 'slideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          boxShadow: '0 -15px 40px rgba(0, 0, 0, 0.15)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={`customer-veg-indicator ${isVeg ? 'veg' : 'non-veg'}`}>
              <div className="customer-veg-dot"></div>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
              {item.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: 'none',
              color: 'var(--text-secondary)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {item.description && (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {item.description}
            </p>
          )}

          {/* Rating and Prep Time */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b'
            }}>
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              {rating}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              color: 'var(--text-secondary)'
            }}>
              <Clock size={12} />
              {prepTime} min
            </span>
          </div>
        </div>

        {/* Spice Level Section */}
        {spiceLevels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Spice level
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {spiceLevels.map(spice => {
                const isActive = selectedSpice === spice;
                return (
                  <button
                    key={spice}
                    onClick={() => setSelectedSpice(spice)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                      color: isActive ? '#white' : 'var(--text-primary)',
                      border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--card-border)'
                    }}
                  >
                    {spice}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sweetness Level Section */}
        {sweetnessLevels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Sweetness level
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sweetnessLevels.map(level => {
                const isActive = selectedSweetness === level;
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedSweetness(level)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                      color: isActive ? '#white' : 'var(--text-primary)',
                      border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--card-border)'
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons Section */}
        {addons.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Add-ons
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {addons.map(addon => {
                const isSelected = !!selectedAddons[addon.id];
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--card-border)',
                      backgroundColor: isSelected ? 'rgba(255, 94, 26, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--text-muted)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}>
                        {isSelected && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent)'
                          }}></div>
                        )}
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{addon.name}</span>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      + ₹{addon.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Special instructions
          </h3>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. no onions, extra crispy..."
            rows={2}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Quantity Controls & Add Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1rem',
          borderTop: '1px solid var(--card-border)',
          paddingTop: '1.25rem',
          gap: '1rem'
        }}>
          {/* Quantity selector */}
          <div className="customer-card-counter" style={{ 
            padding: '6px 12px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button 
              onClick={() => setQty(prev => Math.max(1, prev - 1))}
              aria-label="Decrease quantity"
              style={{ width: '28px', height: '28px', fontSize: '1.2rem', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-primary)' }}
            >
              -
            </button>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', minWidth: '16px', textAlign: 'center' }}>
              {qty}
            </span>
            <button 
              onClick={() => setQty(prev => prev + 1)}
              aria-label="Increase quantity"
              style={{ width: '28px', height: '28px', fontSize: '1.2rem', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-primary)' }}
            >
              +
            </button>
          </div>

          {/* Add CTA Button */}
          <button
            onClick={handleAddClick}
            style={{
              flex: 1,
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              padding: '14px 20px',
              borderRadius: '16px',
              fontSize: '0.98rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 94, 26, 0.2)',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            Add - ₹{grandTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
