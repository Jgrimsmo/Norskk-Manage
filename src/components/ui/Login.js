import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/page.css';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      admin: { email: 'admin@norskk.com', password: 'admin123' },
      manager: { email: 'manager@norskk.com', password: 'manager123' },
      foreman: { email: 'foreman@norskk.com', password: 'foreman123' },
      worker: { email: 'worker@norskk.com', password: 'worker123' }
    };

    const credentials = demoCredentials[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img 
            src={require("../../assets/logos/norskk-logo.png")} 
            alt="Norskk Management" 
            className="login-logo" 
          />
          <h1>Norskk Management System</h1>
          <p>Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="classic-button login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-section">
          <h3>Demo Accounts</h3>
          <p>Click to auto-fill credentials:</p>
          <div className="demo-buttons">
            <button 
              type="button"
              className="classic-button demo-button"
              onClick={() => handleDemoLogin('admin')}
            >
              👑 Admin
            </button>
            <button 
              type="button"
              className="classic-button demo-button"
              onClick={() => handleDemoLogin('manager')}
            >
              👔 Manager
            </button>
            <button 
              type="button"
              className="classic-button demo-button"
              onClick={() => handleDemoLogin('foreman')}
            >
              🏗️ Foreman
            </button>
            <button 
              type="button"
              className="classic-button demo-button"
              onClick={() => handleDemoLogin('worker')}
            >
              👷 Worker
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2025 Norskk Management. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
