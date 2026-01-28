import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaCog,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
} from 'react-icons/fa';
import './SuperAdminDashboard.css';

interface Admin {
  id: string;
  name: string;
  email: string;
  organizationName: string;
  subscriptionPlan: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  adminName: string;
  adminEmail: string;
  subscriptionPlan: string;
  databaseName: string;
  createdAt: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  pricePerYear: number;
  description: string;
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([
    {
      id: 1,
      name: 'Free Tier',
      pricePerYear: 0,
      description: 'Free tier with limited features',
    },
    {
      id: 2,
      name: 'Go',
      pricePerYear: 1000,
      description: 'Go subscription - 1000 INR per year',
    },
    {
      id: 3,
      name: 'Advanced',
      pricePerYear: 5000,
      description: 'Advanced subscription - 5000 INR per year',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    subscriptionPlan: 'Free Tier',
  });

  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Fetch admins and organizations on component load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adminsRes, orgsRes] = await Promise.all([
          fetch('/api/auth/superadmin/admins'),
          fetch('/api/auth/superadmin/organizations'),
        ]);

        if (adminsRes.ok) {
          const adminsData = await adminsRes.json();
          setAdmins(adminsData);
        }

        if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          setOrganizations(orgsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('organizationName');
    sessionStorage.removeItem('subscriptionPlan');
    navigate('/');
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/superadmin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        return;
      }

      // Refetch admins and organizations
      const [adminsRes, orgsRes] = await Promise.all([
        fetch('/api/auth/superadmin/admins'),
        fetch('/api/auth/superadmin/organizations'),
      ]);

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData);
      }

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData);
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        organizationName: '',
        subscriptionPlan: 'Free Tier',
      });
      setShowCreateAdminModal(false);
      alert('Admin created successfully!');
    } catch (error: any) {
      alert(`Failed to create admin: ${error.message}`);
    }
  };

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setAdmins(admins.filter((admin) => admin.id !== id));
    }
  };

  const handleDeleteOrganization = (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(organizations.filter((org) => org.id !== id));
    }
  };

  const handleUpdatePlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
  };

  const handleSavePlan = (updatedPlan: SubscriptionPlan) => {
    setSubscriptionPlans(
      subscriptionPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
    setEditingPlan(null);
  };

  return (
    <div className="superadmin-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>
            <FaHome /> Evalis SuperAdmin
          </h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar /> Overview
          </button>
          <button
            className={`nav-btn ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            <FaUsers /> Manage Admins
          </button>
          <button
            className={`nav-btn ${activeTab === 'organizations' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizations')}
          >
            <FaBuilding /> Organizations
          </button>
          <button
            className={`nav-btn ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
          >
            <FaChartBar /> Subscription Plans
          </button>
          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Settings
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <h1>SuperAdmin Dashboard</h1>
          <div className="header-info">
            <span>Welcome, SuperAdmin</span>
            <span className="timestamp">Last Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <section className="tab-content">
            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>Total Admins</h3>
                  <p className="stat-value">{admins.length}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaBuilding />
                </div>
                <div className="stat-content">
                  <h3>Total Organizations</h3>
                  <p className="stat-value">{organizations.length}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaChartBar />
                </div>
                <div className="stat-content">
                  <h3>Subscription Plans</h3>
                  <p className="stat-value">{subscriptionPlans.length}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaBuilding />
                </div>
                <div className="stat-content">
                  <h3>System Status</h3>
                  <p className="stat-value" style={{ color: '#10b981' }}>
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div className="recent-section">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button className="action-btn create-btn" onClick={() => setShowCreateAdminModal(true)}>
                  <FaPlus /> Create New Admin
                </button>
                <button className="action-btn view-btn" onClick={() => setActiveTab('admins')}>
                  <FaEye /> View All Admins
                </button>
                <button className="action-btn view-btn" onClick={() => setActiveTab('organizations')}>
                  <FaEye /> View Organizations
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <section className="tab-content">
            <div className="section-header">
              <h2>Manage Admins</h2>
              <button className="btn-primary" onClick={() => setShowCreateAdminModal(true)}>
                <FaPlus /> Create New Admin
              </button>
            </div>

            {admins.length === 0 ? (
              <div className="empty-state">
                <FaUsers />
                <p>No admins created yet</p>
                <button className="btn-primary" onClick={() => setShowCreateAdminModal(true)}>
                  Create First Admin
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Subscription</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.organizationName}</td>
                      <td>{admin.subscriptionPlan}</td>
                      <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                      <td className="action-cell">
                        <button className="btn-icon edit-btn" title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon delete-btn"
                          onClick={() => handleDeleteAdmin(admin.id)}
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
          </section>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <section className="tab-content">
            <div className="section-header">
              <h2>Organizations</h2>
            </div>

            {organizations.length === 0 ? (
              <div className="empty-state">
                <FaBuilding />
                <p>No organizations yet. Create an admin to add an organization.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Admin Name</th>
                    <th>Admin Email</th>
                    <th>Subscription</th>
                    <th>Database</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org.id}>
                      <td>{org.name}</td>
                      <td>{org.adminName}</td>
                      <td>{org.adminEmail}</td>
                      <td>{org.subscriptionPlan}</td>
                      <td className="db-name">{org.databaseName}</td>
                      <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                      <td className="action-cell">
                        <button className="btn-icon edit-btn" title="Edit">
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon delete-btn"
                          onClick={() => handleDeleteOrganization(org.id)}
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
          </section>
        )}

        {/* Subscription Plans Tab */}
        {activeTab === 'plans' && (
          <section className="tab-content">
            <div className="section-header">
              <h2>Subscription Plans</h2>
            </div>

            <div className="plans-grid">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className="plan-card">
                  <h3>{plan.name}</h3>
                  <p className="plan-price">₹{plan.pricePerYear}/year</p>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-actions">
                    <button
                      className="btn-icon edit-btn"
                      onClick={() => handleUpdatePlan(plan)}
                      title="Edit"
                    >
                      <FaEdit /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <section className="tab-content">
            <div className="settings-section">
              <h2>System Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Database Host</label>
                  <input type="text" value="localhost" disabled />
                </div>
                <div className="form-group">
                  <label>Database Port</label>
                  <input type="text" value="5432" disabled />
                </div>
                <div className="form-group">
                  <label>JWT Expiration</label>
                  <input type="text" value="24h" disabled />
                </div>
                <div className="form-group">
                  <label>System Status</label>
                  <div className="status-badge active">✓ Active</div>
                </div>
              </div>

              <h2 style={{ marginTop: '40px' }}>Support & Documentation</h2>
              <div className="docs-links">
                <a href="#" className="doc-link">
                  📖 View Documentation
                </a>
                <a href="#" className="doc-link">
                  🐛 Report Bug
                </a>
                <a href="#" className="doc-link">
                  💬 Contact Support
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="modal-overlay" onClick={() => setShowCreateAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Admin</h2>
              <button className="close-btn" onClick={() => setShowCreateAdminModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="admin-form">
              <div className="form-group">
                <label htmlFor="name">Admin Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter admin name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter admin email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  placeholder="Enter organization name"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subscriptionPlan">Subscription Plan</label>
                <select
                  id="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                >
                  {subscriptionPlans.map((plan) => (
                    <option key={plan.id} value={plan.name}>
                      {plan.name} - ₹{plan.pricePerYear}/year
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateAdminModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <FaPlus /> Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
