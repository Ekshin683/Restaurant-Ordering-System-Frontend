import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedPrep, setSelectedPrep] = useState('Medium');
  const [selectedSides, setSelectedSides] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);

  const fetchMenuItemDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await menuAPI.getItemById(id);
      setMenuItem(response.data.menuItem);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMenuItemDetail();
  }, [fetchMenuItemDetail]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const cartItem = {
      ...menuItem,
      quantity,
      customizations: {
        preparation: selectedPrep,
        sides: selectedSides,
        addOns: selectedAddOns,
      },
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }

    setAddedToCart(true);
    setTimeout(() => {
      navigate('/cart');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !menuItem) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="alert alert-error">{error || 'Product not found'}</div>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const prepLevels = ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'];
  const availableSides = [
    { id: 'truffle-frites', name: 'Truffle Frites', price: 4.00 },
    { id: 'pomme-puree', name: 'Pomme Purée', price: 3.50 },
    { id: 'grilled-asparagus', name: 'Grilled Asparagus', price: 5.00 },
  ];
  const availableAddOns = [
    { id: 'extra-butter', name: 'Extra Marrow Butter', price: 4.00 },
    { id: 'truffle-oil', name: 'Truffle Oil Drizzle', price: 6.00 },
  ];

  const calculateAddOnPrice = () => {
    let total = 0;
    selectedSides.forEach(sideId => {
      const side = availableSides.find(s => s.id === sideId);
      if (side) total += side.price;
    });
    selectedAddOns.forEach(addOnId => {
      const addOn = availableAddOns.find(a => a.id === addOnId);
      if (addOn) total += addOn.price;
    });
    return total;
  };

  const totalPrice = (menuItem.price + calculateAddOnPrice()) * quantity;

  return (
    <div className="page-container product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/menu')}>
          ← Back to Menu
        </button>

        <div className="product-grid">
          {/* Left: Product Image */}
          <div className="product-image-section">
            <div className="product-image-wrapper">
              {menuItem.imageUrl && !imageError ? (
                <img
                  src={menuItem.imageUrl}
                  alt={menuItem.name}
                  onError={() => setImageError(true)}
                  className="product-image"
                />
              ) : (
                <div className="product-image-fallback">🍲</div>
              )}
              <span className="chef-badge">CHEF'S SIGNATURE</span>
            </div>

            {/* Alternative Images */}
            <div className="alt-images">
              <div className="alt-image-item" aria-hidden="true">🥩</div>
              <div className="alt-image-item" aria-hidden="true">🍽️</div>
              <div className="alt-image-item" aria-hidden="true">🔥</div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="product-details-section">
            <h1 className="product-name">{menuItem.name}</h1>
            <p className="product-price">₹{Number(menuItem.price || 0).toFixed(2)}</p>

            {/* Tags */}
            <div className="product-tags">
              {menuItem.category && <span className="tag tag-category">{menuItem.category}</span>}
              <span className="tag tag-special">Chef's Selection</span>
            </div>

            <p className="product-description">
              {menuItem.description || 'A culinary masterpiece crafted with the finest ingredients and expert preparation.'}
            </p>

            {/* Preparation Level */}
            <div className="customization-section">
              <h3>Preparation Level</h3>
              <div className="prep-buttons">
                {prepLevels.map((prep) => (
                  <button
                    key={prep}
                    className={`prep-btn ${selectedPrep === prep ? 'active' : ''}`}
                    onClick={() => setSelectedPrep(prep)}
                  >
                    {prep}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Sides */}
            {availableSides.length > 0 && (
              <div className="customization-section">
                <h3>Select A Side</h3>
                <div className="sides-list">
                  {availableSides.map((side) => (
                    <label key={side.id} className="side-option">
                      <input
                        type="radio"
                        name="side"
                        value={side.id}
                        checked={selectedSides.includes(side.id)}
                        onChange={() => setSelectedSides([side.id])}
                      />
                      <span className="side-name">{side.name}</span>
                      <span className="side-price">+₹{side.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Enhance Your Dish */}
            {availableAddOns.length > 0 && (
              <div className="customization-section">
                <h3>Enhance Your Dish</h3>
                <div className="addons-list">
                  {availableAddOns.map((addOn) => (
                    <div key={addOn.id} className="addon-item">
                      <label className="addon-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedAddOns.includes(addOn.id)}
                          onChange={() => {
                            if (selectedAddOns.includes(addOn.id)) {
                              setSelectedAddOns(selectedAddOns.filter(id => id !== addOn.id));
                            } else {
                              setSelectedAddOns([...selectedAddOns, addOn.id]);
                            }
                          }}
                        />
                        <span className="addon-name">{addOn.name}</span>
                      </label>
                      <span className="addon-price">+₹{addOn.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="product-footer">
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>

              <button
                className={`btn btn-primary add-order-btn ${addedToCart ? 'success' : ''}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? '✓ Added to Cart' : `Add to Order — ₹${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
