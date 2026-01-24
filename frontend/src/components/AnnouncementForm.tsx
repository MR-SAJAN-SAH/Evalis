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
import { announcementAPI } from '../services/classroomAPI';
import type { AnnouncementAttachment } from '../services/classroomAPI';
import './AnnouncementForm.css';

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
  const [coverImage, setCoverImage] = useState<AnnouncementAttachment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [requiresAck, setRequiresAck] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      console.log(`📤 Uploading file: ${file.name}`);

      const response = await announcementAPI.uploadFile(file, classroomId);

      if (response.success && response.data) {
        const attachment = response.data;
        // Ensure all required fields are present
        const completeAttachment: AnnouncementAttachment = {
          id: attachment.id || '',
          name: attachment.name || file.name,
          url: attachment.url || '',
          type: attachment.type as any || 'document',
          mimeType: attachment.mimeType || file.type || 'application/octet-stream',
          size: attachment.size || file.size,
          uploadedAt: attachment.uploadedAt ? new Date(attachment.uploadedAt) : new Date(),
        };
        setAttachments([...attachments, completeAttachment]);
        console.log(`✅ File uploaded:`, completeAttachment);
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      console.log(`📤 Uploading cover image: ${file.name}`);

      const response = await announcementAPI.uploadFile(file, classroomId);

      if (response.success && response.data) {
        const attachment = response.data;
        // Ensure all required fields are present
        const completeCoverImage: AnnouncementAttachment = {
          id: attachment.id || '',
          name: attachment.name || file.name,
          url: attachment.url || '',
          type: (attachment.type as any) || 'image',
          mimeType: attachment.mimeType || file.type || 'image/jpeg',
          size: attachment.size || file.size,
          uploadedAt: attachment.uploadedAt ? new Date(attachment.uploadedAt) : new Date(),
        };
        setCoverImage(completeCoverImage);
        console.log(`✅ Cover image uploaded:`, completeCoverImage);
      }
    } catch (error) {
      console.error('❌ Error uploading cover image:', error);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      setIsLoading(true);
      console.log(`📢 Creating announcement: ${title}`);
      console.log(`🎯 Classroom ID: ${classroomId}`);
      console.log(`📎 Attachments: ${attachments.length}`);
      console.log(`🖼️ Cover Image: ${coverImage?.name || 'None'}`);

      // Ensure attachments have properly serialized dates
      const serializedAttachments = attachments.map(att => ({
        ...att,
        uploadedAt: att.uploadedAt instanceof Date ? att.uploadedAt.toISOString() : att.uploadedAt,
      }));

      const announcementData = {
        classroomId,
        title,
        content,
        attachments: serializedAttachments,
        coverImage: coverImage?.url || undefined,
        status: isDraft ? 'draft' : 'published',
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        metadata: {
          isPinned: false,
          priority,
          tags: [],
          allowComments: true,
          requiresAck,
        },
      };

      console.log(`📦 Sending announcement data:`, announcementData);

      const response = await announcementAPI.createAnnouncement(announcementData as any);

      if (response.success && response.data) {
        console.log(`✅ Announcement created successfully`);
        onAnnouncementCreated(response.data);
        setTitle('');
        setContent('');
        setAttachments([]);
        setCoverImage(null);
        setPriority('normal');
        setRequiresAck(false);
        setIsDraft(false);
        setScheduledFor('');
        onClose();
      } else {
        alert(`Failed to create announcement: ${response.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('❌ Error creating announcement:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      alert(`Failed to create announcement: ${errorMessage}`);
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
          {/* Cover Image */}
          {coverImage && (
            <div className="cover-image-preview">
              <img src={coverImage.url} alt="Cover" className="cover-img" />
              <button
                type="button"
                className="btn-remove-cover"
                onClick={removeCoverImage}
              >
                <FaTimes />
              </button>
            </div>
          )}

          {!coverImage && (
            <button
              type="button"
              className="btn-add-cover"
              onClick={() => imageInputRef.current?.click()}
            >
              <FaImage /> Add Cover Image
            </button>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="Announcement Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-input title-input"
            required
          />

          {/* Priority & Settings */}
          <div className="form-settings">
            <div className="setting-group">
              <label>Priority:</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="priority-select"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <label className="checkbox-setting">
              <input
                type="checkbox"
                checked={requiresAck}
                onChange={e => setRequiresAck(e.target.checked)}
              />
              <span>Requires Acknowledgment</span>
            </label>

            <label className="checkbox-setting">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={e => setIsDraft(e.target.checked)}
              />
              <span>Save as Draft</span>
            </label>
          </div>

          {/* Schedule */}
          <div className="form-group">
            <label className="form-label">
              <FaClock /> Schedule (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={e => setScheduledFor(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Content Editor */}
          <div className="editor-container">
            <div className="editor-toolbar">
              <button type="button" className="toolbar-btn" title="Bold">
                <FaBold />
              </button>
              <button type="button" className="toolbar-btn" title="Italic">
                <FaItalic />
              </button>
              <button type="button" className="toolbar-btn" title="Link">
                <FaLink />
              </button>
              <button type="button" className="toolbar-btn" title="List">
                <FaList />
              </button>
              <div className="toolbar-separator"></div>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => imageInputRef.current?.click()}
                title="Add Image"
              >
                <FaImage />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => videoInputRef.current?.click()}
                title="Add Video"
              >
                <FaVideo />
              </button>
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => documentInputRef.current?.click()}
                title="Add Document"
              >
                <FaFile />
              </button>
            </div>

            <textarea
              placeholder="Write your announcement here... You can mention @students or use #hashtags"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="attachments-section">
              <h4>Attachments ({attachments.length})</h4>
              <div className="attachments-list">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="attachment-item">
                    <div className="attachment-info">
                      <span className="attachment-icon">
                        {attachment.type === 'image' && <FaImage />}
                        {attachment.type === 'video' && <FaVideo />}
                        {attachment.type === 'audio' && <FaMusic />}
                        {attachment.type === 'document' && <FaFile />}
                      </span>
                      <div>
                        <p className="attachment-name">{attachment.name}</p>
                        <p className="attachment-size">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-attachment"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinner" /> Publishing...
                </>
              ) : (
                <>
                  <FaCheck /> {isDraft ? 'Save Draft' : 'Publish'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              handleCoverImageUpload(file);
            }
          }}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={e => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          hidden
          onChange={e => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />
      </div>
    </div>
  );
};

export default AnnouncementForm;
