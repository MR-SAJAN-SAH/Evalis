import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaHistory,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaEye,
  FaFileAlt,
  FaDatabase
} from 'react-icons/fa';

interface SidebarProps {
  onLogout: () => void;
  currentPath: string;
  user?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, currentPath, user }) => {
  const { userEmail, organizationName } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <FaTachometerAlt />,
      exact: true
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: <FaUsers />,
      submenu: [
        { title: 'All Users', path: '/admin/users' },
        { title: 'Add User', path: '/admin/users/add' },
        { title: 'Roles & Permissions', path: '/admin/users/roles' }
      ]
    },
    {
      title: 'Exam Management',
      path: '/admin/exams',
      icon: <FaClipboardList />,
      submenu: [
        { title: 'All Exams', path: '/admin/exams' },
        { title: 'Create Exam', path: '/admin/exams/create' },
        { title: 'Question Bank', path: '/admin/exams/questions' },
        { title: 'Schedule Exam', path: '/admin/exams/schedule' }
      ]
    },
    {
      title: 'Evaluation',
      path: '/admin/evaluation',
      icon: <FaFileAlt />,
      submenu: [
        { title: 'Pending Evaluations', path: '/admin/evaluation/pending' },
        { title: 'Evaluation Queue', path: '/admin/evaluation/queue' },
        { title: 'AI Evaluation Settings', path: '/admin/evaluation/ai-settings' }
      ]
    },
    {
      title: 'Results & Analytics',
      path: '/admin/analytics',
      icon: <FaChartBar />,
      submenu: [
        { title: 'Result Overview', path: '/admin/analytics/results' },
        { title: 'Performance Reports', path: '/admin/analytics/reports' },
        { title: 'Statistical Analysis', path: '/admin/analytics/stats' },
        { title: 'Export Data', path: '/admin/analytics/export' }
      ]
    },
    {
      title: 'Proctoring',
      path: '/admin/proctoring',
      icon: <FaEye />,
      submenu: [
        { title: 'Live Monitoring', path: '/admin/proctoring/live' },
        { title: 'Flagged Sessions', path: '/admin/proctoring/flagged' },
        { title: 'Proctoring Settings', path: '/admin/proctoring/settings' }
      ]
    },
    {
      title: 'Audit & Logs',
      path: '/admin/audit',
      icon: <FaHistory />,
      submenu: [
        { title: 'System Logs', path: '/admin/audit/logs' },
        { title: 'User Activity', path: '/admin/audit/activity' },
        { title: 'Security Events', path: '/admin/audit/security' }
      ]
    },
    {
      title: 'System Settings',
      path: '/admin/settings',
      icon: <FaCog />,
      submenu: [
        { title: 'General Settings', path: '/admin/settings/general' },
        { title: 'Email Settings', path: '/admin/settings/email' },
        { title: 'API Settings', path: '/admin/settings/api' },
        { title: 'Backup & Recovery', path: '/admin/settings/backup' }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.path} className="nav-section">
            <NavLink
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.title : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
            {item.submenu && !collapsed && (
              <div className="submenu">
                {item.submenu.map((subitem) => (
                  <NavLink
                    key={subitem.path}
                    to={subitem.path}
                    className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}
                  >
                    {subitem.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
