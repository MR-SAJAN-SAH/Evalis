import React, { useState } from 'react';
import { FaFilter, FaSync, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

const PendingEvaluations = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const pendingEvaluations = [
    {
      id: 1,
      examName: 'Java Programming',
      candidateName: 'Rajesh Kumar',
      candidateEmail: 'rajesh@example.com',
      submittedDate: '2024-01-15',
      score: '75/100',
      status: 'pending',
      evaluator: 'Not Assigned'
    },
    {
      id: 2,
      examName: 'Data Structures',
      candidateName: 'Priya Singh',
      candidateEmail: 'priya@example.com',
      submittedDate: '2024-01-14',
      score: '82/100',
      status: 'in-progress',
      evaluator: 'Dr. Sharma'
    },
    {
      id: 3,
      examName: 'Web Development',
      candidateName: 'Anil Patel',
      candidateEmail: 'anil@example.com',
      submittedDate: '2024-01-13',
      score: '65/100',
      status: 'pending',
      evaluator: 'Not Assigned'
    },
    {
      id: 4,
      examName: 'Database Design',
      candidateName: 'Sneha Gupta',
      candidateEmail: 'sneha@example.com',
      submittedDate: '2024-01-12',
      score: '88/100',
      status: 'completed',
      evaluator: 'Prof. Singh'
    },
    {
      id: 5,
      examName: 'System Design',
      candidateName: 'Vikram Reddy',
      candidateEmail: 'vikram@example.com',
      submittedDate: '2024-01-11',
      score: '70/100',
      status: 'pending',
      evaluator: 'Not Assigned'
    }
  ];

  const filteredEvaluations = pendingEvaluations.filter(evaluation => {
    const matchesFilter = filterStatus === 'all' || evaluation.status === filterStatus;
    const matchesSearch = evaluation.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evaluation.examName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const paginatedData = filteredEvaluations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);

  return (
    <div className="pending-evaluations">
      <div className="page-header">
        <h1>Pending Evaluations</h1>
        <p className="subtitle">Review and manage pending candidate evaluations</p>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <i className="fa fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by candidate name or exam..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn-primary">
          <FaSync /> Refresh
        </button>
        <span className="results-count">{filteredEvaluations.length} evaluations</span>
      </div>

      <table className="management-table">
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Exam</th>
            <th>Submitted Date</th>
            <th>Score</th>
            <th>Evaluator</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((evaluation) => (
              <tr key={evaluation.id}>
                <td>
                  <div>
                    <strong>{evaluation.candidateName}</strong>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
                      {evaluation.candidateEmail}
                    </div>
                  </div>
                </td>
                <td>{evaluation.examName}</td>
                <td>{evaluation.submittedDate}</td>
                <td><strong>{evaluation.score}</strong></td>
                <td>{evaluation.evaluator}</td>
                <td>
                  <span className={`status-badge status-${evaluation.status}`}>
                    {evaluation.status === 'in-progress' ? 'In Progress' : 
                     evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn-icon view" title="View Details">
                      <FaEye />
                    </button>
                    <button className="btn-icon edit" title="Evaluate">
                      <FaCheck />
                    </button>
                    <button className="btn-icon delete" title="Reject">
                      <FaTimes />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#999' }}>No evaluations found</p>
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
    </div>
  );
};

export default PendingEvaluations;
