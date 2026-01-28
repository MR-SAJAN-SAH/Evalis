import React, { useState } from 'react';
import { FaTimes, FaUpload, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './UpdateEvaluationMappingModal.css';

interface UpdateEvaluationMappingModalProps {
  examId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface MappingPreview {
  [evaluatorEmail: string]: string[];
}

const UpdateEvaluationMappingModal: React.FC<UpdateEvaluationMappingModalProps> = ({
  examId,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [mappingPreview, setMappingPreview] = useState<MappingPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Parse and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Validate JSON format
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Invalid format: Expected object with evaluator emails as keys');
        }

        // Validate structure
        for (const [evaluator, candidates] of Object.entries(parsed)) {
          if (!Array.isArray(candidates)) {
            throw new Error(`Invalid format for "${evaluator}": Expected array of candidate emails`);
          }
        }

        setMappingPreview(parsed);
        setShowPreview(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid JSON file');
        setMappingPreview(null);
        setShowPreview(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !mappingPreview) {
      setError('Please select a valid JSON file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/exams/${examId}/evaluation-mapping/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload evaluation mapping');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload evaluation mapping');
    } finally {
      setLoading(false);
    }
  };

  const getTotalMappings = () => {
    if (!mappingPreview) return 0;
    return Object.entries(mappingPreview).reduce((sum, [_, candidates]) => sum + candidates.length, 0);
  };

  const getEvaluatorCount = () => {
    return mappingPreview ? Object.keys(mappingPreview).length : 0;
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>Update Evaluation Mapping</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Instructions */}
          <div className="instructions-section">
            <h3>How to Upload Evaluation Mapping</h3>
            <p>Upload a JSON file with the following format:</p>
            <pre className="code-block">{`{
  "evaluator1@email.com": ["candidate1@email.com", "candidate2@email.com"],
  "evaluator2@email.com": ["candidate3@email.com", "candidate4@email.com"]
}`}</pre>
            <p className="note">
              <FaExclamationTriangle /> Candidates not mapped will be randomly assigned to any evaluator
            </p>
          </div>

          {/* File Upload */}
          <div className="upload-section">
            <label className="file-input-label">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={loading}
              />
              <span className="file-input-button">
                <FaUpload /> Choose JSON File
              </span>
            </label>
            {file && <p className="file-name">Selected: {file.name}</p>}
          </div>

          {/* Preview */}
          {showPreview && mappingPreview && (
            <div className="preview-section">
              <div className="preview-stats">
                <div className="stat">
                  <span className="stat-label">Evaluators</span>
                  <span className="stat-value">{getEvaluatorCount()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Mappings</span>
                  <span className="stat-value">{getTotalMappings()}</span>
                </div>
              </div>

              <div className="mappings-preview">
                <h4>Mapping Preview</h4>
                <div className="mappings-list">
                  {Object.entries(mappingPreview).map(([evaluator, candidates]) => (
                    <div key={evaluator} className="mapping-item">
                      <div className="evaluator-info">
                        <strong>{evaluator}</strong>
                        <span className="candidate-count">{candidates.length} candidate(s)</span>
                      </div>
                      <div className="candidates-list">
                        {candidates.slice(0, 3).map((candidate, idx) => (
                          <span key={idx} className="candidate-badge">
                            {candidate}
                          </span>
                        ))}
                        {candidates.length > 3 && (
                          <span className="candidate-badge more">
                            +{candidates.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <FaCheck /> Evaluation mapping uploaded successfully!
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || !mappingPreview || loading}
          >
            {loading ? 'Uploading...' : 'Upload Mapping'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateEvaluationMappingModal;
