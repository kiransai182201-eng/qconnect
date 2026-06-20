import React from 'react';
import { Search } from 'lucide-react';

const MenuGrid = ({ 
  categories, 
  items, 
  activeCategoryId, 
  setActiveCategoryId, 
  searchQuery, 
  setSearchQuery, 
  addToCart, 
  removeFromCart, // Added to allow decrement from card
  cart, 
  isDarkMode, 
  t, 
  getIcon 
}) => {
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategoryId === 'all' || item.category_id === activeCategoryId;
    return matchesSearch && matchesCategory;
  });

  const itemsByCategory = categories.reduce((acc, cat) => {
    const catItems = filteredItems.filter(item => item.category_id === cat.id);
    if (catItems.length > 0) acc[cat.id] = catItems;
    return acc;
  }, {});

  return (
    <>
      <nav className="customer-pill-container customer-no-scrollbar" aria-label="Menu categories">
        <button 
          className={`customer-pill ${activeCategoryId === 'all' ? 'active' : ''}`} 
          onClick={() => setActiveCategoryId('all')}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            className={`customer-pill ${activeCategoryId === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategoryId(cat.id)}
          >
            <span style={{ fontSize: '1.1rem' }}>{getIcon(cat.name, 'category')}</span> {cat.name}
          </button>
        ))}
      </nav>

      <div className="customer-search-container">
        <div className="customer-search-bar">
          <Search size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder={t.searchItems} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search menu items"
          />
        </div>
      </div>

      <main style={{ padding: '0 0 3rem 0' }}>
        {Object.keys(itemsByCategory).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.25rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>No items found</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Try adjusting your search or category filter</p>
          </div>
        ) : (
          categories.filter(cat => itemsByCategory[cat.id]).map(cat => (
            <div key={cat.id} className="customer-category-section">
              <div className="customer-category-header">
                <h2 className="customer-category-title">{cat.name}</h2>
                <div className="customer-category-line" />
              </div>
              <div className="customer-menu-grid">
                {itemsByCategory[cat.id].map(item => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div 
                      key={item.id} 
                      className={`customer-item-card ${!item.is_available ? 'out-of-stock' : ''}`}
                      style={{ opacity: item.is_available ? 1 : 0.6 }}
                    >
                      <div className="customer-item-icon-wrapper">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} loading="lazy" />
                        ) : (
                          <span>{getIcon(item.name, 'item')}</span>
                        )}
                        {!item.is_available && (
                          <div className="customer-item-out-overlay">
                            Out of stock
                          </div>
                        )}
                      </div>
                      
                      <div className="customer-item-content">
                        <div>
                          <h3 className="customer-item-title">{item.name}</h3>
                          {item.description && (
                            <p className="customer-item-desc">{item.description}</p>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                          <span className="customer-item-price">₹{item.price}</span>
                          
                          {qty > 0 ? (
                            <div className="customer-qty-selector">
                              <button 
                                className="customer-qty-btn"
                                onClick={() => removeFromCart(item.id)}
                                aria-label={`Remove one ${item.name} from order`}
                              >
                                -
                              </button>
                              <span className="customer-qty-value">{qty}</span>
                              <button 
                                className="customer-qty-btn"
                                onClick={() => addToCart(item.id)}
                                aria-label={`Add one more ${item.name} to order`}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="customer-add-btn" 
                              onClick={() => addToCart(item.id)}
                              disabled={!item.is_available}
                              aria-label={`Add ${item.name} to order`}
                            >
                              ADD
                            </button>
                          )}
                        </div>
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

export default MenuGrid;
