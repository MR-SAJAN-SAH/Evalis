import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload, FaChartBar, FaSpinner, FaSync, FaExclamationTriangle, FaTimes, FaCheck, FaTimes as FaX, FaChartPie, FaChartLine } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../../context/AuthContext';

interface AnalyticsData {
  overview: {
    totalCandidates: number;
    totalAttempted: number;
    averageScore: number;
    passPercentage: number;
  };
  exams: Array<{
    id: string;
    name: string;
    code: string;
    subject: string;
    totalCandidates: number;
    attempted: number;
    averageScore: number;
    passed: number;
    passRate: number;
  }>;
}

interface CandidateSubmission {
  id: string;
  candidateName: string;
  candidateEmail: string;
  score: string | number;
  totalMarks: number;
  passingScore: number;
  status: 'PASSED' | 'FAILED';
  submittedAt: string;
}

const ResultsAnalytics = () => {
  const { accessToken } = useAuth();
  const [selectedExam, setSelectedExam] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [modalView, setModalView] = useState<'table' | 'graphs'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch analytics data from API
  const fetchAnalyticsData = async (isInitial: boolean = false) => {
    try {
      // Only set loading on initial load, use isRefreshing for background updates
      if (isInitial) setLoading(true);
      else setIsRefreshing(true);
      
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/exams/published/analytics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Analytics data received:', data);
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('❌ Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      if (isInitial) setLoading(false);
      else setIsRefreshing(false);
    }
  };

  // Fetch candidate submissions for a specific exam
  const fetchCandidateSubmissions = async (examId: string) => {
    try {
      setSubmissionsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Fetch submissions data
      const submissionsResponse = await fetch(`${apiUrl}/api/exams/${examId}/submissions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!submissionsResponse.ok) {
        throw new Error(`Failed to fetch submissions: ${submissionsResponse.statusText}`);
      }

      const submissionsData = await submissionsResponse.json();
      console.log('📋 Submissions received:', submissionsData);
      
      // Get exam details to know the passingScore
      const examResponse = await fetch(`${apiUrl}/api/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!examResponse.ok) {
        throw new Error(`Failed to fetch exam details: ${examResponse.statusText}`);
      }

      const examData = await examResponse.json();
      console.log('📖 Exam data received:', examData);
      
      // Transform ExamSubmission data to CandidateSubmission format
      const transformedSubmissions: CandidateSubmission[] = (Array.isArray(submissionsData) ? submissionsData : submissionsData.submissions || []).map((submission: any) => {
        const candidateName = submission.candidate?.firstName && submission.candidate?.lastName 
          ? `${submission.candidate.firstName} ${submission.candidate.lastName}`
          : submission.candidate?.email || 'Unknown';
        
        // Backend now returns score as percentage (0-100), not marks
        const scorePercentage = submission.score || 0;
        const totalMarks = submission.totalMarks || examData.totalMarks || 0;
        const passingScore = examData.passingScore || 70;
        const status = scorePercentage >= passingScore ? 'PASSED' : 'FAILED';
        
        return {
          id: submission.id,
          candidateName,
          candidateEmail: submission.candidate?.email || 'Unknown',
          score: `${Math.round(scorePercentage)}%`,
          totalMarks,
          passingScore,
          status,
          submittedAt: submission.submittedAt || new Date().toISOString(),
        };
      });
      
      // Remove duplicates - keep only the latest submission per candidate (since already sorted DESC)
      const deduplicatedSubmissions: CandidateSubmission[] = [];
      const seenEmails = new Set<string>();
      for (const sub of transformedSubmissions) {
        if (!seenEmails.has(sub.candidateEmail)) {
          seenEmails.add(sub.candidateEmail);
          deduplicatedSubmissions.push(sub);
        }
      }
      
      setSubmissions(deduplicatedSubmissions);
      setSelectedExamId(examId);
      setShowSubmissionsModal(true);
    } catch (err: any) {
      console.error('❌ Error fetching submissions:', err);
      alert(`Failed to fetch submissions: ${err.message}`);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Calculate chart data from submissions
  const getScoreDistributionData = () => {
    const ranges = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '20-40', min: 20, max: 40, count: 0 },
      { range: '40-60', min: 40, max: 60, count: 0 },
      { range: '60-80', min: 60, max: 80, count: 0 },
      { range: '80-100', min: 80, max: 100, count: 0 },
    ];

    submissions.forEach((sub) => {
      // Score is now stored as percentage string like "38%"
      const scoreNum = typeof sub.score === 'string' ? parseFloat(sub.score.replace('%', '')) : (sub.score || 0);
      const range = ranges.find((r) => scoreNum >= r.min && scoreNum < r.max);
      if (range) range.count++;
    });

    return ranges;
  };

  const getPassFailData = () => {
    const passed = submissions.filter((s) => s.status === 'PASSED').length;
    const failed = submissions.filter((s) => s.status === 'FAILED').length;
    return [
      { name: 'Passed', value: passed, color: '#43e97b' },
      { name: 'Failed', value: failed, color: '#f5576c' },
    ];
  };

  const getScoreTrendData = () => {
    const sorted = [...submissions].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    return sorted.slice(0, 10).map((sub, idx) => {
      // Score is now stored as percentage string like "38%"
      const scoreNum = typeof sub.score === 'string' ? parseFloat(sub.score.replace('%', '')) : (sub.score || 0);
      return {
        name: `Candidate ${idx + 1}`,
        score: scoreNum,
        candidateName: sub.candidateName,
      };
    });
  };

  const getStatistics = () => {
    if (submissions.length === 0) return { avg: 0, max: 0, min: 0, median: 0 };
    
    const scores: number[] = submissions.map((s) => {
      // Score is now stored as percentage string like "38%"
      const scoreNum = typeof s.score === 'string' ? parseFloat(s.score.replace('%', '')) : (s.score || 0);
      return scoreNum;
    });
    const sorted = scores.sort((a, b) => a - b);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
      : sorted[Math.floor(sorted.length / 2)];

    return { avg: avg.toFixed(1), max: max.toFixed(1), min: min.toFixed(1), median: median.toFixed(1) };
  };

  // Fetch on component mount and also refresh periodically
  useEffect(() => {
    fetchAnalyticsData(true); // Initial load - show loading state
    
    // Set up periodic refresh every 10 seconds for real-time updates (silent background refresh)
    const interval = setInterval(() => {
      fetchAnalyticsData(false); // Background refresh - no loading state
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="results-analytics">
        <div className="page-header">
          <h1>Results & Analytics</h1>
          <p className="subtitle">Analyze exam results and performance trends</p>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaSpinner className="spinner-icon" style={{ fontSize: '40px', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-analytics">
        <div className="page-header">
          <h1>Results & Analytics</h1>
          <p className="subtitle">Analyze exam results and performance trends</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff3cd', borderRadius: '8px', margin: '20px' }}>
          <FaExclamationTriangle style={{ fontSize: '30px', marginBottom: '10px', color: '#856404' }} />
          <h3 style={{ color: '#856404' }}>Error Loading Analytics</h3>
          <p style={{ color: '#856404', marginBottom: '15px' }}>{error}</p>
          <button 
            className="btn-primary" 
            onClick={() => fetchAnalyticsData(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
          >
            <FaSync /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="results-analytics">
        <div className="page-header">
          <h1>Results & Analytics</h1>
          <p className="subtitle">Analyze exam results and performance trends</p>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>No analytics data available. Publish an exam to see results.</p>
        </div>
      </div>
    );
  }

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
          {analyticsData.exams && analyticsData.exams.length > 0 ? (
            analyticsData.exams.map((exam) => (
              <tr key={exam.id}>
                <td><strong>{exam.name}</strong></td>
                <td>{exam.totalCandidates}</td>
                <td>{exam.attempted}</td>
                <td>{exam.averageScore.toFixed(1)}%</td>
                <td>{exam.passed}</td>
                <td>
                  <span className={`status-badge ${exam.passRate >= 70 ? 'status-active' : 'status-warning'}`}>
                    {exam.passRate.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-icon view" 
                    title="View Candidate Submissions"
                    onClick={() => fetchCandidateSubmissions(exam.id)}
                  >
                    📊
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                No exam data available
              </td>
            </tr>
          )}
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

      {/* Candidate Submissions Modal */}
      {showSubmissionsModal && (
        <div className="modal-overlay" onClick={() => setShowSubmissionsModal(false)}>
          <div className="modal-content submissions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Candidate Submissions & Analytics</h2>
              <button className="close-btn" onClick={() => setShowSubmissionsModal(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', background: '#f8f9fa' }}>
              <button
                onClick={() => setModalView('table')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: modalView === 'table' ? 'white' : 'transparent',
                  borderBottom: modalView === 'table' ? '3px solid #2196f3' : 'none',
                  cursor: 'pointer',
                  fontWeight: modalView === 'table' ? '600' : 'normal',
                  color: modalView === 'table' ? '#2196f3' : '#666',
                  transition: 'all 0.2s',
                }}
              >
                📋 Submissions List
              </button>
              <button
                onClick={() => setModalView('graphs')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: modalView === 'graphs' ? 'white' : 'transparent',
                  borderBottom: modalView === 'graphs' ? '3px solid #2196f3' : 'none',
                  cursor: 'pointer',
                  fontWeight: modalView === 'graphs' ? '600' : 'normal',
                  color: modalView === 'graphs' ? '#2196f3' : '#666',
                  transition: 'all 0.2s',
                }}
              >
                📊 Analytics & Graphs
              </button>
            </div>

            <div className="modal-body" style={{ background: '#fff' }}>
              {submissionsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FaSpinner className="spinner-icon" style={{ fontSize: '30px', animation: 'spin 1s linear infinite' }} />
                  <p>Loading submissions...</p>
                </div>
              ) : modalView === 'table' ? (
                // TABLE VIEW
                submissions.length > 0 ? (
                  <table className="submissions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Candidate Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Score</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Total Marks</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>
                            <strong>{submission.candidateName}</strong>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <a href={`mailto:${submission.candidateEmail}`} style={{ color: '#2196f3', textDecoration: 'none' }}>
                              {submission.candidateEmail}
                            </a>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                            {submission.score}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {submission.totalMarks}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: submission.status === 'PASSED' ? '#d4edda' : '#f8d7da',
                                color: submission.status === 'PASSED' ? '#155724' : '#721c24',
                              }}
                            >
                              {submission.status === 'PASSED' ? <FaCheck /> : <FaX />}
                              {submission.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <p>No submissions yet</p>
                  </div>
                )
              ) : (
                // GRAPHS VIEW
                submissions.length > 0 ? (
                  <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 180px)' }}>
                    {/* Statistics Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                      {(() => {
                        const stats = getStatistics();
                        return (
                          <>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>Average Score</p>
                              <h3 style={{ margin: 0, fontSize: '28px', color: '#2196f3' }}>{stats.avg}%</h3>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>Highest Score</p>
                              <h3 style={{ margin: 0, fontSize: '28px', color: '#43e97b' }}>{stats.max}%</h3>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>Lowest Score</p>
                              <h3 style={{ margin: 0, fontSize: '28px', color: '#f5576c' }}>{stats.min}%</h3>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>Median Score</p>
                              <h3 style={{ margin: 0, fontSize: '28px', color: '#667eea' }}>{stats.median}%</h3>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Charts Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                      {/* Pass/Fail Pie Chart */}
                      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Pass/Fail Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={getPassFailData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getPassFailData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} candidates`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Score Distribution Bar Chart */}
                      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Score Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={getScoreDistributionData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#667eea" name="Number of Candidates" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Score Trend Line Chart */}
                      {submissions.length > 1 && (
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', gridColumn: 'span 1' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Score Trend (Last 10)</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getScoreTrendData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip formatter={(value) => `${value}%`} />
                              <Legend />
                              <Line type="monotone" dataKey="score" stroke="#2196f3" name="Score %" strokeWidth={2} dot={{ fill: '#2196f3' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <p>No submissions yet to display analytics</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsAnalytics;
