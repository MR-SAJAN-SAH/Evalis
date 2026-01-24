import React from 'react';
import { FaEye } from 'react-icons/fa';

const LiveMonitoring = () => {
  return (
    <div className="live-monitoring">
      <div className="page-header">
        <h1>Live Proctoring Dashboard</h1>
        <p className="subtitle">Monitor ongoing exams in real-time</p>
      </div>

      <div className="monitoring-grid">
        <div className="monitoring-card">
          <div className="monitoring-header">
            <h3>Java Programming Exam</h3>
            <span className="status-badge status-active">Live</span>
          </div>
          <div className="monitoring-info">
            <p><strong>Candidate:</strong> John Doe</p>
            <p><strong>Time Remaining:</strong> 45 minutes</p>
            <p><strong>Progress:</strong> 60% (30/50 questions)</p>
            <p><strong>Status:</strong> Normal</p>
          </div>
        </div>

        <div className="monitoring-card">
          <div className="monitoring-header">
            <h3>Data Structures Exam</h3>
            <span className="status-badge status-warning">Flagged</span>
          </div>
          <div className="monitoring-info">
            <p><strong>Candidate:</strong> Jane Smith</p>
            <p><strong>Time Remaining:</strong> 20 minutes</p>
            <p><strong>Progress:</strong> 85% (34/40 questions)</p>
            <p><strong>Status:</strong> Suspicious Activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
