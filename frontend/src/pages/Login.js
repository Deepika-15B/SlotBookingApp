import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      const userData = result.user || JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      toast.error(result.message || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div 
      className="auth-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/auth-background.jpg)`,
      }}
    >
      <div className="auth-card">
        <div className="auth-header">
          <h1>Smart Slot Booking</h1>
          <p>Welcome back! Please login to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

