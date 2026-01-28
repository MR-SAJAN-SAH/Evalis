import React from 'react';
import type { ChatMessage } from '../../services/chat/chatService';
import './MessageList.css';

interface MessageListProps {
  messages: ChatMessage[];
  isGroup: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isGroup }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateSeparator =
          !prevMessage ||
          formatDate(new Date(message.createdAt)) !== formatDate(new Date(prevMessage.createdAt));

        return (
          <div key={message.id}>
            {showDateSeparator && (
              <div className="date-separator">
                {formatDate(new Date(message.createdAt))}
              </div>
            )}
            <div
              className={`message-group ${
                isGroup && prevMessage?.senderId !== message.senderId ? 'new-sender' : ''
              }`}
            >
              {isGroup && (
                <div className="message-sender-avatar">
                  {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="message-content">
                {isGroup && (
                  <div className="message-sender-name">{message.sender?.name}</div>
                )}
                <div className={`message-bubble ${message.messageType}`}>
                  {message.messageType === 'text' && <p>{message.content}</p>}
                  {message.messageType === 'file' && (
                    <a href={message.fileUrl} download={message.fileName}>
                      📎 {message.fileName}
                    </a>
                  )}
                  {message.messageType === 'image' && (
                    <img src={message.fileUrl} alt="Message" className="message-image" />
                  )}
                  <span className="message-time">{formatTime(new Date(message.createdAt))}</span>
                </div>
                {message.isPinned && <span className="pinned-badge">📌 Pinned</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
