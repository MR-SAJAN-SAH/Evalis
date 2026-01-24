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

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));

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
        <label htmlFor="correctAnswer">Correct Answer</label>
        <select
          id="correctAnswer"
          name="correctAnswer"
          value={formData.correctAnswer}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          {formData.optionC && <option value="C">C</option>}
          {formData.optionD && <option value="D">D</option>}
        </select>
      </div>

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
