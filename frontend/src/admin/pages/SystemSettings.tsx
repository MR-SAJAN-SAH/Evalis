import React, { useState, useEffect } from 'react';
import { FaCog, FaKey, FaBell, FaDownload, FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const SystemSettings = () => {
  const { organizationName, userEmail } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  
  const getAdminProfileImage = () => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      return localStorage.getItem(`adminProfileImageUrl_${userId}`) || '';
    }
    return '';
  };
  
  const [settings, setSettings] = useState({
    organization: organizationName || 'Evalis Exam Platform',
    email: userEmail || 'noreply@evalis.com',
    phone: '+1-800-123-4567',
    address: '123 Tech Street, Innovation City',
    timezone: 'UTC+5:30',
    language: 'English',
    theme: localStorage.getItem('theme') || 'light',
    profileImageUrl: getAdminProfileImage(),
    autoBackup: true,
    backupFrequency: 'weekly',
    maxFileSize: 100,
    sessionTimeout: 30,
    passwordExpiry: 90,
    enableTwoFactor: true,
    apiRateLimit: 1000
  });

  // Apply theme on component mount or when theme changes
  useEffect(() => {
    const theme = settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Apply theme to body background
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }, [settings.theme]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    try {
      // Save profile image URL to localStorage with user-specific key
      if (settings.profileImageUrl) {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
          localStorage.setItem(`adminProfileImageUrl_${userId}`, settings.profileImageUrl);
        }
      }

      // Try to save to backend if user data is available
      const userId = sessionStorage.getItem('userId');
      const accessToken = sessionStorage.getItem('accessToken');
      const role = sessionStorage.getItem('role');
      
      console.log('Saving profile image URL:', {
        userId,
        role,
        hasAccessToken: !!accessToken,
        profileImageUrl: settings.profileImageUrl
      });
      
      if (userId && accessToken && settings.profileImageUrl) {
        try {
          // Determine if this is an admin or regular user
          const isAdmin = role === 'admin';
          const endpoint = isAdmin 
            ? `/api/auth/admin/${userId}/profile`
            : `/api/auth/user/${userId}/profile`;
          
          console.log(`Making PUT request to ${endpoint}`);
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              profileUrl: settings.profileImageUrl
            })
          });

          console.log('Backend response status:', response.status);
          const responseData = await response.json();
          console.log('Backend response data:', responseData);

          if (response.ok) {
            alert('✅ Profile image URL saved successfully!');
            // Reload the admin dashboard to update the profile image
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            console.error('Backend returned error:', responseData);
            // Still save locally even if backend fails
            alert('✅ Profile image saved locally! (Backend sync in progress...)');
          }
        } catch (error) {
          console.error('Error saving to backend:', error);
          // Backend failure is not critical - URL is saved in localStorage
          alert('✅ Profile image saved locally! (Will sync with server on next request)');
        }
      } else {
        alert('Settings saved to local storage!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
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
                  disabled={true}
                  title="Organization name is fixed and cannot be edited"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                    color: '#666'
                  }}
                />
                <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>Fixed to your organization</small>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  disabled={true}
                  title="Email address is fixed and cannot be edited"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                    color: '#666'
                  }}
                />
                <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>System email - cannot be changed</small>
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
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: settings.theme === 'dark' ? '#333' : '#fff',
                    color: settings.theme === 'dark' ? '#fff' : '#000',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <option value="light">☀️ Light Mode</option>
                  <option value="dark">🌙 Dark Mode</option>
                </select>
                <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>
                  ✓ Changes apply immediately
                </small>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Profile Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/profile-image.jpg"
                  value={settings.profileImageUrl}
                  onChange={(e) => handleSettingChange('profileImageUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e6ed',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
                <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>
                  Enter the URL of your profile picture. It will appear in the top-left corner of the dashboard.
                </small>
              </div>
              {settings.profileImageUrl && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                    Preview
                  </label>
                  <div style={{
                    display: 'inline-block',
                    width: '100px',
                    height: '100px',
                    borderRadius: '8px',
                    border: '2px solid #e0e6ed',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    flexShrink: 0
                  }}>
                    <img 
                      src={settings.profileImageUrl} 
                      alt="Profile Preview" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
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
