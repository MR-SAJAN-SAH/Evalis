import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiHelper';
import { 
  FaSignOutAlt, FaBook, FaAward, FaBell, FaCalendar, FaClock, FaCheckCircle, 
  FaChartLine, FaFilter, FaSearch, FaDownload, FaUser, FaCog, FaQuestionCircle,
  FaPlayCircle, FaLock, FaEye, FaArrowRight, FaTrophy, FaFire, FaLightbulb, FaCertificate, FaClipboardList,
  FaGraduationCap, FaStar, FaCodeBranch, FaCheckDouble, FaTimesCircle, FaSpinner
} from 'react-icons/fa';
import './CandidateDashboard.css';

interface Exam {
  id: string;
  code: string;
  name: string;
  subject: string;
  category: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  level: 'EASY' | 'MEDIUM' | 'HARD';
  examType: 'MCQ' | 'PROGRAMMING';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'CLOSED';
  startTime: string;
  endTime: string;
  negativeMarking: boolean;
  negativeMarkPercentage?: number;
  requireWebcam: boolean;
  fullScreenRequired: boolean;
  score?: number;
  completedAt?: string;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'exam' | 'result' | 'system';
}

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userEmail, logout, organizationName, accessToken } = useAuth();
  const token = accessToken;
  
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        console.log('Fetching exams with token:', token?.substring(0, 20) + '...');
        const response = await fetch(getApiUrl('/exams'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`Failed to fetch exams: ${response.status}`);
        }

        const data = await response.json();
        console.log('All exams received:', data);
        
        // Filter only published exams for candidates
        const publishedExams = Array.isArray(data) 
          ? data.filter((exam: any) => exam.status === 'PUBLISHED')
          : [];
        console.log('Published exams filtered:', publishedExams);
        setExams(publishedExams);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching exams:', err);
        setError(`Failed to load exams: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchExams();
    } else {
      console.warn('No token found');
      setError('Not authenticated. Please log in.');
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStartExam = (examId: string) => {
    navigate(`/candidate/exam/${examId}`);
  };

  const handleViewResults = (examId: string) => {
    navigate(`/candidate/results/${examId}`);
  };

  // Calculate statistics
  const availableExams = exams.filter(e => {
    const now = new Date();
    const startTime = new Date(e.startTime);
    const endTime = new Date(e.endTime);
    return now >= startTime && now <= endTime;
  }).length;

  const completedExams = 0;
  const totalExams = exams.length;

  // Get level color
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'EASY': return 'easy';
      case 'MEDIUM': return 'medium';
      case 'HARD': return 'hard';
      default: return 'default';
    }
  };

  // Get level icon
  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'EASY': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HARD': return '🔴';
      default: return '⚪';
    }
  };

  // Filter exams
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || exam.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  // Check if exam is available now
  const isExamAvailable = (exam: Exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    return now >= startTime && now <= endTime;
  };

  const getTimeRemaining = (exam: Exam) => {
    const now = new Date();
    const endTime = new Date(exam.endTime);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="candidate-dashboard">
      {/* Header */}
      <header className="candidate-header">
        <div className="header-container">
          <div className="header-left">
            <div className="brand">
              <FaGraduationCap className="brand-icon" />
              <div className="brand-text">
                <h1>Assessment Portal</h1>
                <p>{organizationName || 'Test Platform'}</p>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="search-bar">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search exams by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="header-right">
            <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell />
              <span className="notification-badge">0</span>
            </button>

            <div className="user-menu">
              <div className="user-avatar">{userEmail?.charAt(0).toUpperCase()}</div>
              <div className="user-dropdown">
                <p className="user-email">{userEmail}</p>
                <p className="user-role">Candidate</p>
                <hr />
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="candidate-main">
        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>{totalExams}</h3>
              <p>Total Exams</p>
              <span className="stat-detail">Available in platform</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{availableExams}</h3>
              <p>Available Now</p>
              <span className="stat-detail">Ready to attempt</span>
            </div>
          </div>

          <div className="stat-card accent">
            <div className="stat-icon">
              <FaFire />
            </div>
            <div className="stat-content">
              <h3>{completedExams}</h3>
              <p>Completed</p>
              <span className="stat-detail">Exams finished</span>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>0%</h3>
              <p>Avg Score</p>
              <span className="stat-detail">Overall performance</span>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="tabs-section">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaBook /> Overview
            </button>
            <button 
              className={`tab ${activeTab === 'exams' ? 'active' : ''}`}
              onClick={() => setActiveTab('exams')}
            >
              <FaBook /> All Exams ({filteredExams.length})
            </button>
            <button 
              className={`tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <FaTrophy /> My Results
            </button>
            <button 
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> Settings
            </button>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-content">
            {/* Welcome Section */}
            <section className="welcome-section">
              <div className="welcome-card">
                <div className="welcome-icon">
                  <FaGraduationCap />
                </div>
                <div className="welcome-text">
                  <h2>Welcome back!</h2>
                  <p>You have <strong>{availableExams} exam{availableExams !== 1 ? 's' : ''}</strong> available to take right now. Challenge yourself and achieve your best score.</p>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <div className="action-card primary">
                  <FaPlayCircle className="action-icon" />
                  <h3>Start an Exam</h3>
                  <p>Begin taking an available exam</p>
                  <button className="action-btn" onClick={() => setActiveTab('exams')}>
                    Browse Exams <FaArrowRight />
                  </button>
                </div>

                <div className="action-card secondary">
                  <FaChartLine className="action-icon" />
                  <h3>My Performance</h3>
                  <p>Track your scores and progress</p>
                  <button className="action-btn" onClick={() => setActiveTab('results')}>
                    View Results <FaArrowRight />
                  </button>
                </div>

                <div className="action-card info">
                  <FaQuestionCircle className="action-icon" />
                  <h3>Exam Guidelines</h3>
                  <p>Learn how to take exams</p>
                  <button className="action-btn">Get Help</button>
                </div>

                <div className="action-card accent">
                  <FaDownload className="action-icon" />
                  <h3>Download Resources</h3>
                  <p>Download study materials</p>
                  <button className="action-btn">Download</button>
                </div>
              </div>
            </section>

            {/* Featured Exams */}
            {filteredExams.length > 0 && (
              <section className="featured-exams">
                <h2>Featured Exams</h2>
                <div className="featured-grid">
                  {filteredExams.slice(0, 3).map(exam => (
                    <div key={exam.id} className={`featured-card ${getLevelColor(exam.level)}`}>
                      <div className="card-header">
                        <h3>{exam.name}</h3>
                        <span className="level-badge">{getLevelIcon(exam.level)} {exam.level}</span>
                      </div>
                      <p className="subject">{exam.subject}</p>
                      <div className="card-meta">
                        <div className="meta-item">
                          <FaClock /> <span>{exam.durationMinutes} min</span>
                        </div>
                        <div className="meta-item">
                          <FaQuestionCircle /> <span>{exam.totalQuestions} Q's</span>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="time-left">{getTimeRemaining(exam)}</span>
                        {isExamAvailable(exam) ? (
                          <button 
                            className="btn-start" 
                            onClick={() => handleStartExam(exam.id)}
                          >
                            Start Now <FaArrowRight />
                          </button>
                        ) : (
                          <button className="btn-disabled" disabled>
                            Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* All Exams Tab */}
        {activeTab === 'exams' && (
          <div className="tab-content exams-content">
            <section className="exams-section">
              <div className="section-header">
                <h2>All Available Exams</h2>
                <div className="filters-group">
                  <select 
                    value={filterLevel} 
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Levels</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading-exams">
                  <FaSpinner className="spinner" />
                  <p>Loading exams...</p>
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="empty-state">
                  <FaBook className="empty-icon" />
                  <p>No exams found matching your criteria</p>
                </div>
              ) : (
                <div className="exams-list">
                  {filteredExams.map(exam => (
                    <div key={exam.id} className={`exam-item level-${getLevelColor(exam.level)}`}>
                      <div className="exam-header">
                        <div className="exam-info">
                          <h3>{exam.name}</h3>
                          <p className="subject">{exam.subject} • {exam.category}</p>
                        </div>
                        <div className="exam-meta-right">
                          <span className={`level-badge level-${getLevelColor(exam.level)}`}>
                            {getLevelIcon(exam.level)} {exam.level}
                          </span>
                          <span className="exam-type">
                            {exam.examType === 'MCQ' ? '📝 MCQ' : '💻 Programming'}
                          </span>
                        </div>
                      </div>

                      <div className="exam-description">
                        {exam.description && <p>{exam.description.substring(0, 150)}...</p>}
                      </div>

                      <div className="exam-details-grid">
                        <div className="detail">
                          <FaClock /> 
                          <span><strong>{exam.durationMinutes}</strong> Minutes</span>
                        </div>
                        <div className="detail">
                          <FaQuestionCircle /> 
                          <span><strong>{exam.totalQuestions}</strong> Questions</span>
                        </div>
                        <div className="detail">
                          <FaTrophy /> 
                          <span><strong>{exam.totalMarks}</strong> Marks</span>
                        </div>
                        <div className="detail">
                          <FaCheckCircle /> 
                          <span><strong>{exam.passingScore}</strong> Pass</span>
                        </div>
                      </div>

                      <div className="exam-footer">
                        <div className="exam-status">
                          {isExamAvailable(exam) ? (
                            <span className="status-available">✅ Available Now</span>
                          ) : (
                            <span className="status-unavailable">⏰ {getTimeRemaining(exam)}</span>
                          )}
                        </div>
                        {isExamAvailable(exam) ? (
                          <button 
                            className="btn-primary" 
                            onClick={() => handleStartExam(exam.id)}
                          >
                            <FaPlayCircle /> Start Exam
                          </button>
                        ) : (
                          <button className="btn-disabled" disabled>
                            Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="tab-content results-content">
            <section className="results-section">
              <h2>Your Results & Performance</h2>
              <div className="empty-state">
                <FaAward className="empty-icon" />
                <p>You haven't completed any exams yet</p>
                <button className="btn-primary" onClick={() => setActiveTab('exams')}>
                  Start Taking Exams
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-content settings-content">
            <section className="settings-section">
              <h2>Account Settings</h2>
              
              <div className="settings-group">
                <h3>Profile Information</h3>
                <div className="setting-item">
                  <label>Email Address</label>
                  <input type="email" value={userEmail || ''} disabled />
                </div>
                <div className="setting-item">
                  <label>Organization</label>
                  <input type="text" value={organizationName || ''} disabled />
                </div>
                <div className="setting-item">
                  <label>Role</label>
                  <input type="text" value="Candidate" disabled />
                </div>
              </div>

              <div className="settings-group">
                <h3>Preferences</h3>
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable Email Notifications
                  </label>
                </div>
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" defaultChecked /> Show Exam Reminders
                  </label>
                </div>
                <div className="setting-item checkbox">
                  <label>
                    <input type="checkbox" /> Use Dark Mode (Coming Soon)
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h3>Security</h3>
                <button className="btn-secondary">Change Password</button>
                <button className="btn-secondary">Two-Factor Authentication</button>
              </div>

              <div className="settings-group">
                <h3>Help & Support</h3>
                <button className="btn-secondary">Contact Support</button>
                <button className="btn-secondary">View FAQ</button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default CandidateDashboard;
