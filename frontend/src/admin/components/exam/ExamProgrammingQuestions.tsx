import React, { useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaCode, FaRobot } from 'react-icons/fa';
import ProgrammingQuestionEditor from './ProgrammingQuestionEditor';
import AIQuestionGenerator from './AIQuestionGenerator';

interface ExamProgrammingQuestionsProps {
  examData: any;
  onAddProgrammingQuestion: (question: any) => void;
  onUpdateProgrammingQuestion: (questionId: number, question: any) => void;
  onDeleteProgrammingQuestion: (questionId: number) => void;
}

const ExamProgrammingQuestions: React.FC<ExamProgrammingQuestionsProps> = ({
  examData,
  onAddProgrammingQuestion,
  onUpdateProgrammingQuestion,
  onDeleteProgrammingQuestion,
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const handleSaveQuestion = (question: any) => {
    if (editingQuestion) {
      onUpdateProgrammingQuestion(editingQuestion.id, question);
    } else {
      onAddProgrammingQuestion(question);
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

  const handleGenerateQuestionsWithAI = (aiQuestions: any[]) => {
    // Add all AI-generated questions to the exam
    aiQuestions.forEach((question) => {
      onAddProgrammingQuestion(question);
    });
    setShowAIGenerator(false);
  };

  return (
    <div className="step-form">
      <div className="form-header">
        <FaCode /> Programming Questions
      </div>

      {showEditor ? (
        <div className="question-editor-container">
          <ProgrammingQuestionEditor
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <>
          <div className="questions-list">
            {examData.programmingQuestions.length === 0 ? (
              <div className="empty-state">
                <p>No programming questions added yet. Click "Add Question" to get started.</p>
              </div>
            ) : (
              examData.programmingQuestions.map((question: any, index: number) => (
                <div key={question.id} className="question-card programming">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className="question-marks">{question.maxMarks} marks</span>
                  </div>

                  <div className="question-body">
                    <p className="question-text">{question.problemStatement}</p>
                    <div className="question-meta">
                      <span className="badge badge-difficulty">{question.difficulty}</span>
                      <span className="badge badge-info">
                        Time: {question.timeLimitSeconds}s
                      </span>
                      <span className="badge badge-info">
                        Memory: {question.memoryLimitMB}MB
                      </span>
                    </div>

                    <div className="programming-details">
                      <div className="detail-section">
                        <strong>Input Format:</strong>
                        <p>{question.inputFormat}</p>
                      </div>

                      <div className="detail-section">
                        <strong>Output Format:</strong>
                        <p>{question.outputFormat}</p>
                      </div>

                      <div className="detail-section">
                        <strong>Constraints:</strong>
                        <p>{question.constraints}</p>
                      </div>

                      <div className="detail-section">
                        <strong>Languages:</strong>
                        <div className="language-tags">
                          {question.supportedLanguages.map((lang: string) => (
                            <span key={lang} className="tag">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
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
                      onClick={() => onDeleteProgrammingQuestion(question.id)}
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
              <strong>Total Questions:</strong> {examData.programmingQuestions.length}
            </p>
            <p>
              <strong>Total Marks:</strong>{' '}
              {examData.programmingQuestions.reduce(
                (sum: number, q: any) => sum + q.maxMarks,
                0,
              )}
            </p>
          </div>

          <div className="button-group" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowEditor(true)}
            >
              <FaPlus /> Add Question
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowAIGenerator(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <FaRobot /> Generate with AI
            </button>
          </div>

          {showAIGenerator && (
            <AIQuestionGenerator
              examData={examData}
              onGenerateQuestions={handleGenerateQuestionsWithAI}
              onClose={() => setShowAIGenerator(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExamProgrammingQuestions;
