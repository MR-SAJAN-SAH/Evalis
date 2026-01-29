// src/pages/candidate/ExamResults.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/apiHelper';
import {
  FaArrowLeft,
  FaTrophy,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaAward,
  FaChartLine,
  FaSpinner,
} from 'react-icons/fa';
import './ExamResults.css';

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  marks: number;
  correctAnswer: string;
  correctAnswers?: string[]; // For multiple correct answers
  allowMultipleCorrect?: boolean; // Flag for multiple correct mode
  userAnswer?: string | string[];
  isCorrect?: boolean;
}

interface ExamResult {
  id: string;
  name: string;
  subject: string;
  examType: string;
  score: number;
  totalMarks: number;
  passingScore: number;
  durationMinutes: number;
  completedAt: string;
  status: 'PASSED' | 'FAILED';
  questions: Question[];
  submissionId: string;
}

const ExamResults: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching exam result for:', examId);

        // First, get submissions to find the exam result
        const submissionsResponse = await fetch(getApiUrl('/exams/candidate/submissions'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!submissionsResponse.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const submissions = await submissionsResponse.json();
        console.log('📋 Submissions received:', submissions);

        // Find the result for this exam
        const examResult = submissions.find((s: any) => s.id === examId);
        if (!examResult) {
          throw new Error('Exam result not found');
        }

        // Get the full exam details with questions
        const examResponse = await fetch(`/api/exams/${examId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!examResponse.ok) {
          throw new Error('Failed to fetch exam details');
        }

        const examData = await examResponse.json();
        console.log('📚 Exam data received:', examData);

        // Get exam with correct answers for results view
        const resultsResponse = await fetch(`/api/exams/${examId}/results-view`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        let examWithAnswers = examData;
        if (resultsResponse.ok) {
          examWithAnswers = await resultsResponse.json();
          console.log('📊 Exam with correct answers:', examWithAnswers);
        }

        // Get submission details with answers
        const submissionResponse = await fetch(`/api/exams/${examId}/submission-details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        let submissionAnswers: any = {};
        if (submissionResponse.ok) {
          const submissionDetails = await submissionResponse.json();
          submissionAnswers = submissionDetails.answers || {};
          console.log('✅ Submission answers object:', submissionAnswers);
          console.log('📊 Submission answers keys:', Object.keys(submissionAnswers));
        }

        console.log('🔍 Enriching questions with answers...');
        // Enrich questions with user answers using the exam with correct answers
        const enrichedQuestions = (examWithAnswers.questions || []).map((q: any) => {
          const userAnswer = submissionAnswers[q.id];
          console.log(`Q${q.id}: looking for answer in submissionAnswers[${q.id}] = ${userAnswer}, correct = ${q.correctAnswer}`);
          
          let isCorrect = false;
          if (q.allowMultipleCorrect && q.correctAnswers) {
            // For multiple correct answers - check if user selected all correct answers and no wrong ones
            const userAnswers = Array.isArray(userAnswer) ? userAnswer : (userAnswer ? [userAnswer] : []);
            const correctAnswers: string[] = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswers];
            
            // Check if user answers match correct answers exactly
            isCorrect = userAnswers.length === correctAnswers.length &&
                        userAnswers.every((a: string) => correctAnswers.includes(a)) &&
                        correctAnswers.every((a: string) => userAnswers.includes(a));
          } else {
            // For single correct answer - simple comparison
            isCorrect = userAnswer === q.correctAnswer;
          }
          
          return {
            ...q,
            userAnswer: userAnswer || null,
            isCorrect: isCorrect,
          };
        });

        const completeResult: ExamResult = {
          ...examResult,
          questions: enrichedQuestions,
        };

        setResult(completeResult);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error fetching exam result:', err);
        setError(err.message || 'Failed to load exam results');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && examId) {
      fetchExamResult();
    }
  }, [examId, accessToken]);

  if (loading) {
    return (
      <div className="exam-results-container loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
          <p>Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="exam-results-container error">
        <div className="error-content">
          <FaTimesCircle className="error-icon" />
          <h2>Error Loading Results</h2>
          <p>{error || 'Exam results not found'}</p>
          <button className="back-btn" onClick={() => navigate('/candidate/dashboard/results')}>
            <FaArrowLeft /> Back to Results
          </button>
        </div>
      </div>
    );
  }

  const correctAnswers = result.questions.filter(q => q.isCorrect).length;
  const percentage = result.score;
  const hasPassed = percentage >= result.passingScore;
  
  // Calculate correct answers from percentage if questions data is incomplete
  const calculatedCorrectAnswers = Math.round((percentage / 100) * result.questions.length);

  return (
    <div className="exam-results-container">
      <div className="results-header">
        <button className="back-btn" onClick={() => navigate('/candidate/dashboard/results')}>
          <FaArrowLeft /> Back to Results
        </button>
      </div>

      <div className="results-wrapper">
        {/* Score Summary */}
        <div className={`score-summary ${hasPassed ? 'passed' : 'failed'}`}>
          <div className="summary-header-top">
            <div>
              <h2>{result.name}</h2>
              <p className="subject">{result.subject}</p>
            </div>
            <div className={`status-badge-large ${hasPassed ? 'passed' : 'failed'}`}>
              {hasPassed ? 'PASSED' : 'FAILED'}
            </div>
          </div>

          <div className="summary-info">
            <div className="summary-stats">
              <div className="stat">
                <FaAward className="stat-icon" />
                <div className="stat-content">
                  <span className="label">Your Score</span>
                  <span className="value">{percentage}%</span>
                </div>
              </div>
              <div className="stat">
                <FaTrophy className="stat-icon" />
                <div className="stat-content">
                  <span className="label">Passing Score</span>
                  <span className="value">{result.passingScore}%</span>
                </div>
              </div>
              <div className="stat">
                <FaCheckCircle className="stat-icon" />
                <div className="stat-content">
                  <span className="label">Correct Answers</span>
                  <span className="value">{calculatedCorrectAnswers}/{result.questions.length}</span>
                </div>
              </div>
              <div className="stat">
                <FaClock className="stat-icon" />
                <div className="stat-content">
                  <span className="label">Completed</span>
                  <span className="value">{new Date(result.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="questions-review">
          <h3><FaChartLine /> Question Review</h3>
          
          <div className="questions-list">
            {result.questions.map((question, index) => (
              <div
                key={question.id}
                className={`question-review ${question.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div
                  className="question-header"
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === question.id ? null : question.id
                    )
                  }
                >
                  <div className="question-number-status">
                    <span className="question-number">Q{index + 1}</span>
                    {!question.isCorrect && (
                      <FaTimesCircle className="status-icon incorrect" />
                    )}
                  </div>
                  <div className="question-text-marks">
                    <p className="question-text">{question.questionText}</p>
                    <span className="marks">{question.marks} marks</span>
                  </div>
                </div>

                {expandedQuestion === question.id && (
                  <div className="question-details">
                    <div className="options">
                      <div className={`option ${question.userAnswer === 'A' ? 'selected' : ''}`}>
                        <span className="option-letter">A)</span>
                        <span className="option-text">{question.optionA}</span>
                      </div>
                      <div className={`option ${question.userAnswer === 'B' ? 'selected' : ''}`}>
                        <span className="option-letter">B)</span>
                        <span className="option-text">{question.optionB}</span>
                      </div>
                      {question.optionC && (
                        <div className={`option ${question.userAnswer === 'C' ? 'selected' : ''}`}>
                          <span className="option-letter">C)</span>
                          <span className="option-text">{question.optionC}</span>
                        </div>
                      )}
                      {question.optionD && (
                        <div className={`option ${question.userAnswer === 'D' ? 'selected' : ''}`}>
                          <span className="option-letter">D)</span>
                          <span className="option-text">{question.optionD}</span>
                        </div>
                      )}
                    </div>

                    <div className="answer-review">
                      {question.userAnswer && (
                        <div className={`user-answer ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                          <strong>Your Answer:</strong> 
                          <span>{question.userAnswer}</span>
                        </div>
                      )}
                      {!question.userAnswer && (
                        <div className="user-answer unanswered">
                          <strong>Your Answer:</strong> 
                          <span>Not Answered</span>
                        </div>
                      )}
                      {(question.correctAnswers && question.correctAnswers.length > 0 || question.correctAnswer) && (
                        <div className="correct-answer">
                          <strong>Correct Answer:</strong> 
                          <span>
                            {question.correctAnswers && question.correctAnswers.length > 0
                              ? question.correctAnswers.join('')
                              : question.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/candidate/dashboard/results')}
          >
            <FaArrowLeft /> Back to Results
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/candidate/dashboard/exams')}
          >
            Take Another Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
