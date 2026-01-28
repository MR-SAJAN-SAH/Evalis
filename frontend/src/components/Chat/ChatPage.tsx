import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import NotificationCenter from './NotificationCenter';
import './ChatPage.css';

const ChatPage: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="chat-page-container">
      <ChatSidebar />
      <ChatWindow />
      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}
      <div className="notification-toggle">
        <button
          className="notification-button"
          onClick={() => setShowNotifications(!showNotifications)}
          title="View notifications"
        >
          🔔
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
