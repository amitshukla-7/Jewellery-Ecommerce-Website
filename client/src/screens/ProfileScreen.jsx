import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!userInfo) { navigate('/login'); return null; }

  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders', config);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        { name, email, ...(password ? { password } : {}) },
        config
      );
      dispatch(setCredentials(data));
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 style={{ marginBottom: '28px' }}>My Account</h1>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Profile Form */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div className="admin-section">
            <h2>Profile Details</h2>
            {message && <p className="alert-success">{message}</p>}
            {error && <p className="alert-error">{error}</p>}
            <form onSubmit={submitHandler}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* My Orders */}
        <div style={{ flex: 2, minWidth: '300px' }}>
          <div className="admin-section">
            <h2>My Orders</h2>
            {ordersLoading ? (
              <div className="loading-wrapper">
                <div className="spinner"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-box-open"></i>
                <p>No orders yet.</p>
                <Link to="/" className="btn btn-outline" style={{ marginTop: '12px', display: 'inline-flex' }}>
                  Shop Now
                </Link>
              </div>
            ) : (
              <div>
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div>
                      <p style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
                        Order ID: #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ fontWeight: '600', color: 'var(--dark-brown)' }}>
                        ₹{order.totalPrice?.toLocaleString('en-IN')}
                      </p>
                      <p style={{ fontSize: '13px', color: '#888' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className={`order-status ${order.isDelivered ? 'status-completed' : 'status-pending'}`}>
                        {order.isDelivered ? 'Delivered' : 'Processing'}
                      </span>
                      <Link to={`/order/${order._id}`} className="btn btn-outline btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
