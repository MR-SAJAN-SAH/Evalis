import React, { useState, useRef } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      console.log('File selected:', file);
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-actions">
        <button className="action-btn emoji-btn" title="Emoji">
          😊
        </button>
        <button className="action-btn attach-btn" onClick={handleAttachFile} title="Attach file">
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      <textarea
        className="message-textarea"
        placeholder="Type a message... (Shift + Enter for new line)"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        rows={1}
      />

      <button className="send-btn" onClick={handleSend} disabled={!message.trim()}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
