import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchSystemStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const userEmail = sessionStorage.getItem('userEmail') || '';
      const organizationName = sessionStorage.getItem('organizationName') || '';
      
      // Fetch full user profile with image URL
      if (accessToken && userEmail) {
        const userId = sessionStorage.getItem('userId'); // Ensure userId is stored during login
        if (userId) {
          try {
            const response = await fetch(`http://localhost:3000/api/auth/user/${userId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser({
                email: userEmail,
                name: userData.name || userEmail.split('@')[0],
                organizationName: organizationName,
                role: 'admin',
                profileUrl: userData.profile?.profileUrl || null
              });
            } else {
              // Fallback if API call fails
              setUser({
                email: userEmail,
                name: userEmail.split('@')[0],
                organizationName: organizationName,
                role: 'admin',
                profileUrl: null
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser({
              email: userEmail,
              name: userEmail.split('@')[0],
              organizationName: organizationName,
              role: 'admin',
              profileUrl: null
            });
          }
        } else {
          setUser({
            email: userEmail,
            name: userEmail.split('@')[0],
            organizationName: organizationName,
            role: 'admin',
            profileUrl: null
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      // Mock system stats for now
      setSystemStats({
        totalUsers: 12,
        activeExams: 5,
        pendingEvaluations: 8,
        systemHealth: 98,
        totalExams: 24,
        completedEvaluations: 45,
        flaggedSessions: 2,
        storageUsed: '4.5 GB'
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear auth data from sessionStorage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('organizationName');
    sessionStorage.removeItem('subscriptionPlan');
    // Also clear localStorage as fallback
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('organizationName');
    localStorage.removeItem('subscriptionPlan');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="sidebar-section">
        {/* Profile Top Bar */}
        <div className="profile-top-bar">
          <div className="profile-card-top">
            <div className="profile-image-square">
              {user?.profileUrl ? (
                <img 
                  src={user.profileUrl} 
                  alt="Profile" 
                  className="profile-image-top"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.add('visible');
                  }}
                />
              ) : null}
              <div className="profile-avatar-fallback-top">
                {user?.name?.charAt(0).toUpperCase() || 
                 user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
            <div className="profile-info-top">
              <p className="profile-name-top">{user?.name || user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="profile-email-top">{user?.email || 'admin@evalis.com'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <Sidebar onLogout={handleLogout} currentPath={location.pathname} user={user} />

        {/* Logout Bottom Bar */}
        <div className="logout-bottom-bar">
          <button className="logout-btn-bottom" onClick={handleLogout} title="Logout">
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="main-content">
        <Header 
          systemStats={systemStats}
          onRefresh={fetchSystemStats}
          user={user}
        />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
