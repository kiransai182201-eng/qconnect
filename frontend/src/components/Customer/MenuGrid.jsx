import React from 'react';
import { Search } from 'lucide-react';

const MenuGrid = ({ categories, items, activeCategoryId, setActiveCategoryId, searchQuery, setSearchQuery, addToCart, cart, isDarkMode, t, getIcon }) => {
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
            {getIcon(cat.name, 'category')} {cat.name}
          </button>
        ))}
      </nav>

      <div style={{ padding: '0 1rem 1rem 1rem' }}>
        <div className="customer-search-bar" style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white', border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
          <Search size={20} color={isDarkMode ? '#94a3b8' : '#9ca3af'} />
          <input 
            type="text" 
            placeholder={t.searchItems} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}
            aria-label="Search menu items"
          />
        </div>
      </div>

      <main className="customer-menu-grid">
        {Object.keys(itemsByCategory).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: isDarkMode ? '#94a3b8' : '#6b7280', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No items found</p>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your search or category filter</p>
          </div>
        ) : (
          categories.filter(cat => itemsByCategory[cat.id]).map(cat => (
            <div key={cat.id} style={{ gridColumn: '1 / -1', marginBottom: '1.5rem' }}>
              <h2 className="customer-category-title" style={{ color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>{cat.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {itemsByCategory[cat.id].map(item => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div key={item.id} className="customer-item-card customer-custom-shadow" style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white', border: isDarkMode ? '1px solid #334155' : 'none', opacity: item.is_available ? 1 : 0.6 }}>
                      <div className="customer-item-image-placeholder">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <span style={{ fontSize: '2.5rem' }}>{getIcon(item.name, 'item')}</span>
                        )}
                        {!item.is_available && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            OUT OF STOCK
                          </div>
                        )}
                      </div>
                      <div className="customer-item-content">
                        <h3 className="customer-item-title" style={{ color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>{item.name}</h3>
                        {item.description && <p className="customer-item-desc" style={{ color: isDarkMode ? '#94a3b8' : '#6b7280' }}>{item.description}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span className="customer-item-price" style={{ color: isDarkMode ? '#f8fafc' : '#1a1a1a' }}>₹{item.price}</span>
                          <button 
                            className="customer-add-btn" 
                            onClick={() => addToCart(item.id)}
                            disabled={!item.is_available}
                            style={{ 
                              opacity: !item.is_available ? 0.5 : 1, 
                              cursor: !item.is_available ? 'not-allowed' : 'pointer',
                              backgroundColor: qty > 0 ? (isDarkMode ? '#334155' : '#f3f4f6') : '#ff6b35',
                              color: qty > 0 ? (isDarkMode ? '#f8fafc' : '#ff6b35') : 'white'
                            }}
                            aria-label={`Add ${item.name} to cart`}
                          >
                            {qty > 0 ? `+ ${qty}` : 'ADD'}
                          </button>
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
