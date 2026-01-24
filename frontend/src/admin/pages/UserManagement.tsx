import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import UserDetailsModal from '../components/UserDetailsModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { organizationName } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', status: 'Active' });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [organizationName]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/users?organizationName=${organizationName}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const handleAddUser = () => {
    if (formData.name && formData.email && formData.role) {
      const newUser: User = {
        id: String(users.length + 1),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
      setFormData({ name: '', email: '', role: '', status: 'Active' });
      setShowModal(false);
    }
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button type="button" className="btn-primary" onClick={() => navigate('/admin/users/add')}>
          <FaPlus /> Add New User
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#999' }}>Loading users...</p>
        </div>
      ) : (
        <>
          <div className="management-filters">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="Evaluator">Evaluator</option>
              <option value="Exam Controller">Exam Controller</option>
              <option value="Candidate">Candidate</option>
            </select>
            <span className="results-count">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </span>
          </div>

          <table className="management-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.map((user) => (
            <tr key={user.id}>
              <td className="user-name">{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge role-${user.role.toLowerCase().replace(' ', '-')}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`status-badge status-${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="actions">
                <button 
                  className="btn-icon details" 
                  title="View Details"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDetailsModal(true);
                  }}
                >
                  <FaEye />
                </button>
                <button className="btn-icon edit" title="Edit">
                  <FaEdit />
                </button>
                <button
                  className="btn-icon delete"
                  title="Delete"
                  onClick={() => handleDelete(user.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
          </table>

          {displayedUsers.length === 0 && (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          )}

          <div className="pagination">
            <button
              className="btn-pagination"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              className="btn-pagination"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          userId={selectedUser.id}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Add User Modal - Keep for backward compatibility but not used */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ marginTop: 0 }}>Add New User</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Name</label>
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="Evaluator">Evaluator</option>
                  <option value="Exam Controller">Exam Controller</option>
                  <option value="Proctor">Proctor</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleAddUser}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#f0f0f0',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#666'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
