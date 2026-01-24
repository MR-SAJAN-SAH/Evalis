import React, { useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaQuestion } from 'react-icons/fa';
import QuestionEditor from './QuestionEditor';

interface ExamQuestionsProps {
  examData: any;
  onAddQuestion: (question: any) => void;
  onUpdateQuestion: (questionId: number, question: any) => void;
  onDeleteQuestion: (questionId: number) => void;
}

const ExamQuestions: React.FC<ExamQuestionsProps> = ({
  examData,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const handleSaveQuestion = (question: any) => {
    if (editingQuestion) {
      onUpdateQuestion(editingQuestion.id, question);
    } else {
      onAddQuestion(question);
    }
    setShowEditor(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setShowEditor(true);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingQuestion(null);
  };

  return (
    <div className="step-form">
      <div className="form-header">
        <FaQuestion /> MCQ Questions
      </div>

      {showEditor ? (
        <div className="question-editor-container">
          <QuestionEditor
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <>
          <div className="questions-list">
            {examData.questions.length === 0 ? (
              <div className="empty-state">
                <p>No questions added yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              examData.questions.map((question: any, index: number) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className="question-marks">{question.marks} marks</span>
                  </div>

                  <div className="question-body">
                    <p className="question-text">{question.questionText}</p>
                    <div className="question-meta">
                      <span className="badge badge-type">{question.questionType}</span>
                      <span className="badge badge-difficulty">{question.difficultyLevel}</span>
                    </div>

                    <div className="question-options">
                      <div className="option">
                        <span className="option-label">A:</span> {question.optionA}
                      </div>
                      <div className="option">
                        <span className="option-label">B:</span> {question.optionB}
                      </div>
                      {question.optionC && (
                        <div className="option">
                          <span className="option-label">C:</span> {question.optionC}
                        </div>
                      )}
                      {question.optionD && (
                        <div className="option">
                          <span className="option-label">D:</span> {question.optionD}
                        </div>
                      )}
                    </div>

                    <div className="question-answer">
                      <strong>Correct Answer:</strong> {question.correctAnswer}
                    </div>

                    {question.correctAnswerExplanation && (
                      <div className="question-explanation">
                        <strong>Explanation:</strong> {question.correctAnswerExplanation}
                      </div>
                    )}
                  </div>

                  <div className="question-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => handleEditQuestion(question)}
                      title="Edit question"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => onDeleteQuestion(question.id)}
                      title="Delete question"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="questions-summary">
            <p>
              <strong>Total Questions:</strong> {examData.questions.length}
            </p>
            <p>
              <strong>Total Marks:</strong>{' '}
              {examData.questions.reduce((sum: number, q: any) => sum + q.marks, 0)}
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowEditor(true)}
            style={{ marginTop: '20px' }}
          >
            <FaPlus /> Add Question
          </button>
        </>
      )}
    </div>
  );
};

export default ExamQuestions;
