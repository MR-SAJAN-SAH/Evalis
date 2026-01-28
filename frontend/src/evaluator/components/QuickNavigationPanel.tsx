import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaCircle, FaClock } from 'react-icons/fa';
import '../styles/QuickNavigationPanel.css';

interface Question {
  id: string;
  number: number;
  candidateName: string;
  status: 'unattempted' | 'marked_no_comment' | 'completed' | 'flagged';
  marks?: number;
  maxMarks?: number;
}

interface QuickNavigationPanelProps {
  questions: Question[];
  currentQuestionId?: string;
  onSelectQuestion: (questionId: string) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const QuickNavigationPanel: React.FC<QuickNavigationPanelProps> = ({
  questions,
  currentQuestionId,
  onSelectQuestion,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [stats, setStats] = useState({
    unattempted: 0,
    markedNoComment: 0,
    completed: 0,
    flagged: 0
  });

  useEffect(() => {
    // Calculate statistics
    const stats = {
      unattempted: questions.filter(q => q.status === 'unattempted').length,
      markedNoComment: questions.filter(q => q.status === 'marked_no_comment').length,
      completed: questions.filter(q => q.status === 'completed').length,
      flagged: questions.filter(q => q.status === 'flagged').length
    };
    setStats(stats);
  }, [questions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unattempted':
        return 'red'; // 🔴 Unmarked
      case 'marked_no_comment':
        return 'yellow'; // 🟡 Marked but no comment
      case 'completed':
        return 'green'; // 🟢 Completed
      case 'flagged':
        return 'orange'; // 🟠 Flagged
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unattempted':
        return 'Unmarked';
      case 'marked_no_comment':
        return 'Marked (No Comment)';
      case 'completed':
        return 'Completed';
      case 'flagged':
        return 'Flagged for Review';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle />;
      case 'flagged':
        return <FaExclamationTriangle />;
      case 'marked_no_comment':
        return <FaClock />;
      default:
        return <FaCircle />;
    }
  };

  if (isMinimized) {
    return (
      <div className="quick-nav-panel minimized">
        <button className="minimize-toggle" onClick={onToggleMinimize} title="Expand Navigation">
          <div className="mini-stats">
            <div className="mini-stat red" title="Unmarked">
              {stats.unattempted}
            </div>
            <div className="mini-stat yellow" title="Marked (No Comment)">
              {stats.markedNoComment}
            </div>
            <div className="mini-stat green" title="Completed">
              {stats.completed}
            </div>
            <div className="mini-stat orange" title="Flagged">
              {stats.flagged}
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="quick-nav-panel">
      <div className="panel-header">
        <h3>📍 Quick Navigation</h3>
        {onToggleMinimize && (
          <button className="minimize-toggle" onClick={onToggleMinimize} title="Minimize">
            ‒
          </button>
        )}
      </div>

      {/* Statistics Overview */}
      <div className="nav-stats">
        <div className="stat-box red">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <strong>{stats.unattempted}</strong>
            <small>Unmarked</small>
          </div>
        </div>
        <div className="stat-box yellow">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <strong>{stats.markedNoComment}</strong>
            <small>Marked (No Comment)</small>
          </div>
        </div>
        <div className="stat-box green">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <strong>{stats.completed}</strong>
            <small>Completed</small>
          </div>
        </div>
        <div className="stat-box orange">
          <div className="stat-icon">🟠</div>
          <div className="stat-content">
            <strong>{stats.flagged}</strong>
            <small>Flagged</small>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="questions-list">
        <div className="list-header">
          <span className="list-title">Questions</span>
          <span className="list-count">{questions.length}</span>
        </div>

        <div className="questions-scroll">
          {questions.length === 0 ? (
            <div className="empty-questions">
              <p>No questions available</p>
            </div>
          ) : (
            questions.map(question => (
              <div
                key={question.id}
                className={`question-item status-${question.status} ${
                  currentQuestionId === question.id ? 'active' : ''
                }`}
                onClick={() => onSelectQuestion(question.id)}
              >
                <div className="question-indicator">
                  <span className={`status-dot ${getStatusColor(question.status)}`}>
                    {getStatusIcon(question.status)}
                  </span>
                </div>
                <div className="question-info">
                  <div className="question-num">Q{question.number}</div>
                  <div className="candidate-name" title={question.candidateName}>
                    {question.candidateName.split(' ')[0]}
                  </div>
                </div>
                {question.marks !== undefined && question.maxMarks && (
                  <div className="marks-badge">
                    {question.marks}/{question.maxMarks}
                  </div>
                )}
                <div className="status-label">
                  {getStatusLabel(question.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="nav-legend">
        <div className="legend-title">Status Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color red">🔴</span>
            <span>Unmarked - Not yet evaluated</span>
          </div>
          <div className="legend-item">
            <span className="legend-color yellow">🟡</span>
            <span>Marked but no comment</span>
          </div>
          <div className="legend-item">
            <span className="legend-color green">🟢</span>
            <span>Completed - Fully evaluated</span>
          </div>
          <div className="legend-item">
            <span className="legend-color orange">🟠</span>
            <span>Flagged for review</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickNavigationPanel;
