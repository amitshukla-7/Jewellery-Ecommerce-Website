import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { clearCartItems } from '../slices/cartSlice';
import { CheckoutSteps } from './ShippingScreen';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}');

  if (!userInfo) { navigate('/login'); return null; }
  if (!shippingAddress.address) { navigate('/shipping'); return null; }

  const itemsTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const shippingCost = itemsTotal > 5000 ? 0 : 99;
  const total = itemsTotal + shippingCost;

  const placeOrderHandler = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const orderItems = cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id,
      }));
      const { data } = await axios.post(
        '/api/orders',
        { orderItems, shippingAddress, paymentMethod: 'COD', totalPrice: total },
        config
      );
      dispatch(clearCartItems());
      navigate(`/order/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <CheckoutSteps step1 step2 step3 />
      <h1>Review Your Order</h1>

      {error && <p className="alert-error">{error}</p>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left: Details */}
        <div style={{ flex: 2, minWidth: '280px' }}>
          {/* Shipping */}
          <div className="order-summary-box" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
              <i className="fas fa-truck" style={{ marginRight: '8px', color: 'var(--gold)' }}></i>
              Shipping Address
            </h2>
            <p>{shippingAddress.address}, {shippingAddress.city}</p>
            <p>{shippingAddress.state} – {shippingAddress.postalCode}</p>
            <p>{shippingAddress.phone}</p>
            <Link to="/shipping" style={{ color: 'var(--gold)', fontSize: '13px', marginTop: '8px', display: 'inline-block' }}>
              Edit
            </Link>
          </div>

          {/* Payment */}
          <div className="order-summary-box" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>
              <i className="fas fa-wallet" style={{ marginRight: '8px', color: 'var(--gold)' }}></i>
              Payment Method
            </h2>
            <p>Cash on Delivery (COD)</p>
          </div>

          {/* Items */}
          <div className="order-summary-box">
            <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
              <i className="fas fa-box" style={{ marginRight: '8px', color: 'var(--gold)' }}></i>
              Order Items
            </h2>
            {cartItems.map((item) => (
              <div key={item._id} className="order-summary-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                  <Link to={`/product/${item._id}`} style={{ color: 'var(--dark-brown)', fontWeight: '500' }}>
                    {item.name}
                  </Link>
                </div>
                <span>{item.qty} × ₹{item.price.toLocaleString('en-IN')} = <strong>₹{(item.qty * item.price).toLocaleString('en-IN')}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div className="order-summary-box">
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Order Summary</h2>
            <div className="order-summary-row">
              <span>Items</span>
              <span>₹{itemsTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="order-summary-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
            </div>
            <div className="order-summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '14px' }}
              onClick={placeOrderHandler}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
            {shippingCost === 0 && (
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#4CAF50', marginTop: '8px' }}>
                🎉 Free shipping on orders above ₹5,000!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;
