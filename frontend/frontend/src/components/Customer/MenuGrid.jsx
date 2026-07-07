import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const isVegItem = (itemName) => {
  const lower = itemName.toLowerCase();
  if (lower.includes('chicken') || lower.includes('egg') || lower.includes('meat') || lower.includes('fish') || lower.includes('mutton') || lower.includes('pork') || lower.includes('nonveg') || lower.includes('non-veg')) {
    return false;
  }
  return true;
};

const getStablePrepTime = (id) => {
  if (!id) return 10;
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return (sum % 15) + 10; // between 10 and 24 mins
};

const MenuGrid = ({ 
  categories, 
  items, 
  activeCategoryId, 
  setActiveCategoryId, 
  searchQuery, 
  setSearchQuery, 
  addToCart, 
  removeFromCart, 
  cart, 
  isDarkMode, 
  t, 
  getIcon,
  onItemClick
}) => {
  // Diet filter state: 'all', 'veg', 'vegan', 'gluten-free', 'spicy'
  const [dietFilter, setDietFilter] = useState('all');

  const getItemQtyInCart = (itemId) => {
    return Object.keys(cart).reduce((total, key) => {
      if (key === itemId || key.startsWith(`${itemId}_`)) {
        return total + cart[key].quantity;
      }
      return total;
    }, 0);
  };

  const isSpicyItem = (item) => {
    const nameLower = item.name.toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    return nameLower.includes('spicy') || nameLower.includes('chilli') || nameLower.includes('pepper') || nameLower.includes('masala') || nameLower.includes('ginger') ||
           descLower.includes('spicy') || descLower.includes('chilli') || descLower.includes('pepper') || descLower.includes('masala');
  };

  const filteredItems = items.filter(item => {
    // 1. Search Query
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 2. Category Filter
    const matchesCategory = activeCategoryId === 'all' || item.category_id === activeCategoryId;
    
    // 3. Diet Filter
    let matchesDiet = true;
    if (dietFilter === 'veg') {
      matchesDiet = isVegItem(item.name);
    } else if (dietFilter === 'vegan') {
      matchesDiet = isVegItem(item.name) || item.name.toLowerCase().includes('vegan') || (item.description || '').toLowerCase().includes('vegan');
    } else if (dietFilter === 'gluten-free') {
      matchesDiet = item.name.toLowerCase().includes('gluten') || (item.description || '').toLowerCase().includes('gluten');
    } else if (dietFilter === 'spicy') {
      matchesDiet = isSpicyItem(item);
    }

    return matchesSearch && matchesCategory && matchesDiet;
  });

  const itemsByCategory = categories.reduce((acc, cat) => {
    const catItems = filteredItems.filter(item => item.category_id === cat.id);
    if (catItems.length > 0) acc[cat.id] = catItems;
    return acc;
  }, {});

  const dietFilters = [
    { id: 'veg', label: 'Vegetarian', color: '#10b981' },
    { id: 'vegan', label: 'Vegan', color: '#34d399' },
    { id: 'gluten-free', label: 'Gluten-Free', color: '#f59e0b' },
    { id: 'spicy', label: 'Spicy', color: '#ef4444' }
  ];

  return (
    <>
      {/* Search Bar */}
      <div className="customer-search-container" style={{ margin: '0.5rem 0' }}>
        <div className="customer-search-bar" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}>
          <Search size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input 
            id="menu-search-input"
            type="text" 
            placeholder="Search coffee, croissants, dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search menu items"
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}
          />
          <SlidersHorizontal size={18} color="var(--text-secondary)" style={{ flexShrink: 0, cursor: 'pointer' }} />
        </div>
      </div>

      {/* Row 1: Horizontally Scrollable Categories */}
      <nav className="customer-pill-container customer-no-scrollbar" aria-label="Categories" style={{ display: 'flex', gap: '0.6rem', padding: '0.4rem 1rem', marginBottom: '0.2rem' }}>
        <button 
          id="category-all-btn"
          className={`customer-pill ${activeCategoryId === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategoryId('all')}
          style={{
            backgroundColor: activeCategoryId === 'all' ? 'var(--color-accent)' : 'var(--bg-secondary)',
            color: activeCategoryId === 'all' ? '#ffffff' : 'var(--text-primary)',
            border: activeCategoryId === 'all' ? 'none' : '1px solid var(--card-border)',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.25s',
            whiteSpace: 'nowrap'
          }}
        >
          All Items
        </button>
        {categories.map(cat => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button 
              key={cat.id}
              id={`category-${cat.id}-btn`}
              className={`customer-pill ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategoryId(cat.id)}
              style={{
                backgroundColor: isActive ? 'var(--color-accent)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                border: isActive ? 'none' : '1px solid var(--card-border)',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.25s',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </nav>

      {/* Row 2: Horizontally Scrollable Dietary Filters */}
      <nav className="customer-pill-container customer-no-scrollbar" aria-label="Dietary filters" style={{ display: 'flex', gap: '0.6rem', padding: '0.4rem 1rem', marginBottom: '1.25rem' }}>
        {dietFilters.map(filter => {
          const isActive = dietFilter === filter.id;
          return (
            <button 
              key={filter.id}
              id={`diet-${filter.id}-btn`}
              className={`customer-pill ${isActive ? 'active' : ''}`} 
              onClick={() => setDietFilter(isActive ? 'all' : filter.id)}
              style={{
                backgroundColor: isActive ? 'var(--color-accent)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                border: isActive ? 'none' : '1px solid var(--card-border)',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.25s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {filter.color && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: filter.color,
                  display: 'inline-block'
                }}></span>
              )}
              {filter.label}
            </button>
          );
        })}
      </nav>

      {/* Menu live status info */}
      <div className="customer-status-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.25rem', marginBottom: '1.25rem', fontSize: '0.82rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
        <span><strong>{filteredItems.length}</strong> items available</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></span>
          Menu live
        </span>
      </div>

      <main style={{ padding: '0 0 3rem 0' }}>
        {Object.keys(itemsByCategory).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.25rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>No items found</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          categories.filter(cat => itemsByCategory[cat.id]).map(cat => (
            <div key={cat.id} className="customer-category-section" style={{ marginBottom: '2rem' }}>
              
              {/* Premium Category Header: # Title [itemCount] */}
              <div className="customer-category-header" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', marginBottom: '1rem' }}>
                <h2 className="customer-category-title" style={{ fontSize: '1.15rem', fontWeight: '800', textTransform: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span style={{ color: 'var(--color-accent)' }}>#</span> {cat.name}
                  <span style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    {itemsByCategory[cat.id].length} {itemsByCategory[cat.id].length === 1 ? 'item' : 'items'}
                  </span>
                </h2>
              </div>

              {/* 2-Column Responsive Grid */}
              <div className="customer-menu-grid-3col">
                {itemsByCategory[cat.id].map(item => {
                  const qty = getItemQtyInCart(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className="customer-vertical-item-card"
                      onClick={() => {
                        if (item.is_available && onItemClick) {
                          onItemClick(item);
                        }
                      }}
                    >
                      {/* Image Frame with Available Badge */}
                      <div className="customer-vertical-image-wrapper">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} loading="lazy" className="customer-vertical-image" />
                        ) : (
                          <span style={{ fontSize: '2rem' }}>{getIcon(item.name, 'item')}</span>
                        )}
                        
                        {/* Prep time badge on bottom-left */}
                        <div className="customer-vertical-prep-badge">
                          prep:{getStablePrepTime(item.id)}
                        </div>

                        {item.is_available ? (
                          <div className="customer-vertical-avail-badge">
                            <div className="customer-vertical-avail-dot"></div>
                            Available
                          </div>
                        ) : (
                          <div className="customer-vertical-avail-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}>
                            Sold Out
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="customer-vertical-content">
                        <div className="customer-vertical-title-row">
                          <h3 className="customer-vertical-title">{item.name}</h3>
                          <span className="customer-vertical-price">₹{item.price}</span>
                        </div>
                        
                        <p className="customer-vertical-desc">
                          {item.description || 'Tasty and fresh item prepared just for you.'}
                        </p>

                        {/* Actions */}
                        {qty === 0 ? (
                          <button 
                            id={`add-to-cart-${item.id}`}
                            className="customer-vertical-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item, 1);
                            }}
                            disabled={!item.is_available}
                          >
                            Add to Cart +
                          </button>
                        ) : (
                          <div className="customer-vertical-counter" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span>{qty}</span>
                            <button 
                              onClick={() => {
                                if (item.is_available && onItemClick) {
                                  onItemClick(item);
                                }
                              }}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </>
  );
};

export default React.memo(MenuGrid);
