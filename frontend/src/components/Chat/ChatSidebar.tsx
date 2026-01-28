import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/chat/ChatContext';
import CreateGroupModal from './CreateGroupModal';
import StartChatModal from './StartChatModal';
import './ChatSidebar.css';

const ChatSidebar: React.FC = () => {
  const {
    directChats,
    groupChats,
    selectedDirectChat,
    selectedGroupChat,
    setSelectedDirectChat,
    setSelectedGroupChat,
    loadDirectChats,
    loadGroupChats,
    activeTab,
    setActiveTab,
    unreadCount,
  } = useChat();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showStartChat, setShowStartChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDirectChats();
    loadGroupChats();
  }, [loadDirectChats, loadGroupChats]);

  const filteredDirectChats = directChats.filter((chat) => {
    const name = chat.otherUser?.name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredGroupChats = groupChats.filter((group) => {
    return group.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <h2>Chat</h2>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="sidebar-tabs">
        <button
          className={`tab-button ${activeTab === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveTab('direct')}
        >
          Direct Messages
        </button>
        <button
          className={`tab-button ${activeTab === 'group' ? 'active' : ''}`}
          onClick={() => setActiveTab('group')}
        >
          Groups
        </button>
      </div>

      <div className="sidebar-actions">
        {activeTab === 'direct' && (
          <button className="action-button" onClick={() => setShowStartChat(true)}>
            + New Chat
          </button>
        )}
        {activeTab === 'group' && (
          <button className="action-button" onClick={() => setShowCreateGroup(true)}>
            + Create Group
          </button>
        )}
      </div>

      <div className="chats-list">
        {activeTab === 'direct' &&
          filteredDirectChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedDirectChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedDirectChat(chat);
                setSelectedGroupChat(null);
              }}
            >
              <div className="chat-item-avatar">
                {chat.otherUser?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="chat-item-info">
                <h3>{chat.otherUser?.name || 'Unknown'}</h3>
                <p>{chat.otherUser?.email}</p>
              </div>
              <div className="chat-item-time">
                {chat.lastMessageTime && (
                  <span>{new Date(chat.lastMessageTime).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}

        {activeTab === 'group' &&
          filteredGroupChats.map((group) => (
            <div
              key={group.id}
              className={`chat-item ${selectedGroupChat?.id === group.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedGroupChat(group);
                setSelectedDirectChat(null);
              }}
            >
              <div className="chat-item-avatar">
                {group.profilePicture ? (
                  <img src={group.profilePicture} alt={group.name} />
                ) : (
                  group.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="chat-item-info">
                <h3>{group.name}</h3>
                <p>{group.memberCount} members</p>
              </div>
              <div className="chat-item-time">
                {group.lastMessageTime && (
                  <span>{new Date(group.lastMessageTime).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
      </div>

      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
      {showStartChat && (
        <StartChatModal onClose={() => setShowStartChat(false)} />
      )}
    </div>
  );
};

export default ChatSidebar;
