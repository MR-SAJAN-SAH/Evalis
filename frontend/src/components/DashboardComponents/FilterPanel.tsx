import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  type: 'select' | 'multiselect' | 'date' | 'range';
  value?: string | string[];
}

interface FilterPanelProps {
  filters: FilterOption[];
  onFilterChange: (key: string, value: any) => void;
  onApply: () => void;
  onReset: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * FilterPanel Component - Advanced filtering for exams
 * Supports multiple filter types and configurations
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
  isOpen = false,
  onToggle,
}) => {
  const [localOpen, setLocalOpen] = useState(isOpen);
  const open = onToggle ? isOpen : localOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalOpen(!localOpen);
    }
  };

  const activeFilterCount = filters.filter((f) => f.value).length;

  return (
    <div className="filter-panel">
      <button className="filter-toggle" onClick={handleToggle}>
        <FaFilter />
        Filters
        {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
      </button>

      {open && (
        <>
          <div className="filter-backdrop" onClick={handleToggle}></div>
          <div className="filter-panel-content">
            <div className="filter-header">
              <h3>Advanced Filters</h3>
              <button onClick={handleToggle} className="close-btn">
                <FaTimes />
              </button>
            </div>

            <div className="filter-options">
              {filters.map((filter) => (
                <div key={filter.key} className="filter-group">
                  <label>{filter.label}</label>

                  {filter.type === 'select' && (
                    <select
                      value={filter.value || ''}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      className="filter-input"
                    >
                      <option value="">Select...</option>
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {filter.type === 'multiselect' && (
                    <select
                      multiple
                      value={Array.isArray(filter.value) ? filter.value : []}
                      onChange={(e) =>
                        onFilterChange(
                          filter.key,
                          Array.from(e.target.selectedOptions, (option) => option.value)
                        )
                      }
                      className="filter-input"
                    >
                      {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {filter.type === 'date' && (
                    <input
                      type="date"
                      value={filter.value || ''}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      className="filter-input"
                    />
                  )}

                  {filter.type === 'range' && (
                    <div className="filter-range">
                      <input
                        type="number"
                        placeholder="Min"
                        className="filter-input"
                        onChange={(e) => onFilterChange(filter.key, [e.target.value])}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="filter-input"
                        onChange={(e) => onFilterChange(filter.key, [Array.isArray(filter.value) ? filter.value[0] : '', e.target.value])}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="filter-actions">
              <button onClick={onReset} className="filter-btn-reset">
                Reset
              </button>
              <button onClick={onApply} className="filter-btn-apply">
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;
