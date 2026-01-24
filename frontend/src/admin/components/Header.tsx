import React from 'react';
import { FaBell, FaSyncAlt, FaSearch, FaCalendar, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  systemStats: any;
  onRefresh: () => void;
  user?: any;
}

const Header: React.FC<HeaderProps> = ({ systemStats, onRefresh, user }) => {
  const { userEmail, organizationName } = useAuth();
  
  const getCurrentTimeRange = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <header className="admin-header">
      {/* Center Search */}
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search users, exams, evaluations..." />
      </div>

      {/* Right Section - Context & Actions */}
      <div className="header-right">
        {/* Date / Time Range */}
        <div className="header-context">
          <FaCalendar />
          <span className="time-range">{getCurrentTimeRange()}</span>
        </div>

        {/* Role Badge */}
        <div className="role-badge">
          <FaShieldAlt style={{ marginRight: '4px' }} />
          Administrator
        </div>

        {/* Organization Dropdown */}
        <div className="organization-dropdown">
          <div className="org-selector">
            <span className="org-label" style={{color: 'var(--gray-500)', fontSize: 'var(--text-xs)'}}>Organization</span>
            <span className="org-name">{organizationName || 'Evalis'}</span>
          </div>
        </div>

        <button className="header-btn refresh-btn" onClick={onRefresh} title="Refresh Data">
          <FaSyncAlt />
        </button>

        <button className="header-btn notifications-btn" title="Notifications">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
