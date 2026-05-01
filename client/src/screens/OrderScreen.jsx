import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const OrderScreen = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
      } catch (err) {
        setError('Could not load order details.');
      } finally {
        setLoading(false);
      }
    };
    if (userInfo) fetchOrder();
  }, [id, userInfo]);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <p className="alert-error">{error}</p>
        <Link to="/" className="btn btn-outline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Success Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #d4af37, #f7e48f)',
        borderRadius: '12px',
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: '28px',
      }}>
        <i className="fas fa-check-circle" style={{ fontSize: '40px', color: '#3b1d1d', marginBottom: '12px' }}></i>
        <h2 style={{ color: '#3b1d1d', margin: '0 0 6px' }}>Order Placed Successfully!</h2>
        <p style={{ color: '#5a3a1a', fontSize: '14px' }}>
          Order ID: <strong>#{order._id}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left */}
        <div style={{ flex: 2, minWidth: '280px' }}>
          {/* Shipping */}
          <div className="order-summary-box" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
              <i className="fas fa-truck" style={{ marginRight: '8px', color: 'var(--gold)' }}></i>
              Shipping Address
            </h2>
            <p><strong>{order.user?.name}</strong></p>
            <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
            <p>{order.shippingAddress?.state} – {order.shippingAddress?.postalCode}</p>
            {order.shippingAddress?.phone && <p>{order.shippingAddress.phone}</p>}
          </div>

          {/* Payment */}
          <div className="order-summary-box" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>
              <i className="fas fa-wallet" style={{ marginRight: '8px', color: 'var(--gold)' }}></i>
              Payment
            </h2>
            <p>Method: {order.paymentMethod}</p>
            <span className={`order-status ${order.isPaid ? 'status-completed' : 'status-pending'}`}>
              {order.isPaid ? 'Paid' : 'Payment Pending (COD)'}
            </span>
          </div>

          {/* Items */}
          <div className="order-summary-box">
            <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
              <i className="fas fa-box" style={{ marginRight: '8px', color: 'var(--gold)' }}></i>
              Order Items
            </h2>
            {order.orderItems?.map((item, i) => (
              <div key={i} className="order-summary-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                  <Link to={`/product/${item.product}`} style={{ color: 'var(--dark-brown)', fontWeight: '500' }}>
                    {item.name}
                  </Link>
                </div>
                <span>{item.qty} × ₹{item.price?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div className="order-summary-box">
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Order Summary</h2>
            <div className="order-summary-row total">
              <span>Total Paid</span>
              <span>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
            </div>
            <div className="order-summary-row">
              <span>Status</span>
              <span className={`order-status ${order.isDelivered ? 'status-completed' : 'status-pending'}`}>
                {order.isDelivered ? 'Delivered' : 'Processing'}
              </span>
            </div>
            <Link to="/" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', textAlign: 'center' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
