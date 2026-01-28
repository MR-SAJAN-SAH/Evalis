import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaCheckDouble, FaCheck } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import './GetUserDetailsModal.css';

interface GetUserDetailsModalProps {
  organizationId: string;
  onClose: () => void;
}

interface FilterOptions {
  schools: string[];
  departments: string[];
  batches: string[];
  roles: string[];
  statuses: string[];
  genders: string[];
  countries: string[];
  semesters: string[];
  scholarships: string[];
}

interface SelectedFilters {
  schools: string[];
  departments: string[];
  admissionBatches: string[];
  roles: string[];
  statuses: string[];
  genders: string[];
  countries: string[];
  semesters: string[];
  scholarships: string[];
}

interface SelectedDetails {
  [key: string]: boolean;
}

const AVAILABLE_DETAILS = {
  'Basic Information': {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    personalEmail: 'Personal Email',
    role: 'Role',
    status: 'Status',
  },
  'Personal Information': {
    gender: 'Gender',
    dateOfBirth: 'Date of Birth',
    country: 'Country',
  },
  'Academic Information': {
    school: 'School',
    department: 'Department',
    rollNumber: 'Roll Number',
    registrationNumber: 'Registration Number',
    admissionBatch: 'Admission Batch',
    currentSemester: 'Current Semester',
    graduated: 'Graduated',
    cgpa: 'CGPA',
  },
  'Additional Information': {
    scholarship: 'Scholarship',
    portfolioLink: 'Portfolio Link',
    githubUrl: 'GitHub URL',
  },
};

