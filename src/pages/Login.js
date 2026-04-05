import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

    const result = await login(formData.email, formData.password);

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
          <span className="auth-kicker">Welcome Back</span>
          <h1 className="auth-title">Order your favorite taste</h1>
          <p className="auth-description">
            Sign in to your Bawarchi account and resume your culinary journey with quick access to past orders, saved favorites, and personalized recommendations.
          </p>

          <div className="auth-benefits">
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">⚡</span>
              <div>
                <h4>Quick Checkout</h4>
                <p>Saved addresses and payment methods</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">🎯</span>
              <div>
                <h4>Order History</h4>
                <p>Reorder your favorites instantly</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon" aria-hidden="true">🏆</span>
              <div>
                <h4>Loyalty Rewards</h4>
                <p>Earn points on every order</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
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
                <div className="auth-inline-link-row">
                  <Link to="/forgot-password" className="auth-link">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-footer">
              <p>
                New to Bawarchi?{' '}
                <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="auth-link">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
