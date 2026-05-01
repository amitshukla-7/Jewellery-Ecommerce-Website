import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import axios from 'axios';

const LoginScreen = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (isRegistering) {
        ({ data } = await axios.post('/api/users', { name, email, password }));
      } else {
        ({ data } = await axios.post('/api/users/login', { email, password }));
      }
      dispatch(setCredentials(data));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="login-container">
        {/* Gold accent header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <i className="fas fa-gem" style={{ fontSize: '36px', color: 'var(--gold)', marginBottom: '12px' }}></i>
          <h2 style={{ margin: 0 }}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '6px' }}>
            {isRegistering ? 'Join Aura Jewels' : 'Sign in to your account'}
          </p>
        </div>

        {error && <p className="alert-error">{error}</p>}

        <form onSubmit={submitHandler}>
          {isRegistering && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading
              ? (isRegistering ? 'Creating Account...' : 'Signing In...')
              : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="form-footer" style={{ marginTop: '20px' }}>
          {isRegistering ? (
            <p>
              Already have an account?{' '}
              <span onClick={() => { setIsRegistering(false); setError(''); }}>Sign In</span>
            </p>
          ) : (
            <p>
              New to Aura Jewels?{' '}
              <span onClick={() => { setIsRegistering(true); setError(''); }}>Create Account</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
