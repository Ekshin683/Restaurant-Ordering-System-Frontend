import React, { useEffect, useState, useCallback } from 'react';
import { orderAPI } from '../services/api';
import './Orders.css';

const createReviewDraft = () => ({
  rating: 5,
  reviewText: '',
  reviewImage: '',
  reviewImageName: '',
  reviewImagePreview: '',
  loading: false,
  error: '',
  success: '',
});

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [reviewDrafts, setReviewDrafts] = useState({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = filter ? { status: filter } : {};
      const response = await orderAPI.getAllOrders(params);
      const fetchedOrders = Array.isArray(response.data.orders) ? response.data.orders : [];
      setOrders(fetchedOrders);

      setReviewDrafts((prev) => {
        const nextDrafts = { ...prev };
        fetchedOrders.forEach((order) => {
          if (!nextDrafts[order._id]) {
            nextDrafts[order._id] = createReviewDraft();
          }
        });
        return nextDrafts;
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'completed':
        return 'badge-completed';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateReviewDraft = (orderId, changes) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || createReviewDraft()),
        ...changes,
      },
    }));
  };

  const handleReviewImageChange = (orderId, event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      updateReviewDraft(orderId, {
        error: 'Please choose an image smaller than 2MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateReviewDraft(orderId, {
        reviewImage: reader.result,
        reviewImageName: file.name,
        reviewImagePreview: reader.result,
        error: '',
      });
    };
    reader.readAsDataURL(file);
  };

  const submitReview = async (orderId) => {
    const draft = reviewDrafts[orderId] || createReviewDraft();

    if (!draft.reviewText.trim()) {
      updateReviewDraft(orderId, {
        error: 'Please add a short review description.',
      });
      return;
    }

    updateReviewDraft(orderId, {
      loading: true,
      error: '',
      success: '',
    });

    try {
      const response = await orderAPI.submitOrderReview(orderId, {
        reviewRating: draft.rating,
        reviewText: draft.reviewText.trim(),
        reviewImage: draft.reviewImage,
      });

      const updatedOrder = response.data.order;
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? updatedOrder : order))
      );

      updateReviewDraft(orderId, {
        loading: false,
        success: 'Thanks for your review. It will appear on the home page.',
      });
    } catch (err) {
      updateReviewDraft(orderId, {
        loading: false,
        error: err.response?.data?.message || 'Failed to submit review',
      });
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="page-title">My Orders 📦</h1>
        <p className="page-subtitle">Track your order history and share feedback after completion</p>

        <div className="filter-section card">
          <label>Filter by Status:</label>
          <div className="filter-buttons">
            <button
              className={`btn ${filter === '' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('')}
            >
              All
            </button>
            <button
              className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`btn ${filter === 'cancelled' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner"></div>
        ) : orders.length === 0 ? (
          <div className="no-orders card">
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const draft = reviewDrafts[order._id] || createReviewDraft();

              return (
                <div key={order._id} className="order-card card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-items">
                    <h4>Items:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">
                          {item.menuId?.name || 'Item'}
                        </span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">
                          ₹{((item.menuId?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <span className="order-total">
                      Total: <strong>₹{order.totalPrice.toFixed(2)}</strong>
                    </span>
                  </div>

                  {order.status === 'completed' && (
                    <div className="review-section">
                      <div className="review-section-header">
                        <h4>Share your review</h4>
                        <span>Visible on the home page</span>
                      </div>

                      {order.reviewRating ? (
                        <div className="submitted-review">
                          <div className="review-stars">{'★'.repeat(order.reviewRating)}</div>
                          {order.reviewImage && (
                            <img
                              src={order.reviewImage}
                              alt="Customer review"
                              className="submitted-review-image"
                            />
                          )}
                          <p>{order.reviewText}</p>
                          <small>{order.reviewedAt ? formatDate(order.reviewedAt) : 'Submitted'}</small>
                        </div>
                      ) : (
                        <div className="review-form">
                          <div className="review-stars-selector" aria-label="Review rating">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                className={`review-star-btn ${draft.rating >= rating ? 'active' : ''}`}
                                onClick={() => updateReviewDraft(order._id, { rating })}
                              >
                                ★
                              </button>
                            ))}
                            <span className="review-rating-label">{draft.rating}.0</span>
                          </div>

                          <textarea
                            className="review-textarea"
                            value={draft.reviewText}
                            onChange={(e) => updateReviewDraft(order._id, { reviewText: e.target.value, error: '' })}
                            placeholder="Tell others what you liked about this order..."
                            rows="4"
                          />

                          <div className="review-image-row">
                            <label className="review-image-button">
                              <span className="review-image-icon">📷</span>
                              <span>Add image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleReviewImageChange(order._id, e)}
                              />
                            </label>
                            {draft.reviewImageName && (
                              <span className="review-image-name">{draft.reviewImageName}</span>
                            )}
                          </div>

                          {draft.reviewImagePreview && (
                            <img
                              src={draft.reviewImagePreview}
                              alt="Review preview"
                              className="review-image-preview"
                            />
                          )}

                          {draft.error && <div className="review-error">{draft.error}</div>}
                          {draft.success && <div className="review-success">{draft.success}</div>}

                          <button
                            type="button"
                            className="btn btn-primary review-submit-btn"
                            onClick={() => submitReview(order._id)}
                            disabled={draft.loading}
                          >
                            {draft.loading ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
