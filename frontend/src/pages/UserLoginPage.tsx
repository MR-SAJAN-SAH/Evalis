import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiHelper';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaArrowLeft
} from 'react-icons/fa';
import './LoginPage.css';

const UserLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role
      if (role === 'evaluator') {
        navigate('/evaluator/dashboard');
      } else if (role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'exam_controller') {
        navigate('/exam-controller/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, role, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/auth/user-login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        })
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response body is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server');
      }

      const { access_token, role, email: userEmail, name, organizationName } = responseData;

      console.log('User login successful!');
      console.log('Role:', role);

      // Use AuthContext login function
      login(access_token, role, userEmail, organizationName);

      setShowSuccess(true);

      // Redirect based on role
      setTimeout(() => {
        if (role === 'Evaluator') {
          navigate('/evaluator/dashboard');
        } else if (role === 'Exam Controller') {
          navigate('/exam-controller/dashboard');
        } else if (role === 'Candidate') {
          navigate('/candidate/dashboard');
        } else {
          navigate('/');
        }
      }, 500);

    } catch (error: any) {
      console.error('User login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side: Login Form */}
        <div className="login-left">
          <button 
            type="button"
            className="btn-back-to-main"
            onClick={() => navigate('/login')}
            style={{
              marginBottom: '20px',
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#666',
            }}
          >
            <FaArrowLeft /> Back to Login
          </button>

          <div className="logo">
            <div className="logo-icon">E</div>
            <div className="logo-text">Evalis<span>User</span></div>
          </div>
          
          <h1 className="welcome-title">Candidate Login</h1>
          <p className="welcome-subtitle">Sign in with your credentials</p>
          
          {/* Success message */}
          {showSuccess && (
            <div className="success-message">
              <FaCheckCircle />
              <span>Login successful! Redirecting to dashboard...</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} id="userLoginForm">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaSignInAlt />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Right side: Information */}
        <div className="login-right">
          <h2 className="right-title">User Portal</h2>
          <p className="right-description">
            Access your dashboard to take exams, view results, and track your progress.
          </p>
          
          <div style={{ marginTop: '40px', color: 'white', lineHeight: '1.8' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Your Roles:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '15px' }}>
                <strong>📝 Evaluator:</strong> Evaluate and grade exams
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>⚙️ Exam Controller:</strong> Create and manage exams
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>✅ Candidate:</strong> Take exams and view results
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;
