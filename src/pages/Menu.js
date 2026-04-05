import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Menu.css';

const dietaryFilters = ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'];

const inferTag = (item, index) => {
  const fallbackTags = ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'];
  const source = `${item.name || ''} ${item.category || ''} ${item.description || ''}`.toLowerCase();

  if (source.includes('vegan') || source.includes('veg')) return 'Vegan';
  if (source.includes('gluten')) return 'Gluten-Free';
  if (source.includes('dairy') || source.includes('lactose')) return 'Dairy-Free';
  if (source.includes('keto') || source.includes('grill') || source.includes('tandoori')) return 'Keto';

  return fallbackTags[index % fallbackTags.length];
};

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDietaryFilter, setActiveDietaryFilter] = useState('');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  });
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [addedItems, setAddedItems] = useState({});
  const [failedImages, setFailedImages] = useState({});

  // Handle image load error
  const handleImageError = (itemId) => {
    setFailedImages(prev => ({ ...prev, [itemId]: true }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    setError('');
    setFailedImages({}); // Clear failed images when fetching new items
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;

      const response = await menuAPI.getAllItems(params);
      setMenuItems(Array.isArray(response.data.menuItems) ? response.data.menuItems : []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load menu items';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.search]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const fetchCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) params.set(key, newFilters[key]);
    });
    setSearchParams(params);
  };

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      const redirectPath = `${window.location.pathname}${window.location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    addToCart(item);
    setAddedItems({ ...addedItems, [item._id]: true });
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item._id]: false }));
    }, 2000);
  };

  const handleViewDetails = (itemId) => {
    navigate(`/menu/${itemId}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
    });
    setActiveDietaryFilter('');
    setSearchParams({});
  };

  const decoratedItems = useMemo(
    () =>
      menuItems.map((item, index) => ({
        ...item,
        uiTag: inferTag(item, index),
        uiRating: (4.6 + (index % 4) * 0.1).toFixed(1),
      })),
    [menuItems]
  );

  const visibleItems = useMemo(
    () =>
      decoratedItems.filter((item) => {
        if (!activeDietaryFilter) return true;
        return item.uiTag === activeDietaryFilter;
      }),
    [activeDietaryFilter, decoratedItems]
  );

  const sidebarCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)));
  }, [categories, menuItems]);

  const featuredItem = visibleItems[0];
  const regularItems = visibleItems.slice(1);

  return (
    <div className="menu-page page-container">
      <div className="container menu-layout">
        <aside className="menu-sidebar">
          <div className="sidebar-block">
            <h3>Categories</h3>
            <div className="category-buttons">
              <button
                type="button"
                className={`category-btn ${filters.category === '' ? 'active' : ''}`}
                onClick={() =>
                  handleFilterChange({ target: { name: 'category', value: '' } })
                }
              >
                All Items
              </button>
              {sidebarCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`category-btn ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => handleFilterChange({ target: { name: 'category', value: cat } })}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {featuredItem && (
            <article className="sidebar-recommendation">
              <p className="recommend-title">Chef&apos;s Recommendation</p>
              <div className="recommend-image-wrap">
                {featuredItem.imageUrl && !failedImages[featuredItem._id] ? (
                  <img
                    src={featuredItem.imageUrl}
                    alt={featuredItem.name}
                    onError={() => {
                      console.warn('Sidebar image failed to load:', featuredItem.imageUrl);
                      handleImageError(featuredItem._id);
                    }}
                  />
                ) : (
                  <div className="menu-image-fallback" aria-hidden="true">🍽️</div>
                )}
              </div>
              <h4>{featuredItem.name}</h4>
              <p>{featuredItem.description || 'Our most ordered signature dish today.'}</p>
            </article>
          )}
        </aside>

        <section className="menu-main">
          <div className="menu-toolbar">
            <div className="menu-search">
              <span aria-hidden="true">🔎</span>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search for your favorite dish..."
              />
            </div>

            <div className="dietary-chips">
              {dietaryFilters.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  className={`dietary-chip ${activeDietaryFilter === chip ? 'active' : ''}`}
                  onClick={() => setActiveDietaryFilter((prev) => (prev === chip ? '' : chip))}
                >
                  {chip}
                </button>
              ))}
              <button type="button" className="clear-filters" onClick={clearFilters}>
                Reset
              </button>
            </div>
          </div>

          <h1 className="menu-title">Main Courses</h1>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="spinner"></div>
          ) : visibleItems.length === 0 ? (
            <div className="no-items">
              <h3>No items found</h3>
              <p>Try a different category or search term.</p>
            </div>
          ) : (
            <div className="menu-bento-grid">
              {featuredItem && (
                <article className="featured-card" onClick={() => handleViewDetails(featuredItem._id)} style={{cursor: 'pointer'}}>
                  <div className="featured-image">
                    {featuredItem.imageUrl && !failedImages[featuredItem._id] ? (
                      <img 
                        src={featuredItem.imageUrl} 
                        alt={featuredItem.name}
                        onError={() => {
                          console.warn('Featured image failed to load:', featuredItem.imageUrl);
                          handleImageError(featuredItem._id);
                        }}
                      />
                    ) : (
                      <div className="menu-image-fallback large" aria-hidden="true">🍲</div>
                    )}
                    <span className="featured-badge">Limited Availability</span>
                  </div>

                  <div className="featured-content">
                    <div className="featured-topline">
                      <span>★ {featuredItem.uiRating}</span>
                      <strong>₹{Number(featuredItem.price || 0).toFixed(2)}</strong>
                    </div>
                    <h3>{featuredItem.name}</h3>
                    <p>{featuredItem.description || 'A rich house favorite curated by our chefs.'}</p>

                    {featuredItem.available ? (
                      <button
                        className={`btn btn-primary ${addedItems[featuredItem._id] ? 'btn-success' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(featuredItem);
                        }}
                      >
                        {!isAuthenticated
                          ? 'Login or Register to Order'
                          : (addedItems[featuredItem._id] ? 'Added to Cart' : 'Add to Order')}
                      </button>
                    ) : (
                      <span className="availability unavailable">
                        Currently unavailable
                      </span>
                    )}
                  </div>
                </article>
              )}

              {regularItems.map((item) => (
                <article key={item._id} className="menu-item-card" onClick={() => handleViewDetails(item._id)} style={{cursor: 'pointer'}}>
                  <div className="menu-item-image-wrap">
                    {item.imageUrl && !failedImages[item._id] ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="menu-item-image"
                        onError={() => {
                          console.warn('Menu item image failed to load:', item.imageUrl);
                          handleImageError(item._id);
                        }}
                      />
                    ) : (
                      <div className="menu-image-fallback" aria-hidden="true">🍛</div>
                    )}
                    <span className="rating-pill">★ {item.uiRating}</span>
                  </div>

                  <div className="menu-item-body">
                    <div className="menu-item-header">
                      <h3>{item.name}</h3>
                      <strong className="price">₹{Number(item.price || 0).toFixed(2)}</strong>
                    </div>
                    <p className="menu-item-description">{item.description || 'Chef crafted and freshly prepared.'}</p>

                    <div className="menu-item-footer">
                      <div className="tags-row">
                        <span className="dish-tag">{item.uiTag}</span>
                        {item.category && <span className="dish-category">{item.category}</span>}
                      </div>

                      {item.available ? (
                        <button
                          className={`icon-cart-btn ${addedItems[item._id] ? 'added' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          aria-label={isAuthenticated ? `Add ${item.name} to cart` : `Login or register to order ${item.name}`}
                          title={isAuthenticated ? 'Add to cart' : 'Login or register to order'}
                        >
                          {isAuthenticated ? (addedItems[item._id] ? '✓' : '+') : '→'}
                        </button>
                      ) : (
                        <span className="availability unavailable">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Menu;