const GetUserDetailsModal: React.FC<GetUserDetailsModalProps> = ({ organizationId, onClose }) => {
  const { accessToken } = useAuth();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    schools: [],
    departments: [],
    batches: [],
    roles: ['ADMIN', 'TEACHER', 'CANDIDATE', 'EVALUATOR'],
    statuses: ['Active', 'Inactive', 'Suspended'],
    genders: ['Male', 'Female', 'Other'],
    countries: [],
    semesters: [],
    scholarships: [],
  });

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    schools: [],
    departments: [],
    admissionBatches: [],
    roles: [],
    statuses: [],
    genders: [],
    countries: [],
    semesters: [],
    scholarships: [],
  });

  const [selectedDetails, setSelectedDetails] = useState<SelectedDetails>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilterOptions();
    initializeSelectedDetails();
  }, []);

  const initializeSelectedDetails = () => {
    const initial: SelectedDetails = {};
    Object.values(AVAILABLE_DETAILS).forEach((section) => {
      Object.keys(section).forEach((key) => {
        initial[key] = true; // Default: all selected
      });
    });
    setSelectedDetails(initial);
  };

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/filter-options`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch filter options');

      const data = await response.json();
      setFilterOptions((prev) => ({
        ...prev,
        schools: data.schools || [],
        departments: data.departments || [],
        batches: data.batches || [],
        countries: data.countries || [],
        semesters: data.semesters || [],
        scholarships: data.scholarships || [],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch filter options');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (category: keyof SelectedFilters, value: string) => {
    setSelectedFilters((prev) => {
      const updated = [...prev[category]];
      const index = updated.indexOf(value);
      if (index > -1) {
        updated.splice(index, 1);
      } else {
        updated.push(value);
      }
      return { ...prev, [category]: updated };
    });
  };

  const handleSelectAllFilters = (category: keyof SelectedFilters) => {
    const allOptions = filterOptions[category as keyof FilterOptions] || [];
    if (selectedFilters[category].length === allOptions.length) {
      setSelectedFilters((prev) => ({ ...prev, [category]: [] }));
    } else {
      setSelectedFilters((prev) => ({ ...prev, [category]: [...allOptions] }));
    }
  };

  const handleDetailChange = (key: string) => {
    setSelectedDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllDetails = () => {
    const allSelected = Object.values(selectedDetails).every((v) => v);
    const updated: SelectedDetails = {};
    Object.keys(selectedDetails).forEach((key) => {
      updated[key] = !allSelected;
    });
    setSelectedDetails(updated);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      // Check if at least one detail is selected
      if (!Object.values(selectedDetails).some((v) => v)) {
        setError('Please select at least one detail to export');
        return;
      }

      // Build filter query
      const filterParams = new URLSearchParams();
      
      if (selectedFilters.schools.length > 0) {
        filterParams.append('schools', selectedFilters.schools.join(','));
      }
      if (selectedFilters.departments.length > 0) {
        filterParams.append('departments', selectedFilters.departments.join(','));
      }
      if (selectedFilters.admissionBatches.length > 0) {
        filterParams.append('admissionBatches', selectedFilters.admissionBatches.join(','));
      }
      if (selectedFilters.roles.length > 0) {
        filterParams.append('roles', selectedFilters.roles.join(','));
      }
      if (selectedFilters.statuses.length > 0) {
        filterParams.append('statuses', selectedFilters.statuses.join(','));
      }
      if (selectedFilters.genders.length > 0) {
        filterParams.append('genders', selectedFilters.genders.join(','));
      }
      if (selectedFilters.countries.length > 0) {
        filterParams.append('countries', selectedFilters.countries.join(','));
      }
      if (selectedFilters.semesters.length > 0) {
        filterParams.append('semesters', selectedFilters.semesters.join(','));
      }
      if (selectedFilters.scholarships.length > 0) {
        filterParams.append('scholarships', selectedFilters.scholarships.join(','));
      }

      const url = filterParams.toString() 
        ? `/api/users/export?${filterParams.toString()}`
        : `/api/users/export`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedDetails: Object.keys(selectedDetails).filter((key) => selectedDetails[key]),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${errorText || response.statusText}`);
      }

      const users = await response.json();

      // Prepare data for Excel
      const exportData = users.map((user: any) => {
        const row: any = {};
        Object.keys(selectedDetails).forEach((key) => {
          if (selectedDetails[key]) {
            const label = getDetailLabel(key);
            row[label] = formatCellValue(user[key]);
          }
        });
        return row;
      });

      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.max(key.length + 2, 20),
      }));
      ws['!cols'] = colWidths;

      // Download file
      const filename = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  const getDetailLabel = (key: string): string => {
    for (const section of Object.values(AVAILABLE_DETAILS)) {
      if (section[key as keyof typeof section]) {
        return section[key as keyof typeof section];
      }
    }
    return key;
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return new Date(value).toLocaleDateString();
    return String(value);
  };

  const selectedDetailsCount = Object.values(selectedDetails).filter((v) => v).length;
  const selectedFiltersCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="modal-overlay">
      <div className="modal modal-xl">
        <div className="modal-header">
          <h2>Export User Details</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body get-details-modal">
          {error && <div className="error-banner">{error}</div>}

          <div className="modal-content-grid">
            {/* Left: Details Selection */}
            <div className="details-section">
              <div className="section-header">
                <h3>Select Details to Export</h3>
                <button
                  className="select-all-btn"
                  onClick={handleSelectAllDetails}
                  title={Object.values(selectedDetails).every((v) => v) ? 'Deselect All' : 'Select All'}
                >
                  <FaCheckDouble /> {Object.values(selectedDetails).every((v) => v) ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="details-list">
                {Object.entries(AVAILABLE_DETAILS).map(([category, details]) => (
                  <div key={category} className="detail-category">
                    <h4>{category}</h4>
                    <div className="detail-items">
                      {Object.entries(details).map(([key, label]) => (
                        <label key={key} className="detail-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedDetails[key] || false}
                            onChange={() => handleDetailChange(key)}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="details-count">
                <FaCheck /> {selectedDetailsCount} details selected
              </div>
            </div>

            {/* Right: Filter Selection */}
            <div className="filters-section">
              <div className="section-header">
                <h3>Apply Filters</h3>
                <p className="filter-subtitle">Select criteria to filter users (leave empty for all)</p>
              </div>

              <div className="filters-list">
                {/* School Filter */}
                {filterOptions.schools.length > 0 && (
                  <div className="filter-group">
                    <div className="filter-header">
                      <label>School</label>
                      <button
                        className="select-all-btn-small"
                        onClick={() => handleSelectAllFilters('schools')}
                      >
                        {selectedFilters.schools.length === filterOptions.schools.length ? 'Clear' : 'All'}
                      </button>
                    </div>
                    <div className="filter-options">
                      {filterOptions.schools.map((school) => (
                        <label key={school} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFilters.schools.includes(school)}
                            onChange={() => handleFilterChange('schools', school)}
                          />
                          <span>{school}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Department Filter */}
                {filterOptions.departments.length > 0 && (
                  <div className="filter-group">
                    <div className="filter-header">
                      <label>Department</label>
                      <button
                        className="select-all-btn-small"
                        onClick={() => handleSelectAllFilters('departments')}
                      >
                        {selectedFilters.departments.length === filterOptions.departments.length ? 'Clear' : 'All'}
                      </button>
                    </div>
                    <div className="filter-options">
                      {filterOptions.departments.map((dept) => (
                        <label key={dept} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFilters.departments.includes(dept)}
                            onChange={() => handleFilterChange('departments', dept)}
                          />
                          <span>{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admission Batch Filter */}
                {filterOptions.batches.length > 0 && (
                  <div className="filter-group">
                    <div className="filter-header">
                      <label>Admission Batch</label>
                      <button
                        className="select-all-btn-small"
                        onClick={() => handleSelectAllFilters('admissionBatches')}
                      >
                        {selectedFilters.admissionBatches.length === filterOptions.batches.length ? 'Clear' : 'All'}
                      </button>
                    </div>
                    <div className="filter-options">
                      {filterOptions.batches.map((batch) => (
                        <label key={batch} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFilters.admissionBatches.includes(batch)}
                            onChange={() => handleFilterChange('admissionBatches', batch)}
                          />
                          <span>{batch}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Role Filter */}
                <div className="filter-group">
                  <div className="filter-header">
                    <label>Role</label>
                    <button
                      className="select-all-btn-small"
                      onClick={() => handleSelectAllFilters('roles')}
                    >
                      {selectedFilters.roles.length === filterOptions.roles.length ? 'Clear' : 'All'}
                    </button>
                  </div>
                  <div className="filter-options">
                    {filterOptions.roles.map((role) => (
                      <label key={role} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFilters.roles.includes(role)}
                          onChange={() => handleFilterChange('roles', role)}
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="filter-group">
                  <div className="filter-header">
                    <label>Status</label>
                    <button
                      className="select-all-btn-small"
                      onClick={() => handleSelectAllFilters('statuses')}
                    >
                      {selectedFilters.statuses.length === filterOptions.statuses.length ? 'Clear' : 'All'}
                    </button>
                  </div>
                  <div className="filter-options">
                    {filterOptions.statuses.map((status) => (
                      <label key={status} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFilters.statuses.includes(status)}
                          onChange={() => handleFilterChange('statuses', status)}
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div className="filter-group">
                  <div className="filter-header">
                    <label>Gender</label>
                    <button
                      className="select-all-btn-small"
                      onClick={() => handleSelectAllFilters('genders')}
                    >
                      {selectedFilters.genders.length === filterOptions.genders.length ? 'Clear' : 'All'}
                    </button>
                  </div>
                  <div className="filter-options">
                    {filterOptions.genders.map((gender) => (
                      <label key={gender} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFilters.genders.includes(gender)}
                          onChange={() => handleFilterChange('genders', gender)}
                        />
                        <span>{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Country Filter */}
                {filterOptions.countries.length > 0 && (
                  <div className="filter-group">
                    <div className="filter-header">
                      <label>Country</label>
                      <button
                        className="select-all-btn-small"
                        onClick={() => handleSelectAllFilters('countries')}
                      >
                        {selectedFilters.countries.length === filterOptions.countries.length ? 'Clear' : 'All'}
                      </button>
                    </div>
                    <div className="filter-options">
                      {filterOptions.countries.map((country) => (
                        <label key={country} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFilters.countries.includes(country)}
                            onChange={() => handleFilterChange('countries', country)}
                          />
                          <span>{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Semester Filter */}
                {filterOptions.semesters.length > 0 && (
                  <div className="filter-group">
                    <div className="filter-header">
                      <label>Current Semester</label>
                      <button
                        className="select-all-btn-small"
                        onClick={() => handleSelectAllFilters('semesters')}
                      >
                        {selectedFilters.semesters.length === filterOptions.semesters.length ? 'Clear' : 'All'}
                      </button>
                    </div>
                    <div className="filter-options">
                      {filterOptions.semesters.map((semester) => (
                        <label key={semester} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFilters.semesters.includes(semester)}
                            onChange={() => handleFilterChange('semesters', semester)}
                          />
                          <span>{semester}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scholarship Filter */}
                {filterOptions.scholarships.length > 0 && (
                  <div className="filter-group">
                    <div className="filter-header">
                      <label>Scholarship</label>
                      <button
                        className="select-all-btn-small"
                        onClick={() => handleSelectAllFilters('scholarships')}
                      >
                        {selectedFilters.scholarships.length === filterOptions.scholarships.length ? 'Clear' : 'All'}
                      </button>
                    </div>
                    <div className="filter-options">
                      {filterOptions.scholarships.map((scholarship) => (
                        <label key={scholarship} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFilters.scholarships.includes(scholarship)}
                            onChange={() => handleFilterChange('scholarships', scholarship)}
                          />
                          <span>{scholarship}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="filters-count">
                <FaCheck /> {selectedFiltersCount} filters applied
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={exporting || !Object.values(selectedDetails).some((v) => v)}
          >
            <FaDownload /> {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetUserDetailsModal;
