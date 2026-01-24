import React from 'react';
import { FaCheckCircle, FaEye } from 'react-icons/fa';

interface ExamReviewProps {
  examData: any;
}

const ExamReview: React.FC<ExamReviewProps> = ({ examData }) => {
  const questionCount =
    examData.examType === 'MCQ'
      ? examData.questions.length
      : examData.programmingQuestions.length;

  const totalMarks =
    examData.examType === 'MCQ'
      ? examData.questions.reduce((sum: number, q: any) => sum + q.marks, 0)
      : examData.programmingQuestions.reduce((sum: number, q: any) => sum + q.maxMarks, 0);

  return (
    <div className="step-form review-form">
      <div className="form-header">
        <FaCheckCircle /> Review Exam Details
      </div>

      {/* Basic Information Review */}
      <div className="review-section">
        <h3 className="section-title">Basic Information</h3>
        <div className="review-grid">
          <div className="review-item">
            <label>Exam Name</label>
            <p>{examData.name}</p>
          </div>
          <div className="review-item">
            <label>Subject</label>
            <p>{examData.subject}</p>
          </div>
          <div className="review-item">
            <label>Category</label>
            <p>{examData.category}</p>
          </div>
          <div className="review-item">
            <label>Level</label>
            <p>{examData.level}</p>
          </div>
          <div className="review-item">
            <label>Exam Type</label>
            <p>{examData.examType === 'MCQ' ? 'Multiple Choice Questions' : 'Programming'}</p>
          </div>
          {examData.description && (
            <div className="review-item full-width">
              <label>Description</label>
              <p>{examData.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timing Review */}
      <div className="review-section">
        <h3 className="section-title">Timing</h3>
        <div className="review-grid">
          <div className="review-item">
            <label>Duration</label>
            <p>{examData.durationMinutes} minutes</p>
          </div>
          <div className="review-item">
            <label>Start Time</label>
            <p>{new Date(examData.startTime).toLocaleString()}</p>
          </div>
          <div className="review-item">
            <label>End Time</label>
            <p>{new Date(examData.endTime).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Scoring Review */}
      <div className="review-section">
        <h3 className="section-title">Scoring</h3>
        <div className="review-grid">
          <div className="review-item">
            <label>Total Questions</label>
            <p className="highlight">{questionCount}</p>
          </div>
          <div className="review-item">
            <label>Total Marks</label>
            <p className="highlight">{totalMarks}</p>
          </div>
          <div className="review-item">
            <label>Passing Score</label>
            <p>{examData.passingScore}</p>
          </div>
          {examData.negativeMarking && (
            <div className="review-item">
              <label>Negative Marking</label>
              <p>{examData.negativeMarkPercentage}% per wrong answer</p>
            </div>
          )}
        </div>
      </div>

      {/* Display Options Review */}
      <div className="review-section">
        <h3 className="section-title">Display Options</h3>
        <div className="review-features">
          {examData.randomizeQuestions && (
            <div className="feature-badge">Questions Randomized</div>
          )}
          {examData.randomizeOptions && (
            <div className="feature-badge">Options Randomized</div>
          )}
          {examData.allowBackNavigation && (
            <div className="feature-badge">Back Navigation Allowed</div>
          )}
          {examData.showResultsImmediately && (
            <div className="feature-badge">Results Shown Immediately</div>
          )}
          {!examData.randomizeQuestions &&
            !examData.randomizeOptions &&
            !examData.allowBackNavigation &&
            !examData.showResultsImmediately && (
              <p className="no-features">No special display options enabled</p>
            )}
        </div>
      </div>

      {/* Proctoring Review */}
      <div className="review-section">
        <h3 className="section-title">Proctoring & Security</h3>
        <div className="review-features">
          {examData.requireWebcam && <div className="feature-badge">Webcam Required</div>}
          {examData.fullScreenRequired && (
            <div className="feature-badge">Fullscreen Required</div>
          )}
          {examData.preventTabSwitch && (
            <div className="feature-badge">Tab Switching Prevented</div>
          )}
          {!examData.requireWebcam &&
            !examData.fullScreenRequired &&
            !examData.preventTabSwitch && (
              <p className="no-features">No proctoring options enabled</p>
            )}
          <div className="feature-detail">
            Auto-save: Every {examData.autoSaveInterval} seconds
          </div>
        </div>
      </div>

      {/* Questions Summary */}
      <div className="review-section">
        <h3 className="section-title">Questions Summary</h3>
        <div className="questions-summary-box">
          <div className="summary-stat">
            <span className="stat-label">Total Questions</span>
            <span className="stat-value">{questionCount}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Total Marks</span>
            <span className="stat-value">{totalMarks}</span>
          </div>

          {examData.examType === 'MCQ' && (
            <>
              <div className="summary-stat">
                <span className="stat-label">Avg Marks per Question</span>
                <span className="stat-value">
                  {questionCount > 0 ? (totalMarks / questionCount).toFixed(2) : '0'}
                </span>
              </div>
            </>
          )}
        </div>

        {questionCount > 0 ? (
          <div className="review-info-box">
            <p>
              <strong>Ready to submit:</strong> Your exam has all required information and{' '}
              {questionCount} question{questionCount !== 1 ? 's' : ''}. You can now click the
              "Create Exam" button to save the exam.
            </p>
          </div>
        ) : (
          <div className="review-warning-box">
            <p>
              <strong>Warning:</strong> You must add at least one question before submitting the
              exam. Please go back to the previous step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamReview;
