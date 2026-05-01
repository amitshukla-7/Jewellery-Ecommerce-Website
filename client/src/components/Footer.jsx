import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <div className="footer-logo-container">
            <div className="logo">
              <span className="logo-text">Aura Jewels</span>
              <div className="logo-accent"><span>◆</span></div>
            </div>
          </div>
          <p>Where heritage meets elegance. Explore our timeless collections handcrafted to perfection at Aura Jewels.</p>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/rings">Rings</Link></li>
            <li><Link to="/earrings">Earrings</Link></li>
            <li><Link to="/wedding">Wedding</Link></li>
            <li><Link to="/offer">Offers</Link></li>
          </ul>
        </div>

        <div className="footer-section contact" id="contact">
          <h3>Visit Us In Store</h3>
          <p>123, Jewellers Lane, Sarafa Bazaar, Madhya Pradesh</p>
          <p><i className="fas fa-phone-alt"></i> <a href="tel:+9198765XXXXX">+91 98765 XXXXX</a></p>
          <p>Email: <a href="mailto:support@aurajewels.com">support@aurajewels.com</a></p>
          <p>GST: 23AAAAA0000A1Z5</p>
          <div style={{ marginTop: '10px', color: 'var(--gold-light)', fontSize: '13px', fontWeight: '600' }}>
            Payment options available in store
          </div>
        </div>

        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://wa.me/9198765XXXXX" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp"></i> 
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Aura Jewels. All rights reserved.</span>
        <Link to="/login" style={{ opacity: 0.5, marginLeft: '20px', fontSize: '12px' }}>Management Portal</Link>
      </div>
    </footer>
  );
};

export default Footer;
