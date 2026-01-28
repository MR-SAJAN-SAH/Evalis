import React, { useState, useEffect } from 'react';
import { FaTimes, FaFilter, FaUsers, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import '../../styles/publish-modal.css';

export interface PublishFilters {
  schools?: string[];
  departments?: string[];
  admissionBatches?: string[];
  currentSemesters?: string[];
}

interface PublishModalProps {
  isOpen: boolean;
  examId: string;
  examName: string;
  onPublish: (filters: PublishFilters) => void;
  onClose: () => void;
  loading?: boolean;
}

const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  examId,
  examName,
  onPublish,
  onClose,
  loading = false,
}) => {
  const { accessToken } = useAuth();
  const [filters, setFilters] = useState<PublishFilters>({});
  const [schools, setSchools] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [candidateCount, setCandidateCount] = useState<number | null>(null);
  const [countingCandidates, setCountingCandidates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFilterOptions();
    }
  }, [isOpen]);

  // Count candidates whenever filters change
  useEffect(() => {
    if (isOpen) {
      countMatchingCandidates();
    }
  }, [filters, isOpen]);

  const fetchFilterOptions = async () => {
    try {
      setLoadingOptions(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/users/filter-options`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
        setDepartments(data.departments || []);
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Count candidates matching current filters
  const countMatchingCandidates = async () => {
    try {
      setCountingCandidates(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Build query parameters from filters (arrays)
      const params = new URLSearchParams();
      if (filters.schools && filters.schools.length > 0) {
        filters.schools.forEach((s) => params.append('schools', s));
      }
      if (filters.departments && filters.departments.length > 0) {
        filters.departments.forEach((d) => params.append('departments', d));
      }
      if (filters.admissionBatches && filters.admissionBatches.length > 0) {
        filters.admissionBatches.forEach((b) => params.append('admissionBatches', b));
      }
      if (filters.currentSemesters && filters.currentSemesters.length > 0) {
        filters.currentSemesters.forEach((s) => params.append('currentSemesters', s));
      }

      const response = await fetch(`${apiUrl}/api/users/count-candidates?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCandidateCount(data.count);
        console.log('📊 Matching candidates count:', data.count);
      }
    } catch (error) {
      console.error('Error counting candidates:', error);
    } finally {
      setCountingCandidates(false);
    }
  };

  // Handle adding filter option
  const addFilter = (filterType: 'schools' | 'departments' | 'admissionBatches' | 'currentSemesters', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: [...(prev[filterType] || []), value],
    }));
  };

  // Handle removing filter option
  const removeFilter = (filterType: 'schools' | 'departments' | 'admissionBatches' | 'currentSemesters', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: (prev[filterType] || []).filter((item) => item !== value),
    }));
  };

  const handlePublish = () => {
    console.log('PublishModal handlePublish() called with filters:', filters);
    console.log('Has filters:', hasFilters);
    onPublish(filters);
  };

  const hasFilters = Object.values(filters).some((val) => Array.isArray(val) && val.length > 0);

  if (!isOpen) return null;

  return (
    <div className="publish-modal-overlay">
      <div className="publish-modal-container">
        <div className="publish-modal-header">
          <h2>
            <FaFilter style={{ marginRight: '8px' }} />
            Publish Exam with Filters
          </h2>
          <button className="publish-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="publish-modal-content">
          <div className="publish-exam-info">
            <p>
              <strong>Exam:</strong> {examName}
            </p>
            <p className="publish-info-text">
              Select filtering criteria to decide which users receive this exam. Leave all fields empty to publish to all candidates.
            </p>
          </div>

          <div className="publish-filters-section">
            <h3>Filtering Criteria</h3>

            {/* School Filter */}
            <div className="publish-filter-group">
              <label>🏫 School (Select Multiple)</label>
              <div className="filter-options-list">
                {schools.map((school) => (
                  <label key={school} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.schools || []).includes(school)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addFilter('schools', school);
                        } else {
                          removeFilter('schools', school);
                        }
                      }}
                      disabled={loadingOptions}
                    />
                    <span>{school}</span>
                  </label>
                ))}
              </div>
              {filters.schools && filters.schools.length > 0 && (
                <div className="selected-filters">
                  {filters.schools.map((school) => (
                    <span key={school} className="filter-chip">
                      {school}
                      <button
                        className="filter-chip-remove"
                        onClick={() => removeFilter('schools', school)}
                        type="button"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Department Filter */}
            <div className="publish-filter-group">
              <label>🎓 Department (Select Multiple)</label>
              <div className="filter-options-list">
                {departments.map((dept) => (
                  <label key={dept} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.departments || []).includes(dept)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addFilter('departments', dept);
                        } else {
                          removeFilter('departments', dept);
                        }
                      }}
                      disabled={loadingOptions}
                    />
                    <span>{dept}</span>
                  </label>
                ))}
              </div>
              {filters.departments && filters.departments.length > 0 && (
                <div className="selected-filters">
                  {filters.departments.map((dept) => (
                    <span key={dept} className="filter-chip">
                      {dept}
                      <button
                        className="filter-chip-remove"
                        onClick={() => removeFilter('departments', dept)}
                        type="button"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Admission Batch Filter */}
            <div className="publish-filter-group">
              <label>📅 Admission Batch (Select Multiple)</label>
              <div className="filter-options-list">
                {batches.map((batch) => (
                  <label key={batch} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.admissionBatches || []).includes(batch)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addFilter('admissionBatches', batch);
                        } else {
                          removeFilter('admissionBatches', batch);
                        }
                      }}
                      disabled={loadingOptions}
                    />
                    <span>{batch}</span>
                  </label>
                ))}
              </div>
              {filters.admissionBatches && filters.admissionBatches.length > 0 && (
                <div className="selected-filters">
                  {filters.admissionBatches.map((batch) => (
                    <span key={batch} className="filter-chip">
                      {batch}
                      <button
                        className="filter-chip-remove"
                        onClick={() => removeFilter('admissionBatches', batch)}
                        type="button"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Current Semester Filter */}
            <div className="publish-filter-group">
              <label>📊 Current Semester (Enter values)</label>
              <input
                type="text"
                placeholder="e.g., 1, 2, 3, 4 (separate by comma)"
                value={(filters.currentSemesters || []).join(', ')}
                onChange={(e) => {
                  const values = e.target.value
                    .split(',')
                    .map((v) => v.trim())
                    .filter((v) => v !== '');
                  setFilters((prev) => ({
                    ...prev,
                    currentSemesters: values.length > 0 ? values : undefined,
                  }));
                }}
                disabled={loadingOptions}
              />
              {filters.currentSemesters && filters.currentSemesters.length > 0 && (
                <div className="selected-filters">
                  {filters.currentSemesters.map((sem) => (
                    <span key={sem} className="filter-chip">
                      Sem {sem}
                      <button
                        className="filter-chip-remove"
                        onClick={() => removeFilter('currentSemesters', sem)}
                        type="button"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {hasFilters && (
            <div className="publish-filters-summary">
              <h4>Filters Applied:</h4>
              <div className="filters-applied-list">
                {filters.schools && filters.schools.length > 0 && (
                  <div className="filter-type">
                    <strong>Schools:</strong> {filters.schools.join(', ')}
                  </div>
                )}
                {filters.departments && filters.departments.length > 0 && (
                  <div className="filter-type">
                    <strong>Departments:</strong> {filters.departments.join(', ')}
                  </div>
                )}
                {filters.admissionBatches && filters.admissionBatches.length > 0 && (
                  <div className="filter-type">
                    <strong>Admission Batches:</strong> {filters.admissionBatches.join(', ')}
                  </div>
                )}
                {filters.currentSemesters && filters.currentSemesters.length > 0 && (
                  <div className="filter-type">
                    <strong>Semesters:</strong> {filters.currentSemesters.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Candidate Count Display */}
          <div className="publish-candidate-count">
            <div className="count-content">
              <FaUsers className="count-icon" />
              <div className="count-info">
                {countingCandidates ? (
                  <>
                    <FaSpinner className="spin-icon" />
                    <span>Counting candidates...</span>
                  </>
                ) : (
                  <>
                    <p className="count-label">
                      {hasFilters ? 'Candidates who will receive this exam:' : 'Total candidates in organization:'}
                    </p>
                    <p className="count-number">
                      {candidateCount !== null ? candidateCount : '0'} 
                      <span className="count-suffix">candidate{candidateCount !== 1 ? 's' : ''}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {!hasFilters && (
            <div className="publish-filters-info">
              <p>📢 <strong>No filters selected:</strong> This exam will be published to all candidates in the organization.</p>
            </div>
          )}
        </div>

        <div className="publish-modal-footer">
          <button
            className="publish-modal-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="publish-modal-btn-publish"
            onClick={handlePublish}
            disabled={loading || loadingOptions}
          >
            {loading ? 'Publishing...' : 'Publish Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
