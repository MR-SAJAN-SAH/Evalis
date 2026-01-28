import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/chat/ChatContext';
import chatService from '../../services/chat/chatService';
import './CreateGroupModal.css';

interface CreateGroupModalProps {
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
  const { createGroupChat } = useChat();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      const users = await chatService.getOrganizationUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setAvailableUsers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      setIsLoading(true);
      await createGroupChat(groupName, description, selectedMembers);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Group Chat</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Add Members</label>
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search members..."
              className="search-input"
            />

            <div className="members-list">
              {filteredUsers.map((user) => (
                <label key={user.id} className="member-item">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => handleMemberToggle(user.id)}
                  />
                  <div className="member-info">
                    <div className="member-name">{user.name}</div>
                    <div className="member-email">{user.email}</div>
                  </div>
                </label>
              ))}
            </div>

            {selectedMembers.length > 0 && (
              <div className="selected-members">
                <p>Selected: {selectedMembers.length} member(s)</p>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
