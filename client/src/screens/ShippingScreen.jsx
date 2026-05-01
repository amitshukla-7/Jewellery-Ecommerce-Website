import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CheckoutSteps = ({ step1, step2, step3 }) => (
  <div className="checkout-steps">
    {[
      { label: 'Sign In', active: step1, num: 1 },
      { label: 'Shipping', active: step2, num: 2 },
      { label: 'Place Order', active: step3, num: 3 },
    ].map((s) => (
      <div key={s.num} className={`step ${s.active ? 'active' : ''}`}>
        <div className="step-circle">{s.num}</div>
        <span className="step-label">{s.label}</span>
      </div>
    ))}
  </div>
);

const ShippingScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const saved = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
  const [address, setAddress] = useState(saved.address || '');
  const [city, setCity] = useState(saved.city || '');
  const [postalCode, setPostalCode] = useState(saved.postalCode || '');
  const [state, setState] = useState(saved.state || '');
  const [phone, setPhone] = useState(saved.phone || '');

  if (!userInfo) {
    navigate('/login?redirect=/shipping');
    return null;
  }

  const submitHandler = (e) => {
    e.preventDefault();
    const shippingAddress = { address, city, postalCode, state, phone };
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    navigate('/placeorder');
  };

  return (
    <div className="checkout-page">
      <CheckoutSteps step1 step2 />
      <div className="form-container" style={{ maxWidth: '100%' }}>
        <h2>Shipping Address</h2>
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Full Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House no, Street, Area"
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              required
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              required
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="PIN Code"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Continue to Order Review
          </button>
        </form>
      </div>
    </div>
  );
};

export { CheckoutSteps };
export default ShippingScreen;
