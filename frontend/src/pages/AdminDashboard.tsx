import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserCog,
  FaFileAlt,
  FaDatabase,
  FaHistory,
  FaExclamationTriangle,
} from 'react-icons/fa';
import './AdminDashboard.css';

interface Exam {
  id: string;
  title: string;
  createdDate: string;
  totalQuestions: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdDate: string;
  status: string;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    totalQuestions: 0,
    duration: 60,
    passingScore: 40,
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'Evaluator',
    password: '',
  });

  // Sample data for overview
  const overviewStats = {
    totalUsers: 5,
    totalExams: 3,
    pendingEvaluations: 2,
    systemHealth: 98,
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('organizationName');
    localStorage.removeItem('subscriptionPlan');
    navigate('/');
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: Exam = {
      id: Date.now().toString(),
      title: examForm.title,
      createdDate: new Date().toLocaleDateString(),
      totalQuestions: examForm.totalQuestions,
      status: 'Draft',
    };
    setExams([...exams, newExam]);
    setExamForm({
      title: '',
      description: '',
      totalQuestions: 0,
      duration: 60,
      passingScore: 40,
    });
    setShowCreateExamModal(false);
    alert('Exam created successfully!');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      createdDate: new Date().toLocaleDateString(),
      status: 'Active',
    };
    setUsers([...users, newUser]);
    setUserForm({
      name: '',
      email: '',
      role: 'Evaluator',
      password: '',
    });
    setShowAddUserModal(false);
    alert('User added successfully!');
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter((exam) => exam.id !== id));
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>
            <FaHome /> Evalis Admin
          </h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar /> Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            <FaClipboardList /> Exam Management
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> User Management
          </button>
          <button
            className={`nav-item ${activeTab === 'evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluation')}
          >
            <FaFileAlt /> Evaluations
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartBar /> Analytics
          </button>
          <button
            className={`nav-item ${activeTab === 'proctoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('proctoring')}
          >
            <FaEye /> Proctoring
          </button>
          <button
            className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <FaHistory /> Audit Logs
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <h1>Dashboard Overview</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#667eea' }}>
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <h3>{overviewStats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#764ba2' }}>
                  <FaClipboardList />
                </div>
                <div className="stat-info">
                  <h3>{overviewStats.totalExams}</h3>
                  <p>Total Exams</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f093fb' }}>
                  <FaFileAlt />
                </div>
                <div className="stat-info">
                  <h3>{overviewStats.pendingEvaluations}</h3>
                  <p>Pending Evaluations</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#4facfe' }}>
                  <FaDatabase />
                </div>
                <div className="stat-info">
                  <h3>{overviewStats.systemHealth}%</h3>
                  <p>System Health</p>
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h2>Quick Access</h2>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => setShowCreateExamModal(true)}>
                  <FaPlus /> Create New Exam
                </button>
                <button className="action-btn" onClick={() => setShowAddUserModal(true)}>
                  <FaPlus /> Add New User
                </button>
                <button className="action-btn" onClick={() => setActiveTab('proctoring')}>
                  <FaEye /> Live Proctoring
                </button>
                <button className="action-btn" onClick={() => setActiveTab('analytics')}>
                  <FaChartBar /> View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exam Management Tab */}
        {activeTab === 'exams' && (
          <div className="tab-content">
            <div className="content-header">
              <h1>Exam Management</h1>
              <button className="btn-primary" onClick={() => setShowCreateExamModal(true)}>
                <FaPlus /> Create Exam
              </button>
            </div>

            {exams.length === 0 ? (
              <div className="empty-state">
                <FaClipboardList />
                <p>No exams created yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Exam Title</th>
                    <th>Questions</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id}>
                      <td>{exam.title}</td>
                      <td>{exam.totalQuestions}</td>
                      <td>{exam.createdDate}</td>
                      <td>
                        <span className={`status-badge status-${exam.status.toLowerCase()}`}>
                          {exam.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteExam(exam.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="content-header">
              <h1>User Management</h1>
              <button className="btn-primary" onClick={() => setShowAddUserModal(true)}>
                <FaPlus /> Add User
              </button>
            </div>

            {users.length === 0 ? (
              <div className="empty-state">
                <FaUsers />
                <p>No users added yet</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.createdDate}</td>
                      <td>
                        <span className={`status-badge status-${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Evaluation Tab */}
        {activeTab === 'evaluation' && (
          <div className="tab-content">
            <h1>Evaluation Management</h1>
            <div className="placeholder-content">
              <FaFileAlt />
              <h2>Pending Evaluations</h2>
              <p>View and manage pending exam evaluations</p>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>2</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>15</h3>
                    <p>Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <h1>Analytics & Reports</h1>
            <div className="placeholder-content">
              <FaChartBar />
              <h2>Performance Analytics</h2>
              <p>View detailed exam and user performance analytics</p>
            </div>
          </div>
        )}

        {/* Proctoring Tab */}
        {activeTab === 'proctoring' && (
          <div className="tab-content">
            <h1>Live Proctoring</h1>
            <div className="placeholder-content">
              <FaEye />
              <h2>Proctoring Dashboard</h2>
              <p>Monitor ongoing exams in real-time</p>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="tab-content">
            <h1>Audit Logs</h1>
            <div className="placeholder-content">
              <FaHistory />
              <h2>Activity Logs</h2>
              <p>View system activity and security events</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <h1>System Settings</h1>
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Organization Name</label>
                  <input type="text" placeholder="Enter organization name" />
                </div>
                <div className="setting-item">
                  <label>Email Address</label>
                  <input type="email" placeholder="Enter email" />
                </div>
                <div className="setting-item">
                  <label>Timezone</label>
                  <select>
                    <option>UTC</option>
                    <option>IST</option>
                    <option>EST</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary">Save Settings</button>
            </div>
          </div>
        )}
      </main>

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Exam</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateExamModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateExam}>
              <div className="form-group">
                <label>Exam Title</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) =>
                    setExamForm({ ...examForm, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={examForm.description}
                  onChange={(e) =>
                    setExamForm({ ...examForm, description: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Questions</label>
                  <input
                    type="number"
                    required
                    value={examForm.totalQuestions}
                    onChange={(e) =>
                      setExamForm({
                        ...examForm,
                        totalQuestions: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={examForm.duration}
                    onChange={(e) =>
                      setExamForm({
                        ...examForm,
                        duration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                Create Exam
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                >
                  <option>Evaluator</option>
                  <option>Exam Controller</option>
                  <option>Proctor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-primary">
                Add User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
