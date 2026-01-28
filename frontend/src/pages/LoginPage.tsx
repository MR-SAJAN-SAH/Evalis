import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaChartLine,
  FaShieldAlt,
  FaUsersCog
} from 'react-icons/fa';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'evaluator') {
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const validateUsername = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    return emailRegex.test(value) || usernameRegex.test(value);
  };

  const validatePassword = (value: string): boolean => {
    return value.length >= 6;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value.trim() === '') {
      setErrors(prev => ({ ...prev, username: '' }));
    } else if (!validateUsername(value)) {
      setErrors(prev => ({ ...prev, username: 'Please enter a valid username or email' }));
    } else {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value.trim() === '') {
      setErrors(prev => ({ ...prev, password: '' }));
    } else if (!validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors = { username: '', password: '' };

    if (!validateUsername(username)) {
      newErrors.username = 'Please enter a valid username or email';
      isValid = false;
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsLoading(true);
      
      try {
        // Real API call to backend (proxied through vite)
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: username,
            password: password,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const { access_token, role, email, organizationName, subscriptionPlan, name, userId } = await response.json();
        
        console.log('Login successful!');
        console.log('Role:', role);
        console.log('Organization:', organizationName);
        console.log('User ID:', userId);
        
        // Use AuthContext login function to update global state
        // Ensure organizationName and subscriptionPlan are always strings
        const org = organizationName && typeof organizationName === 'string' ? organizationName : '';
        const plan = subscriptionPlan && typeof subscriptionPlan === 'string' ? subscriptionPlan : '';
        
        login(access_token, role, email, org, plan, userId);
        
        setShowSuccess(true);
        
        // Small delay to ensure state updates then redirect
        setTimeout(() => {
          // Redirect based on role
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }, 500);

      } catch (error: any) {
        console.error('Login error:', error);
        const errorMessage = error.message || 'Login failed. Please check your credentials.';
        
        setErrors({
          username: errorMessage,
          password: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = () => {
    const email = prompt('Please enter your email to reset password:');
    if (email && validateUsername(email)) {
      alert(`Password reset link sent to ${email} (simulated)`);
    } else if (email) {
      alert('Please enter a valid email address.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side: Login Form */}
        <div className="login-left">
          <div className="logo">
            <div className="logo-icon">E</div>
            <div className="logo-text">Evalis<span>System</span></div>
          </div>
          
          <h1 className="welcome-title">Welcome Back</h1>
          <p className="welcome-subtitle">Sign in to access your Evalis System account</p>
          
          {/* Success message */}
          {showSuccess && (
            <div className="success-message">
              <FaCheckCircle />
              <span>Login successful! Redirecting to dashboard...</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} id="loginForm">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username or Email</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                />
              </div>
              {errors.username && (
                <div className="error-message">
                  <FaExclamationCircle />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <div className="error-message">
                  <FaExclamationCircle />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>
            
            <div className="remember-forgot">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button 
                type="button" 
                className="forgot-link" 
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
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
                  <span>Sign In as Admin</span>
                  <FaSignInAlt />
                </>
              )}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                Are you a candidate or evaluator?
              </p>
              <button
                type="button"
                onClick={() => navigate('/user-login')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                }}
              >
                Sign In as User
              </button>
            </div>
          </form>
        </div>
        
        {/* Right side: Information */}
        <div className="login-right">
          <h2 className="right-title">Evalis System</h2>
          <p className="right-description">
            A comprehensive evaluation and analytics platform designed to help organizations 
            measure performance, track progress, and make data-driven decisions.
          </p>
          
          <ul className="features-list">
            <li>
              <FaChartLine />
              <div>
                <strong>Advanced Analytics</strong>
                <p>Gain insights with powerful data visualization tools</p>
              </div>
            </li>
            <li>
              <FaShieldAlt />
              <div>
                <strong>Enterprise Security</strong>
                <p>Your data is protected with bank-level encryption</p>
              </div>
            </li>
            <li>
              <FaUsersCog />
              <div>
                <strong>Team Collaboration</strong>
                <p>Work seamlessly with your team in real-time</p>
              </div>
            </li>
          </ul>
          
          <div className="copyright">
            &copy; 2023 Evalis System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
