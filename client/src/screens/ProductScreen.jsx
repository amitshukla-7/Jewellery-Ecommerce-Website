import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Image */}
      <div className="product-detail-image">
        <img src={product.image} alt={product.name} />
      </div>

      {/* Info */}
      <div className="product-detail-info">
        {/* Breadcrumb */}
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px', textTransform: 'capitalize' }}>
          <Link to="/" style={{ color: '#aaa' }}>Home</Link> /&nbsp;
          <Link to={`/${product.category}`} style={{ color: '#aaa' }}>{product.category}</Link> /&nbsp;
          <span style={{ color: '#666' }}>{product.name}</span>
        </p>

        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>{product.name}</h1>

        <p className="product-detail-price">₹{product.price?.toLocaleString('en-IN')}</p>

        {product.sku && (
          <p style={{ fontSize: '12px', color: '#bbb', marginBottom: '12px' }}>SKU: {product.sku}</p>
        )}

        <p className="product-detail-desc">{product.description}</p>

        {product.metalType && (
          <div className="price-breakdown-card">
            <h4>Price Breakdown</h4>
            <div className="breakdown-row">
              <span>Metal ({product.metalType.toUpperCase()})</span>
              <span>{product.weight}g</span>
            </div>
            {product.makingCharge > 0 && (
              <div className="breakdown-row">
                <span>Making Charges</span>
                <span>₹{product.makingCharge.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="breakdown-total">
              <span>Grand Total</span>
              <span>₹{product.price?.toLocaleString('en-IN')}</span>
            </div>
            <p className="price-disclaimer">*Final price includes 3% GST (calculated at checkout)</p>
          </div>
        )}

        <div className="qty-selector" style={{ marginTop: '24px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px', color: '#666' }}>Qty:</label>
          <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button
            className={`btn ${added ? 'btn-dark' : 'btn-primary'}`}
            onClick={addToCartHandler}
            style={{ flex: 1, minWidth: '160px', padding: '14px' }}
          >
            <i className={`fas ${added ? 'fa-check' : 'fa-cart-plus'}`}></i>
            &nbsp;{added ? 'Added to Cart!' : 'Add to Cart'}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => { addToCartHandler(); navigate('/cart'); }}
            style={{ flex: 1, minWidth: '140px', padding: '14px' }}
          >
            Buy Now
          </button>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: '20px', marginTop: '24px', flexWrap: 'wrap',
          padding: '16px', background: '#f9f8f4', borderRadius: '8px',
        }}>
          {[
            { icon: 'fa-shield-alt', text: 'BIS Hallmarked' },
            { icon: 'fa-truck', text: 'Free Shipping ₹5000+' },
            { icon: 'fa-undo', text: '7-Day Returns' },
          ].map((b) => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
              <i className={`fas ${b.icon}`} style={{ color: 'var(--gold)' }}></i>
              {b.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;
