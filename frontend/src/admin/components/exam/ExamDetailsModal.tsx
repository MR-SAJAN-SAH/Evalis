import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaLock, FaCheckCircle, FaClock, FaBook, FaClock as FaClockIcon } from 'react-icons/fa';
import './styles/ExamDetailsModal.css';

interface ExamDetails {
  id: string;
  code: string;
  name: string;
  description?: string;
  subject: string;
  category?: string;
  level?: string;
  examType: string;
  totalQuestions: number;
  durationMinutes: number;
  status: string;
  createdAt: string;
  passingScore?: number;
  negativeMarking?: boolean;
  negativeMarkPercentage?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResultsImmediately?: boolean;
  requireWebcam?: boolean;
  fullScreenRequired?: boolean;
  preventTabSwitch?: boolean;
}

interface ExamDetailsModalProps {
  isOpen: boolean;
  examId: string | null;
  onClose: () => void;
  onEdit: (exam: ExamDetails) => void;
  exam: ExamDetails | null;
}

const ExamDetailsModal: React.FC<ExamDetailsModalProps> = ({
  isOpen,
  examId,
  onClose,
  onEdit,
  exam,
}) => {
  const [loading, setLoading] = useState(false);
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(exam);

  useEffect(() => {
    if (isOpen && examId && !exam) {
      fetchExamDetails();
    } else if (exam) {
      setExamDetails(exam);
    }
  }, [isOpen, examId, exam]);

  const fetchExamDetails = async () => {
    if (!examId) return;
    
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/exams/${examId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exam details');
      }

      const data = await response.json();
      setExamDetails(data);
    } catch (error) {
      console.error('Error fetching exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (examDetails) {
      if (examDetails.status === 'PUBLISHED') {
        alert(
          'This exam is currently PUBLISHED. You cannot edit published exams.\n\n' +
          'To edit this exam, please unpublish it first (it will revert to DRAFT status), ' +
          'then you can make your changes.'
        );
        return;
      }

      const confirmEdit = window.confirm(
        `Are you sure you want to edit "${examDetails.name}"?\n\nThis will allow you to modify the exam questions and settings.`
      );

      if (confirmEdit) {
        onEdit(examDetails);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="exam-details-modal-overlay">
      <div className="exam-details-modal">
        <div className="exam-details-header">
          <h2>Exam Details</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="exam-details-loading">
            <p>Loading exam details...</p>
          </div>
        ) : examDetails ? (
          <div className="exam-details-content">
            {/* Status Badge */}
            <div className="exam-status-badge">
              {examDetails.status === 'PUBLISHED' && (
                <span className="status-published">
                  <FaCheckCircle /> PUBLISHED
                </span>
              )}
              {examDetails.status === 'DRAFT' && (
                <span className="status-draft">
                  <FaClock /> DRAFT
                </span>
              )}
              {examDetails.status === 'ARCHIVED' && (
                <span className="status-archived">
                  <FaClock /> ARCHIVED
                </span>
              )}
            </div>

            {/* Basic Information */}
            <div className="details-section">
              <h3>Basic Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Exam Code</label>
                  <p>{examDetails.code}</p>
                </div>
                <div className="detail-item">
                  <label>Exam Name</label>
                  <p>{examDetails.name}</p>
                </div>
                <div className="detail-item">
                  <label>Subject</label>
                  <p>{examDetails.subject}</p>
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <p>{examDetails.category || 'N/A'}</p>
                </div>
              </div>
              {examDetails.description && (
                <div className="detail-item full-width">
                  <label>Description</label>
                  <p>{examDetails.description}</p>
                </div>
              )}
            </div>

            {/* Exam Configuration */}
            <div className="details-section">
              <h3>Exam Configuration</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Exam Type</label>
                  <p>{examDetails.examType}</p>
                </div>
                <div className="detail-item">
                  <label>Level</label>
                  <p>{examDetails.level || 'MEDIUM'}</p>
                </div>
                <div className="detail-item">
                  <label>Total Questions</label>
                  <p>{examDetails.totalQuestions}</p>
                </div>
                <div className="detail-item">
                  <label>Duration</label>
                  <p>{examDetails.durationMinutes} minutes</p>
                </div>
              </div>
            </div>

            {/* Scoring Settings */}
            <div className="details-section">
              <h3>Scoring Settings</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Passing Score</label>
                  <p>{examDetails.passingScore || 'Not set'}%</p>
                </div>
                <div className="detail-item">
                  <label>Negative Marking</label>
                  <p>{examDetails.negativeMarking ? 'Yes' : 'No'}</p>
                </div>
                {examDetails.negativeMarking && (
                  <div className="detail-item">
                    <label>Negative Mark %</label>
                    <p>{examDetails.negativeMarkPercentage || 0}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Exam Rules */}
            <div className="details-section">
              <h3>Exam Rules & Settings</h3>
              <div className="exam-rules">
                <div className="rule-item">
                  <input
                    type="checkbox"
                    checked={examDetails.randomizeQuestions || false}
                    disabled
                  />
                  <label>Randomize Questions</label>
                </div>
                <div className="rule-item">
                  <input
                    type="checkbox"
                    checked={examDetails.randomizeOptions || false}
                    disabled
                  />
                  <label>Randomize Options</label>
                </div>
                <div className="rule-item">
                  <input
                    type="checkbox"
                    checked={examDetails.showResultsImmediately || false}
                    disabled
                  />
                  <label>Show Results Immediately</label>
                </div>
                <div className="rule-item">
                  <input
                    type="checkbox"
                    checked={examDetails.requireWebcam || false}
                    disabled
                  />
                  <label>Require Webcam</label>
                </div>
                <div className="rule-item">
                  <input
                    type="checkbox"
                    checked={examDetails.fullScreenRequired || false}
                    disabled
                  />
                  <label>Full Screen Required</label>
                </div>
                <div className="rule-item">
                  <input
                    type="checkbox"
                    checked={examDetails.preventTabSwitch || false}
                    disabled
                  />
                  <label>Prevent Tab Switch</label>
                </div>
              </div>
            </div>

            {/* Created Date */}
            <div className="details-section">
              <div className="detail-item">
                <label>Created Date</label>
                <p>{new Date(examDetails.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Edit Warning for Published Exams */}
            {examDetails.status === 'PUBLISHED' && (
              <div className="warning-box published-warning">
                <FaLock /> This exam is published and cannot be edited. To edit, unpublish it first.
              </div>
            )}
          </div>
        ) : (
          <div className="exam-details-error">
            <p>Failed to load exam details</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="exam-details-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className={`btn-primary ${examDetails?.status === 'PUBLISHED' ? 'disabled' : ''}`}
            onClick={handleEditClick}
            disabled={examDetails?.status === 'PUBLISHED'}
          >
            <FaEdit /> Edit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsModal;
