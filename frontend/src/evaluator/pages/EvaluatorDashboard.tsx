import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaClipboardCheck, FaSearch, FaFilter, FaSort,
  FaClock, FaCalendar, FaUserGraduate, FaBook,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaExclamationTriangle, FaEye, FaEdit, FaSave,
  FaPaperPlane, FaRobot, FaChartLine,
  FaFileExport, FaSync, FaCrown,
  FaStar, FaRegStar, FaStarHalfAlt,
  FaUsers, FaTachometerAlt, FaBrain, FaChevronRight,
  FaChevronLeft, FaPercentage, FaTag, FaCalculator,
  FaShieldAlt, FaLightbulb, FaAward, FaThumbsUp
} from 'react-icons/fa';
import './EvaluatorDashboard.css';

// Types
interface Answer {
  id: string;
  answerText: string;
  questionId: string;
  candidateId: string;
  candidateName: string;
  questionText: string;
  questionType: string;
  maxMarks: number;
  obtainedMarks?: number;
  aiSuggestedMarks?: number;
  aiConfidence?: number;
  aiFeedback?: string;
  evaluatorComment?: string;
  isFlagged?: boolean;
  isReviewed?: boolean;
  submittedAt: string;
  timeSpent: number;
  similarityScore?: number;
  difficulty?: string;
}

interface Exam {
  id: string;
  code: string;
  name: string;
  subject: string;
  totalQuestions: number;
  totalEvaluated: number;
  totalPending: number;
  averageScore: number;
  status: string;
  submittedCount: number;
  totalCandidates: number;
}

interface EvaluationStats {
  totalExams: number;
  totalAnswers: number;
  evaluatedAnswers: number;
  pendingAnswers: number;
  averageTimePerAnswer: number;
  aiAssistedCount: number;
  todayEvaluations: number;
  accuracyRate: number;
}

