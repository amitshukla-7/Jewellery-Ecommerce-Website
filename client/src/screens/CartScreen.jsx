import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);

  const removeFromCartHandler = (id) => dispatch(removeFromCart(id));

  const updateQtyHandler = (item, qty) => {
    dispatch(addToCart({ ...item, qty: Number(qty) }));
  };

  const checkoutHandler = () => navigate('/shipping');

  const itemsTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const shippingCost = itemsTotal > 5000 ? 0 : 99;
  const total = itemsTotal + shippingCost;

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-shopping-cart"></i>
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            <i className="fas fa-gem"></i>&nbsp; Browse Jewellery
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Items List */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-left">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <Link to={`/product/${item._id}`} className="cart-item-name">{item.name}</Link>
                    <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', textTransform: 'capitalize' }}>
                      {item.category}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <select
                    value={item.qty}
                    onChange={(e) => updateQtyHandler(item, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      border: '1.5px solid #e5e3de',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                  <span className="cart-item-price">
                    ₹{(item.qty * item.price).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => removeFromCartHandler(item._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                    title="Remove"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div style={{ margin: '16px 0', borderTop: '1px solid #e5e3de', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>
                    Subtotal ({cartItems.reduce((a, i) => a + i.qty, 0)} items)
                  </span>
                  <span>₹{itemsTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Shipping</span>
                  <span style={{ color: shippingCost === 0 ? '#4CAF50' : 'inherit' }}>
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
                {shippingCost === 0 && (
                  <p style={{ fontSize: '12px', color: '#4CAF50', marginBottom: '8px' }}>
                    🎉 You qualify for free shipping!
                  </p>
                )}
              </div>
              <div className="cart-total">₹{total.toLocaleString('en-IN')}</div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px' }}
                onClick={checkoutHandler}
              >
                <i className="fas fa-lock"></i>&nbsp; Proceed to Checkout
              </button>
              <Link
                to="/"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '12px',
                  color: '#888',
                  fontSize: '14px',
                }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
