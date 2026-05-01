import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import RatesWidget from '../components/RatesWidget';

const CATEGORIES = {
  '': 'All Products',
  'gold-silver': 'Gold & Silver',
  diamond: 'Diamond',
  rings: 'Rings',
  earrings: 'Earrings',
  wedding: 'Wedding',
};

const CategoryScreen = ({ category = '' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const location = useLocation();

  // Support search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        let url = '/api/products?';
        if (category) url += `category=${category}&`;
        if (searchQuery) url += `search=${searchQuery}`;
        const { data } = await axios.get(url);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, searchQuery]);

  const title = searchQuery
    ? `Search results for "${searchQuery}"`
    : CATEGORIES[category] || 'Products';

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <i className="fas fa-exclamation-triangle" style={{ color: '#e53e3e' }}></i>
        <p>Experiencing connectivity issues with our gallery server.</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Our technical team is on it. Please ensure the backend service is active and the database is connected.</p>
        <button className="btn btn-outline" onClick={() => window.location.reload()} style={{ marginTop: '16px' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Hero Slider (only on home) */}
      {!category && !searchQuery && (
        <>
          <HeroSlider />
          <RatesWidget />
        </>
      )}

      <h2 className="section-heading">{title}</h2>

      {products.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-gem"></i>
          <p>No products found.</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Browse All
          </Link>
        </div>
      ) : (
        <section className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <Link to={`/product/${product._id}`}>
                <img src={product.image} alt={product.name} loading="lazy" />
                <h3>{product.name}</h3>
                <p className="price">₹{product.price?.toLocaleString('en-IN')}</p>
              </Link>
            </div>
          ))}
        </section>
      )}
    </>
  );
};

// Hero Slider Component (used on home only)
const HeroSlider = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [rates, setRates] = useState({ goldRate: 0, silverRate: 0 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await axios.get('/api/products/rates');
        setRates(data);
      } catch (err) {
        console.error('Failed to fetch rates', err);
      }
    };
    fetchRates();

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      title: 'The Royal Collection',
      subtext: "Handcrafted gold & diamond pieces for life's finest moments",
      cta: 'Explore Now',
      link: '/rings',
      bg: 'linear-gradient(to right, #0a0a0a, #1a1a2e)',
      img: 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?q=80&w=1920&auto=format&fit=crop',
    },
    {
      title: "Today's Gold Rate",
      subtext: 'Live rates updated daily — buy with confidence',
      cta: 'View Pricing',
      link: '/rates',
      bg: 'linear-gradient(to right, #1a0a00, #2d1b00)',
      isRate: true,
    },
    {
      title: 'Festive Season Sale',
      subtext: 'Up to 20% off on making charges — limited time only',
      cta: 'Shop the Sale',
      link: '/?search=sale',
      bg: 'linear-gradient(to right, #1a0000, #0d0d0d)',
      img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1920&auto=format&fit=crop',
    },
  ];

  return (
    <div className="hero-container">
      <div
        className="hero-slider"
        style={{ transform: `translateX(-${slideIndex * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="hero-slide"
            style={{
              background: slide.img ? `url(${slide.img})` : slide.bg,
              backgroundColor: slide.bg,
            }}
          >
            <div className="hero-overlay" style={{ background: slide.img ? 'rgba(0,0,0,0.5)' : slide.bg }}></div>
            <div className="hero-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtext}</p>
              
              {slide.isRate && (
                <div className="hero-rates">
                  <div className="rate-item">
                    <span>Gold (24K)</span>
                    <strong>₹{rates.goldRate || '7,200'}/g</strong>
                  </div>
                  <div className="rate-item">
                    <span>Silver</span>
                    <strong>₹{rates.silverRate || '90'}/g</strong>
                  </div>
                </div>
              )}

              <Link to={slide.link} className="btn btn-primary">
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button className="hero-arrow prev" onClick={() => setSlideIndex((slideIndex - 1 + 3) % 3)}>
        <i className="fas fa-chevron-left"></i>
      </button>
      <button className="hero-arrow next" onClick={() => setSlideIndex((slideIndex + 1) % 3)}>
        <i className="fas fa-chevron-right"></i>
      </button>

      {/* Dots */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`hero-dot ${slideIndex === i ? 'active' : ''}`}
            onClick={() => setSlideIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryScreen;
