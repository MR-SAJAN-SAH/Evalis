import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser, FaFileAlt, FaChartBar, FaBell, FaPlus } from 'react-icons/fa';
import './UserDashboard.css';

const ExamControllerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userEmail, logout, organizationName } = useAuth();
  const [loading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <header className="user-dashboard-header">
        <div className="header-left">
          <h1>Exam Controller Dashboard</h1>
          <p className="organization-name">{organizationName}</p>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="avatar">{userEmail?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <p className="email">{userEmail}</p>
              <p className="role">Exam Controller</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="welcome-section">
          <h2>Welcome, {userEmail?.split('@')[0]}!</h2>
          <p>You are logged in as an Exam Controller for {organizationName}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <FaFileAlt className="card-icon" />
            <h3>Active Exams</h3>
            <p className="card-number">8</p>
            <p className="card-description">Exams currently running</p>
          </div>

          <div className="dashboard-card">
            <FaPlus className="card-icon" />
            <h3>Create Exam</h3>
            <p className="card-description">Create a new exam</p>
            <button className="card-btn">Create New</button>
          </div>

          <div className="dashboard-card">
            <FaChartBar className="card-icon" />
            <h3>Statistics</h3>
            <p className="card-number">156</p>
            <p className="card-description">Total candidates evaluated</p>
          </div>

          <div className="dashboard-card">
            <FaBell className="card-icon" />
            <h3>Notifications</h3>
            <p className="card-number">3</p>
            <p className="card-description">System notifications</p>
          </div>
        </div>

        <div className="info-section">
          <h3>Quick Info</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userEmail}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Organization:</span>
              <span className="info-value">{organizationName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">Exam Controller</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value" style={{ color: '#22c55e' }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamControllerDashboard;
