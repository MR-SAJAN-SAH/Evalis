import React, { useState, useEffect } from 'react';
import {
  FaPlus, FaBook, FaUsers, FaPaperPlane, FaEdit, FaTrash, FaCog,
  FaCheckCircle, FaTimesCircle, FaClock, FaChevronRight, FaSearch,
  FaTimes, FaBell, FaEnvelope, FaCheck, FaArrowRight, FaHome
} from 'react-icons/fa';
import './TeacherDashboard.css';

// Types
interface Subject {
  id: string;
  name: string;
  description: string;
  options: SubjectOption[];
  createdAt: string;
  totalInvites: number;
  acceptedCount: number;
  pendingCount: number;
  teacherId: string;
}

interface SubjectOption {
  id: string;
  title: string;
  description: string;
}

interface Invitation {
  id: string;
  subjectId: string;
  subjectName: string;
  candidateEmail: string;
  candidateName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

interface Notification {
  id: string;
  type: 'accepted' | 'rejected' | 'pending';
  subject: string;
  candidate: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'invitations' | 'notifications'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Subject Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([
    { id: '1', title: '', description: '' },
  ]);

  // Edit Subject Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSubject, setInviteSubject] = useState<Subject | null>(null);
  const [inviteEmails, setInviteEmails] = useState('');

  // Selected Subject Detail
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showSubjectDetail, setShowSubjectDetail] = useState(false);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      const mockSubjects: Subject[] = [
        {
          id: '1',
          name: 'Mathematics',
          description: 'Advanced Mathematics Course',
          options: [
            { id: '1', title: 'Algebra', description: 'Basic algebraic concepts' },
            { id: '2', title: 'Calculus', description: 'Differential and integral calculus' },
            { id: '3', title: 'Statistics', description: 'Data analysis and probability' },
          ],
          createdAt: new Date().toISOString(),
          totalInvites: 5,
          acceptedCount: 3,
          pendingCount: 2,
          teacherId: 'teacher-1',
        },
      ];
      setSubjects(mockSubjects);

      const mockInvitations: Invitation[] = [
        {
          id: '1',
          subjectId: '1',
          subjectName: 'Mathematics',
          candidateEmail: 'john@gmail.com',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ];
      setInvitations(mockInvitations);

      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'accepted',
          subject: 'Mathematics',
          candidate: 'John Doe',
          message: 'accepted your invitation to Mathematics course',
          timestamp: new Date().toISOString(),
          read: false,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectName.trim()) return;

    try {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name: subjectName,
        description: subjectDescription,
        options: subjectOptions.filter(opt => opt.title.trim()),
        createdAt: new Date().toISOString(),
        totalInvites: 0,
        acceptedCount: 0,
        pendingCount: 0,
        teacherId: 'teacher-1',
      };

