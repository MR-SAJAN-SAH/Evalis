import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
}

interface SendEmailModalProps {
  user: User | null;
  organizationName: string;
  onClose: () => void;
  onSend: (data: any) => Promise<void>;
}

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    name: 'Welcome Email',
    description: 'Standard welcome email with login credentials',
  },
  credentials: {
    name: 'Credentials Only',
    description: 'Send only login credentials without additional content',
  },
  reminder: {
    name: 'Reminder Email',
    description: 'Reminder email with quick start guide',
  },
  verification: {
    name: 'Account Verification',
    description: 'Email for account verification and confirmation',
  },
  personalDetail: {
    name: 'Personal Detail Form',
    description: 'Form for users to fill and submit their personal details',
  },
};

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  user,
  organizationName,
  onClose,
  onSend,
}) => {
  const [emailTemplate, setEmailTemplate] = useState('welcome');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await onSend({
        userEmail: user.email,
        userName: user.name,
        password: user.password || 'N/A',
        organizationName: organizationName,
        emailTemplate: emailTemplate,
        customMessage: customMessage.trim() || undefined,
        userId: user.id,
      });

      setSuccess(`Email sent successfully to ${user.email}!`);
      setTimeout(() => {
        setCustomMessage('');
        setEmailTemplate('welcome');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{ margin: 0 }}>Send Email to {user.name}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            To:
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email Template:
          </label>
          <select
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            {EMAIL_TEMPLATES[emailTemplate as keyof typeof EMAIL_TEMPLATES].description}
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Custom Message (Optional):
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter any additional message you want to include in the email..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              boxSizing: 'border-box',
              minHeight: '120px',
              resize: 'vertical',
            }}
          />
          <small style={{ color: '#666' }}>
            This message will be added to the welcome email
          </small>
        </div>

        {error && (
          <div style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            border: '1px solid #fcc',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#efe',
            color: '#3c3',
            borderRadius: '4px',
            border: '1px solid #cfc',
          }}>
            {success}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
