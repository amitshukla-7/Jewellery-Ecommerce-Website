import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const CATEGORIES = ['rings', 'earrings', 'diamond', 'gold-silver', 'wedding', 'other'];

const emptyForm = {
  name: '', description: '', price: '', category: 'rings',
  metalType: '', weight: '', makingCharge: '', image: '',
};

const AdminScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo || userInfo.role !== 'admin') {
    navigate('/');
    return null;
  }

  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  // State
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [goldRate, setGoldRate] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Product form
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // Investment form
  const [invFormData, setInvFormData] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [invEditId, setInvEditId] = useState(null);
  const [showInvForm, setShowInvForm] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, userRes, orderRes, rateRes, invRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/users', config),
        axios.get('/api/orders', config),
        axios.get('/api/products/rates'),
        axios.get('/api/admin/investments', config),
      ]);
      setProducts(prodRes.data);
      setUsers(userRes.data);
      setOrders(orderRes.data);
      setGoldRate(rateRes.data.goldRate || '');
      setSilverRate(rateRes.data.silverRate || '');
      setInvestments(invRes.data);
    } catch (err) {
      console.warn('Failed to load real data, using mock data for Aura Jewels Demo Mode.');
      // Mock Products
      setProducts([
        { _id: '1', name: 'Kundan Polki Necklace', category: 'wedding', price: 245000, sku: 'NEC-DEMO' },
        { _id: '2', name: 'Diamond Ring', category: 'diamond', price: 185000, sku: 'RNG-DEMO' }
      ]);
      // Mock Users
      setUsers([
        { _id: '1', name: 'Admin User', email: 'admin@aurajewels.com', role: 'admin', createdAt: new Date() },
        { _id: '2', name: 'Priya Sharma', email: 'priya@gmail.com', role: 'user', createdAt: new Date() }
      ]);
      // Mock Orders
      setOrders([
        { _id: 'ord1', user: { name: 'Priya Sharma' }, totalPrice: 245000, isPaid: true, isDelivered: false, createdAt: new Date() }
      ]);
      // Mock Investments
      setInvestments([
        { _id: 'inv1', name: 'New Shop Inventory', amount: 500000, date: new Date().toISOString() }
      ]);
      setGoldRate('7250');
      setSilverRate('92');
      setError('Aura Jewels Demo Mode: Showing simulated data because the database is disconnected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 4000);
  };

  // Image upload
  const uploadImageHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataImg = new FormData();
    formDataImg.append('image', file);
    setUploading(true);
    try {
      const uploadConfig = {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.post('/api/upload', formDataImg, uploadConfig);
      setFormData((prev) => ({ ...prev, image: data }));
      notify('Image uploaded!');
    } catch {
      notify('Image upload failed.', true);
    } finally {
      setUploading(false);
    }
  };

  // Save product (create or update)
  const saveProductHandler = async (e) => {
    e.preventDefault();
    if (!formData.image) { notify('Please upload a product image.', true); return; }
    try {
      if (editId) {
        await axios.put(`/api/products/${editId}`, formData, config);
        notify('Product updated!');
      } else {
        await axios.post('/api/products', formData, config);
        notify('Product created!');
      }
      setFormData(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || 'Save failed.', true);
    }
  };

  const editProductHandler = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      metalType: product.metalType || '',
      weight: product.weight || '',
      makingCharge: product.makingCharge || '',
      image: product.image,
    });
    setEditId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProductHandler = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, config);
      notify('Product deleted!');
      fetchData();
    } catch {
      notify('Delete failed.', true);
    }
  };

  // Save investment
  const saveInvHandler = async (e) => {
    e.preventDefault();
    try {
      if (invEditId) {
        await axios.put(`/api/admin/investments/${invEditId}`, invFormData, config);
        notify('Investment updated!');
      } else {
        await axios.post('/api/admin/investments', invFormData, config);
        notify('Investment created!');
      }
      setInvFormData({ name: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setInvEditId(null);
      setShowInvForm(false);
      fetchData();
    } catch (err) {
      notify('Failed to save investment.', true);
    }
  };

  const editInvHandler = (inv) => {
    setInvFormData({ name: inv.name, amount: inv.amount, date: inv.date.split('T')[0] });
    setInvEditId(inv._id);
    setShowInvForm(true);
  };

  const deleteInvHandler = async (id) => {
    if (!window.confirm('Delete this investment?')) return;
    try {
      await axios.delete(`/api/admin/investments/${id}`, config);
      notify('Investment deleted!');
      fetchData();
    } catch {
      notify('Delete failed.', true);
    }
  };

  // Update metal rates (for products)
  const updateRatesHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/products/rates', { goldRate: Number(goldRate), silverRate: Number(silverRate) }, config);
      notify('Product pricing base rates updated!');
      fetchData();
    } catch {
      notify('Failed to update product rates.', true);
    }
  };

  // Update history rates (for chart/widget)
  const updateHistoryRatesHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/rates/update', { goldRate: Number(goldRate), silverRate: Number(silverRate) }, config);
      notify('Historical market rates updated for today!');
      fetchData();
    } catch {
      notify('Failed to update historical rates.', true);
    }
  };

  const TAB_COUNTS = {
    products: products.length,
    users: users.length,
    orders: orders.length,
    investments: investments.length,
    rates: '',
  };

  return (
    <div className="admin-page">
      <h1>
        <i className="fas fa-cog" style={{ marginRight: '10px', color: 'var(--gold)' }}></i>
        Admin Dashboard
      </h1>

      {message && <p className="alert-success">{message}</p>}
      {error && <p className="alert-error">{error}</p>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['products', 'orders', 'users', 'investments', 'rates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'} btn-sm`}
            style={{ textTransform: 'capitalize' }}
          >
            {tab} {TAB_COUNTS[tab] !== '' && <span style={{ opacity: 0.8 }}>({TAB_COUNTS[tab]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-wrapper"><div className="spinner"></div></div>
      ) : (
        <>
          {/* ---- PRODUCTS TAB ---- */}
          {activeTab === 'products' && (
            <div className="admin-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Products</h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setFormData(emptyForm); setEditId(null); setShowForm((v) => !v); }}
                >
                  <i className="fas fa-plus"></i> {showForm && !editId ? 'Cancel' : 'Add Product'}
                </button>
              </div>

              {/* Product Form */}
              {showForm && (
                <form onSubmit={saveProductHandler} style={{
                  background: 'var(--cream)', padding: '20px', borderRadius: '8px',
                  marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px',
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Product Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Category *</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Price (₹) *</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Metal Type</label>
                    <select value={formData.metalType} onChange={(e) => setFormData({ ...formData, metalType: e.target.value })}>
                      <option value="">None</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Weight (grams)</label>
                    <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Making Charge (₹)</label>
                    <input type="number" value={formData.makingCharge} onChange={(e) => setFormData({ ...formData, makingCharge: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <label>Description *</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <label>Product Image *</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {formData.image && (
                        <img src={formData.image} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                      )}
                      <input ref={fileRef} type="file" accept="image/*" onChange={uploadImageHandler} style={{ display: 'none' }} />
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </button>
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">
                      {editId ? 'Update Product' : 'Create Product'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); setFormData(emptyForm); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Metal</th>
                      <th>SKU</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ fontWeight: '500', maxWidth: '180px' }}>{p.name}</td>
                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                        <td>₹{p.price?.toLocaleString('en-IN')}</td>
                        <td style={{ textTransform: 'capitalize' }}>{p.metalType || '—'}</td>
                        <td style={{ fontSize: '12px', color: '#888' }}>{p.sku}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => editProductHandler(p)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteProductHandler(p._id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- ORDERS TAB ---- */}
          {activeTab === 'orders' && (
            <div className="admin-section">
              <h2>All Orders</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td style={{ fontSize: '12px' }}>#{order._id.slice(-8).toUpperCase()}</td>
                        <td>{order.user?.name || 'Deleted User'}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className={`order-status ${order.isPaid ? 'status-completed' : 'status-pending'}`}>
                              {order.isPaid ? 'Paid' : 'Pending'}
                            </span>
                            {!order.isPaid && (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                                onClick={async () => {
                                  if (window.confirm('Mark as Paid?')) {
                                    await axios.put(`/api/orders/${order._id}/pay`, {}, config);
                                    fetchData();
                                  }
                                }}
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className={`order-status ${order.isDelivered ? 'status-completed' : 'status-pending'}`}>
                              {order.isDelivered ? 'Delivered' : 'Processing'}
                            </span>
                            {!order.isDelivered && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                                onClick={async () => {
                                  if (window.confirm('Mark as Delivered?')) {
                                    await axios.put(`/api/orders/${order._id}/deliver`, {}, config);
                                    fetchData();
                                  }
                                }}
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- USERS TAB ---- */}
          {activeTab === 'users' && (
            <div className="admin-section">
              <h2>All Users</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td style={{ fontWeight: '500' }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`order-status ${user.role === 'admin' ? 'status-completed' : 'status-pending'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---- INVESTMENTS TAB ---- */}
          {activeTab === 'investments' && (
            <div className="admin-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Business Investments</h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setInvFormData({ name: '', amount: '', date: new Date().toISOString().split('T')[0] }); setInvEditId(null); setShowInvForm((v) => !v); }}
                >
                  <i className="fas fa-plus"></i> {showInvForm && !invEditId ? 'Cancel' : 'Add Investment'}
                </button>
              </div>

              {showInvForm && (
                <form onSubmit={saveInvHandler} style={{
                  background: 'var(--cream)', padding: '20px', borderRadius: '8px',
                  marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap'
                }}>
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label>Investment Name</label>
                    <input type="text" value={invFormData.name} onChange={(e) => setInvFormData({ ...invFormData, name: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0, width: '150px' }}>
                    <label>Amount (₹)</label>
                    <input type="number" value={invFormData.amount} onChange={(e) => setInvFormData({ ...invFormData, amount: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ margin: 0, width: '180px' }}>
                    <label>Date</label>
                    <input type="date" value={invFormData.date} onChange={(e) => setInvFormData({ ...invFormData, date: e.target.value })} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary">{invEditId ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => (
                      <tr key={inv._id}>
                        <td style={{ fontWeight: '500' }}>{inv.name}</td>
                        <td style={{ color: '#e53e3e', fontWeight: '600' }}>₹{inv.amount?.toLocaleString('en-IN')}</td>
                        <td>{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => editInvHandler(inv)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteInvHandler(inv._id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '18px', fontWeight: '700', color: '#3b1d1d' }}>
                  Total Investment: <span style={{ color: 'var(--gold)' }}>₹{investments.reduce((acc, inv) => acc + (inv.amount || 0), 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ---- RATES TAB ---- */}
          {activeTab === 'rates' && (
            <div className="admin-section">
              <h2>Update Metal Rates</h2>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                Updating rates will automatically recalculate prices for all gold and silver products.
              </p>
              <form onSubmit={updateRatesHandler} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', paddingBottom: '30px', borderBottom: '1px solid #eee', marginBottom: '30px' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                  <label>Gold Rate (₹ per gram)</label>
                  <input
                    type="number"
                    value={goldRate}
                    onChange={(e) => setGoldRate(e.target.value)}
                    placeholder="e.g. 7200"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                  <label>Silver Rate (₹ per gram)</label>
                  <input
                    type="number"
                    value={silverRate}
                    onChange={(e) => setSilverRate(e.target.value)}
                    placeholder="e.g. 90"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-sync"></i> Update Product Rates
                </button>
              </form>

              <h2 style={{ marginTop: '20px' }}>Update Today's Market Trend</h2>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                This updates the 7-day historical graph and live widget on the homepage.
              </p>
              <form onSubmit={updateHistoryRatesHandler} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                  <label>Market Gold Rate (24KT)</label>
                  <input
                    type="number"
                    value={goldRate}
                    onChange={(e) => setGoldRate(e.target.value)}
                    placeholder="e.g. 7200"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '180px' }}>
                  <label>Market Silver Rate</label>
                  <input
                    type="number"
                    value={silverRate}
                    onChange={(e) => setSilverRate(e.target.value)}
                    placeholder="e.g. 90"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-outline">
                  <i className="fas fa-chart-line"></i> Update Market Trend
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminScreen;
