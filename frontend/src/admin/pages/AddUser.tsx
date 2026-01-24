import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

const AddUser = () => {
  const navigate = useNavigate();
  const { userEmail, organizationName } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Evaluator',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          organizationName: organizationName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create user');
        return;
      }

      setSuccess('User created successfully!');
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err) {
      setError('Error creating user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#667eea',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}
      >
        <FaArrowLeft /> Back to Users
      </button>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
      }}>
        <h1 style={{ marginTop: 0, color: '#333' }}>Add New User</h1>
        <p style={{ color: '#999', marginBottom: '30px' }}>Create a new user account for your organization</p>

        {error && (
          <div style={{
            background: '#ffe0e0',
            color: '#c00',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffb3b3'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e6ed',
                borderRadius: '8px',
                boxSizing: 'border-box',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e6ed'}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e6ed',
                borderRadius: '8px',
                boxSizing: 'border-box',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e6ed'}
            />
          </div>

          {/* Organization (Read-only) */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Organization
            </label>
            <input
              type="text"
              value={organizationName || 'Loading...'}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e6ed',
                borderRadius: '8px',
                boxSizing: 'border-box',
                fontSize: '14px',
                background: '#f9f9f9',
                color: '#666',
                cursor: 'not-allowed'
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
              Fixed to your organization. Cannot be changed.
            </p>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 characters)"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: '1px solid #e0e6ed',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e6ed'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#667eea',
                  fontSize: '16px'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: '1px solid #e0e6ed',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e6ed'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#667eea',
                  fontSize: '16px'
                }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e6ed',
                borderRadius: '8px',
                boxSizing: 'border-box',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e6ed'}
            >
              <option value="Evaluator">Evaluator</option>
              <option value="Exam Controller">Exam Controller</option>
              <option value="Candidate">Candidate</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              marginTop: '10px'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
