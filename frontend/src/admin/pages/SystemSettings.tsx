import React, { useState } from 'react';
import { FaCog, FaKey, FaBell, FaDownload, FaSave } from 'react-icons/fa';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    organization: 'Evalis Exam Platform',
    email: 'noreply@evalis.com',
    phone: '+1-800-123-4567',
    address: '123 Tech Street, Innovation City',
    timezone: 'UTC+5:30',
    language: 'English',
    theme: 'light',
    autoBackup: true,
    backupFrequency: 'weekly',
    maxFileSize: 100,
    sessionTimeout: 30,
    passwordExpiry: 90,
    enableTwoFactor: true,
    apiRateLimit: 1000
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="system-settings">
      <div className="page-header">
        <h1>System Settings</h1>
        <p className="subtitle">Configure system-wide settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'general' ? '3px solid #667eea' : 'none',
            fontWeight: activeTab === 'general' ? '600' : '400',
            color: activeTab === 'general' ? '#667eea' : '#666',
            marginRight: '20px'
          }}
        >
          <FaCog /> General
        </button>
        <button
          onClick={() => setActiveTab('email')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'email' ? '3px solid #667eea' : 'none',
            fontWeight: activeTab === 'email' ? '600' : '400',
            color: activeTab === 'email' ? '#667eea' : '#666',
            marginRight: '20px'
          }}
        >
          <FaBell /> Email & Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'security' ? '3px solid #667eea' : 'none',
            fontWeight: activeTab === 'security' ? '600' : '400',
            color: activeTab === 'security' ? '#667eea' : '#666',
            marginRight: '20px'
          }}
        >
          <FaKey /> Security
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'backup' ? '3px solid #667eea' : 'none',
            fontWeight: activeTab === 'backup' ? '600' : '400',
            color: activeTab === 'backup' ? '#667eea' : '#666'
          }}
        >
          <FaDownload /> Backup & Storage
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="settings-form">
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
            <h2 style={{ marginTop: 0 }}>Organization Details</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  value={settings.organization}
                  onChange={(e) => handleSettingChange('organization', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e6ed',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>UTC+5:30</option>
                    <option>UTC+5:45</option>
                    <option>UTC+6:00</option>
                    <option>UTC+0:00</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e6ed',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="settings-form">
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
            <h2 style={{ marginTop: 0 }}>Email Configuration</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  SMTP Host
                </label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    placeholder="587"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e6ed',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                    SMTP Username
                  </label>
                  <input
                    type="email"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e6ed',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Enable Notifications
                </label>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <span>Send email on new exam creation</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px' }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <span>Send exam results to candidates</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="settings-form">
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
            <h2 style={{ marginTop: 0 }}>Security Settings</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => handleSettingChange('passwordExpiry', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactor}
                    onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Enable Two-Factor Authentication</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  API Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === 'backup' && (
        <div className="settings-form">
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
            <h2 style={{ marginTop: 0 }}>Backup & Storage</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: '#333' }}>
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Enable Automatic Backups</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Backup Frequency
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  disabled={!settings.autoBackup}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    opacity: settings.autoBackup ? 1 : 0.6
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Max File Upload Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button className="btn-primary" style={{ marginTop: '10px' }}>
                <FaDownload /> Download Backup Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="btn-primary"
        style={{ marginTop: '20px', padding: '12px 30px' }}
      >
        <FaSave /> Save Settings
      </button>
    </div>
  );
};

export default SystemSettings;
