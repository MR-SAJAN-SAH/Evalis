// src/pages/candidate/CandidateDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdvancedClassroom from './AdvancedClassroom';
import { 
  FaSignOutAlt, FaBook, FaAward, FaBell, FaCalendar, FaClock, FaCheckCircle, 
  FaChartLine, FaFilter, FaSearch, FaDownload, FaUser, FaCog, FaQuestionCircle,
  FaPlayCircle, FaLock, FaEye, FaArrowRight, FaTrophy, FaFire, FaLightbulb, FaCertificate, FaClipboardList,
  FaGraduationCap, FaStar, FaCodeBranch, FaCheckDouble, FaTimesCircle, FaSpinner, FaHistory, FaUserGraduate, FaChalkboard,
  FaComments, FaUpload, FaDownload as FaDownloadFile, FaPaperclip, FaPlus, FaChevronRight
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
  const location = useLocation();
  const { userEmail, logout, organizationName, accessToken } = useAuth();
  const token = accessToken;
  
  // Get active tab from URL
  const getActiveTabFromUrl = (): string => {
    const pathname = location.pathname;
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    
    const validTabs = ['dashboard', 'exams', 'schedule', 'results', 'classroom', 'history', 'settings'];
    return validTabs.includes(lastSegment) ? lastSegment : 'dashboard';
  };
  
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    pendingExams: 0,
    averageScore: 0,
    rank: 0,
    percentile: 0
  });
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<Exam[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  // Sync URL with activeTab
  useEffect(() => {
    const tabFromUrl = getActiveTabFromUrl();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  // Fetch exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        console.log('📡 [CANDIDATE] Fetching exams...');
        console.log('🔐 Token available:', !!token);
        
        const response = await fetch('/api/exams', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📊 [CANDIDATE] API Response Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [CANDIDATE] API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ [CANDIDATE] Raw API Response:', data);
        
        // Filter only published exams for candidates
        let publishedExams: Exam[] = [];
        
        if (Array.isArray(data)) {
          publishedExams = data.filter((exam: any) => exam.status === 'PUBLISHED');
        } else if (data?.data && Array.isArray(data.data)) {
          publishedExams = data.data.filter((exam: any) => exam.status === 'PUBLISHED');
        } else if (data?.exams && Array.isArray(data.exams)) {
          publishedExams = data.exams.filter((exam: any) => exam.status === 'PUBLISHED');
        }
        
        console.log('📚 [CANDIDATE] Published exams found:', publishedExams.length);
        console.log('📋 [CANDIDATE] Exams:', publishedExams);
        
        setExams(publishedExams);
        setError(null);
        
        // Update stats
        updateStats(publishedExams);
        updateCategoryExams(publishedExams);
        
        if (publishedExams.length === 0) {
          console.warn('⚠️ [CANDIDATE] No published exams available');
        }
      } catch (err: any) {
        console.error('❌ [CANDIDATE] Error fetching exams:', err.message);
        setError(`Failed to load exams: ${err.message}`);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchExams();
    } else {
      setLoading(false);
      setError('Not authenticated. Please log in.');
      console.warn('⚠️ [CANDIDATE] No token available');
    }
  }, [token]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000);
    return () => clearInterval(interval);
  }, [upcomingExams]);

  const updateStats = (exams: Exam[]) => {
    const now = new Date();
    const upcoming = exams.filter(e => new Date(e.startTime) > now);
    const completed = exams.filter(e => e.completedAt);

    setStats({
      totalExams: exams.length,
      completedExams: completed.length,
      pendingExams: upcoming.length,
      averageScore: completed.length > 0 
        ? Math.round(completed.reduce((sum, e) => sum + (e.score || 0), 0) / completed.length)
        : 0,
      rank: 1,
      percentile: 85
    });
  };

  const updateCategoryExams = (allExams: Exam[]) => {
    const now = new Date();
    const upcoming = allExams.filter(e => new Date(e.startTime) > now);
    const completed = allExams.filter(e => e.completedAt);
    
    setUpcomingExams(upcoming.slice(0, 5));
    setCompletedExams(completed.slice(0, 5));
  };

  const updateCountdowns = () => {
    const newTimeRemaining: { [key: string]: string } = {};
    upcomingExams.forEach(exam => {
      newTimeRemaining[exam.id] = calculateTimeRemaining(exam.startTime);
    });
    setTimeRemaining(newTimeRemaining);
  };

  const calculateTimeRemaining = (startTime: string) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const diff = start - now;

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}`);
  };

  const handleViewResults = (examId: string) => {
    navigate(`/exam/${examId}/results`);
  };

  const formatExamDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || exam.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'EASY': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'HARD': return '#f44336';
      default: return '#2196f3';
    }
  };

  if (loading) {
    return (
      <div className="candidate-dashboard-loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
        </div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="candidate-sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">E</div>
          <div>
            <h3>Evalis</h3>
            <p>Candidate Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              navigate('/candidate/dashboard');
            }}
          >
            <FaChartLine /> Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('exams');
              navigate('/candidate/dashboard/exams');
            }}
          >
            <FaBook /> Available Exams
          </button>
          <button 
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('schedule');
              navigate('/candidate/dashboard/schedule');
            }}
          >
            <FaCalendar /> Schedule
          </button>
          <button 
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('results');
              navigate('/candidate/dashboard/results');
            }}
          >
            <FaTrophy /> Results
          </button>
          <button 
            className={`nav-item ${activeTab === 'classroom' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('classroom');
              navigate('/candidate/dashboard/classroom');
            }}
          >
            <FaChalkboard /> Classroom
          </button>
          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              navigate('/candidate/dashboard/history');
            }}
          >
            <FaHistory /> History
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              navigate('/candidate/dashboard/settings');
            }}
          >
            <FaCog /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <FaUser className="user-icon" />
            <div>
              <p className="user-email">{userEmail}</p>
              <p className="user-org">{organizationName}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="candidate-main">
        {/* Header */}
        <header className="candidate-header">
          <div className="header-top">
            <h1>{activeTab === 'dashboard' && 'Dashboard'}
               {activeTab === 'exams' && 'Available Exams'}
               {activeTab === 'schedule' && 'Exam Schedule'}
               {activeTab === 'results' && 'Your Results'}
               {activeTab === 'classroom' && 'Classroom'}
               {activeTab === 'history' && 'Exam History'}
               {activeTab === 'settings' && 'Settings'}</h1>
            <div className="header-actions">
              <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                <FaBell />
                {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <section className="candidate-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-section">
              {/* Welcome Card */}
              <div className="welcome-card">
                <div className="welcome-content">
                  <h2>Welcome to Evalis Candidate Portal</h2>
                  <p>Track your exam progress and start new assessments</p>
                </div>
                <button className="welcome-btn" onClick={() => setActiveTab('exams')}>
                  <FaPlayCircle /> Start an Exam
                </button>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon" style={{ color: '#667eea' }}>
                    <FaBook />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalExams}</h3>
                    <p>Total Exams</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon" style={{ color: '#10b981' }}>
                    <FaCheckCircle />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.completedExams}</h3>
                    <p>Completed</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon" style={{ color: '#f59e0b' }}>
                    <FaClock />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.pendingExams}</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon" style={{ color: '#ec4899' }}>
                    <FaChartLine />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.averageScore}%</h3>
                    <p>Avg Score</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Exams */}
              <div className="exams-section">
                <div className="section-header">
                  <h3><FaCalendar /> Upcoming Exams</h3>
                  <button className="view-all-btn" onClick={() => setActiveTab('schedule')}>
                    View All <FaArrowRight />
                  </button>
                </div>
                
                {upcomingExams.length > 0 ? (
                  <div className="exams-list">
                    {upcomingExams.slice(0, 3).map(exam => (
                      <div key={exam.id} className="exam-item">
                        <div className="exam-item-header">
                          <h4>{exam.name}</h4>
                          <span className="level-badge" style={{ backgroundColor: getLevelColor(exam.level) }}>
                            {exam.level}
                          </span>
                        </div>
                        <div className="exam-item-meta">
                          <span><FaClock /> {formatExamDuration(exam.durationMinutes)}</span>
                          <span><FaClipboardList /> {exam.totalQuestions} questions</span>
                          <span>{exam.subject}</span>
                        </div>
                        <div className="exam-item-footer">
                          <span className="countdown">Starts in: {timeRemaining[exam.id] || 'Calculating...'}</span>
                          <button 
                            className="start-btn"
                            onClick={() => handleStartExam(exam.id)}
                          >
                            Start Exam
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaCalendar />
                    <p>No upcoming exams at the moment</p>
                  </div>
                )}
              </div>

              {/* Recent Results */}
              {completedExams.length > 0 && (
                <div className="exams-section">
                  <div className="section-header">
                    <h3><FaTrophy /> Recent Results</h3>
                    <button className="view-all-btn" onClick={() => setActiveTab('results')}>
                      View All <FaArrowRight />
                    </button>
                  </div>
                  <div className="results-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Exam</th>
                          <th>Score</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedExams.slice(0, 5).map(exam => (
                          <tr key={exam.id}>
                            <td>
                              <div>
                                <strong>{exam.name}</strong>
                                <small>{exam.subject}</small>
                              </div>
                            </td>
                            <td>
                              <span className={`score-badge ${(exam.score || 0) >= 70 ? 'pass' : 'fail'}`}>
                                {exam.score}%
                              </span>
                            </td>
                            <td>{exam.completedAt ? new Date(exam.completedAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <button 
                                className="view-btn"
                                onClick={() => handleViewResults(exam.id)}
                              >
                                <FaEye /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Available Exams Tab */}
          {activeTab === 'exams' && (
            <div className="exams-tab">
              <div className="tab-controls">
                <div className="search-bar">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search exams by name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filters">
                  <select 
                    className="filter-select"
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="error-banner">
                  <p>⚠️ {error}</p>
                </div>
              )}

              {loading && (
                <div className="loading-exams">
                  <FaSpinner className="spinner-icon" />
                  <p>Loading available exams...</p>
                </div>
              )}

              {!loading && filteredExams.length > 0 ? (
                <div className="exams-grid">
                  {filteredExams.map(exam => (
                    <div key={exam.id} className="exam-card">
                      <div className="card-header">
                        <h3>{exam.name}</h3>
                        <span className="level-badge" style={{ backgroundColor: getLevelColor(exam.level) }}>
                          {exam.level}
                        </span>
                      </div>
                      
                      <div className="card-meta">
                        <span className="subject">{exam.subject}</span>
                        <span className="code">{exam.code}</span>
                      </div>

                      <div className="card-details">
                        <div className="detail">
                          <FaClock /> {formatExamDuration(exam.durationMinutes)} duration
                        </div>
                        <div className="detail">
                          <FaClipboardList /> {exam.totalQuestions} questions
                        </div>
                        <div className="detail">
                          <FaAward /> {exam.totalMarks} marks
                        </div>
                      </div>

                      {exam.description && (
                        <p className="card-description">{exam.description}</p>
                      )}

                      <div className="card-requirements">
                        {exam.requireWebcam && <span className="req">📹 Webcam Required</span>}
                        {exam.fullScreenRequired && <span className="req">🖥️ Fullscreen</span>}
                        {exam.negativeMarking && <span className="req">⚠️ Negative Marking</span>}
                      </div>

                      <button 
                        className="card-btn"
                        onClick={() => handleStartExam(exam.id)}
                      >
                        <FaPlayCircle /> Start Exam
                      </button>
                    </div>
                  ))}
                </div>
              ) : !loading && filteredExams.length === 0 && !error ? (
                <div className="empty-state">
                  <FaSearch />
                  <p>No exams found matching your criteria</p>
                  <small>Check back later for more exams</small>
                </div>
              ) : null}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="schedule-tab">
              {upcomingExams.length > 0 ? (
                <div className="schedule-list">
                  {upcomingExams.map(exam => (
                    <div key={exam.id} className="schedule-card">
                      <div className="schedule-date">
                        <div className="date-box">
                          <span className="day">{new Date(exam.startTime).getDate()}</span>
                          <span className="month">{new Date(exam.startTime).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                      </div>
                      <div className="schedule-info">
                        <h3>{exam.name}</h3>
                        <p className="exam-subject">{exam.subject}</p>
                        <div className="schedule-details">
                          <span><FaClock /> {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{formatExamDuration(exam.durationMinutes)}</span>
                          <span className="countdown">{timeRemaining[exam.id]}</span>
                        </div>
                      </div>
                      <button 
                        className="schedule-btn"
                        onClick={() => handleStartExam(exam.id)}
                      >
                        Start Exam
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaCalendar />
                  <p>No upcoming exams scheduled</p>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="results-tab">
              {completedExams.length > 0 ? (
                <div className="results-grid">
                  {completedExams.map(exam => (
                    <div key={exam.id} className="result-card">
                      <div className="result-header">
                        <h3>{exam.name}</h3>
                        <span className={`status-badge ${(exam.score || 0) >= 70 ? 'passed' : 'failed'}`}>
                          {(exam.score || 0) >= 70 ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div className="result-score">
                        <div className="score-circle">
                          <span className="score-value">{exam.score}</span>
                          <span className="score-percent">%</span>
                        </div>
                        <div className="score-info">
                          <p>Your Score</p>
                          <small>{exam.subject}</small>
                        </div>
                      </div>
                      <div className="result-details">
                        <div className="detail-item">
                          <strong>Date:</strong>
                          <span>{exam.completedAt ? new Date(exam.completedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Duration:</strong>
                          <span>{formatExamDuration(exam.durationMinutes)}</span>
                        </div>
                      </div>
                      <button 
                        className="result-btn"
                        onClick={() => handleViewResults(exam.id)}
                      >
                        View Detailed Report
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaTrophy />
                  <p>No exam results yet. Complete an exam to see your results.</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="history-tab">
              <p className="tab-info">Coming soon...</p>
            </div>
          )}

          {/* Classroom Tab */}
          {activeTab === 'classroom' && (
            <AdvancedClassroom />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="settings-card">
                <h3>Account Settings</h3>
                <div className="setting-item">
                  <label>Email</label>
                  <p className="setting-value">{userEmail}</p>
                </div>
                <div className="setting-item">
                  <label>Organization</label>
                  <p className="setting-value">{organizationName}</p>
                </div>
              </div>
              <div className="settings-card">
                <h3>Preferences</h3>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Enable email notifications</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Show exam reminders</span>
                </label>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CandidateDashboard;
