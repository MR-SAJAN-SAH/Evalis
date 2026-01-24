import React, { useState } from 'react';
import { FaUpload, FaTimes, FaFile, FaCheck } from 'react-icons/fa';
import './MaterialUploadForm.css';

interface MaterialFile {
  file: File;
  name: string;
}

interface MaterialUploadFormProps {
  classroomId: string;
  onSubmit: (data: { name: string; description: string; files: File[] }) => Promise<void>;
  onCancel: () => void;
}

const MaterialUploadForm: React.FC<MaterialUploadFormProps> = ({ classroomId, onSubmit, onCancel }) => {
  const [materialName, setMaterialName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.currentTarget.files;
    if (!selectedFiles) return;

    const newFiles: MaterialFile[] = Array.from(selectedFiles).map(file => ({
      file,
      name: file.name,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    // Reset input so same file can be selected again if needed
    e.currentTarget.value = '';
    console.log('Files added:', newFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    const newFiles: MaterialFile[] = Array.from(droppedFiles).map(file => ({
      file,
      name: file.name,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!materialName.trim()) {
      setError('Please enter material name');
      return;
    }

    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        name: materialName,
        description,
        files: files.map(f => f.file),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload material');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <FaFile />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="material-upload-overlay">
      <div className="material-upload-modal">
        <div className="upload-modal-header">
          <h2>Upload Course Material</h2>
          <button className="close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="material-upload-form">
          {/* Material Name */}
          <div className="form-group">
            <label>Material Name *</label>
            <input
              type="text"
              value={materialName}
              onChange={e => setMaterialName(e.target.value)}
              placeholder="e.g., Chapter 5 Notes, Project Template"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details about this material (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label>Upload Files *</label>
            <div 
              className="file-upload-area"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
            >
              <input
                type="file"
                id="file-input"
                multiple
                onChange={handleFileSelect}
                disabled={isLoading}
                accept="*/*"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="file-upload-label">
                <FaUpload /> Click to select files or drag and drop
              </label>
              <p className="file-hint">You can upload multiple files of any type</p>
            </div>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="files-list">
              <h3>Selected Files ({files.length})</h3>
              <div className="files-container">
                {files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <div className="file-info">
                      <span className="file-icon">{getFileIcon(file.name)}</span>
                      <div className="file-details">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{formatFileSize(file.file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile(idx)}
                      disabled={isLoading}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading || files.length === 0}>
              {isLoading ? 'Uploading...' : <><FaCheck /> Upload Material</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialUploadForm;
