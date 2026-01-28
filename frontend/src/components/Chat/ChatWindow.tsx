import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/chat/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow: React.FC = () => {
  const {
    selectedDirectChat,
    selectedGroupChat,
    messages,
    loadMessages,
    sendMessage,
    isLoadingMessages,
  } = useChat();

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGroup = !!selectedGroupChat;
  const currentChat = selectedGroupChat || selectedDirectChat;

  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id, isGroup);
    }
  }, [currentChat, isGroup, loadMessages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      await sendMessage(content, isGroup);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  if (!currentChat) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>No chat selected</h2>
          <p>
            {isGroup
              ? 'Select a group or create a new one to start chatting'
              : 'Select a chat or start a new conversation'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>
            {isGroup
              ? (selectedGroupChat?.name || 'Group Chat')
              : (selectedDirectChat?.otherUser?.name || 'Chat')}
          </h2>
          {isGroup && <p className="chat-subtitle">{selectedGroupChat?.memberCount} members</p>}
        </div>
        <div className="chat-header-actions">
          <button className="header-button" title="Call">
            ☎️
          </button>
          <button className="header-button" title="Video call">
            📹
          </button>
          <button className="header-button" title="Chat info">
            ℹ️
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {isLoadingMessages ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">No messages yet. Start a conversation!</div>
        ) : (
          <MessageList messages={messages} isGroup={isGroup} />
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