      // TODO: API call to save to database
      setSubjects([...subjects, newSubject]);
      resetCreateForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    try {
      const updated = subjects.map(s => 
        s.id === editingSubject.id ? editingSubject : s
      );
      // TODO: API call to update in database
      setSubjects(updated);
      setShowEditModal(false);
      setEditingSubject(null);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      // TODO: API call to delete from database
      setSubjects(subjects.filter(s => s.id !== subjectId));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleInviteCandidates = async () => {
    if (!inviteSubject || !inviteEmails.trim()) return;

    try {
      const emails = inviteEmails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email);

      const newInvitations: Invitation[] = emails.map(email => ({
        id: Date.now().toString() + Math.random(),
        subjectId: inviteSubject.id,
        subjectName: inviteSubject.name,
        candidateEmail: email,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));

      // TODO: API call to save invitations and send emails
      setInvitations([...invitations, ...newInvitations]);
      
      // Update subject counts
      const updated = subjects.map(s => 
        s.id === inviteSubject.id
          ? { ...s, totalInvites: s.totalInvites + emails.length, pendingCount: s.pendingCount + emails.length }
          : s
      );
      setSubjects(updated);

      setShowInviteModal(false);
      setInviteEmails('');
      setInviteSubject(null);
    } catch (error) {
      console.error('Error inviting candidates:', error);
    }
  };

  const resetCreateForm = () => {
    setSubjectName('');
    setSubjectDescription('');
    setSubjectOptions([{ id: '1', title: '', description: '' }]);
  };

  const addSubjectOption = () => {
    setSubjectOptions([
      ...subjectOptions,
      { id: Date.now().toString(), title: '', description: '' },
    ]);
  };

  const removeSubjectOption = (optionId: string) => {
    if (subjectOptions.length > 1) {
      setSubjectOptions(subjectOptions.filter(opt => opt.id !== optionId));
    }
  };

  const updateSubjectOption = (optionId: string, field: 'title' | 'description', value: string) => {
    setSubjectOptions(subjectOptions.map(opt =>
      opt.id === optionId ? { ...opt, [field]: value } : opt
    ));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-top">
          <div className="header-left">
            <h1>Teacher Dashboard</h1>
            <p>Manage subjects and invite candidates</p>
          </div>
          <div className="header-right">
            <button 
              className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell /> Notifications
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <FaBook /> Subjects
          </button>
          <button 
            className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
            onClick={() => setActiveTab('invitations')}
          >
            <FaPaperPlane /> Invitations
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="tab-content subjects-tab">
            <div className="section-header">
              <h2>My Subjects</h2>
              <button 
                className="btn-primary"
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(true);
                }}
              >
                <FaPlus /> Create Subject
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="empty-state">
                <FaBook size={48} />
                <h3>No subjects yet</h3>
                <p>Create your first subject to get started</p>
              </div>
            ) : (
              <div className="subjects-grid">
                {subjects.map(subject => (
                  <div key={subject.id} className="subject-card">
                    <div className="card-header">
                      <h3>{subject.name}</h3>
                      <div className="card-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => {
                            setEditingSubject(subject);
                            setShowEditModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <p className="card-description">{subject.description}</p>

                    <div className="options-preview">
                      <strong>Options:</strong>
                      <ul>
                        {subject.options.slice(0, 3).map(opt => (
                          <li key={opt.id}>{opt.title}</li>
                        ))}
                        {subject.options.length > 3 && (
                          <li>+{subject.options.length - 3} more</li>
                        )}
                      </ul>
                    </div>

                    <div className="card-stats">
                      <div className="stat">
                        <span className="stat-label">Total Invites</span>
                        <span className="stat-value">{subject.totalInvites}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label accepted">
                          <FaCheckCircle /> {subject.acceptedCount}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label pending">
                          <FaClock /> {subject.pendingCount}
                        </span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedSubject(subject);
                          setShowSubjectDetail(true);
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn-primary small"
                        onClick={() => {
                          setInviteSubject(subject);
                          setShowInviteModal(true);
                        }}
                      >
                        <FaUsers /> Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="tab-content invitations-tab">
            <div className="section-header">
              <h2>Pending Invitations</h2>
              <div className="filter-controls">
                <select defaultValue="all" className="filter-select">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {invitations.length === 0 ? (
              <div className="empty-state">
                <FaPaperPlane size={48} />
                <h3>No invitations yet</h3>
                <p>Create subjects and invite candidates</p>
              </div>
            ) : (
              <div className="invitations-list">
                {invitations.map(invitation => (
                  <div key={invitation.id} className={`invitation-item status-${invitation.status}`}>
                    <div className="invitation-info">
                      <h4>{invitation.subjectName}</h4>
                      <p className="candidate-email">{invitation.candidateEmail}</p>
                      <div className="invitation-meta">
                        <span className="date">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`status-badge ${invitation.status}`}>
                          {invitation.status === 'pending' && <FaClock />}
                          {invitation.status === 'accepted' && <FaCheckCircle />}
                          {invitation.status === 'rejected' && <FaTimesCircle />}
                          {invitation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="tab-content notifications-tab">
            <div className="section-header">
              <h2>Notifications</h2>
            </div>

            {notifications.length === 0 ? (
              <div className="empty-state">
                <FaBell size={48} />
                <h3>No notifications</h3>
                <p>You'll see notifications here when candidates respond</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {notification.type === 'accepted' && <FaCheckCircle />}
                      {notification.type === 'rejected' && <FaTimesCircle />}
                      {notification.type === 'pending' && <FaClock />}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">
                        <strong>{notification.candidate}</strong> {notification.message}
                      </p>
                      <p className="notification-subject">{notification.subject}</p>
                      <time className="notification-time">
                        {new Date(notification.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Subject</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={subjectDescription}
                  onChange={e => setSubjectDescription(e.target.value)}
                  placeholder="Describe your subject"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Subject Options</label>
                <div className="options-list">
                  {subjectOptions.map((option, index) => (
                    <div key={option.id} className="option-item">
                      <input
                        type="text"
                        placeholder="Option title"
                        value={option.title}
                        onChange={e => updateSubjectOption(option.id, 'title', e.target.value)}
                      />
                      <textarea
                        placeholder="Option description"
                        value={option.description}
                        onChange={e => updateSubjectOption(option.id, 'description', e.target.value)}
                        rows={2}
                      />
                      {subjectOptions.length > 1 && (
                        <button
                          className="btn-remove"
                          onClick={() => removeSubjectOption(option.id)}
                        >
                          <FaTrash /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="btn-secondary"
                  onClick={addSubjectOption}
                >
                  <FaPlus /> Add Option
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateSubject}>
                Create Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditModal && editingSubject && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Subject</h2>
              <button onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingSubject.description}
                  onChange={e => setEditingSubject({ ...editingSubject, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Subject Options</label>
                <div className="options-list">
                  {editingSubject.options.map((option) => (
                    <div key={option.id} className="option-item">
                      <input
                        type="text"
                        value={option.title}
                        onChange={e => {
                          const updated = editingSubject.options.map(o =>
                            o.id === option.id ? { ...o, title: e.target.value } : o
                          );
                          setEditingSubject({ ...editingSubject, options: updated });
                        }}
                      />
                      <textarea
                        value={option.description}
                        onChange={e => {
                          const updated = editingSubject.options.map(o =>
                            o.id === option.id ? { ...o, description: e.target.value } : o
                          );
                          setEditingSubject({ ...editingSubject, options: updated });
                        }}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleUpdateSubject}>
                Update Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && inviteSubject && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite Candidates to {inviteSubject.name}</h2>
              <button onClick={() => setShowInviteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Candidate Emails (one per line) *</label>
                <textarea
                  value={inviteEmails}
                  onChange={e => setInviteEmails(e.target.value)}
                  placeholder="john@gmail.com&#10;jane@gmail.com&#10;bob@gmail.com"
                  rows={6}
                  className="email-input"
                />
                <p className="hint">Enter one email per line</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleInviteCandidates}>
                Send Invitations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Detail Modal */}
      {showSubjectDetail && selectedSubject && (
        <div className="modal-overlay" onClick={() => setShowSubjectDetail(false)}>
          <div className="modal large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSubject.name}</h2>
              <button onClick={() => setShowSubjectDetail(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p className="subject-description">{selectedSubject.description}</p>
              <div className="subject-options">
                <h3>Subject Options:</h3>
                {selectedSubject.options.map(option => (
                  <div key={option.id} className="option-detail">
                    <h4>{option.title}</h4>
                    <p>{option.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
