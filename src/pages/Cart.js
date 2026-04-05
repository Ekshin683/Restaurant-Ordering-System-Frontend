import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Checkout form state
  const [deliveryForm, setDeliveryForm] = useState({
    street: '',
    aptSuite: '',
    instructions: '',
    name: '',
    phone: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardMonth: '',
    cardYear: '',
    cardCVV: '',
  });

  const handleDeliveryFormChange = (e) => {
    const { name, value } = e.target;
    setDeliveryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity >= 0) {
      updateQuantity(itemId, quantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Validate required fields
    if (!deliveryForm.street || !deliveryForm.name || !deliveryForm.phone) {
      setError('Please fill in all required delivery details');
      return;
    }

    if (deliveryForm.paymentMethod === 'credit-card' && (!deliveryForm.cardNumber || !deliveryForm.cardMonth || !deliveryForm.cardYear || !deliveryForm.cardCVV)) {
      setError('Please fill in all payment card details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          menuId: item._id,
          quantity: item.quantity,
        })),
        delivery: {
          street: deliveryForm.street,
          aptSuite: deliveryForm.aptSuite,
          instructions: deliveryForm.instructions,
          contactName: deliveryForm.name,
          phone: deliveryForm.phone,
        },
        payment: {
          method: deliveryForm.paymentMethod,
          ...(deliveryForm.paymentMethod === 'credit-card' && {
            cardNumber: deliveryForm.cardNumber.slice(-4),
          }),
        },
      };

      await orderAPI.createOrder(orderData);
      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="success-message card">
            <h2>🎉 Order Placed Successfully!</h2>
            <p>Your delicious meal is being prepared. Redirecting to your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="page-title">Your Selection</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {cartItems.length === 0 ? (
          <div className="empty-cart card">
            <h3>Your cart is empty</h3>
            <p>Add some delicious items from the menu to get started!</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="cart-checkout-grid">
            {/* Left Column: Cart Items */}
            <div className="cart-items-column">
              <h3 className="section-title">Items in Your Order</h3>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item-card">
                    <div className="cart-item-header">
                      <h4>{item.name}</h4>
                      <span className="cart-item-price">₹{Number(item.price || 0).toFixed(2)}</span>
                    </div>

                    {item.category && (
                      <p className="cart-item-category">{item.category}</p>
                    )}

                    <div className="cart-item-controls">
                      <div className="quantity-selector">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <span className="item-total">₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</span>

                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item._id)}
                        title="Remove from cart"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary-card">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Delivery Fee</span>
                  <span>₹50.00</span>
                </div>
                <div className="summary-line">
                  <span>Taxes</span>
                  <span>₹{(getTotalPrice() * 0.05).toFixed(2)}</span>
                </div>
                <div className="summary-line total">
                  <span>Total</span>
                  <span>₹{(getTotalPrice() + 50 + getTotalPrice() * 0.05).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div className="checkout-column">
              <h3 className="section-title">Delivery & Payment</h3>
              
              <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }}>
                {/* Delivery Section */}
                <fieldset className="form-section">
                  <legend className="form-section-title">Delivery Address</legend>
                  
                  <label className="form-label required">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={deliveryForm.street}
                    onChange={handleDeliveryFormChange}
                    placeholder="Enter your street address"
                    className="form-input"
                    required
                  />

                  <label className="form-label">Apt, Suite, etc.</label>
                  <input
                    type="text"
                    name="aptSuite"
                    value={deliveryForm.aptSuite}
                    onChange={handleDeliveryFormChange}
                    placeholder="Apartment number (optional)"
                    className="form-input"
                  />

                  <label className="form-label">Delivery Instructions</label>
                  <textarea
                    name="instructions"
                    value={deliveryForm.instructions}
                    onChange={handleDeliveryFormChange}
                    placeholder="Special instructions, gate codes, etc."
                    className="form-textarea"
                    rows="3"
                  />
                </fieldset>

                {/* Contact Section */}
                <fieldset className="form-section">
                  <legend className="form-section-title">Contact Information</legend>
                  
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={deliveryForm.name}
                    onChange={handleDeliveryFormChange}
                    placeholder="Your full name"
                    className="form-input"
                    required
                  />

                  <label className="form-label required">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryForm.phone}
                    onChange={handleDeliveryFormChange}
                    placeholder="Your phone number"
                    className="form-input"
                    required
                  />
                </fieldset>

                {/* Payment Section */}
                <fieldset className="form-section">
                  <legend className="form-section-title">Payment Method</legend>
                  
                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={deliveryForm.paymentMethod === 'credit-card'}
                        onChange={handleDeliveryFormChange}
                      />
                      <span className="payment-label">💳 Credit Card</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="digital-pay"
                        checked={deliveryForm.paymentMethod === 'digital-pay'}
                        onChange={handleDeliveryFormChange}
                      />
                      <span className="payment-label">📱 Digital Payment</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={deliveryForm.paymentMethod === 'cash'}
                        onChange={handleDeliveryFormChange}
                      />
                      <span className="payment-label">💵 Cash on Delivery</span>
                    </label>
                  </div>

                  {deliveryForm.paymentMethod === 'credit-card' && (
                    <div className="card-details">
                      <label className="form-label required">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={deliveryForm.cardNumber}
                        onChange={handleDeliveryFormChange}
                        placeholder="1234 5678 9012 3456"
                        className="form-input"
                        maxLength="19"
                        required
                      />

                      <div className="card-row">
                        <div>
                          <label className="form-label required">MM/YY</label>
                          <input
                            type="text"
                            name="cardMonth"
                            value={deliveryForm.cardMonth}
                            onChange={handleDeliveryFormChange}
                            placeholder="MM/YY"
                            className="form-input"
                            maxLength="5"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label required">CVV</label>
                          <input
                            type="text"
                            name="cardCVV"
                            value={deliveryForm.cardCVV}
                            onChange={handleDeliveryFormChange}
                            placeholder="123"
                            className="form-input"
                            maxLength="4"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </fieldset>

                {/* Submit Buttons */}
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-large"
                    disabled={loading || cartItems.length === 0}
                  >
                    {loading ? '⏳ Placing Order...' : '✓ Place Order'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/menu')}
                  >
                    Continue Shopping
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
