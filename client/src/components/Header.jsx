import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const logoutHandler = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate('/login');
  };

  const searchHandler = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${search.trim()}`);
      setSearch('');
    } else {
      navigate('/');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`overlay ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Side Menu */}
      <div className={`side-menu ${menuOpen ? 'active' : ''}`}>
        <div className="side-menu-header">
          <div className="logo">
            <span className="logo-text">Aura Jewels</span>
            <div className="logo-accent"><span>◆</span></div>
          </div>
          <button className="close-btn" onClick={() => setMenuOpen(false)}>
            &times;
          </button>
        </div>
        <div className="side-menu-content">
          <h3>Categories</h3>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-star"></i> All Products
          </Link>
          <Link to="/gold-silver" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-coins"></i> Gold &amp; Silver
          </Link>
          <Link to="/diamond" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-gem"></i> Diamond
          </Link>
          <Link to="/rings" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-ring"></i> Rings
          </Link>
          <Link to="/earrings" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-certificate"></i> Earrings
          </Link>
          <Link to="/wedding" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-heart"></i> Wedding
          </Link>

          <h3>Account</h3>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-shopping-cart"></i> Cart ({cartCount})
          </Link>
          {userInfo ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-user"></i> Profile
              </Link>
              {userInfo.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-cog"></i> Admin Panel
                </Link>
              )}
              <a href="#!" onClick={logoutHandler}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-sign-in-alt"></i> Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="header">
        <div className="navbar">
          {/* Left: Hamburger + Logo */}
          <div className="navbar-left">
            <button
              className="hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <i className="fas fa-bars"></i>
            </button>
            <Link to="/" className="logo">
              <span className="logo-text">Aura Jewels</span>
              <div className="logo-accent"><span>◆</span></div>
            </Link>
          </div>

          {/* Search */}
          <form className="search-icon-input" onSubmit={searchHandler}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search jewellery..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Desktop Icons */}
          <div className="desktop-icons">
            <a
              href="#contact"
              title="Visit Us"
            >
              <i className="fas fa-store"></i>
            </a>
            <Link to="/cart" className="cart-wrapper" title="Cart">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
            {userInfo && (
              <Link to="/profile" title="Profile">
                <i className="fas fa-user"></i>
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="nav-auth">
            {userInfo ? (
              <>
                {userInfo.role === 'admin' && (
                  <Link to="/admin">Admin</Link>
                )}
                <button className="logout-btn" onClick={logoutHandler}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-signin">
                <i className="fas fa-user"></i>
                <span className="nav-text"> Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Category Nav (desktop) */}
        <nav className="categories" id="categoryNav">
          <Link to="/">
            <button><i className="fas fa-star"></i> All Products</button>
          </Link>
          <Link to="/gold-silver">
            <button className="gold">
              <i className="fas fa-coins"></i> Gold &amp; Silver
            </button>
          </Link>
          <Link to="/diamond">
            <button><i className="fas fa-gem"></i> Diamond</button>
          </Link>
          <Link to="/rings">
            <button><i className="fas fa-ring"></i> Rings</button>
          </Link>
          <Link to="/earrings">
            <button><i className="fas fa-certificate"></i> Earrings</button>
          </Link>
          <Link to="/wedding">
            <button><i className="fas fa-heart"></i> Wedding</button>
          </Link>
        </nav>
      </header>
    </>
  );
};

export default Header;
