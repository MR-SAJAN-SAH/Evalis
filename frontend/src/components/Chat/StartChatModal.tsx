import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/chat/ChatContext';
import chatService from '../../services/chat/chatService';
import './StartChatModal.css';

interface StartChatModalProps {
  onClose: () => void;
}

const StartChatModal: React.FC<StartChatModalProps> = ({ onClose }) => {
  const { createDirectChat } = useChat();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure token is available
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication token not found. Please reload the page.');
        console.error('No authentication token found');
        return;
      }
      
      console.log('🔍 [StartChatModal] Loading organization users...');
      const users = await chatService.getOrganizationUsers();
      console.log('✅ [StartChatModal] Received users:', users);
      
      if (!users || users.length === 0) {
        console.warn('⚠️ [StartChatModal] No users returned from API');
      }
      
      setAvailableUsers(users || []);
      setFilteredUsers(users || []);
    } catch (error) {
      console.error('❌ [StartChatModal] Error loading users:', error);
      setError(`Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAvailableUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredUsers(filtered);
  }, [searchQuery, availableUsers]);

  const handleStartChat = async () => {
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    try {
      setIsLoading(true);
      await createDirectChat(selectedUserId);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content start-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Start New Chat</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
              disabled={isLoading || !!error}
            />
          </div>

          <div className="users-list">
            {error && (
              <div className="error-message" style={{ color: '#d32f2f', padding: '10px', marginBottom: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                {error}
              </div>
            )}
            
            {isLoading && (
              <div className="loading-message" style={{ color: '#666', padding: '10px', textAlign: 'center' }}>
                Loading users...
              </div>
            )}
            
            {!isLoading && !error && filteredUsers.length === 0 ? (
              <div className="no-results">
                {searchQuery ? 'No users found' : 'No users available'}
              </div>
            ) : (
              !isLoading && filteredUsers.map((user) => (
                <label key={user.id} className="user-item">
                  <input
                    type="radio"
                    name="selected-user"
                    value={user.id}
                    checked={selectedUserId === user.id}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-details">
                      {user.email} • {user.role}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleStartChat}
            disabled={!selectedUserId || isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartChatModal;
