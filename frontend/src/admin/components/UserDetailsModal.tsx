import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import './UserDetailsModal.css';

interface UserDetailsModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
}

interface UserProfileData {
  // Core Info (non-editable)
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;

  // Editable Info
  phoneNumber?: string;
  personalEmail?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  profileUrl?: string;
  school?: string;
  department?: string;
  rollNumber?: string;
  registrationNumber?: string;
  admissionBatch?: string;
  currentSemester?: string;
  graduated?: boolean;
  cgpa?: string;
  scholarship?: string;
  portfolioLink?: string;
  resumeUrl?: string;
  githubUrl?: string;
  parentName?: string;
  parentPhone?: string;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  userName,
  userEmail,
  onClose,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<UserProfileData | null>(null);
  const [originalData, setOriginalData] = useState<UserProfileData | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      const profileData = {
        ...data.user,
        ...data.profile,
      };
      setFormData(profileData);
      setOriginalData(profileData);
      setError('');
    } catch (err) {
      setError('Failed to load user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      setError('');

      const profileUpdate = {
        phoneNumber: formData.phoneNumber,
        personalEmail: formData.personalEmail,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        profileUrl: formData.profileUrl,
        school: formData.school,
        department: formData.department,
        rollNumber: formData.rollNumber,
        registrationNumber: formData.registrationNumber,
        admissionBatch: formData.admissionBatch,
        currentSemester: formData.currentSemester,
        graduated: formData.graduated,
        cgpa: formData.cgpa,
        scholarship: formData.scholarship,
        portfolioLink: formData.portfolioLink,
        resumeUrl: formData.resumeUrl,
        githubUrl: formData.githubUrl,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
      };

      const response = await fetch(`/api/auth/user/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileUpdate),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      setSuccess('Profile updated successfully!');
      setIsEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save profile changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="spinner"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <p>Failed to load user profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-info">
            <h2>User Details</h2>
            <p className="user-badge">{formData.role}</p>
          </div>
          <div className="header-actions">
            {!isEditMode && (
              <button
                className="btn-edit"
                onClick={() => setIsEditMode(true)}
                title="Edit Profile"
              >
                <FaEdit /> Edit
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Body */}
        <div className="modal-body">
          {/* Core Information Section (Non-editable) */}
          <div className="section">
            <h3 className="section-title">Core Information (Non-editable)</h3>
            <div className="info-grid">
              <div className="info-field">
                <label>Name</label>
                <input type="text" value={formData.name} disabled />
              </div>
              <div className="info-field">
                <label>Email</label>
                <input type="email" value={formData.email} disabled />
              </div>
              <div className="info-field">
                <label>Role</label>
                <input type="text" value={formData.role} disabled />
              </div>
              <div className="info-field">
                <label>Status</label>
                <input
                  type="text"
                  value={formData.isActive ? 'Active' : 'Inactive'}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="section">
            <h3 className="section-title">Contact Information</h3>
            <div className="info-grid">
              <div className="info-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="info-field">
                <label>Personal Email</label>
                <input
                  type="email"
                  value={formData.personalEmail || ''}
                  onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter personal email"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="section">
            <h3 className="section-title">Personal Information</h3>
            <div className="info-grid">
              <div className="info-field">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditMode}
                />
              </div>
              <div className="info-field">
                <label>Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={!isEditMode}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="info-field">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter country"
                />
              </div>
              <div className="info-field">
                <label>Profile URL</label>
                <input
                  type="url"
                  value={formData.profileUrl || ''}
                  onChange={(e) => handleInputChange('profileUrl', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="https://example.com/profile"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="section">
            <h3 className="section-title">Academic Information</h3>
            <div className="info-grid">
              <div className="info-field">
                <label>School/College</label>
                <input
                  type="text"
                  value={formData.school || ''}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter school/college name"
                />
              </div>
              <div className="info-field">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter department"
                />
              </div>
              <div className="info-field">
                <label>Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNumber || ''}
                  onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter roll number"
                />
              </div>
              <div className="info-field">
                <label>Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter registration number"
                />
              </div>
              <div className="info-field">
                <label>Admission Batch</label>
                <input
                  type="text"
                  value={formData.admissionBatch || ''}
                  onChange={(e) => handleInputChange('admissionBatch', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="E.g., 2020, 2021"
                />
              </div>
              <div className="info-field">
                <label>Current Semester</label>
                <input
                  type="text"
                  value={formData.currentSemester || ''}
                  onChange={(e) => handleInputChange('currentSemester', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="E.g., 4, 6"
                />
              </div>
              <div className="info-field">
                <label>CGPA</label>
                <input
                  type="text"
                  value={formData.cgpa || ''}
                  onChange={(e) => handleInputChange('cgpa', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="E.g., 8.5"
                />
              </div>
              <div className="info-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.graduated || false}
                    onChange={(e) => handleInputChange('graduated', e.target.checked)}
                    disabled={!isEditMode}
                  />
                  Graduated
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="section">
            <h3 className="section-title">Additional Information</h3>
            <div className="info-grid">
              <div className="info-field">
                <label>Scholarship</label>
                <input
                  type="text"
                  value={formData.scholarship || ''}
                  onChange={(e) => handleInputChange('scholarship', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="E.g., Merit-based, Need-based"
                />
              </div>
              <div className="info-field">
                <label>Portfolio Link</label>
                <input
                  type="url"
                  value={formData.portfolioLink || ''}
                  onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="https://portfolio.example.com"
                />
              </div>
              <div className="info-field">
                <label>Resume URL</label>
                <input
                  type="url"
                  value={formData.resumeUrl || ''}
                  onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="info-field">
                <label>GitHub Profile</label>
                <input
                  type="url"
                  value={formData.githubUrl || ''}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="section">
            <h3 className="section-title">Parent Information</h3>
            <div className="info-grid">
              <div className="info-field">
                <label>Parent Name</label>
                <input
                  type="text"
                  value={formData.parentName || ''}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter parent name"
                />
              </div>
              <div className="info-field">
                <label>Parent Phone Number</label>
                <input
                  type="tel"
                  value={formData.parentPhone || ''}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="Enter parent phone number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditMode && (
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <div className="spinner-small"></div> : <FaSave />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal;
