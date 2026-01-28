import React, { useState } from 'react';
import { FaEllipsisV } from 'react-icons/fa';

export interface ContextMenuOption {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

interface ActionMenuProps {
  options: ContextMenuOption[];
  triggerIcon?: React.ReactNode;
  triggerLabel?: string;
  className?: string;
}

/**
 * ActionMenu Component - Context menu for exam actions
 * Provides quick access to exam operations
 */
const ActionMenu: React.FC<ActionMenuProps> = ({
  options,
  triggerIcon = <FaEllipsisV />,
  triggerLabel = 'Actions',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className={`action-menu ${className}`}>
      <button
        className="action-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={triggerLabel}
      >
        {triggerIcon}
      </button>

      {isOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setIsOpen(false)}></div>
          <div className="action-menu-dropdown">
            {options.map((option, idx) => (
              <button
                key={idx}
                className={`menu-option menu-option-${option.variant || 'default'}`}
                onClick={() => handleAction(option.action)}
                disabled={option.disabled}
              >
                {option.icon && <span className="menu-option-icon">{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActionMenu;