const EvaluatorDashboard = () => {
  // State Management
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'evaluated' | 'flagged' | 'exams'>('pending');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [filteredAnswers, setFilteredAnswers] = useState<Answer[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<EvaluationStats>({
    totalExams: 0,
    totalAnswers: 0,
    evaluatedAnswers: 0,
    pendingAnswers: 0,
    averageTimePerAnswer: 0,
    aiAssistedCount: 0,
    todayEvaluations: 0,
    accuracyRate: 95.5
  });
  
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [evaluationNote, setEvaluationNote] = useState<string>('');
  const [assignedMarks, setAssignedMarks] = useState<number>(0);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState<boolean>(true);
  
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());
  const [bulkMarks, setBulkMarks] = useState<number>(0);
  const [bulkComment, setBulkComment] = useState<string>('');
  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [autoSave, setAutoSave] = useState(true);
  const [enablePlagiarismCheck, setEnablePlagiarismCheck] = useState(true);

  // Filter options
  const questionTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'DESCRIPTIVE', label: 'Descriptive' },
    { value: 'SHORT_ANSWER', label: 'Short Answer' },
    { value: 'PROGRAMMING', label: 'Programming' },
    { value: 'CASE_STUDY', label: 'Case Study' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
  ];

  // Mock data - Replace with API calls
  const mockAnswers: Answer[] = [
    {
      id: '1',
      answerText: 'JavaScript is a versatile programming language...',
      questionId: 'q1',
      candidateId: 'c1',
      candidateName: 'John Doe',
      questionText: 'What is JavaScript and its uses?',
      questionType: 'DESCRIPTIVE',
      maxMarks: 10,
      aiSuggestedMarks: 8,
      aiConfidence: 85,
      aiFeedback: 'Well-structured answer with good examples',
      isReviewed: false,
      submittedAt: new Date().toISOString(),
      timeSpent: 300,
      similarityScore: 5,
      difficulty: 'MEDIUM'
    },
    {
      id: '2',
      answerText: 'React is a JavaScript library for building user interfaces...',
      questionId: 'q2',
      candidateId: 'c2',
      candidateName: 'Jane Smith',
      questionText: 'Explain React and its benefits',
      questionType: 'DESCRIPTIVE',
      maxMarks: 10,
      aiSuggestedMarks: 9,
      aiConfidence: 90,
      aiFeedback: 'Comprehensive answer with practical examples',
      isReviewed: false,
      submittedAt: new Date().toISOString(),
      timeSpent: 420,
      similarityScore: 2,
      difficulty: 'MEDIUM'
    }
  ];

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      setAnswers(mockAnswers);
      setExams([
        {
          id: 'e1',
          code: 'CSE101',
          name: 'Web Development Basics',
          subject: 'Computer Science',
          totalQuestions: 50,
          totalEvaluated: 35,
          totalPending: 15,
          averageScore: 78,
          status: 'active',
          submittedCount: 45,
          totalCandidates: 50
        }
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...answers];

    if (activeTab === 'evaluated') {
      filtered = filtered.filter(a => a.isReviewed);
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(a => !a.isReviewed);
    } else if (activeTab === 'flagged') {
      filtered = filtered.filter(a => a.isFlagged);
    }

    if (selectedExam !== 'all') {
      filtered = filtered.filter(a => a.questionId.includes(selectedExam));
    }

    if (selectedQuestionType !== 'all') {
      filtered = filtered.filter(a => a.questionType === selectedQuestionType);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(a => a.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.candidateName.toLowerCase().includes(query) ||
        a.questionText.toLowerCase().includes(query) ||
        a.answerText.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Answer];
      let bValue: any = b[sortBy as keyof Answer];

      if (sortBy === 'submittedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAnswers(filtered);
  }, [answers, activeTab, selectedExam, selectedQuestionType, selectedDifficulty, searchQuery, sortBy, sortOrder]);

  // Handle answer selection
  const handleSelectAnswer = (answer: Answer) => {
    setSelectedAnswer(answer);
    setAssignedMarks(answer.obtainedMarks || answer.aiSuggestedMarks || 0);
    setEvaluationNote(answer.evaluatorComment || '');
  };

  // Evaluate answer
  const evaluateAnswer = async () => {
    if (!selectedAnswer) return;

    setEvaluating(selectedAnswer.id);
    try {
      // Simulate API call
      setTimeout(() => {
        setAnswers(prev => prev.map(a => 
          a.id === selectedAnswer.id 
            ? { ...a, obtainedMarks: assignedMarks, evaluatorComment: evaluationNote, isReviewed: true }
            : a
        ));
        setSelectedAnswer(null);
        setEvaluationNote('');
        setAssignedMarks(0);
        alert('Answer evaluated successfully!');
        setEvaluating(null);
      }, 500);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer');
      setEvaluating(null);
    }
  };

  // Toggle answer selection
  const toggleAnswerSelection = (answerId: string) => {
    const newSelection = new Set(selectedAnswers);
    if (newSelection.has(answerId)) {
      newSelection.delete(answerId);
    } else {
      newSelection.add(answerId);
    }
    setSelectedAnswers(newSelection);
  };

  // Render confidence stars
  const renderConfidenceStars = (confidence: number) => {
    const stars = [];
    const fullStars = Math.floor(confidence / 20);
    const halfStar = confidence % 20 >= 10;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-full" />);
    }
    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star-half" />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star-empty" />);
    }

    return (
      <div className="confidence-stars">
        {stars}
        <span className="confidence-percent">{confidence}%</span>
      </div>
    );
  };

  // Render progress bar
  const renderProgressBar = (evaluated: number, total: number) => {
    const percentage = total > 0 ? (evaluated / total) * 100 : 0;
    return (
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        <span className="progress-text">{evaluated}/{total} ({percentage.toFixed(1)}%)</span>
      </div>
    );
  };

  // Stats cards
  const statsCards = useMemo(() => [
    {
      title: 'Pending Evaluations',
      value: stats.pendingAnswers,
      icon: <FaHourglassHalf />,
      color: 'warning',
      change: '+12%',
      description: 'Awaiting your review'
    },
    {
      title: 'Evaluated Today',
      value: stats.todayEvaluations,
      icon: <FaClipboardCheck />,
      color: 'success',
      change: '+8%',
      description: 'Completed evaluations'
    },
    {
      title: 'AI Assisted',
      value: stats.aiAssistedCount,
      icon: <FaRobot />,
      color: 'info',
      change: '+25%',
      description: 'With AI suggestions'
    },
    {
      title: 'Accuracy Rate',
      value: `${stats.accuracyRate}%`,
      icon: <FaCrown />,
      color: 'purple',
      change: '+1.2%',
      description: 'Evaluation accuracy'
    }
  ], [stats]);

  if (loading && answers.length === 0 && exams.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Evaluator Dashboard...</p>
      </div>
    );
  }

  if (error && answers.length === 0 && exams.length === 0) {
    return (
      <div className="loading-container">
        <div className="error-container">
          <FaExclamationTriangle size={48} color="#d32f2f" />
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchDashboardData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluator-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1><FaClipboardCheck /> Evaluator Dashboard</h1>
          <p className="subtitle">AI-Assisted Subjective Answer Evaluation System</p>
        </div>
        <div className="header-right">
          <div className="quick-actions">
            <button
              className={`quick-action-btn ${aiSuggestionsEnabled ? 'active' : ''}`}
              onClick={() => setAiSuggestionsEnabled(!aiSuggestionsEnabled)}
              title="Toggle AI Suggestions"
            >
              <FaRobot />
            </button>
            <button
              className={`quick-action-btn ${enablePlagiarismCheck ? 'active' : ''}`}
              onClick={() => setEnablePlagiarismCheck(!enablePlagiarismCheck)}
              title="Toggle Plagiarism Check"
            >
              <FaShieldAlt />
            </button>
            <button
              className="quick-action-btn"
              onClick={fetchDashboardData}
              title="Refresh Data"
            >
              <FaSync />
            </button>
            <button
              className="quick-action-btn"
              onClick={() => setShowAnalytics(!showAnalytics)}
              title="View Analytics"
            >
              <FaChartLine />
            </button>
          </div>
          <div className="user-info">
            <span className="user-role">{user?.role || 'Evaluator'}</span>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        {statsCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <small>
                <span className={`change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.change}
                </span> • {stat.description}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Sidebar - Filters */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h3><FaFilter /> Filters</h3>
            
            <div className="filter-group">
              <label>Exam</label>
              <select 
                value={selectedExam} 
                onChange={(e) => setSelectedExam(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Exams</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.code} - {exam.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Question Type</label>
              <select 
                value={selectedQuestionType} 
                onChange={(e) => setSelectedQuestionType(e.target.value)}
                className="filter-select"
              >
                {questionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Difficulty Level</label>
              <select 
                value={selectedDifficulty} 
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="filter-select"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="submittedAt">Submission Time</option>
                <option value="candidateName">Candidate Name</option>
                <option value="maxMarks">Maximum Marks</option>
                <option value="timeSpent">Time Spent</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort Order</label>
              <div className="sort-order-buttons">
                <button
                  className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                  onClick={() => setSortOrder('desc')}
                >
                  <FaSort /> Newest
                </button>
                <button
                  className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                  onClick={() => setSortOrder('asc')}
                >
                  <FaSort /> Oldest
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label><FaSearch /> Search</label>
              <input
                type="text"
                placeholder="Search answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Exams List */}
          <div className="sidebar-section">
            <h3><FaBook /> Active Exams</h3>
            <div className="exams-list">
              {exams.map(exam => (
                <div 
                  key={exam.id} 
                  className={`exam-item ${selectedExam === exam.id ? 'active' : ''}`}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  <div className="exam-info">
                    <h4>{exam.code}</h4>
                    <p>{exam.name}</p>
                    <span className="exam-subject">{exam.subject}</span>
                  </div>
                  <div className="exam-stats">
                    {renderProgressBar(exam.totalEvaluated, exam.totalQuestions * exam.submittedCount)}
                    <div className="exam-meta">
                      <span><FaUserGraduate /> {exam.submittedCount}/{exam.totalCandidates}</span>
                      <span><FaPercentage /> {exam.averageScore.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Tabs Navigation */}
          <div className="tabs-navigation">
            <button
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <FaHourglassHalf /> Pending
              {stats.pendingAnswers > 0 && (
                <span className="tab-badge">{stats.pendingAnswers}</span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === 'evaluated' ? 'active' : ''}`}
              onClick={() => setActiveTab('evaluated')}
            >
              <FaCheckCircle /> Evaluated
              <span className="tab-badge">{stats.evaluatedAnswers}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'flagged' ? 'active' : ''}`}
              onClick={() => setActiveTab('flagged')}
            >
              <FaExclamationTriangle /> Flagged
            </button>
            <button
              className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
              onClick={() => setActiveTab('exams')}
            >
              <FaBook /> Exams
            </button>
          </div>

          {/* Bulk Actions Bar */}
          {selectedAnswers.size > 0 && (
            <div className="bulk-actions-bar">
              <div className="bulk-info">
                <FaUsers /> {selectedAnswers.size} answers selected
              </div>
              <div className="bulk-controls">
                <input
                  type="number"
                  placeholder="Marks for all"
                  value={bulkMarks}
                  onChange={(e) => setBulkMarks(Number(e.target.value))}
                  className="bulk-marks-input"
                  min="0"
                  max="100"
                />
                <button
                  className="btn-bulk-apply"
                  disabled={bulkMarks <= 0}
                >
                  <FaSave /> Apply to Selected
                </button>
                <button
                  className="btn-clear-selection"
                  onClick={() => setSelectedAnswers(new Set())}
                >
                  <FaTimesCircle /> Clear
                </button>
              </div>
            </div>
          )}

          {/* Answers List */}
          <div className="answers-list">
            {filteredAnswers.length === 0 ? (
              <div className="empty-state">
                <FaClipboardCheck size={48} />
                <h3>No answers found</h3>
                <p>There are no answers matching your current filters.</p>
              </div>
            ) : (
              filteredAnswers.map(answer => (
                <div 
                  key={answer.id} 
                  className={`answer-card ${selectedAnswer?.id === answer.id ? 'selected' : ''}`}
                  onClick={() => handleSelectAnswer(answer)}
                >
                  {/* Selection checkbox */}
                  <div 
                    className="selection-checkbox"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAnswerSelection(answer.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAnswers.has(answer.id)}
                      onChange={() => {}}
                    />
                  </div>

                  {/* Answer header */}
                  <div className="answer-header">
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        {answer.candidateName.charAt(0)}
                      </div>
                      <div>
                        <h4>{answer.candidateName}</h4>
                        <p className="answer-meta">
                          <FaClock /> {Math.floor(answer.timeSpent / 60)} min • 
                          <FaCalendar /> {new Date(answer.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="answer-status">
                      {answer.isReviewed ? (
                        <span className="status-badge reviewed">
                          <FaCheckCircle /> Evaluated
                        </span>
                      ) : (
                        <span className="status-badge pending">
                          <FaHourglassHalf /> Pending
                        </span>
                      )}
                      {answer.isFlagged && (
                        <span className="status-badge flagged">
                          <FaExclamationTriangle /> Flagged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question preview */}
                  <div className="question-preview">
                    <h5>Question:</h5>
                    <p className="question-text">
                      {answer.questionText.length > 150 
                        ? `${answer.questionText.substring(0, 150)}...` 
                        : answer.questionText}
                    </p>
                    <div className="question-meta">
                      <span className="question-type">{answer.questionType}</span>
                      <span className="max-marks">{answer.maxMarks} marks</span>
                    </div>
                  </div>

                  {/* Answer preview */}
                  <div className="answer-preview">
                    <h5>Answer:</h5>
                    <p className="answer-text">
                      {answer.answerText.length > 200 
                        ? `${answer.answerText.substring(0, 200)}...` 
                        : answer.answerText}
                    </p>
                  </div>

                  {/* AI Suggestions */}
                  {aiSuggestionsEnabled && answer.aiSuggestedMarks && (
                    <div className="ai-suggestion">
                      <div className="ai-header">
                        <FaRobot /> AI Suggestion
                        {renderConfidenceStars(answer.aiConfidence || 0)}
                      </div>
                      <div className="ai-content">
                        <div className="ai-marks">
                          <strong>Suggested Marks:</strong> {answer.aiSuggestedMarks}/{answer.maxMarks}
                        </div>
                        {answer.aiFeedback && (
                          <p className="ai-feedback">{answer.aiFeedback}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="answer-actions">
                    <button
                      className="btn-evaluate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAnswer(answer);
                      }}
                    >
                      <FaEye /> {answer.isReviewed ? 'View' : 'Evaluate'}
                    </button>
                    <button
                      className="btn-flag"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      disabled={answer.isFlagged}
                    >
                      <FaExclamationTriangle /> {answer.isFlagged ? 'Flagged' : 'Flag'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredAnswers.length > 0 && (
            <div className="pagination">
              <button className="pagination-btn">
                <FaChevronLeft /> Previous
              </button>
              <div className="page-numbers">
                <span className="current-page">1</span>
                <span>of</span>
                <span className="total-pages">5</span>
              </div>
              <button className="pagination-btn">
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Evaluation Panel */}
        <div className="evaluation-sidebar">
          {selectedAnswer ? (
            <div className="evaluation-panel">
              <div className="panel-header">
                <h3><FaEdit /> Evaluation Panel</h3>
                <button 
                  className="btn-close-panel"
                  onClick={() => setSelectedAnswer(null)}
                >
                  &times;
                </button>
              </div>

              {/* Candidate Info */}
              <div className="candidate-details">
                <div className="candidate-header">
                  <div className="candidate-avatar large">
                    {selectedAnswer.candidateName.charAt(0)}
                  </div>
                  <div>
                    <h4>{selectedAnswer.candidateName}</h4>
                    <p>Submission: {new Date(selectedAnswer.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Full Question */}
              <div className="full-question">
                <h5>Question:</h5>
                <div className="question-content">
                  {selectedAnswer.questionText}
                </div>
                <div className="question-details">
                  <span><FaTag /> {selectedAnswer.questionType}</span>
                  <span><FaCalculator /> {selectedAnswer.maxMarks} marks</span>
                  <span><FaClock /> {Math.floor(selectedAnswer.timeSpent / 60)} minutes spent</span>
                </div>
              </div>

              {/* Full Answer */}
              <div className="full-answer">
                <h5>Candidate's Answer:</h5>
                <div className="answer-content">
                  {selectedAnswer.answerText}
                </div>
                
                {/* Plagiarism Check */}
                {enablePlagiarismCheck && selectedAnswer.similarityScore && (
                  <div className="similarity-check">
                    <FaExclamationTriangle />
                    <span>Similarity Score: {selectedAnswer.similarityScore}%</span>
                    <button className="btn-view-sources">View Sources</button>
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              {aiSuggestionsEnabled && selectedAnswer.aiSuggestedMarks && (
                <div className="ai-evaluation">
                  <div className="ai-header">
                    <FaRobot /> AI Evaluation
                    <span className="ai-confidence">
                      Confidence: {selectedAnswer.aiConfidence}%
                    </span>
                  </div>
                  <div className="ai-scores">
                    <div className="ai-score-item">
                      <span>Suggested Marks:</span>
                      <strong>{selectedAnswer.aiSuggestedMarks}/{selectedAnswer.maxMarks}</strong>
                    </div>
                    <div className="ai-feedback">
                      <h6>AI Feedback:</h6>
                      <p>{selectedAnswer.aiFeedback}</p>
                    </div>
                  </div>
                  <button 
                    className="btn-use-ai"
                    onClick={() => setAssignedMarks(selectedAnswer.aiSuggestedMarks || 0)}
                  >
                    <FaRobot /> Use AI Suggestion
                  </button>
                </div>
              )}

              {/* Evaluation Controls */}
              <div className="evaluation-controls">
                <div className="marks-control">
                  <label>Assign Marks (0 - {selectedAnswer.maxMarks})</label>
                  <div className="marks-input-group">
                    <input
                      type="range"
                      min="0"
                      max={selectedAnswer.maxMarks}
                      step="0.5"
                      value={assignedMarks}
                      onChange={(e) => setAssignedMarks(parseFloat(e.target.value))}
                      className="marks-slider"
                    />
                    <input
                      type="number"
                      min="0"
                      max={selectedAnswer.maxMarks}
                      step="0.5"
                      value={assignedMarks}
                      onChange={(e) => setAssignedMarks(parseFloat(e.target.value))}
                      className="marks-input"
                    />
                    <span className="max-marks-display">/{selectedAnswer.maxMarks}</span>
                  </div>
                </div>

                <div className="feedback-control">
                  <label>Evaluation Comments</label>
                  <textarea
                    value={evaluationNote}
                    onChange={(e) => setEvaluationNote(e.target.value)}
                    placeholder="Add your evaluation comments..."
                    rows={4}
                    className="feedback-textarea"
                  />
                </div>

                <div className="control-buttons">
                  <button className="btn-save-draft">
                    <FaSave /> Save Draft
                  </button>
                  <button
                    className="btn-submit-evaluation"
                    onClick={evaluateAnswer}
                    disabled={evaluating === selectedAnswer.id}
                  >
                    {evaluating === selectedAnswer.id ? (
                      <>
                        <span className="spinner"></span>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane /> Submit Evaluation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Templates */}
              <div className="quick-templates">
                <h6>Quick Comments:</h6>
                <div className="template-buttons">
                  <button onClick={() => setEvaluationNote('Well-structured answer with good examples.')}>
                    Good Structure
                  </button>
                  <button onClick={() => setEvaluationNote('Needs more depth and specific examples.')}>
                    Needs Depth
                  </button>
                  <button onClick={() => setEvaluationNote('Accurate and comprehensive answer.')}>
                    Comprehensive
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-panel">
              <FaEye size={48} />
              <h3>Select an Answer</h3>
              <p>Click on any answer from the list to start evaluation</p>
              <div className="panel-stats">
                <div className="stat-item">
                  <FaTachometerAlt />
                  <div>
                    <strong>{stats.pendingAnswers}</strong>
                    <span>Pending</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FaBrain />
                  <div>
                    <strong>{stats.aiAssistedCount}</strong>
                    <span>AI Assisted</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="analytics-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2><FaChartLine /> Evaluation Analytics</h2>
              <button onClick={() => setShowAnalytics(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Analytics dashboard coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluatorDashboard;
