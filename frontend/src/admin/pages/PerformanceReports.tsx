import React from 'react';
import { FaChartBar } from 'react-icons/fa';

const PerformanceReports = () => {
  const reports = [
    {
      id: 1,
      examName: 'Java Programming',
      totalCandidates: 45,
      passCount: 38,
      averageScore: 76.5,
      passPercentage: 84.4,
    },
    {
      id: 2,
      examName: 'Data Structures',
      totalCandidates: 38,
      passCount: 28,
      averageScore: 68.2,
      passPercentage: 73.7,
    },
    {
      id: 3,
      examName: 'Web Development',
      totalCandidates: 52,
      passCount: 44,
      averageScore: 81.3,
      passPercentage: 84.6,
    },
  ];

  return (
    <div className="performance-reports">
      <div className="page-header">
        <h1>Performance Reports</h1>
      </div>

      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <h3>{report.examName}</h3>
            <div className="report-stats">
              <div className="report-stat">
                <span className="stat-label">Total Candidates</span>
                <span className="stat-value">{report.totalCandidates}</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Pass Count</span>
                <span className="stat-value">{report.passCount}</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Average Score</span>
                <span className="stat-value">{report.averageScore}</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Pass %</span>
                <span className="stat-value">{report.passPercentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceReports;
