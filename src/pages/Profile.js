import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI, orderAPI, userAPI } from '../services/api';
import './Profile.css';

const navItems = [
  { id: 'personal-info', label: 'Personal Info', icon: '👤' },
  { id: 'order-history', label: 'Order History', icon: '🧾' },
  { id: 'saved-addresses', label: 'Saved Addresses', icon: '📍' },
  { id: 'favorites', label: 'Favorites', icon: '♥' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [ordersResponse, menuResponse] = await Promise.all([
        orderAPI.getUserOrders(),
        menuAPI.getAllItems({ limit: 6 }),
      ]);

      const orders = Array.isArray(ordersResponse.data.orders) ? ordersResponse.data.orders : [];
      setRecentOrders(orders.slice(0, 2));

      const allItems = Array.isArray(menuResponse.data.menuItems) ? menuResponse.data.menuItems : [];
      const favoriteMap = new Map();

      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.menuId?._id && !favoriteMap.has(item.menuId._id)) {
            favoriteMap.set(item.menuId._id, {
              ...item.menuId,
              orderedCount: item.quantity,
            });
          }
        });
      });

      const favoriteList = Array.from(favoriteMap.values()).slice(0, 3);
      setFavoriteItems(favoriteList.length > 0 ? favoriteList : allItems.slice(0, 3));
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data.user || {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const handleManageAddress = () => {
    setEditing(true);
    const personalInfoElement = document.getElementById('personal-info');
    personalInfoElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleStartEditing = () => {
    setEditing(true);
    setTimeout(() => {
      document.getElementById('profile-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return 'N/A';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [user]);

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (pageLoading && !user) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      <div className="container profile-shell">
        <header className="profile-hero card">
          <div className="profile-hero-main">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-large">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="avatar-status-dot" />
            </div>

            <div className="profile-hero-copy">
              <span className="loyalty-pill">⭐ Loyalty Member</span>
              <h1>{user?.name || 'Guest User'}</h1>
              <p>{user?.email || 'No email provided'}</p>
            </div>
          </div>

          <button type="button" className="edit-profile-btn" onClick={handleStartEditing}>
            {editing ? 'Editing Profile' : 'Edit Profile'}
          </button>
        </header>

        <div className="profile-layout">
          <aside className="profile-sidebar card">
            <nav className="profile-nav">
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="profile-nav-item">
                  <span className="profile-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            <button className="signout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </aside>

          <main className="profile-main">
            <section id="personal-info" className="profile-section card">
              <div className="section-heading-row">
                <h2>Personal Information</h2>
                {editing ? (
                  <button className="save-link-btn" type="button" onClick={() => document.getElementById('profile-form')?.requestSubmit()}>
                    Save Changes
                  </button>
                ) : (
                  <button className="save-link-btn" type="button" onClick={handleStartEditing}>
                    Edit
                  </button>
                )}
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {editing ? (
                <form className="profile-form" id="profile-form" onSubmit={handleSubmit}>
                  <div className="profile-form-grid">
                    <div className="input-group profile-field">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="input-group profile-field">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="input-group profile-field">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="input-group profile-field profile-field-wide">
                      <label htmlFor="address">Saved Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your delivery address"
                      />
                    </div>

                    <div className="input-group profile-field">
                      <label>Password</label>
                      <div className="password-row">
                        <input type="password" value="••••••••••" readOnly />
                        <button type="button" className="text-link-btn">Change</button>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions profile-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-form-grid view-mode">
                  <div className="profile-field static-field">
                    <label>Full Name</label>
                    <div className="static-value">{user?.name || '—'}</div>
                  </div>

                  <div className="profile-field static-field">
                    <label>Email Address</label>
                    <div className="static-value">{user?.email || '—'}</div>
                  </div>

                  <div className="profile-field static-field">
                    <label>Phone Number</label>
                    <div className="static-value">{user?.phone || 'No phone number saved yet'}</div>
                  </div>

                  <div className="profile-field static-field">
                    <label>Member Since</label>
                    <div className="static-value">{memberSince}</div>
                  </div>

                  <div className="profile-field static-field profile-field-wide">
                    <label>Saved Address</label>
                    <div className="static-value">{user?.address || 'No saved address yet'}</div>
                  </div>
                </div>
              )}
            </section>

            <section id="favorites" className="profile-section">
              <div className="section-heading-row section-heading-row-inline">
                <h2>Your Favorites</h2>
                <Link to="/menu" className="text-link-btn">View All</Link>
              </div>

              <div className="favorites-grid">
                {favoriteItems.map((item) => (
                  <article key={item._id} className="favorite-card card">
                    <div className="favorite-image-wrap">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="favorite-image" />
                      ) : (
                        <div className="favorite-image fallback">🍽️</div>
                      )}
                      <button className="favorite-heart" type="button">♥</button>
                    </div>
                    <div className="favorite-body">
                      <h3>{item.name}</h3>
                      <p>{item.category || 'Chef curated'}</p>
                      <span>{item.orderedCount ? `Ordered ${item.orderedCount} times` : 'Ordered by you'}</span>
                      <button className="quick-reorder-btn" type="button">
                        Quick Reorder
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="order-history" className="profile-section">
              <div className="section-heading-row section-heading-row-inline">
                <h2>Recent Orders</h2>
                <Link to="/orders" className="text-link-btn">Full History</Link>
              </div>

              <div className="recent-orders-list">
                {recentOrders.map((order) => (
                  <article key={order._id} className="recent-order-card card">
                    <div className="recent-order-icon">🍽️</div>
                    <div className="recent-order-content">
                      <div className="recent-order-topline">
                        <strong>Order #{order._id.slice(-6)}</strong>
                        <span className={`order-status-pill ${order.status}`}>{order.status}</span>
                      </div>
                      <p>{formatOrderDate(order.createdAt)} • {order.items.length} items</p>
                    </div>
                    <div className="recent-order-total">
                      ₹{Number(order.totalPrice || 0).toFixed(2)}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="saved-addresses" className="profile-section card compact-panel">
              <div className="section-heading-row">
                <h2>Saved Addresses</h2>
                <button className="text-link-btn" type="button" onClick={handleManageAddress}>Manage</button>
              </div>
              <div className="compact-placeholder">
                <p>{user?.address || 'No saved address yet'}</p>
              </div>
            </section>
          </main>
        </div>

        <footer className="profile-footer card">
          <div className="footer-brand">
            <h3>The Culinary Curator</h3>
            <p>Experience high-end dining delivered to your doorstep, curated by chefs and built for your table.</p>
          </div>

          <div className="footer-links-block">
            <h4>Navigation</h4>
            <a href="/">Home</a>
            <a href="/menu">Menu</a>
            <a href="/orders">Order</a>
          </div>

          <div className="footer-links-block">
            <h4>Support</h4>
            <button type="button" className="footer-link-button">Privacy Policy</button>
            <button type="button" className="footer-link-button">Terms of Service</button>
            <button type="button" className="footer-link-button">Contact Us</button>
          </div>

          <div className="footer-newsletter">
            <h4>Newsletter</h4>
            <div className="newsletter-row">
              <input type="email" placeholder="Email" />
              <button type="button">➜</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
