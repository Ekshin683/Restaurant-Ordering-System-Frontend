import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI, orderAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [curatedItems, setCuratedItems] = useState([]);
  const [imageLoadState, setImageLoadState] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);

  useEffect(() => {
    fetchCuratedItems();
    fetchPublicReviews();
  }, []);

  const fetchCuratedItems = async () => {
    try {
      const response = await menuAPI.getAllItems({ limit: 6 });
      const items = Array.isArray(response.data.menuItems) ? response.data.menuItems.slice(0, 6) : [];
      setCuratedItems(items);
      // Initialize image load state
      items.forEach(item => {
        setImageLoadState(prev => ({ ...prev, [item._id]: true }));
      });
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (itemId) => {
    setImageLoadState(prev => ({ ...prev, [itemId]: false }));
  };

  const fetchPublicReviews = async () => {
    try {
      const response = await orderAPI.getPublicReviews();
      const responseReviews = Array.isArray(response?.data?.reviews) ? response.data.reviews : [];
      setReviews(responseReviews);
    } catch (err) {
      console.error('Error fetching public reviews:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const testimonials = [
    {
      name: 'Sarah Kumar',
      role: 'Food Enthusiast',
      message: 'The delivery is consistently on time and the food arrives exactly as it should. The presentation and experience are unmatched.',
      rating: 5
    },
    {
      name: 'Arjun Patel',
      role: 'Office Manager',
      message: 'Ordering for team meetings has never been easier. Quality is consistent and the customization options are fantastic.',
      rating: 5
    },
    {
      name: 'Priya Singh',
      role: 'Restaurant Regular',
      message: 'I initially thought ordering online couldn\'t match the dine-in experience, but Bawarchi proved me wrong. Truly premium.',
      rating: 5
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Savor Every Moment</h1>
            <p className="hero-subtitle">Experience the art of fine dining delivered. Uncover our chef&apos;s carefully curated dishes, all at your doorstep.</p>
            <div className="hero-buttons">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Order Now
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Sign Up
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image" aria-hidden="true">
            <div className="hero-visual-container">
              <img 
                src="/images/hero/home.jpg"
                alt="Hero Dish"
                className="hero-img"
                onError={() => setImageLoadState(prev => ({ ...prev, hero: false }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="promo-banner">
        <div className="container promo-content">
          <div className="promo-text">
            <h2>First Taste is on Us</h2>
            <p>Get ₹200 off on your first order. Enjoy premium dining with exclusive first-time customer discount.</p>
          </div>
          <div className="promo-features">
            <div className="promo-item">
              <span className="promo-icon">★★★★✩</span>
              <span className="promo-label">4.3 / 5 Rating</span>
            </div>
            <div className="promo-item">
              <span className="promo-icon">🚚</span>
              <span className="promo-label">Fast Delivery</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Signature Curations */}
        <section className="curations-section">
          <div className="section-header">
            <h2 className="section-title">Our Signature Curations</h2>
            <p className="section-subtitle">Hand-picked selections our chefs prepare with passion and pride</p>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="curations-grid">
              {curatedItems.map((item, index) => (
                <article 
                  key={item._id} 
                  className={`curation-card ${index % 2 === 0 ? 'large' : 'small'}`}
                  onClick={() => navigate(`/menu/${item._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="curation-image">
                    {imageLoadState[item._id] ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        onError={() => handleImageError(item._id)}
                      />
                    ) : (
                      <div className="image-fallback">🍛</div>
                    )}
                  </div>
                  <div className="curation-body">
                    <div className="curation-header">
                      <h3 className="curation-name">{item.name}</h3>
                      <span className="curation-price">₹{Number(item.price || 0).toFixed(2)}</span>
                    </div>
                    <p className="curation-description">{item.description || 'Chef\'s special preparation'}</p>
                    <div className="curation-footer">
                      {item.category && (
                        <span className="curation-tag">{item.category}</span>
                      )}
                      <span className="curation-rating">★ 4.8</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="curation-cta">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Explore Full Menu
            </Link>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2 className="section-title">What Our Patrons Say</h2>
          {reviewLoading ? (
            <div className="spinner"></div>
          ) : (
            <div className="testimonials-grid">
              {(reviews.length > 0 ? reviews : testimonials).map((testimonial, index) => {
                const reviewerName = testimonial.userId?.name || testimonial.name;
                const reviewerRole = testimonial.reviewRating ? 'Verified Guest' : testimonial.role;
                const reviewRating = testimonial.reviewRating || testimonial.rating || 5;
                const reviewText = testimonial.reviewText || testimonial.message;

                return (
                  <article key={testimonial._id || index} className="testimonial-card">
                    <div className="testimonial-rating">
                      {'★'.repeat(reviewRating)}
                    </div>
                    {testimonial.reviewImage && (
                      <div className="testimonial-image-wrap">
                        <img src={testimonial.reviewImage} alt="Customer review" className="testimonial-image" />
                      </div>
                    )}
                    <p className="testimonial-message">"{reviewText}"</p>
                    <div className="testimonial-author">
                      <strong className="author-name">{reviewerName}</strong>
                      <span className="author-role">{reviewerRole}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="final-cta-section">
          <div className="final-cta-card">
            <h2>Ready to indulge?</h2>
            <p>Order now and experience restaurant-quality dining at home.</p>
            <Link to="/menu" className="btn btn-primary btn-lg">
              Start Ordering
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
