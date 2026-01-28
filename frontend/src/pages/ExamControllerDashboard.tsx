import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaSignOutAlt,
  FaFileAlt,
  FaChartBar,
  FaBell,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlay,
  FaPause,
  FaDownload,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaTrophy,
  FaPercent,
  FaBook,
  FaCog,
  FaSync,
  FaBars,
  FaTimes,
  FaClipboardCheck,
} from 'react-icons/fa';
import '../styles/ExamControllerDashboard.css';

interface Exam {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  totalQuestions: number;
  duration: number;
  totalCandidates: number;
  completedCandidates: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  passingPercentage: number;
  averageScore?: number;
}

interface DashboardStats {
  totalExams: number;
  activeExams: number;
  totalCandidates: number;
  averageScore: number;
  completionRate: number;
  passRate: number;
}

const ExamControllerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail, logout, organizationName, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Paper Evaluation State
  const [paperFormData, setPaperFormData] = useState({
    batch: '',
    school: '',
    department: '',
    semester: '',
    examType: '',
    candidateType: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }[] >([]);
  const [uploadingPapers, setUploadingPapers] = useState<{ [key: string]: number }>({});
  const [papers, setPapers] = useState<any[]>([]);
  const [viewingPaper, setViewingPaper] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [sendingToEvaluator, setSendingToEvaluator] = useState<any>(null);
  const [evaluatorEmail, setEvaluatorEmail] = useState<string>('');
  const [evaluatorCheckLoading, setEvaluatorCheckLoading] = useState<boolean>(false);

  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/exams')) return 'exams';
    if (path.includes('/candidates')) return 'candidates';
    if (path.includes('/performance')) return 'performance';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/configuration')) return 'configuration';
    if (path.includes('/PaperEvaluation')) return 'paperEvaluation';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  // Fetch papers from API
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch('/api/papers', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPapers(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching papers:', error);
      }
    };

    if (accessToken && activeTab === 'paperEvaluation') {
      fetchPapers();
    }
  }, [accessToken, activeTab]);

  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 12,
    activeExams: 3,
    totalCandidates: 456,
    averageScore: 78.5,
    completionRate: 85,
    passRate: 72,
  });

  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      status: 'ACTIVE',
      totalQuestions: 25,
      duration: 120,
      totalCandidates: 45,
      completedCandidates: 38,
      createdAt: '2024-01-15',
      startDate: '2024-01-20',
      endDate: '2024-02-05',
      passingPercentage: 60,
      averageScore: 76.5,
    },
    {
      id: '2',
      title: 'React Advanced Concepts',
      status: 'PUBLISHED',
      totalQuestions: 30,
      duration: 150,
      totalCandidates: 32,
      completedCandidates: 28,
      createdAt: '2024-01-10',
      startDate: '2024-01-25',
      endDate: '2024-02-10',
      passingPercentage: 65,
      averageScore: 82.3,
    },
    {
      id: '3',
      title: 'Database Design',
      status: 'DRAFT',
      totalQuestions: 20,
      duration: 90,
      totalCandidates: 0,
      completedCandidates: 0,
      createdAt: '2024-01-18',
      passingPercentage: 60,
    },
    {
      id: '4',
      title: 'DevOps Essentials',
      status: 'SCHEDULED',
      totalQuestions: 28,
      duration: 180,
      totalCandidates: 67,
      completedCandidates: 15,
      createdAt: '2024-01-05',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      passingPercentage: 70,
      averageScore: 75.2,
    },
    {
      id: '5',
      title: 'Python Data Analysis',
      status: 'COMPLETED',
      totalQuestions: 35,
      duration: 120,
      totalCandidates: 52,
      completedCandidates: 52,
      createdAt: '2023-12-01',
      startDate: '2023-12-15',
      endDate: '2024-01-15',
      passingPercentage: 55,
      averageScore: 79.8,
    },
  ]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>(exams);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Search and filter logic
  useEffect(() => {
    let result = exams;

    // Search filter
    if (searchTerm) {
      result = result.filter((exam) =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((exam) => exam.status === statusFilter);
    }

    // Sort
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'candidates') {
      result.sort((a, b) => b.totalCandidates - a.totalCandidates);
    }

    setFilteredExams(result);
  }, [searchTerm, statusFilter, sortBy, exams]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateExam = () => {
    navigate('/admin/create-exam');
  };

  const handleViewExam = (examId: string) => {
    navigate(`/exam/${examId}`);
  };

  const handleEditExam = (examId: string) => {
    navigate(`/admin/exam/${examId}/edit`);
  };

  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter((exam) => exam.id !== examId));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: '#8b5cf6',
      PUBLISHED: '#3b82f6',
      SCHEDULED: '#f59e0b',
      ACTIVE: '#10b981',
      COMPLETED: '#6366f1',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      DRAFT: <FaBook />,
      PUBLISHED: <FaCheckCircle />,
      SCHEDULED: <FaCalendarAlt />,
      ACTIVE: <FaPlay />,
      COMPLETED: <FaTrophy />,
    };
    return icons[status] || <FaBook />;
  };

  // Paper Evaluation Handlers
  const validatePdfFilename = (filename: string): { isValid: boolean; message?: string; roll?: string; examname?: string } => {
    const pdfPattern = /^(\d+)_(.+)\.pdf$/i;
    const match = filename.match(pdfPattern);

    if (!match) {
      return {
        isValid: false,
        message: `Invalid filename: "${filename}". Expected format: roll_examname.pdf (e.g., 22054081_DOS.pdf)`,
      };
    }

    const roll = match[1];
    const examname = match[2];

    if (!roll || !examname) {
      return {
        isValid: false,
        message: 'Roll number and exam name cannot be empty',
      };
    }

    return { isValid: true, roll, examname };
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Check if PDF
      if (!file.type.includes('pdf')) {
        errors.push(`${file.name} - Only PDF files are allowed`);
        return;
      }

      // Validate filename
      const validation = validatePdfFilename(file.name);
      if (!validation.isValid) {
        errors.push(`${file.name} - ${validation.message}`);
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} - File size exceeds 10MB limit`);
        return;
      }

      newFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadStatus(errors.map((msg) => ({ message: msg, type: 'error' as const })));
    }

    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const handleUploadPapers = async () => {
    // Validate all required fields
    if (!paperFormData.batch || !paperFormData.school || !paperFormData.department || 
        !paperFormData.semester || !paperFormData.examType || !paperFormData.candidateType) {
      setUploadStatus([{
        message: 'All exam details must be selected before uploading',
        type: 'error',
      }]);
      return;
    }

    if (selectedFiles.length === 0) {
      setUploadStatus([{
        message: 'Please select at least one file to upload',
        type: 'error',
      }]);
      return;
    }

    setUploadStatus([{ message: 'Starting upload...', type: 'info' }]);

    for (const file of selectedFiles) {
      try {
        setUploadingPapers((prev) => ({ ...prev, [file.name]: 0 }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('batch', paperFormData.batch);
        formData.append('school', paperFormData.school);
        formData.append('department', paperFormData.department);
        formData.append('semester', paperFormData.semester);
        formData.append('examType', paperFormData.examType);
        formData.append('candidateType', paperFormData.candidateType);

        const response = await fetch('/api/papers/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();
        setUploadStatus((prev) => [
          ...prev,
          { message: `✅ ${file.name} uploaded successfully (Paper ID: ${result.data.paperid})`, type: 'success' },
        ]);

        // Add to papers list
        setPapers((prev) => [result.data, ...prev]);
        setUploadingPapers((prev) => {
          const { [file.name]: _, ...rest } = prev;
          return rest;
        });
      } catch (error: any) {
        setUploadStatus((prev) => [
          ...prev,
          { message: `❌ ${file.name} - ${error?.message || 'Upload failed'}`, type: 'error' },
        ]);
        setUploadingPapers((prev) => {
          const { [file.name]: _, ...rest } = prev;
          return rest;
        });
      }
    }

    // Clear selected files after upload
    setSelectedFiles([]);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="exam-dashboard">
      {/* Header */}
      <header className="exam-dashboard-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="header-branding">
            <h1>📊 Exam Controller</h1>
            <p className="org-name">{organizationName}</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="notification-badge">
            <FaBell />
            <span className="badge-count">3</span>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{userEmail?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{userEmail?.split('@')[0]}</p>
              <p className="user-role">Exam Controller</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="exam-dashboard-main">
        {/* Sidebar */}
        <aside className={`exam-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="nav-menu">
            <div className="nav-section">
              <h3>Dashboard</h3>
              <button
                className={`exam-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => navigate('/exam-controller/dashboard')}
              >
                <FaChartBar /> Overview
              </button>
            </div>

            <div className="nav-section">
              <h3>Management</h3>
              <button
                className={`exam-nav-item ${activeTab === 'exams' ? 'active' : ''}`}
                onClick={() => navigate('/exam-controller/dashboard/exams')}
              >
                <FaFileAlt /> All Exams
              </button>
              <button className="exam-nav-item" onClick={handleCreateExam}>
                <FaPlus /> Create Exam
              </button>
              <button 
                className={`exam-nav-item ${activeTab === 'candidates' ? 'active' : ''}`}
                onClick={() => navigate('/exam-controller/dashboard/candidates')}
              >
                <FaUsers /> Candidates
              </button>
              <button 
                className={`exam-nav-item ${activeTab === 'paperEvaluation' ? 'active' : ''}`}
                onClick={() => navigate('/exam-controller/dashboard/PaperEvaluation')}
              >
                <FaClipboardCheck /> Paper Evaluation
              </button>
            </div>

            <div className="nav-section">
              <h3>Analytics</h3>
              <button 
                className={`exam-nav-item ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => navigate('/exam-controller/dashboard/performance')}
              >
                <FaTrophy /> Performance
              </button>
              <button 
                className={`exam-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => navigate('/exam-controller/dashboard/reports')}
              >
                <FaPercent /> Reports
              </button>
            </div>

            <div className="nav-section">
              <h3>Settings</h3>
              <button 
                className={`exam-nav-item ${activeTab === 'configuration' ? 'active' : ''}`}
                onClick={() => navigate('/exam-controller/dashboard/configuration')}
              >
                <FaCog /> Configuration
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="exam-dashboard-content">
          {activeTab === 'overview' && (
            <>
              {/* Welcome Section */}
              <section className="welcome-banner">
                <div className="banner-content">
                  <h2>Welcome back, {userEmail?.split('@')[0]}! 👋</h2>
                  <p>Manage exams, track candidate performance, and analyze results all in one place.</p>
                </div>
                <button className="banner-cta" onClick={handleCreateExam}>
                  <FaPlus /> Create New Exam
                </button>
              </section>

              {/* Statistics Grid */}
              <section className="stats-section">
                <div className="stats-title">
                  <h3>Quick Statistics</h3>
                  <button className="refresh-btn" title="Refresh data">
                    <FaSync /> Refresh
                  </button>
                </div>
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">
                      <FaFileAlt />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Total Exams</p>
                      <p className="stat-value">{stats.totalExams}</p>
                      <p className="stat-change">↑ 3 this month</p>
                    </div>
                  </div>

                  <div className="stat-card success">
                    <div className="stat-icon">
                      <FaPlay />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Active Exams</p>
                      <p className="stat-value">{stats.activeExams}</p>
                      <p className="stat-change">Running now</p>
                    </div>
                  </div>

                  <div className="stat-card info">
                    <div className="stat-icon">
                      <FaUsers />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Total Candidates</p>
                      <p className="stat-value">{stats.totalCandidates}</p>
                      <p className="stat-change">↑ 42 this week</p>
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-icon">
                      <FaTrophy />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Average Score</p>
                      <p className="stat-value">{stats.averageScore}%</p>
                      <p className="stat-change">↑ 2.3% increase</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Completion Rate</p>
                      <p className="stat-value">{stats.completionRate}%</p>
                      <p className="stat-change">Target: 90%</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaPercent />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Pass Rate</p>
                      <p className="stat-value">{stats.passRate}%</p>
                      <p className="stat-change">↓ 1.2% from last month</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="activity-section">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon success">
                      <FaCheckCircle />
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">Exam Completed</p>
                      <p className="activity-desc">Java Fundamentals - 45 candidates completed</p>
                      <p className="activity-time">2 hours ago</p>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon info">
                      <FaPlus />
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">Exam Published</p>
                      <p className="activity-desc">Python Advanced - Now available for candidates</p>
                      <p className="activity-time">5 hours ago</p>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon warning">
                      <FaExclamationCircle />
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">Low Participation</p>
                      <p className="activity-desc">C++ Intermediate - Only 60% completion</p>
                      <p className="activity-time">1 day ago</p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'exams' && (
            <>
              {/* Filters Section */}
              <section className="filters-section">
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search exams by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="filter-controls">
                  <div className="filter-group">
                    <label>Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="ALL">All Status</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="filter-select"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="candidates">Most Candidates</option>
                    </select>
                  </div>

                  <button className="btn-primary" onClick={handleCreateExam}>
                    <FaPlus /> New Exam
                  </button>
                </div>
              </section>

              {/* Exams Table */}
              <section className="exams-section">
                <div className="section-header">
                  <h3>
                    <FaFileAlt /> All Exams ({filteredExams.length})
                  </h3>
                  <button className="btn-secondary">
                    <FaDownload /> Export
                  </button>
                </div>

                <div className="exams-container">
                  {filteredExams.length > 0 ? (
                    <div className="exams-grid">
                      {filteredExams.map((exam) => (
                        <div key={exam.id} className="exam-card">
                          <div className="exam-header">
                            <div className="exam-title-section">
                              <h4>{exam.title}</h4>
                              <span
                                className="exam-status"
                                style={{ backgroundColor: getStatusColor(exam.status) }}
                              >
                                {getStatusIcon(exam.status)} {exam.status}
                              </span>
                            </div>
                            <div className="exam-actions-menu">
                              <button className="action-btn" title="View">
                                <FaEye />
                              </button>
                              <button
                                className="action-btn"
                                title="Edit"
                                onClick={() => handleEditExam(exam.id)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="action-btn"
                                title="Delete"
                                onClick={() => handleDeleteExam(exam.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          <div className="exam-details">
                            <div className="detail-item">
                              <span className="detail-label">
                                <FaBook /> Questions
                              </span>
                              <span className="detail-value">{exam.totalQuestions}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">
                                <FaClock /> Duration
                              </span>
                              <span className="detail-value">{exam.duration} mins</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">
                                <FaUsers /> Candidates
                              </span>
                              <span className="detail-value">
                                {exam.completedCandidates}/{exam.totalCandidates}
                              </span>
                            </div>
                          </div>

                          {exam.averageScore && (
                            <div className="exam-stats">
                              <div className="stat">
                                <span>Avg Score: {exam.averageScore}%</span>
                              </div>
                              <div className="stat">
                                <span>Pass Rate: {exam.passingPercentage}%</span>
                              </div>
                            </div>
                          )}

                          <div className="exam-footer">
                            <p className="exam-date">Created {exam.createdAt}</p>
                            <button
                              className="btn-view"
                              onClick={() => handleViewExam(exam.id)}
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">
                      <FaFileAlt />
                      <p>No exams found</p>
                      <button className="btn-primary" onClick={handleCreateExam}>
                        Create Your First Exam
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'candidates' && (
            <>
              <section className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Candidates Management</h2>
                <p>Manage and monitor all candidates taking your exams</p>
              </section>
              
              <div className="content-placeholder" style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaUsers style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }} />
                <h3>Candidates Section</h3>
                <p>View and manage all candidates, their performance, and progress.</p>
              </div>
            </>
          )}

          {activeTab === 'paperEvaluation' && (
            <>
              <section className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Paper Evaluation</h2>
                <p>Upload, manage, and distribute exam papers to evaluators</p>
              </section>

              {/* Filter & Selection Section */}
              <section style={{
                backgroundColor: '#fff',
                padding: '25px',
                borderRadius: '8px',
                marginBottom: '25px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>📋 Select Exam Details</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                      Admission Batch *
                    </label>
                    <select 
                      value={paperFormData.batch}
                      onChange={(e) => setPaperFormData({ ...paperFormData, batch: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: paperFormData.batch ? '1px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}>
                      <option value="">-- Select Batch --</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2024-25">2024-25</option>
                      <option value="2023-24">2023-24</option>
                      <option value="2022-23">2022-23</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                      School *
                    </label>
                    <select 
                      value={paperFormData.school}
                      onChange={(e) => setPaperFormData({ ...paperFormData, school: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: paperFormData.school ? '1px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}>
                      <option value="">-- Select School --</option>
                      <option value="engineering">School of Engineering</option>
                      <option value="science">School of Science</option>
                      <option value="commerce">School of Commerce</option>
                      <option value="arts">School of Arts</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                      Department *
                    </label>
                    <select 
                      value={paperFormData.department}
                      onChange={(e) => setPaperFormData({ ...paperFormData, department: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: paperFormData.department ? '1px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}>
                      <option value="">-- Select Department --</option>
                      <option value="cse">Computer Science</option>
                      <option value="ece">Electronics</option>
                      <option value="mechanical">Mechanical</option>
                      <option value="civil">Civil</option>
                      <option value="it">Information Technology</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                      Semester *
                    </label>
                    <select 
                      value={paperFormData.semester}
                      onChange={(e) => setPaperFormData({ ...paperFormData, semester: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: paperFormData.semester ? '1px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}>
                      <option value="">-- Select Semester --</option>
                      <option value="sem1">Semester 1</option>
                      <option value="sem2">Semester 2</option>
                      <option value="sem3">Semester 3</option>
                      <option value="sem4">Semester 4</option>
                      <option value="sem5">Semester 5</option>
                      <option value="sem6">Semester 6</option>
                      <option value="sem7">Semester 7</option>
                      <option value="sem8">Semester 8</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                      Exam Type *
                    </label>
                    <select 
                      value={paperFormData.examType}
                      onChange={(e) => setPaperFormData({ ...paperFormData, examType: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: paperFormData.examType ? '1px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}>
                      <option value="">-- Select Type --</option>
                      <option value="midterm">Mid Term</option>
                      <option value="remid">Re-mid</option>
                      <option value="endterm">End Term</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                      Candidate Type *
                    </label>
                    <select 
                      value={paperFormData.candidateType}
                      onChange={(e) => setPaperFormData({ ...paperFormData, candidateType: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: paperFormData.candidateType ? '1px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                      }}>
                      <option value="">-- Select Type --</option>
                      <option value="regular">Regular</option>
                      <option value="back">Back</option>
                      <option value="improvement">Improvement</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Upload Section */}
              <section style={{ 
                backgroundColor: '#fff', 
                padding: '30px', 
                borderRadius: '8px', 
                marginBottom: '30px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>📤 Upload Answer Papers</h3>
                
                {/* File Upload Area */}
                <div 
                  style={{
                    border: '2px dashed #3498db',
                    borderRadius: '8px',
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9ff',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileSelect(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
                  <h4 style={{ margin: '10px 0', color: '#333' }}>Drag and drop PDF files here</h4>
                  <p style={{ color: '#666', margin: '5px 0' }}>or click to browse</p>
                  <p style={{ color: '#999', fontSize: '12px', margin: '10px 0' }}>
                    📌 Format: roll_examname.pdf (e.g., 22054081_DOS.pdf)<br/>
                    Max 10MB per file • PDF only
                  </p>
                  <input 
                    type="file" 
                    multiple 
                    accept=".pdf" 
                    style={{ display: 'none' }} 
                    id="fileInput"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <button 
                    style={{
                      marginTop: '15px',
                      padding: '10px 25px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    Choose Files
                  </button>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '5px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Selected Files ({selectedFiles.length}):</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                      {selectedFiles.map((file, idx) => (
                        <li key={idx} style={{ padding: '5px 0', color: '#555', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <button
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e74c3c',
                              cursor: 'pointer',
                              fontSize: '16px'
                            }}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleUploadPapers}
                      disabled={Object.keys(uploadingPapers).length > 0}
                      style={{
                        marginTop: '15px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: Object.keys(uploadingPapers).length > 0 ? '#bdc3c7' : '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: Object.keys(uploadingPapers).length > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {Object.keys(uploadingPapers).length > 0 ? '⏳ Uploading...' : '✅ Upload Selected Files'}
                    </button>
                  </div>
                )}

                {/* Upload Status Messages */}
                {uploadStatus.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    {uploadStatus.map((status, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          marginBottom: '10px',
                          borderRadius: '5px',
                          borderLeft: '4px solid',
                          backgroundColor: status.type === 'success' ? '#d4edda' : status.type === 'error' ? '#f8d7da' : '#d1ecf1',
                          borderLeftColor: status.type === 'success' ? '#28a745' : status.type === 'error' ? '#dc3545' : '#17a2b8',
                          color: status.type === 'success' ? '#155724' : status.type === 'error' ? '#721c24' : '#0c5460'
                        }}
                      >
                        {status.message}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Filters and Actions */}
              <section style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <input 
                  type="text"
                  placeholder="🔍 Search by exam name, candidate name..."
                  style={{
                    padding: '10px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    flex: 1,
                    minWidth: '250px',
                    fontSize: '14px'
                  }}
                />
                <select style={{
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <option value="">Filter by Status</option>
                  <option value="pending">Pending Evaluation</option>
                  <option value="assigned">Assigned to Evaluator</option>
                  <option value="completed">Evaluation Complete</option>
                  <option value="reviewed">Reviewed</option>
                </select>
                <select style={{
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <option value="">Sort By</option>
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Candidate Name</option>
                </select>
              </section>

              {/* Papers List */}
              <section style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f5f5f5',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, color: '#333' }}>📋 Uploaded Papers ({papers.length})</h3>
                  <button style={{
                    padding: '8px 15px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                    ⬇️ Export Report
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Paper ID</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Candidate Name</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Roll No.</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Exam</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Upload Date</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Assigned To</th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {papers.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            No papers uploaded yet
                          </td>
                        </tr>
                      ) : (
                        papers.map((paper) => (
                          <tr key={paper.paperid} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: papers.indexOf(paper) % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                            <td style={{ padding: '15px', color: '#333' }}>{paper.paperid.substring(0, 8)}</td>
                            <td style={{ padding: '15px', color: '#333' }}>{paper.roll}</td>
                            <td style={{ padding: '15px', color: '#333' }}>{paper.roll}</td>
                            <td style={{ padding: '15px', color: '#333' }}>{paper.examname}</td>
                            <td style={{ padding: '15px', color: '#666' }}>{new Date(paper.uploadedDate).toLocaleDateString()}</td>
                            <td style={{ padding: '15px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: paper.status === 'pending' ? '#fff3cd' : paper.status === 'assigned' ? '#d1ecf1' : '#d4edda',
                                color: paper.status === 'pending' ? '#856404' : paper.status === 'assigned' ? '#0c5460' : '#155724'
                              }}>
                                {paper.status === 'pending' ? '⏳ Pending' : paper.status === 'assigned' ? '👤 Assigned' : '✅ Evaluated'}
                              </span>
                            </td>
                            <td style={{ padding: '15px', color: '#666' }}>
                              {paper.assignedTo || '—'}
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button 
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/papers/${paper.paperid}/download`, {
                                        headers: { Authorization: `Bearer ${accessToken}` },
                                      });
                                      if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        setViewingPaper(paper);
                                        setPdfUrl(url);
                                      }
                                    } catch (error) {
                                      alert('Error loading PDF: ' + error);
                                    }
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }} 
                                  title="View Paper">
                                  👁️
                                </button>
                                <button 
                                  onClick={() => {
                                    setSendingToEvaluator(paper);
                                    setEvaluatorEmail('');
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }} 
                                  title="Send to Evaluator">
                                  ➤
                                </button>
                                <button 
                                  onClick={() => {
                                    const notes = prompt('Add evaluation notes:');
                                    if (notes) {
                                      fetch(`/api/papers/${paper.paperid}/notes`, {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          Authorization: `Bearer ${accessToken}`,
                                        },
                                        body: JSON.stringify({ notes }),
                                      }).then(res => {
                                        if (res.ok) {
                                          alert('Notes updated successfully');
                                          // Refresh papers list
                                          const response = fetch('/api/papers', {
                                            headers: { Authorization: `Bearer ${accessToken}` },
                                          });
                                          response.then(r => r.json()).then(d => setPapers(d.data || []));
                                        }
                                      });
                                    }
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#f39c12',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }} 
                                  title="Add Notes">
                                  📝
                                </button>
                                <button 
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `/api/papers/${paper.paperid}/download`;
                                    link.download = paper.fileName;
                                    link.click();
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#95a5a6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }} 
                                  title="Download">
                                  ⬇️
                                </button>
                                <button 
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this paper?')) {
                                      fetch(`/api/papers/${paper.paperid}`, {
                                        method: 'DELETE',
                                        headers: { Authorization: `Bearer ${accessToken}` },
                                      }).then(res => {
                                        if (res.ok) {
                                          alert('Paper deleted successfully');
                                          setPapers(papers.filter(p => p.paperid !== paper.paperid));
                                        }
                                      });
                                    }
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }} 
                                  title="Delete">
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Send to Evaluator Modal-like Section */}
              <section style={{
                marginTop: '30px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                {/* Left: Quick Stats */}
                <div style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ marginBottom: '15px', color: '#333' }}>📊 Evaluation Stats</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px'
                  }}>
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f0f7ff',
                      borderRadius: '6px',
                      textAlign: 'center',
                      borderLeft: '4px solid #3498db'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{papers.length}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Total Papers</div>
                    </div>
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '6px',
                      textAlign: 'center',
                      borderLeft: '4px solid #f39c12'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>{papers.filter(p => p.status === 'pending').length}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Pending</div>
                    </div>
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#d4edda',
                      borderRadius: '6px',
                      textAlign: 'center',
                      borderLeft: '4px solid #27ae60'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{papers.filter(p => p.status === 'evaluated').length}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Evaluated</div>
                    </div>
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#e8daef',
                      borderRadius: '6px',
                      textAlign: 'center',
                      borderLeft: '4px solid #8e44ad'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8e44ad' }}>{papers.filter(p => p.status === 'assigned').length}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>In Progress</div>
                    </div>
                  </div>
                </div>

                {/* Right: Send to Evaluator Form */}
                <div style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ marginBottom: '15px', color: '#333' }}>➤ Assign to Evaluator</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                        Select Papers to Assign
                      </label>
                      <select multiple style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        minHeight: '80px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}>
                        <option>PAPER-001 - Candidate 1</option>
                        <option>PAPER-003 - Candidate 3</option>
                        <option>PAPER-005 - Candidate 5</option>
                      </select>
                      <p style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>Hold Ctrl/Cmd to select multiple</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                        Select Evaluator
                      </label>
                      <select style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}>
                        <option value="">Choose an evaluator</option>
                        <option value="evaluator1">Dr. Evaluator A (3 papers)</option>
                        <option value="evaluator2">Dr. Evaluator B (2 papers)</option>
                        <option value="evaluator3">Dr. Evaluator C (1 paper)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                        Deadline (Optional)
                      </label>
                      <input type="date" style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        fontSize: '13px'
                      }} />
                    </div>
                    <button style={{
                      padding: '12px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginTop: '10px'
                    }}>
                      ➤ Send to Evaluator
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'performance' && (
            <>
              <section className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Performance Analytics</h2>
                <p>Analyze exam performance and candidate results</p>
              </section>
              
              <div className="content-placeholder" style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaTrophy style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }} />
                <h3>Performance Section</h3>
                <p>View detailed performance metrics, trends, and insights.</p>
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <>
              <section className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Reports</h2>
                <p>Generate and download detailed exam reports</p>
              </section>
              
              <div className="content-placeholder" style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaDownload style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }} />
                <h3>Reports Section</h3>
                <p>Generate and export comprehensive reports.</p>
              </div>
            </>
          )}

          {activeTab === 'configuration' && (
            <>
              <section className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Configuration Settings</h2>
                <p>Configure system settings and preferences</p>
              </section>
              
              <div className="content-placeholder" style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                color: '#666'
              }}>
                <FaCog style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }} />
                <h3>Configuration Section</h3>
                <p>Manage system settings, preferences, and configurations.</p>
              </div>
            </>
          )}
        </main>

        {/* Send to Evaluator Modal */}
        {sendingToEvaluator && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9998,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              padding: '30px'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '20px' }}>
                📤 Send to Evaluator
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Paper:</strong> {sendingToEvaluator.roll} - {sendingToEvaluator.examname}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#333' }}>
                  Evaluator Email
                </label>
                <input
                  type="email"
                  value={evaluatorEmail}
                  onChange={(e) => setEvaluatorEmail(e.target.value)}
                  placeholder="Enter evaluator's email address"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Status Message */}
              {evaluatorCheckLoading && (
                <div style={{ padding: '10px', backgroundColor: '#e3f2fd', color: '#1976d2', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
                  ⏳ Verifying evaluator...
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSendingToEvaluator(null);
                    setEvaluatorEmail('');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!evaluatorEmail.trim()) {
                      alert('Please enter an evaluator email');
                      return;
                    }

                    setEvaluatorCheckLoading(true);
                    try {
                      // First check if evaluator exists
                      const checkResponse = await fetch(
                        `/api/papers/${sendingToEvaluator.paperid}/check-evaluator`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify({ evaluatorEmail }),
                        }
                      );

                      const checkData = await checkResponse.json();

                      if (!checkData.exists) {
                        alert(`Evaluator ${evaluatorEmail} does not exist in this organization`);
                        setEvaluatorCheckLoading(false);
                        return;
                      }

                      // Send paper to evaluator
                      const sendResponse = await fetch(
                        `/api/papers/${sendingToEvaluator.paperid}/send-to-evaluator`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify({ evaluatorEmail }),
                        }
                      );

                      const sendData = await sendResponse.json();

                      if (sendData.success) {
                        alert(`✅ Paper sent to ${evaluatorEmail} successfully!`);
                        
                        // Update local papers list
                        setPapers(papers.map(p => 
                          p.paperid === sendingToEvaluator.paperid 
                            ? { ...p, assignedTo: evaluatorEmail, status: 'assigned' }
                            : p
                        ));

                        setSendingToEvaluator(null);
                        setEvaluatorEmail('');
                      }
                    } catch (error) {
                      alert('Error sending paper: ' + error);
                    } finally {
                      setEvaluatorCheckLoading(false);
                    }
                  }}
                  disabled={evaluatorCheckLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: evaluatorCheckLoading ? '#bdc3c7' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: evaluatorCheckLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {evaluatorCheckLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {viewingPaper && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              height: '90vh',
              maxWidth: '1000px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f5f5f5'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>📄 {viewingPaper.fileName}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    Roll: {viewingPaper.roll} | Exam: {viewingPaper.examname} | 
                    Uploaded: {new Date(viewingPaper.uploadedDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setViewingPaper(null);
                    setPdfUrl('');
                  }}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✕ Close
                </button>
              </div>

              {/* PDF Viewer */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#e0e0e0'
              }}>
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title="Paper PDF Viewer"
                  />
                ) : (
                  <div style={{ color: '#999', fontSize: '16px' }}>Loading PDF...</div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '15px 20px',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = viewingPaper.fileName;
                    link.click();
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ⬇️ Download
                </button>
                <button
                  onClick={() => {
                    setViewingPaper(null);
                    setPdfUrl('');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamControllerDashboard;
