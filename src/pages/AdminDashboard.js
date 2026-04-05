import React, { useState, useEffect } from 'react';
import { menuAPI, orderAPI, userAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [success, setSuccess] = useState('');

  // Menu Item Form
  const [menuForm, setMenuForm] = useState({
    _id: '',
    name: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    available: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (activeTab === 'menu') fetchMenuItems();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await menuAPI.getAllItems();
      setMenuItems(response.data.menuItems);
    } catch (err) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getAllOrders();
      setOrders(response.data.orders);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Menu Item Handlers
  const handleMenuFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuForm({
      ...menuForm,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setImageError('Only JPG and PNG images are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setImageError('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Save uploaded image as data URL so it can be stored and rendered directly.
        setMenuForm((prev) => ({ ...prev, imageUrl: reader.result }));
        setImagePreview(reader.result);
        setImageError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setImageError('');
    setSuccess('');
    setLoading(true);

    try {
      const submitData = {
        name: menuForm.name.trim(),
        price: menuForm.price,
        category: menuForm.category,
        description: menuForm.description.trim(),
        available: menuForm.available,
      };

      const normalizedImage = menuForm.imageUrl ? menuForm.imageUrl.trim() : '';
      if (normalizedImage) {
        const isDataImage = normalizedImage.startsWith('data:image/');
        const isHttpImage = /^https?:\/\/.+/i.test(normalizedImage);

        if (!isDataImage && !isHttpImage) {
          setError('Enter a valid image URL (http/https) or upload a JPG/PNG file');
          setLoading(false);
          return;
        }

        submitData.imageUrl = normalizedImage;
      }

      // Validate required fields
      if (!submitData.name || !submitData.price || !submitData.category) {
        setError('Name, price, and category are required');
        setLoading(false);
        return;
      }

      // Validate price is positive
      if (isNaN(submitData.price) || Number(submitData.price) <= 0) {
        setError('Price must be a valid positive number');
        setLoading(false);
        return;
      }

      if (isEditing) {
        await menuAPI.updateItem(menuForm._id, submitData);
        setSuccess('Menu item updated successfully!');
      } else {
        await menuAPI.createItem(submitData);
        setSuccess('Menu item created successfully!');
      }
      resetMenuForm();
      fetchMenuItems();
    } catch (err) {
      console.error('Menu submit error:', err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenuItem = (item) => {
    setMenuForm(item);
    setImagePreview(item.imageUrl || '');
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMenuItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      await menuAPI.deleteItem(id);
      setSuccess('Menu item deleted successfully!');
      fetchMenuItems();
    } catch (err) {
      setError('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      _id: '',
      name: '',
      price: '',
      category: '',
      description: '',
      imageUrl: '',
      available: true,
    });
    setImagePreview('');
    setIsEditing(false);
  };

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId, status) => {
    setLoading(true);
    setError('');
    try {
      await orderAPI.updateOrderStatus(orderId, status);
      setSuccess(`Order status updated to ${status}!`);
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    setLoading(true);
    try {
      await orderAPI.deleteOrder(orderId);
      setSuccess('Order deleted successfully!');
      fetchOrders();
    } catch (err) {
      setError('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  // User Handlers
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    try {
      await userAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="page-title">Admin Dashboard 👨‍💼</h1>
        <p className="page-subtitle">Manage your restaurant</p>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu Items
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="admin-section">
            <div className="card">
              <h2>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <form onSubmit={handleMenuSubmit}>
                <div className="form-grid">
                  <div className="input-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={menuForm.name}
                      onChange={handleMenuFormChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={menuForm.price}
                      onChange={handleMenuFormChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={menuForm.category}
                      onChange={handleMenuFormChange}
                      required
                    />
                  </div>

                  <div className="input-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="available"
                        checked={menuForm.available}
                        onChange={handleMenuFormChange}
                      />
                      Available
                    </label>
                  </div>
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={menuForm.description}
                    onChange={handleMenuFormChange}
                    rows="3"
                  />
                </div>

                <div className="input-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={menuForm.imageUrl}
                    onChange={handleMenuFormChange}
                    placeholder="https://..."
                  />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageUpload}
                    style={{marginTop:'8px'}}
                  />
                  {imageError && <div style={{color:'red',marginTop:'4px'}}>{imageError}</div>}
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{maxWidth:'100%',maxHeight:'120px',objectFit:'cover',marginTop:'8px'}} />
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
                  </button>
                  {isEditing && (
                    <button type="button" className="btn btn-secondary" onClick={resetMenuForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="items-list">
              <h2>All Menu Items ({menuItems.length})</h2>
              {loading && <div className="spinner"></div>}
              <div className="grid-2">
                {menuItems.map((item) => (
                  <div key={item._id} className="card item-card">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="item-image" style={{maxWidth:'100%',maxHeight:'120px',objectFit:'cover',marginBottom:'8px'}} />
                    )}
                    <h3>{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                    {item.description && <p className="item-description">{item.description}</p>}
                    <span className={`badge ${item.available ? 'badge-completed' : 'badge-cancelled'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="item-actions">
                      <button className="btn btn-primary" onClick={() => handleEditMenuItem(item)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteMenuItem(item._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <h2>All Orders ({orders.length})</h2>
            {loading && <div className="spinner"></div>}
            <div className="orders-admin-list">
              {orders.map((order) => (
                <div key={order._id} className="card order-admin-card">
                  <div className="order-admin-header">
                    <div>
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <p>Customer: {order.userId?.name || 'Unknown'}</p>
                      <p>Email: {order.userId?.email || 'N/A'}</p>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </div>

                  <div className="order-admin-items">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.menuId?.name || 'Item'} x{item.quantity}
                      </div>
                    ))}
                  </div>

                  <div className="order-admin-total">
                    Total: ₹{order.totalPrice.toFixed(2)}
                  </div>

                  <div className="order-admin-actions">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteOrder(order._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>All Users ({users.length})</h2>
            {loading && <div className="spinner"></div>}
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge badge-${user.role}`}>{user.role}</span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
