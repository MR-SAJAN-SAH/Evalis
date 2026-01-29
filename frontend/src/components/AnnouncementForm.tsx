import React, { useState, useRef } from 'react';
import {
  FaPlus,
  FaTimes,
  FaImage,
  FaVideo,
  FaFile,
  FaMusic,
  FaSpinner,
  FaBold,
  FaItalic,
  FaLink,
  FaList,
  FaCheck,
  FaClock,
  FaStar,
} from 'react-icons/fa';
import './AnnouncementForm.css';

interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  size?: number;
}

interface AnnouncementFormProps {
  classroomId: string;
  onAnnouncementCreated: (announcement: any) => void;
  onClose: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  classroomId,
  onAnnouncementCreated,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const attachment: AnnouncementAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        type: 'document',
        mimeType: file.type,
        size: file.size,
      };
      setAttachments([...attachments, attachment]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      setIsLoading(true);

      const announcementData = {
        classroomId,
        title,
        content,
        attachments,
        status: 'published',
        createdAt: new Date(),
      };

      onAnnouncementCreated(announcementData);
      setTitle('');
      setContent('');
      setAttachments([]);
      onClose();
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="announcement-overlay" onClick={onClose}>
      <div className="announcement-form-container" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>Create Announcement</h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="announcement-form">
          <div className="form-section">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-section">
            <label>Content *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your announcement..."
              rows={5}
              disabled={isLoading}
              required
            />
          </div>

          {attachments.length > 0 && (
            <div className="form-section">
              <label>Attachments ({attachments.length})</label>
              <div className="attachments-list">
                {attachments.map(att => (
                  <div key={att.id} className="attachment-item">
                    <span>{att.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="btn-remove"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner" /> : <FaCheck />}
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;
