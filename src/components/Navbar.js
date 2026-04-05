import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          {!logoImageError ? (
            <img
              src="/images/logos/Logo-bawarchi.png"
              alt="Bawarchi Logo"
              className="nav-logo-image"
              onError={() => setLogoImageError(true)}
            />
          ) : (
            <span className="nav-logo-icon" aria-hidden="true">🍲</span>
          )}
          Bawarchi
        </Link>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/menu" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Menu
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="nav-link cart-link" onClick={() => setMobileMenuOpen(false)}>
                Cart {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
              </Link>
              <Link to="/orders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Orders
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="nav-link admin-link" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
              <span className="user-greeting">Hi, {user?.name}!</span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-btn" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>

        <button className="mobile-menu-icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
