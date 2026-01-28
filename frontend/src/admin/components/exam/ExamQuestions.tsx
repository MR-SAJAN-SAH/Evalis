import React, { useState, useRef } from 'react';
import { FaPlus, FaTrash, FaEdit, FaQuestion, FaUpload, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
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
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateQuestion = (question: any): string | null => {
    if (!question.questionText || question.questionText.trim() === '') {
      return 'Question text is required';
    }
    if (!question.optionA || question.optionA.trim() === '') {
      return 'Option A is required';
    }
    if (!question.optionB || question.optionB.trim() === '') {
      return 'Option B is required';
    }
    if (question.allowMultipleCorrect) {
      // For multiple correct answers
      if (!question.correctAnswers || question.correctAnswers.length === 0) {
        return 'At least one correct answer must be selected';
      }
    } else {
      // For single correct answer
      if (!question.correctAnswer) {
        return 'Correct answer is required';
      }
      if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        return 'Correct answer must be A, B, C, or D';
      }
    }
    if (!question.marks || question.marks <= 0) {
      return 'Marks must be greater than 0';
    }
    return null;
  };

  const parseJSONQuestions = (jsonContent: string): any[] => {
    try {
      const data = JSON.parse(jsonContent);
      
      // Support both array and object with questions property
      let questionsArray = Array.isArray(data) ? data : data.questions || [];
      
      if (!Array.isArray(questionsArray)) {
        throw new Error('JSON must contain an array of questions or an object with a "questions" property');
      }

      const parsedQuestions = questionsArray.map((q: any, index: number) => {
        // Determine if this question has multiple correct answers
        const hasMultipleCorrect = Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0;
        const correctAnswersSingle = q.correctAnswer || q.answer || '';
        
        const question: any = {
          questionText: q.questionText || q.question || q.text || '',
          questionType: q.questionType || q.type || 'MCQ',
          marks: parseFloat(q.marks || q.score || 1),
          difficultyLevel: q.difficultyLevel || q.difficulty || 'MEDIUM',
          optionA: q.optionA || q.options?.A || q.options?.[0] || '',
          optionB: q.optionB || q.options?.B || q.options?.[1] || '',
          hasImage: q.hasImage || false,
        };

        // Handle correct answers - support both single and multiple
        if (hasMultipleCorrect) {
          // Multiple correct answers mode
          question.allowMultipleCorrect = true;
          question.correctAnswers = q.correctAnswers.map((a: any) => String(a).toUpperCase());
          question.correctAnswer = question.correctAnswers[0]; // Keep first for compatibility
        } else {
          // Single correct answer mode
          question.allowMultipleCorrect = false;
          question.correctAnswer = correctAnswersSingle.toUpperCase();
          question.correctAnswers = question.correctAnswer ? [question.correctAnswer] : [];
        }

        // Only add optional fields if they have values
        const optionC = q.optionC || q.options?.C || q.options?.[2];
        const optionD = q.optionD || q.options?.D || q.options?.[3];
        
        if (optionC) question.optionC = optionC;
        if (optionD) question.optionD = optionD;
        
        if (q.correctAnswerExplanation || q.explanation) {
          question.correctAnswerExplanation = q.correctAnswerExplanation || q.explanation;
        }

        return question;
      });

      return parsedQuestions;
    } catch (error) {
      throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  };

  const handleJSONUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedQuestions = parseJSONQuestions(content);

        if (parsedQuestions.length === 0) {
          setUploadMessage({ type: 'error', text: 'No questions found in the JSON file' });
          return;
        }

        // Validate all questions
        const errors: string[] = [];
        parsedQuestions.forEach((q, idx) => {
          const error = validateQuestion(q);
          if (error) {
            errors.push(`Question ${idx + 1}: ${error}`);
          }
        });

        if (errors.length > 0) {
          setUploadMessage({ type: 'error', text: `Validation errors:\n${errors.join('\n')}` });
          return;
        }

        // Add all questions
        parsedQuestions.forEach((question) => {
          console.log('✅ Parsed question:', {
            questionText: question.questionText?.substring(0, 50),
            allowMultipleCorrect: question.allowMultipleCorrect,
            correctAnswers: question.correctAnswers,
            correctAnswer: question.correctAnswer,
          });
          onAddQuestion(question);
        });

        setUploadMessage({ 
          type: 'success', 
          text: `Successfully imported ${parsedQuestions.length} question(s)` 
        });
        
        // Clear message after 5 seconds
        setTimeout(() => setUploadMessage(null), 5000);
      } catch (error) {
        setUploadMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Failed to parse JSON file' 
        });
      }
    };

    reader.onerror = () => {
      setUploadMessage({ type: 'error', text: 'Failed to read the file' });
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="step-form">
      <div className="form-header">
        <FaQuestion /> MCQ Questions
      </div>

      {/* Upload Message Alert */}
      {uploadMessage && (
        <div className={`upload-alert upload-alert-${uploadMessage.type}`}>
          <div className="alert-icon">
            {uploadMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          </div>
          <div className="alert-content">
            <p>{uploadMessage.text}</p>
          </div>
        </div>
      )}

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
                      <strong>Correct Answer:</strong> {
                        question.allowMultipleCorrect && question.correctAnswers?.length > 0
                          ? question.correctAnswers.join(', ')
                          : question.correctAnswer
                      }
                      {question.allowMultipleCorrect && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>(Multiple answers required)</span>}
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

          <div className="questions-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowEditor(true)}
            >
              <FaPlus /> Add Question
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              title="Upload questions from JSON file"
            >
              <FaUpload /> Upload from JSON
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleJSONUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div className="json-format-info">
            <p><strong>JSON Format Examples:</strong></p>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Single Correct Answer:</p>
            <pre>{`[
  {
    "questionText": "What is 2 + 2?",
    "questionType": "MCQ",
    "marks": 1,
    "difficultyLevel": "EASY",
    "optionA": "3",
    "optionB": "4",
    "optionC": "5",
    "optionD": "6",
    "correctAnswer": "B",
    "correctAnswerExplanation": "2 + 2 = 4"
  }
]`}</pre>
            
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', marginTop: '15px' }}>Multiple Correct Answers:</p>
            <pre>{`[
  {
    "questionText": "Select all programming languages",
    "questionType": "MCQ",
    "marks": 2,
    "difficultyLevel": "MEDIUM",
    "optionA": "Java",
    "optionB": "Python",
    "optionC": "HTML",
    "optionD": "JavaScript",
    "correctAnswers": ["A", "B", "D"],
    "correctAnswerExplanation": "Java, Python, and JavaScript are programming languages. HTML is markup."
  }
]`}</pre>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamQuestions;
