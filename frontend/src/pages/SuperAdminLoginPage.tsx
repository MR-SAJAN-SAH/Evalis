import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaSignInAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './SuperAdminLoginPage.css';

const SuperAdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect to superadmin dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/superadmin/dashboard');
    }
  }, [isAuthenticated, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/superadmin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { access_token, role, email: userEmail } = await response.json();

      console.log('SuperAdmin login successful!');
      console.log('Role:', role);

      // Call login function from AuthContext to update global state
      login(access_token, role, userEmail);

      setShowSuccess(true);

      // Redirect to superadmin dashboard
      setTimeout(() => {
        navigate('/superadmin/dashboard');
      }, 500);

    } catch (error: any) {
      console.error('SuperAdmin login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="superadmin-login-page">
      <div className="superadmin-login-container">
        <div className="superadmin-lock-icon">
          <FaLock />
        </div>

        <h1 className="superadmin-title">SuperAdmin Access</h1>
        <p className="superadmin-subtitle">Restricted access - superadmin credentials required</p>

        {error && (
          <div className="superadmin-error-message">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {showSuccess && (
          <div className="superadmin-success-message">
            <FaCheckCircle />
            <span>Login successful! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="superadmin-form">
          <div className="superadmin-form-group">
            <label htmlFor="email" className="superadmin-label">Email Address</label>
            <div className="superadmin-input-wrapper">
              <FaEnvelope className="superadmin-input-icon" />
              <input
                type="email"
                id="email"
                className="superadmin-input"
                placeholder="Enter superadmin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="superadmin-form-group">
            <label htmlFor="password" className="superadmin-label">Password</label>
            <div className="superadmin-input-wrapper">
              <FaLock className="superadmin-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="superadmin-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="superadmin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`superadmin-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="superadmin-spinner"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Access SuperAdmin Panel</span>
                <FaSignInAlt />
              </>
            )}
          </button>
        </form>

        <div className="superadmin-footer">
          <button
            type="button"
            className="superadmin-back-link"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;
