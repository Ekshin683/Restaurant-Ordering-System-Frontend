import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      navigate(redirectTo);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="container auth-layout fade-in">
        <div className="auth-left">
          <span className="auth-kicker">Join Bawarchi</span>
          <h1 className="auth-title">Start your culinary story</h1>
          <p className="auth-description">
            Create your account and unlock a world of authentic flavors, personalized recommendations, and exclusive member-only offers.
          </p>

          <div className="auth-benefits">
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">🎨</span>
              <div>
                <h4>Personalized Feed</h4>
                <p>Curated menu based on your taste</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">💳</span>
              <div>
                <h4>Easy Checkout</h4>
                <p>Save cards and addresses for speed</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">🌟</span>
              <div>
                <h4>Exclusive Deals</h4>
                <p>Member-only discounts & offers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@restaurant.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <span className="input-hint">Minimum 6 characters</span>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already eating with us?{' '}
                <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="auth-link">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
