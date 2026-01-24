import React, { useState } from 'react';
import {
  FaHeart,
  FaComment,
  FaShare,
  FaDownload,
  FaPlay,
  FaTimes,
  FaImage,
  FaVideo,
  FaMusic,
  FaFile,
  FaCheckCircle,
  FaExclamationCircle,
  FaStar,
  FaClock,
  FaUser,
} from 'react-icons/fa';
import type { Announcement } from '../services/classroomAPI';
import './AnnouncementFeed.css';

interface AnnouncementFeedProps {
  announcements: Announcement[];
  isTeacher: boolean;
  onDelete?: (announcementId: string) => void;
  onTogglePin?: (announcementId: string) => void;
  onEdit?: (announcement: Announcement) => void;
  onLike?: (announcementId: string) => void;
  onComment?: (announcementId: string) => void;
}

const AnnouncementFeed: React.FC<AnnouncementFeedProps> = ({
  announcements,
  isTeacher,
  onDelete,
  onTogglePin,
  onEdit,
  onLike,
  onComment,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: string;
    url: string;
    name: string;
  } | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'audio':
        return <FaMusic />;
      case 'document':
        return <FaFile />;
      default:
        return <FaFile />;
    }
  };

  const getMediaThumbnail = (attachment: any) => {
    if (attachment.type === 'image') {
      return (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="media-thumbnail image-thumb"
          onClick={() =>
            setSelectedMedia({
              type: 'image',
              url: attachment.url,
              name: attachment.name,
            })
          }
        />
      );
    }

    if (attachment.type === 'video') {
      return (
        <div
          className="media-thumbnail video-thumb"
          onClick={() =>
            setSelectedMedia({
              type: 'video',
              url: attachment.url,
              name: attachment.name,
            })
          }
        >
          <FaPlay className="play-icon" />
          <video src={attachment.url} className="video-preview" />
        </div>
      );
    }

    return (
      <div className="media-thumbnail document-thumb">
        <div className="doc-icon">{getAttachmentIcon(attachment.type)}</div>
        <p className="doc-name">{attachment.name}</p>
      </div>
    );
  };

  if (!announcements || announcements.length === 0) {
    return (
      <div className="empty-announcements">
        <FaExclamationCircle />
        <p>No announcements yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="announcements-feed">
        {announcements.map(announcement => (
          <div
            key={announcement.id}
            className={`announcement-card ${announcement.metadata?.isPinned ? 'pinned' : ''} ${
              announcement.metadata?.priority === 'urgent'
                ? 'urgent'
                : announcement.metadata?.priority === 'high'
                  ? 'high-priority'
                  : ''
            }`}
          >
            {/* Pin Indicator */}
            {announcement.metadata?.isPinned && (
              <div className="pin-badge">
                <FaStar /> Pinned
              </div>
            )}

            {/* Priority Indicator */}
            {announcement.metadata?.priority && announcement.metadata.priority !== 'normal' && (
              <div className={`priority-badge priority-${announcement.metadata.priority}`}>
                {announcement.metadata.priority.charAt(0).toUpperCase() +
                  announcement.metadata.priority.slice(1)}{' '}
                Priority
              </div>
            )}

            {/* Cover Image */}
            {announcement.coverImage && (
              <div className="announcement-cover">
                <img
                  src={announcement.coverImage}
                  alt="Cover"
                  onClick={() =>
                    setSelectedMedia({
                      type: 'image',
                      url: announcement.coverImage,
                      name: 'Cover Image',
                    })
                  }
                />
              </div>
            )}

            {/* Header */}
            <div className="announcement-header">
              <div className="author-info">
                <div className="author-avatar">{announcement.teacherName.charAt(0)}</div>
                <div>
                  <h4 className="author-name">{announcement.teacherName}</h4>
                  <p className="post-time">
                    <FaClock /> {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>

              {isTeacher && (
                <div className="announcement-actions">
                  <button
                    className="action-btn"
                    title="Pin"
                    onClick={() => onTogglePin?.(announcement.id)}
                  >
                    <FaStar
                      style={{
                        color: announcement.metadata?.isPinned ? '#ffd700' : '#ccc',
                      }}
                    />
                  </button>
                  <button
                    className="action-btn"
                    title="Edit"
                    onClick={() => onEdit?.(announcement)}
                  >
                    ✎
                  </button>
                  <button
                    className="action-btn"
                    title="Delete"
                    onClick={() => onDelete?.(announcement.id)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="announcement-title">{announcement.title}</h3>

            {/* Requires Acknowledgment */}
            {announcement.metadata?.requiresAck && (
              <div className="requires-ack-badge">
                <FaCheckCircle /> Acknowledgment Required
              </div>
            )}

            {/* Content */}
            <div
              className={`announcement-content ${expandedId === announcement.id ? 'expanded' : ''}`}
              dangerouslySetInnerHTML={{ __html: announcement.contentHtml || announcement.content }}
            />

            {/* Media Gallery */}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="media-gallery">
                <div className="gallery-grid">
                  {announcement.attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="gallery-item"
                      onDoubleClick={() => window.open(attachment.url, '_blank')}
                    >
                      {getMediaThumbnail(attachment)}
                      {/* Only show download button for non-image files */}
                      {attachment.type !== 'image' && (
                        <div className="attachment-overlay">
                          <a href={attachment.url} download target="_blank" rel="noopener noreferrer">
                            <FaDownload /> Download
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Stats */}
            <div className="announcement-stats">
              <span className="view-count">👁️ {announcement.viewCount} views</span>
              {announcement.metadata?.tags && announcement.metadata.tags.length > 0 && (
                <div className="tags">
                  {announcement.metadata.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Section - Visible to Everyone */}
            {announcement.metadata?.comments && announcement.metadata.comments.length > 0 && (
              <div className="comments-section">
                <h5 className="comments-title">Comments ({announcement.metadata.comments.length})</h5>
                <div className="comments-list">
                  {announcement.metadata.comments.map((comment: any, idx: number) => (
                    <div key={idx} className="comment-item">
                      <div className="comment-header">
                        <strong className="comment-author">{comment.userName}</strong>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactions */}
            {!isTeacher && (
              <div className="announcement-interactions">
                <button className="interact-btn" onClick={() => onLike?.(announcement.id)}>
                  <FaHeart /> Like ({announcement.metadata?.likes || 0})
                </button>
                {announcement.metadata?.allowComments && (
                  <button className="interact-btn" onClick={() => onComment?.(announcement.id)}>
                    <FaComment /> Comment ({announcement.metadata?.comments?.length || 0})
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="media-viewer" onClick={() => setSelectedMedia(null)}>
          <div className="media-viewer-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-media" onClick={() => setSelectedMedia(null)}>
              <FaTimes />
            </button>

            {selectedMedia.type === 'image' && (
              <img src={selectedMedia.url} alt={selectedMedia.name} className="media-display" />
            )}

            {selectedMedia.type === 'video' && (
              <video src={selectedMedia.url} controls autoPlay className="media-display" />
            )}

            <p className="media-name">{selectedMedia.name}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementFeed;
