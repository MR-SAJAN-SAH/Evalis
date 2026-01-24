import React, { useState } from 'react';
import { FaSearch, FaFilter, FaDownload, FaChartBar } from 'react-icons/fa';

const ResultsAnalytics = () => {
  const [selectedExam, setSelectedExam] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const analyticsData = {
    overview: {
      totalCandidates: 245,
      totalAttempted: 198,
      averageScore: 72.5,
      passPercentage: 68.5
    },
    exams: [
      {
        id: 1,
        name: 'Java Programming',
        candidates: 45,
        attempted: 42,
        average: 75.3,
        passed: 32,
        passRate: 76.2
      },
      {
        id: 2,
        name: 'Data Structures',
        candidates: 52,
        attempted: 48,
        average: 70.8,
        passed: 30,
        passRate: 62.5
      },
      {
        id: 3,
        name: 'Web Development',
        candidates: 38,
        attempted: 35,
        average: 68.2,
        passed: 20,
        passRate: 57.1
      },
      {
        id: 4,
        name: 'Database Design',
        candidates: 55,
        attempted: 42,
        average: 74.5,
        passed: 32,
        passRate: 76.2
      },
      {
        id: 5,
        name: 'System Design',
        candidates: 55,
        attempted: 31,
        average: 71.2,
        passed: 18,
        passRate: 58.1
      }
    ]
  };

  return (
    <div className="results-analytics">
      <div className="page-header">
        <h1>Results & Analytics</h1>
        <p className="subtitle">Analyze exam results and performance trends</p>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.overview.totalCandidates}</h3>
            <p>Total Candidates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.overview.totalAttempted}</h3>
            <p>Total Attempted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.overview.averageScore.toFixed(1)}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.overview.passPercentage.toFixed(1)}%</h3>
            <p>Pass Rate</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="management-filters" style={{ marginBottom: '20px' }}>
        <select
          className="filter-select"
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
        >
          <option value="all">All Exams</option>
          {analyticsData.exams.map(exam => (
            <option key={exam.id} value={exam.id}>{exam.name}</option>
          ))}
        </select>
        <select className="filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
        <button className="btn-primary">
          <FaDownload /> Export Report
        </button>
      </div>

      {/* Exam Results Table */}
      <table className="management-table">
        <thead>
          <tr>
            <th>Exam Name</th>
            <th>Total Candidates</th>
            <th>Attempted</th>
            <th>Average Score</th>
            <th>Passed</th>
            <th>Pass Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {analyticsData.exams.map((exam) => (
            <tr key={exam.id}>
              <td><strong>{exam.name}</strong></td>
              <td>{exam.candidates}</td>
              <td>{exam.attempted}</td>
              <td>{exam.average.toFixed(1)}%</td>
              <td>{exam.passed}</td>
              <td>
                <span className={`status-badge ${exam.passRate >= 70 ? 'status-active' : 'status-warning'}`}>
                  {exam.passRate.toFixed(1)}%
                </span>
              </td>
              <td>
                <button className="btn-icon view" title="View Details">📊</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detailed Analytics Section */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Score Distribution</h2>
        <div className="reports-grid">
          <div className="report-card">
            <h3>Score Ranges</h3>
            <div className="report-stats">
              <div className="report-stat">
                <span className="stat-label">90-100</span>
                <span className="stat-value">28</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">80-89</span>
                <span className="stat-value">45</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">70-79</span>
                <span className="stat-value">52</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">60-69</span>
                <span className="stat-value">35</span>
              </div>
            </div>
          </div>
          <div className="report-card">
            <h3>Performance Trend</h3>
            <p style={{ color: '#999', marginBottom: '10px' }}>Average score improved by 2.5% this month</p>
            <div className="report-stats">
              <div className="report-stat">
                <span className="stat-label">This Week</span>
                <span className="stat-value">71.8%</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Last Week</span>
                <span className="stat-value">70.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsAnalytics;
