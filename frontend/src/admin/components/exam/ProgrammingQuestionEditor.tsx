import React, { useState } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

interface ProgrammingQuestionEditorProps {
  question?: any;
  onSave: (question: any) => void;
  onCancel: () => void;
}

const INITIAL_QUESTION = {
  problemStatement: '',
  inputFormat: '',
  outputFormat: '',
  constraints: '',
  examples: '',
  edgeCases: '',
  supportedLanguages: ['PYTHON'],
  functionSignatures: {},
  maxMarks: 5,
  difficulty: 'MEDIUM',
  timeLimitSeconds: 30,
  memoryLimitMB: 256,
};

const ProgrammingQuestionEditor: React.FC<ProgrammingQuestionEditorProps> = ({
  question,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState(question || INITIAL_QUESTION);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const LANGUAGES = ['PYTHON', 'JAVASCRIPT', 'CPP', 'JAVA', 'GO'];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.problemStatement)
      newErrors.problemStatement = 'Problem statement is required';
    if (!formData.inputFormat) newErrors.inputFormat = 'Input format is required';
    if (!formData.outputFormat) newErrors.outputFormat = 'Output format is required';
    if (!formData.constraints) newErrors.constraints = 'Constraints are required';
    if (formData.maxMarks <= 0) newErrors.maxMarks = 'Marks must be greater than 0';
    if (formData.supportedLanguages.length === 0)
      newErrors.languages = 'At least one language is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const numValue = type === 'number' ? Number(value) : value;

    setFormData((prev: any) => ({
      ...prev,
      [name]: numValue,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLanguageToggle = (language: string) => {
    setFormData((prev: any) => {
      const languages = prev.supportedLanguages.includes(language)
        ? prev.supportedLanguages.filter((l: string) => l !== language)
        : [...prev.supportedLanguages, language];
      return { ...prev, supportedLanguages: languages };
    });

    if (errors.languages) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.languages;
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
    <form onSubmit={handleSubmit} className="question-editor-form programming">
      <div className="editor-header">
        <h3>{question ? 'Edit Programming Question' : 'Add Programming Question'}</h3>
      </div>

      {/* Problem Statement */}
      <div className="form-group">
        <label htmlFor="problemStatement">
          Problem Statement <span className="required">*</span>
        </label>
        <textarea
          id="problemStatement"
          name="problemStatement"
          value={formData.problemStatement}
          onChange={handleInputChange}
          placeholder="Enter the problem statement..."
          rows={4}
          className={`form-input ${errors.problemStatement ? 'error' : ''}`}
        />
        {errors.problemStatement && (
          <span className="error-text">{errors.problemStatement}</span>
        )}
      </div>

      {/* Input and Output Format */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="inputFormat">
            Input Format <span className="required">*</span>
          </label>
          <textarea
            id="inputFormat"
            name="inputFormat"
            value={formData.inputFormat}
            onChange={handleInputChange}
            placeholder="Describe input format..."
            rows={2}
            className={`form-input ${errors.inputFormat ? 'error' : ''}`}
          />
          {errors.inputFormat && <span className="error-text">{errors.inputFormat}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="outputFormat">
            Output Format <span className="required">*</span>
          </label>
          <textarea
            id="outputFormat"
            name="outputFormat"
            value={formData.outputFormat}
            onChange={handleInputChange}
            placeholder="Describe output format..."
            rows={2}
            className={`form-input ${errors.outputFormat ? 'error' : ''}`}
          />
          {errors.outputFormat && <span className="error-text">{errors.outputFormat}</span>}
        </div>
      </div>

      {/* Constraints and Examples */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="constraints">
            Constraints <span className="required">*</span>
          </label>
          <textarea
            id="constraints"
            name="constraints"
            value={formData.constraints}
            onChange={handleInputChange}
            placeholder="Enter constraints..."
            rows={2}
            className={`form-input ${errors.constraints ? 'error' : ''}`}
          />
          {errors.constraints && <span className="error-text">{errors.constraints}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="examples">Examples</label>
          <textarea
            id="examples"
            name="examples"
            value={formData.examples}
            onChange={handleInputChange}
            placeholder="Enter examples..."
            rows={2}
            className="form-input"
          />
        </div>
      </div>

      {/* Edge Cases */}
      <div className="form-group">
        <label htmlFor="edgeCases">Edge Cases (Optional)</label>
        <textarea
          id="edgeCases"
          name="edgeCases"
          value={formData.edgeCases}
          onChange={handleInputChange}
          placeholder="Enter edge cases to consider..."
          rows={2}
          className="form-input"
        />
      </div>

      {/* Scoring and Difficulty */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="maxMarks">
            Marks <span className="required">*</span>
          </label>
          <input
            type="number"
            id="maxMarks"
            name="maxMarks"
            value={formData.maxMarks}
            onChange={handleInputChange}
            step="0.5"
            min="0.5"
            className={`form-input ${errors.maxMarks ? 'error' : ''}`}
          />
          {errors.maxMarks && <span className="error-text">{errors.maxMarks}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Time and Memory Limits */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="timeLimitSeconds">Time Limit (Seconds)</label>
          <input
            type="number"
            id="timeLimitSeconds"
            name="timeLimitSeconds"
            value={formData.timeLimitSeconds}
            onChange={handleInputChange}
            min="1"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="memoryLimitMB">Memory Limit (MB)</label>
          <input
            type="number"
            id="memoryLimitMB"
            name="memoryLimitMB"
            value={formData.memoryLimitMB}
            onChange={handleInputChange}
            min="1"
            className="form-input"
          />
        </div>
      </div>

      {/* Supported Languages */}
      <div className="form-group">
        <label>
          Supported Languages <span className="required">*</span>
        </label>
        {errors.languages && <span className="error-text">{errors.languages}</span>}
        <div className="language-checkboxes">
          {LANGUAGES.map((lang) => (
            <div key={lang} className="checkbox">
              <input
                type="checkbox"
                id={`lang-${lang}`}
                checked={formData.supportedLanguages.includes(lang)}
                onChange={() => handleLanguageToggle(lang)}
              />
              <label htmlFor={`lang-${lang}`}>{lang}</label>
            </div>
          ))}
        </div>
      </div>

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

export default ProgrammingQuestionEditor;
