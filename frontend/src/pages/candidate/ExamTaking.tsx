// src/pages/candidate/ExamTaking.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaChevronLeft,
  FaChevronRight,
  FaFlag,
  FaCheck,
  FaTimes,
  FaSignOutAlt,
  FaClock,
  FaQuestionCircle,
} from 'react-icons/fa';
import './ExamTaking.css';

interface Question {
  id: string;
  questionText: string;
  options?: string[];
  questionType: string;
  marks: number;
}

interface Exam {
  id: string;
  name: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  requireWebcam: boolean;
  fullScreenRequired: boolean;
  questions: Question[];
}

interface Answer {
  questionId: string;
  answer: string | null;
  isMarked: boolean;
}

const ExamTaking: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();

  // State management
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        console.log('📚 Fetching exam:', examId);

        const response = await fetch(`/api/exams/${examId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch exam details');
        }

        const data = await response.json();
        console.log('✅ Exam loaded:', data);
        setExam(data);

        // Initialize time
        setTimeRemaining(data.durationMinutes * 60);

        // Initialize answers
        const initialAnswers = data.questions.map((q: Question) => ({
          questionId: q.id,
          answer: null,
          isMarked: false,
        }));
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('❌ Error fetching exam:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && examId) {
      fetchExam();
    }
  }, [examId, accessToken]);

  // Timer effect
  useEffect(() => {
    if (!exam || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  // Fullscreen effect
  useEffect(() => {
    if (exam?.fullScreenRequired) {
      const handleFullScreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullScreenChange);
      return () =>
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }
  }, [exam]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getTimeColor = () => {
    const minutes = timeRemaining / 60;
    if (minutes < 5) return '#ef4444';
    if (minutes < 10) return '#f59e0b';
    return '#10b981';
  };

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].answer = answer;
    setAnswers(newAnswers);
  };

  const handleMarkQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].isMarked = !newAnswers[currentQuestionIndex].isMarked;
    setAnswers(newAnswers);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleExitExam = () => {
    setShowExitConfirm(true);
  };

  const handleSubmitExam = async () => {
    try {
      console.log('📤 Submitting exam...');

      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      const result = await response.json();
      console.log('✅ Exam submitted:', result);

      alert(`Exam submitted successfully!\nYour score: ${result.score}/${exam?.totalMarks}`);
      navigate('/candidate/dashboard');
    } catch (err) {
      console.error('❌ Error submitting exam:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit exam');
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    navigate('/candidate/dashboard');
  };

  const currentAnswer = answers[currentQuestionIndex];
  const unansweredCount = answers.filter((a) => a.answer === null).length;
  const markedCount = answers.filter((a) => a.isMarked).length;

  if (loading) {
    return (
      <div className="exam-loading">
        <div className="spinner"></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="exam-error">
        <h2>Error Loading Exam</h2>
        <p>{error || 'Failed to load exam'}</p>
        <button onClick={() => navigate('/candidate/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="exam-taking-container">
      {/* Header */}
      <header className="exam-header">
        <div className="exam-header-left">
          <h1>{exam.name}</h1>
        </div>
        <div className="exam-header-center">
          <div className="exam-timer" style={{ color: getTimeColor() }}>
            <FaClock />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="exam-header-right">
          <button className="btn-exit" onClick={handleExitExam}>
            <FaSignOutAlt /> Exit
          </button>
        </div>
      </header>

      <div className="exam-content">
        {/* Left Panel - Questions List */}
        <aside className="exam-sidebar">
          <div className="sidebar-stats">
            <div className="stat">
              <strong>{exam.totalQuestions}</strong>
              <small>Total</small>
            </div>
            <div className="stat">
              <strong>{answers.filter((a) => a.answer !== null).length}</strong>
              <small>Answered</small>
            </div>
            <div className="stat">
              <strong>{unansweredCount}</strong>
              <small>Unanswered</small>
            </div>
            <div className="stat">
              <strong>{markedCount}</strong>
              <small>Marked</small>
            </div>
          </div>

          <div className="questions-grid">
            {exam.questions.map((question, index) => {
              const answer = answers[index];
              let status = 'unanswered';
              if (answer.isMarked) status = 'marked';
              else if (answer.answer !== null) status = 'answered';

              return (
                <button
                  key={question.id}
                  className={`question-btn question-${status} ${
                    index === currentQuestionIndex ? 'active' : ''
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content - Question Display */}
        <main className="exam-main">
          <div className="question-container">
            <div className="question-header">
              <h2>Question {currentQuestionIndex + 1} of {exam.totalQuestions}</h2>
              <div className="question-meta">
                <span className="marks">Marks: {currentQuestion.marks}</span>
              </div>
            </div>

            <div className="question-text">
              <p>{currentQuestion.questionText}</p>
            </div>

            <div className="question-options">
              {currentQuestion.options && currentQuestion.options.map((option, index) => (
                <label key={index} className="option">
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={currentAnswer.answer === option}
                    onChange={() => handleAnswerChange(option)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>

            <div className="question-actions">
              <button
                className={`btn-mark ${currentAnswer.isMarked ? 'marked' : ''}`}
                onClick={handleMarkQuestion}
              >
                <FaFlag /> {currentAnswer.isMarked ? 'Unmark' : 'Mark for Review'}
              </button>
            </div>

            <div className="navigation-buttons">
              <button
                className="btn-nav"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <FaChevronLeft /> Previous
              </button>

              <button
                className="btn-nav"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === exam.questions.length - 1}
              >
                Next <FaChevronRight />
              </button>
            </div>

            <button className="btn-submit" onClick={() => setShowSubmitConfirm(true)}>
              <FaCheck /> Submit Exam
            </button>
          </div>
        </main>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Exit Exam?</h3>
            <p>Are you sure you want to exit the exam? Your progress will be lost.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowExitConfirm(false)}>
                Continue Exam
              </button>
              <button className="btn-danger" onClick={confirmExit}>
                Exit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Submit Exam?</h3>
            <p>
              Unanswered questions: <strong>{unansweredCount}</strong>
            </p>
            <p>Are you sure you want to submit the exam?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSubmitConfirm(false)}>
                Review
              </button>
              <button className="btn-success" onClick={handleSubmitExam}>
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTaking;
