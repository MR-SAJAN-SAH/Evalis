import React from 'react';
import { FaCog } from 'react-icons/fa';

interface ExamSettingsProps {
  examData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ExamSettings: React.FC<ExamSettingsProps> = ({ examData, onChange }) => {
  return (
    <div className="step-form">
      <div className="form-header">
        <FaCog /> Settings & Configuration
      </div>

      {/* Timing Section */}
      <div className="form-section">
        <h3 className="section-title">Timing</h3>
        
        <div className="form-group">
          <label htmlFor="durationMinutes">Duration (Minutes) *</label>
          <input
            type="number"
            id="durationMinutes"
            name="durationMinutes"
            value={examData.durationMinutes}
            onChange={onChange}
            min="1"
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={examData.startTime}
              onChange={onChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <input
              type="datetime-local"
              id="endTime"
              name="endTime"
              value={examData.endTime}
              onChange={onChange}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Scoring Section */}
      <div className="form-section">
        <h3 className="section-title">Scoring</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="passingScore">Passing Score</label>
            <input
              type="number"
              id="passingScore"
              name="passingScore"
              value={examData.passingScore}
              onChange={onChange}
              min="0"
              step="0.5"
              className="form-input"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="negativeMarking"
              name="negativeMarking"
              checked={examData.negativeMarking}
              onChange={onChange}
            />
            <label htmlFor="negativeMarking">Enable Negative Marking</label>
          </div>
        </div>

        {examData.negativeMarking && (
          <div className="form-group">
            <label htmlFor="negativeMarkPercentage">Negative Mark Percentage (%)</label>
            <input
              type="number"
              id="negativeMarkPercentage"
              name="negativeMarkPercentage"
              value={examData.negativeMarkPercentage}
              onChange={onChange}
              min="0"
              max="100"
              step="0.5"
              className="form-input"
            />
          </div>
        )}
      </div>

      {/* Display Options Section */}
      <div className="form-section">
        <h3 className="section-title">Display Options</h3>

        <div className="checkbox-group">
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="randomizeQuestions"
              name="randomizeQuestions"
              checked={examData.randomizeQuestions}
              onChange={onChange}
            />
            <label htmlFor="randomizeQuestions">Randomize Questions</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="randomizeOptions"
              name="randomizeOptions"
              checked={examData.randomizeOptions}
              onChange={onChange}
            />
            <label htmlFor="randomizeOptions">Randomize Options</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="allowBackNavigation"
              name="allowBackNavigation"
              checked={examData.allowBackNavigation}
              onChange={onChange}
            />
            <label htmlFor="allowBackNavigation">Allow Back Navigation</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="showResultsImmediately"
              name="showResultsImmediately"
              checked={examData.showResultsImmediately}
              onChange={onChange}
            />
            <label htmlFor="showResultsImmediately">Show Results Immediately</label>
          </div>
        </div>
      </div>

      {/* Proctoring Section */}
      <div className="form-section">
        <h3 className="section-title">Proctoring & Security</h3>

        <div className="checkbox-group">
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="requireWebcam"
              name="requireWebcam"
              checked={examData.requireWebcam}
              onChange={onChange}
            />
            <label htmlFor="requireWebcam">Require Webcam</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="fullScreenRequired"
              name="fullScreenRequired"
              checked={examData.fullScreenRequired}
              onChange={onChange}
            />
            <label htmlFor="fullScreenRequired">Fullscreen Required</label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="preventTabSwitch"
              name="preventTabSwitch"
              checked={examData.preventTabSwitch}
              onChange={onChange}
            />
            <label htmlFor="preventTabSwitch">Prevent Tab Switching</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="autoSaveInterval">Auto-save Interval (Seconds)</label>
          <input
            type="number"
            id="autoSaveInterval"
            name="autoSaveInterval"
            value={examData.autoSaveInterval}
            onChange={onChange}
            min="10"
            step="10"
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};

export default ExamSettings;
