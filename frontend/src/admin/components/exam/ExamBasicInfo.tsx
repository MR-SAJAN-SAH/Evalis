import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface ExamBasicInfoProps {
  examData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ExamBasicInfo: React.FC<ExamBasicInfoProps> = ({ examData, onChange }) => {
  return (
    <div className="step-form">
      <div className="form-header">
        <FaInfoCircle /> Basic Information
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="name">Exam Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={examData.name}
            onChange={onChange}
            placeholder="e.g., Mathematics Final Exam 2024"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={examData.description}
            onChange={onChange}
            placeholder="Enter exam description..."
            rows={3}
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={examData.subject}
              onChange={onChange}
              placeholder="e.g., Mathematics"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={examData.category}
              onChange={onChange}
              className="form-input"
            >
              <option value="">Select Category</option>
              <option value="ACADEMIC">Academic</option>
              <option value="COMPETENCY">Competency</option>
              <option value="TRAINING">Training</option>
              <option value="PLACEMENT">Placement</option>
              <option value="MOCK">Mock Test</option>
              <option value="QUIZ">Quiz</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="level">Difficulty Level *</label>
            <select
              id="level"
              name="level"
              value={examData.level}
              onChange={onChange}
              className="form-input"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="examType">Exam Type *</label>
            <select
              id="examType"
              name="examType"
              value={examData.examType}
              onChange={onChange}
              className="form-input"
            >
              <option value="MCQ">Multiple Choice Questions (MCQ)</option>
              <option value="PROGRAMMING">Programming</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-info-box">
        <p>
          <strong>Note:</strong> You can change the exam type here, but questions will need to match the selected type in the next steps.
        </p>
      </div>
    </div>
  );
};

export default ExamBasicInfo;
