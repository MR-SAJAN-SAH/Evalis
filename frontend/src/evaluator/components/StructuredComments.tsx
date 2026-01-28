import React, { useState } from 'react';
import { FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import '../styles/StructuredComments.css';

export type CommentType = 
  | 'conceptual_error' 
  | 'incomplete_answer' 
  | 'calculation_mistake' 
  | 'irrelevant_content' 
  | 'custom';

interface StructuredComment {
  type: CommentType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

interface StructuredCommentsProps {
  selectedComments: CommentType[];
  customComment?: string;
  onSelectComment: (commentType: CommentType) => void;
  onDeselectComment: (commentType: CommentType) => void;
  onCustomCommentChange: (comment: string) => void;
  onApplyComments: () => void;
  disabled?: boolean;
}

const COMMENT_TYPES: Record<CommentType, StructuredComment> = {
  conceptual_error: {
    type: 'conceptual_error',
    label: '💡 Conceptual Error',
    description: 'Shows misunderstanding of core concepts',
    icon: '💡',
    color: '#FF6B6B'
  },
  incomplete_answer: {
    type: 'incomplete_answer',
    label: '📝 Incomplete Answer',
    description: 'Missing parts or incomplete response',
    icon: '📝',
    color: '#FFA500'
  },
  calculation_mistake: {
    type: 'calculation_mistake',
    label: '🧮 Calculation Mistake',
    description: 'Arithmetic or calculation error',
    icon: '🧮',
    color: '#FFD93D'
  },
  irrelevant_content: {
    type: 'irrelevant_content',
    label: '❌ Irrelevant Content',
    description: 'Content not relevant to the question',
    icon: '❌',
    color: '#95A5A6'
  },
  custom: {
    type: 'custom',
    label: '✏️ Custom Note',
    description: 'Add your own comment',
    icon: '✏️',
    color: '#667EEA'
  }
};

const StructuredComments: React.FC<StructuredCommentsProps> = ({
  selectedComments,
  customComment = '',
  onSelectComment,
  onDeselectComment,
  onCustomCommentChange,
  onApplyComments,
  disabled = false
}) => {
  const [showCustomInput, setShowCustomInput] = useState(customComment.length > 0);

  const isCommentSelected = (type: CommentType) => {
    return selectedComments.includes(type);
  };

  const toggleComment = (type: CommentType) => {
    if (isCommentSelected(type)) {
      onDeselectComment(type);
    } else {
      onSelectComment(type);
    }
  };

  return (
    <div className="structured-comments">
      <div className="comments-header">
        <h4>📋 Structured Comments</h4>
        <p className="comments-subtitle">Select applicable comments for this answer</p>
      </div>

      {/* Predefined Comments */}
      <div className="predefined-comments">
        {Object.entries(COMMENT_TYPES)
          .filter(([key]) => key !== 'custom')
          .map(([key, comment]) => (
            <button
              key={key}
              className={`comment-button ${isCommentSelected(comment.type as CommentType) ? 'selected' : ''}`}
              style={{
                borderColor: isCommentSelected(comment.type as CommentType) ? comment.color : '#E0E0E0',
                backgroundColor: isCommentSelected(comment.type as CommentType) ? `${comment.color}15` : '#FFFFFF'
              }}
              onClick={() => toggleComment(comment.type as CommentType)}
              disabled={disabled}
              title={comment.description}
            >
              <span className="comment-icon">{comment.icon}</span>
              <div className="comment-text">
                <span className="comment-label">{comment.label}</span>
                <span className="comment-desc">{comment.description}</span>
              </div>
              {isCommentSelected(comment.type as CommentType) && (
                <span className="check-icon">
                  <FaCheck />
                </span>
              )}
            </button>
          ))}
      </div>

      {/* Custom Comment */}
      <div className="custom-comment-section">
        <button
          className={`add-custom-btn ${showCustomInput ? 'active' : ''}`}
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={disabled}
        >
          {showCustomInput ? (
            <>
              <FaTimes /> Cancel
            </>
          ) : (
            <>
              <FaPlus /> Add Custom Note
            </>
          )}
        </button>

        {showCustomInput && (
          <div className="custom-input-container">
            <textarea
              value={customComment}
              onChange={(e) => onCustomCommentChange(e.target.value)}
              placeholder="Enter your custom evaluation comment... (e.g., specific strengths, areas for improvement, suggestions)"
              rows={3}
              className="custom-comment-input"
              disabled={disabled}
            />
            {customComment && (
              <div className="char-count">
                {customComment.length} characters
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Comments Summary */}
      {selectedComments.length > 0 && (
        <div className="selected-summary">
          <div className="summary-title">Selected Comments:</div>
          <div className="selected-tags">
            {selectedComments.map(type => (
              <div
                key={type}
                className="comment-tag"
                style={{
                  backgroundColor: COMMENT_TYPES[type]?.color || '#667EEA',
                  color: '#FFFFFF'
                }}
              >
                <span>{COMMENT_TYPES[type]?.icon}</span>
                <span>{COMMENT_TYPES[type]?.label.split(' ').slice(1).join(' ')}</span>
                <button
                  className="tag-remove"
                  onClick={() => onDeselectComment(type)}
                  disabled={disabled}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      <button
        className="apply-comments-btn"
        onClick={onApplyComments}
        disabled={disabled || (selectedComments.length === 0 && !customComment)}
      >
        ✓ Apply Comments
      </button>

      {/* Info Box */}
      <div className="comments-info">
        <strong>💡 Tip:</strong> These structured comments will be shown to students for better learning feedback and used in analytics.
      </div>
    </div>
  );
};

export default StructuredComments;
