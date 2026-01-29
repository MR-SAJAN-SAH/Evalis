import React, { useState, useEffect } from 'react';
import {
  FaBell, FaTimes, FaCheckCircle, FaTimesCircle, FaClock, FaEnvelope
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './CandidateInvitationCenter.css';

interface Invitation {
  id: string;
  classroomId: string;
  classroomName?: string;
  candidateEmail: string;
  candidateName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInvitationAccepted?: (subject: string) => void;
}

const CandidateInvitationCenter: React.FC<Props> = ({
  isOpen,
  onClose,
  onInvitationAccepted,
}) => {
  const { userEmail } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      console.log(`📥 Loading pending invitations for: ${userEmail}`);
      
      // Mock empty invitations
      setInvitations([]);
    } catch (error) {
      console.error('❌ Error loading invitations:', error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (invitationId: string, status: 'accepted' | 'rejected') => {
    try {
      setRespondingTo(invitationId);
      console.log(`Responding to invitation ${invitationId} with status: ${status}`);
      
      // Mock response
      console.log(`✅ Invitation ${status} successfully`);
      
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (invitation && status === 'accepted' && onInvitationAccepted) {
        onInvitationAccepted(invitation.classroomName || 'Classroom');
      }

      // Update invitations list
      setInvitations(invitations.map(inv =>
        inv.id === invitationId ? { ...inv, status } : inv
      ));
      
      // Reload invitations after a short delay
      setTimeout(() => {
        loadInvitations();
      }, 500);
    } catch (error: any) {
      console.error('❌ Error responding to invitation:', error);
      alert('Failed to respond to invitation');
    } finally {
      setRespondingTo(null);
    }
  };

  if (!isOpen) return null;

  const pendingCount = invitations.filter(inv => inv.status === 'pending').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;

  return (
    <div className="invitation-overlay" onClick={onClose}>
      <div className="invitation-panel" onClick={e => e.stopPropagation()}>
        <div className="invitation-header">
          <div className="header-content">
            <h2><FaBell /> Course Invitations</h2>
            <p>Respond to invitations from instructors</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="invitation-stats">
          <div className="stat">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending">{pendingCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Accepted</span>
            <span className="stat-value accepted">{acceptedCount}</span>
          </div>
        </div>

        <div className="invitation-content">
          {loading ? (
            <div className="loading-state">
              <p>Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="empty-state">
              <FaEnvelope size={40} />
              <h3>No invitations yet</h3>
              <p>Check back when instructors send you course invitations</p>
            </div>
          ) : (
            <div className="invitations-list">
              {invitations.map(invitation => (
                <div
                  key={invitation.id}
                  className={`invitation-card status-${invitation.status}`}
                >
                  <div className="invitation-main">
                    <div className="invitation-info">
                      <h4>{invitation.classroomName || 'Classroom'}</h4>
                      <p className="invitation-from">
                        <FaEnvelope /> Invitation received from instructor
                      </p>
                      <time className="invitation-date">
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </time>
                    </div>

                    {invitation.status === 'pending' && (
                      <div className="invitation-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleRespond(invitation.id, 'accepted')}
                          disabled={respondingTo === invitation.id}
                        >
                          <FaCheckCircle /> Accept
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRespond(invitation.id, 'rejected')}
                          disabled={respondingTo === invitation.id}
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    )}

                    {invitation.status === 'accepted' && (
                      <div className="invitation-status accepted">
                        <FaCheckCircle /> Accepted
                      </div>
                    )}

                    {invitation.status === 'rejected' && (
                      <div className="invitation-status rejected">
                        <FaTimesCircle /> Rejected
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="invitation-footer">
          <p className="footer-text">
            ℹ️ Accept an invitation to add the course to your subjects
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateInvitationCenter;
