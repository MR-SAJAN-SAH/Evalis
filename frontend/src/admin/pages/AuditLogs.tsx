import React, { useState } from 'react';
import { FaSearch, FaFilter, FaExclamationTriangle, FaLock, FaUser } from 'react-icons/fa';

const AuditLogs = () => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:32:45',
      user: 'admin@example.com',
      action: 'Created new exam',
      entityType: 'Exam',
      entityName: 'Java Programming',
      status: 'success',
      details: 'Exam created with 50 questions'
    },
    {
      id: 2,
      timestamp: '2024-01-15 13:15:20',
      user: 'dr.sharma@example.com',
      action: 'Updated evaluation',
      entityType: 'Evaluation',
      entityName: 'Candidate #123',
      status: 'success',
      details: 'Score updated to 85/100'
    },
    {
      id: 3,
      timestamp: '2024-01-15 12:48:10',
      user: 'system',
      action: 'Failed login attempt',
      entityType: 'Authentication',
      entityName: 'unknown@example.com',
      status: 'failure',
      details: 'Invalid credentials'
    },
    {
      id: 4,
      timestamp: '2024-01-15 11:20:30',
      user: 'admin@example.com',
      action: 'Deleted user account',
      entityType: 'User',
      entityName: 'John Doe',
      status: 'success',
      details: 'User account permanently deleted'
    },
    {
      id: 5,
      timestamp: '2024-01-15 10:05:15',
      user: 'proctor@example.com',
      action: 'Flagged suspicious activity',
      entityType: 'Proctoring',
      entityName: 'Exam Session #456',
      status: 'warning',
      details: 'Multiple tab switches detected'
    },
    {
      id: 6,
      timestamp: '2024-01-15 09:30:00',
      user: 'admin@example.com',
      action: 'Updated system settings',
      entityType: 'Settings',
      entityName: 'Email Configuration',
      status: 'success',
      details: 'SMTP settings updated'
    }
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = filterType === 'all' || log.status === filterType;
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.entityName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const paginatedData = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getStatusBadgeClass = (status: string) => {
    if (status === 'success') return 'status-active';
    if (status === 'failure') return 'status-warning';
    return 'status-draft';
  };

  return (
    <div className="audit-logs">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p className="subtitle">Monitor all system activities and user actions</p>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by user, action, or entity..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Events</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="warning">Warning</option>
        </select>
        <span className="results-count">{filteredLogs.length} log entries</span>
      </div>

      <table className="management-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: '12px' }}>{log.timestamp}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaUser style={{ color: '#667eea' }} />
                    {log.user}
                  </div>
                </td>
                <td><strong>{log.action}</strong></td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ background: '#f0f0f0', padding: '3px 8px', borderRadius: '4px' }}>
                      {log.entityType}
                    </span>
                    <div style={{ color: '#666', marginTop: '3px' }}>{log.entityName}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(log.status)}`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </td>
                <td style={{ fontSize: '12px', color: '#666' }}>{log.details}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#999' }}>No log entries found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="btn-pagination"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>
        <span className="page-info">Page {currentPage} of {totalPages || 1}</span>
        <button
          className="btn-pagination"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>

      {/* Security Summary */}
      <div style={{ marginTop: '30px' }}>
        <h2>Security Summary</h2>
        <div className="reports-grid">
          <div className="report-card">
            <h3>Failed Login Attempts</h3>
            <p style={{ color: '#999', marginBottom: '10px' }}>Last 24 hours</p>
            <div className="report-stats">
              <div className="report-stat">
                <span className="stat-label">Today</span>
                <span className="stat-value">3</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">This Week</span>
                <span className="stat-value">12</span>
              </div>
            </div>
          </div>
          <div className="report-card">
            <h3>Active Users</h3>
            <p style={{ color: '#999', marginBottom: '10px' }}>Currently online</p>
            <div className="report-stats">
              <div className="report-stat">
                <span className="stat-label">Admins</span>
                <span className="stat-value">5</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Evaluators</span>
                <span className="stat-value">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
