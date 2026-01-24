import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaClipboardCheck,
  FaChartLine,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFileAlt,
  FaEye,
  FaDatabase,
  FaShieldAlt,
  FaPlus,
} from 'react-icons/fa';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 12,
    activeExams: 5,
    pendingEvaluations: 8,
    systemHealth: 98,
    totalExams: 24,
    completedEvaluations: 45,
    flaggedSessions: 2,
    storageUsed: '4.5 GB',
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      action: 'Exam Created',
      description: 'Java Programming Exam',
      timestamp: '2 hours ago',
      icon: '📝',
    },
    {
      id: 2,
      action: 'User Added',
      description: 'John Doe (Evaluator)',
      timestamp: '4 hours ago',
      icon: '👤',
    },
    {
      id: 3,
      action: 'Evaluation Completed',
      description: 'Python Advanced Module',
      timestamp: '6 hours ago',
      icon: '✅',
    },
    {
      id: 4,
      action: 'Session Flagged',
      description: 'Suspicious Activity Detected',
      timestamp: '8 hours ago',
      icon: '⚠️',
    },
  ]);

  const quickActions = [
    {
      title: 'Create Exam',
      description: 'Set up and configure a new examination',
      icon: <FaFileAlt />,
      path: '/admin/exams/create',
      color: '#3498db'
    },
    {
      title: 'Add User',
      description: 'Register a new system user account',
      icon: <FaUsers />,
      path: '/admin/users/add',
      color: '#2ecc71'
    },
    {
      title: 'Live Proctoring',
      description: 'Monitor active examination sessions',
      icon: <FaEye />,
      path: '/admin/proctoring/live',
      color: '#e74c3c'
    },
    {
      title: 'View Reports',
      description: 'Access performance and analytics insights',
      icon: <FaChartLine />,
      path: '/admin/analytics/reports',
      color: '#f39c12'
    },
  ];

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1>System Overview</h1>
        <p className="subtitle">Real-time metrics and key performance indicators for your examination platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FaClipboardCheck />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.activeExams}</h3>
            <p>Active Exams</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.pendingEvaluations}</h3>
            <p>Pending Evaluations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <FaShieldAlt />
          </div>
          <div className="stat-content">
            <h3>{dashboardData.systemHealth}%</h3>
            <p>System Health</p>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="additional-stats">
        <div className="stat-item">
          <FaChartLine className="stat-item-icon" />
          <div>
            <p className="stat-item-value">{dashboardData.totalExams}</p>
            <p className="stat-item-label">Total Exams Created</p>
          </div>
        </div>

        <div className="stat-item">
          <FaCheckCircle className="stat-item-icon" />
          <div>
            <p className="stat-item-value">{dashboardData.completedEvaluations}</p>
            <p className="stat-item-label">Completed Evaluations</p>
          </div>
        </div>

        <div className="stat-item">
          <FaExclamationTriangle className="stat-item-icon" />
          <div>
            <p className="stat-item-value">{dashboardData.flaggedSessions}</p>
            <p className="stat-item-label">Flagged Sessions</p>
          </div>
        </div>

        <div className="stat-item">
          <FaDatabase className="stat-item-icon" />
          <div>
            <p className="stat-item-value">{dashboardData.storageUsed}</p>
            <p className="stat-item-label">Storage Used</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button
              type="button"
              key={index}
              onClick={() => navigate(action.path)}
              className="quick-action-card"
              style={{ borderLeftColor: action.color, background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div className="quick-action-icon" style={{ background: action.color }}>
                {action.icon}
              </div>
              <div className="quick-action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p className="activity-action">{activity.action}</p>
                <p className="activity-description">{activity.description}</p>
              </div>
              <div className="activity-time">{activity.timestamp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
