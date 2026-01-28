import React, { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

interface QuestionEditorProps {
  question?: any;
  onSave: (question: any) => void;
  onCancel: () => void;
}

const INITIAL_QUESTION = {
  questionText: '',
  questionType: 'MCQ',
  marks: 1,
  difficultyLevel: 'MEDIUM',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  correctAnswers: [], // Support for multiple correct answers - starts empty
  allowMultipleCorrect: false, // Flag to enable multiple correct answers
  correctAnswerExplanation: '',
  hasImage: false,
  imageUrl: '',
  imageAltText: '',
  tags: [],
};

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState(question || INITIAL_QUESTION);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.questionText) newErrors.questionText = 'Question text is required';
    if (!formData.optionA) newErrors.optionA = 'Option A is required';
    if (!formData.optionB) newErrors.optionB = 'Option B is required';
    if (formData.marks <= 0) newErrors.marks = 'Marks must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
      };
      
      // When switching to multiple correct answers mode, initialize from current single answer
      if (name === 'allowMultipleCorrect' && checked) {
        newData.correctAnswers = prev.correctAnswer ? [prev.correctAnswer] : [];
      }
      
      // When switching away from multiple mode, clear the array
      if (name === 'allowMultipleCorrect' && !checked) {
        newData.correctAnswers = [];
      }
      
      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-editor-form">
      <div className="editor-header">
        <h3>{question ? 'Edit Question' : 'Add New Question'}</h3>
      </div>

      {/* Question Text */}
      <div className="form-group">
        <label htmlFor="questionText">
          Question Text <span className="required">*</span>
        </label>
        <textarea
          id="questionText"
          name="questionText"
          value={formData.questionText}
          onChange={handleInputChange}
          placeholder="Enter the question..."
          rows={3}
          className={`form-input ${errors.questionText ? 'error' : ''}`}
        />
        {errors.questionText && <span className="error-text">{errors.questionText}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="questionType">Question Type</label>
          <select
            id="questionType"
            name="questionType"
            value={formData.questionType}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="DESCRIPTIVE">Descriptive</option>
            <option value="TRUE_FALSE">True/False</option>
            <option value="FILL_BLANKS">Fill in the Blanks</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="marks">
            Marks <span className="required">*</span>
          </label>
          <input
            type="number"
            id="marks"
            name="marks"
            value={formData.marks}
            onChange={handleInputChange}
            step="0.5"
            min="0.5"
            className={`form-input ${errors.marks ? 'error' : ''}`}
          />
          {errors.marks && <span className="error-text">{errors.marks}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="difficultyLevel">Difficulty</label>
          <select
            id="difficultyLevel"
            name="difficultyLevel"
            value={formData.difficultyLevel}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Options */}
      <div className="options-section">
        <h4>Options</h4>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="optionA">
              Option A <span className="required">*</span>
            </label>
            <input
              type="text"
              id="optionA"
              name="optionA"
              value={formData.optionA}
              onChange={handleInputChange}
              placeholder="Enter option A..."
              className={`form-input ${errors.optionA ? 'error' : ''}`}
            />
            {errors.optionA && <span className="error-text">{errors.optionA}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="optionB">
              Option B <span className="required">*</span>
            </label>
            <input
              type="text"
              id="optionB"
              name="optionB"
              value={formData.optionB}
              onChange={handleInputChange}
              placeholder="Enter option B..."
              className={`form-input ${errors.optionB ? 'error' : ''}`}
            />
            {errors.optionB && <span className="error-text">{errors.optionB}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="optionC">Option C (Optional)</label>
            <input
              type="text"
              id="optionC"
              name="optionC"
              value={formData.optionC}
              onChange={handleInputChange}
              placeholder="Enter option C..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="optionD">Option D (Optional)</label>
            <input
              type="text"
              id="optionD"
              name="optionD"
              value={formData.optionD}
              onChange={handleInputChange}
              placeholder="Enter option D..."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Correct Answer */}
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="allowMultipleCorrect"
            checked={formData.allowMultipleCorrect}
            onChange={handleInputChange}
            style={{ marginRight: '8px' }}
          />
          Allow Multiple Correct Answers
        </label>
      </div>

      {formData.allowMultipleCorrect ? (
        <div className="form-group">
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '12px' }}>Mark Correct Answers</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionKey = `option${option}`;
              if (!formData[optionKey]) return null;
              
              const isSelected = formData.correctAnswers?.includes(option) || false;
              
              return (
                <div
                  key={option}
                  onClick={() => {
                    const newCorrectAnswers = [...(formData.correctAnswers || [])];
                    if (isSelected) {
                      const index = newCorrectAnswers.indexOf(option);
                      if (index > -1) {
                        newCorrectAnswers.splice(index, 1);
                      }
                    } else {
                      if (!newCorrectAnswers.includes(option)) {
                        newCorrectAnswers.push(option);
                      }
                    }
                    setFormData((prev: any) => ({
                      ...prev,
                      correctAnswers: newCorrectAnswers,
                    }));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '12px',
                    border: isSelected ? '2px solid #2196f3' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e3f2fd' : '#f9f9f9',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ marginRight: '10px', marginTop: '2px', cursor: 'pointer' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                      Option {option}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {formData[optionKey]}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ color: '#2196f3', fontSize: '18px', fontWeight: 'bold' }}>✓</div>
                  )}
                </div>
              );
            })}
          </div>
          {formData.correctAnswers && formData.correctAnswers.length > 0 && (
            <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: '#f0f7ff', borderRadius: '6px', borderLeft: '4px solid #2196f3', fontSize: '13px', color: '#0066cc' }}>
              Selected: {formData.correctAnswers.join(', ')} (Full marks only if all selected correctly)
            </div>
          )}
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="correctAnswer">Correct Answer</label>
          <select
            id="correctAnswer"
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={(e) => {
              handleInputChange(e);
              setFormData((prev: any) => ({
                ...prev,
                correctAnswers: [e.target.value],
              }));
            }}
            className="form-input"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            {formData.optionC && <option value="C">C</option>}
            {formData.optionD && <option value="D">D</option>}
          </select>
        </div>
      )}

      {/* Explanation */}
      <div className="form-group">
        <label htmlFor="correctAnswerExplanation">Explanation (Optional)</label>
        <textarea
          id="correctAnswerExplanation"
          name="correctAnswerExplanation"
          value={formData.correctAnswerExplanation}
          onChange={handleInputChange}
          placeholder="Enter explanation for the correct answer..."
          rows={2}
          className="form-input"
        />
      </div>

      {/* Image Support */}
      <div className="form-group checkbox">
        <input
          type="checkbox"
          id="hasImage"
          name="hasImage"
          checked={formData.hasImage}
          onChange={handleInputChange}
        />
        <label htmlFor="hasImage">Include Image</label>
      </div>

      {formData.hasImage && (
        <>
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="Enter image URL..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageAltText">Image Alt Text</label>
            <input
              type="text"
              id="imageAltText"
              name="imageAltText"
              value={formData.imageAltText}
              onChange={handleInputChange}
              placeholder="Enter alt text for accessibility..."
              className="form-input"
            />
          </div>
        </>
      )}

      {/* Form Actions */}
      <div className="editor-actions">
        <button type="submit" className="btn btn-primary">
          <FaSave /> Save Question
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          <FaTimes /> Cancel
        </button>
      </div>
    </form>
  );
};

export default QuestionEditor;
