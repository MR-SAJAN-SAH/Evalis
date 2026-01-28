import React, { useState } from 'react';
import { Role } from '../types/roleTypes';
import './CustomRolesList.css';

interface Props {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

const CustomRolesList: React.FC<Props> = ({ roles, onEdit, onDelete }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (roles.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✨</div>
        <h3>No Custom Roles Yet</h3>
        <p>Create your first custom role to get started with role-based access control</p>
      </div>
    );
  }

  return (
    <div className="custom-roles-list">
      <div className="crl-header">
        <h2>Custom Roles</h2>
        <p className="crl-info">{roles.length} custom role(s) available</p>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div
            key={role.id}
            className="role-item"
            onMouseEnter={() => setHoveredId(role.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="ri-header">
              <div className="ri-icon">🔵</div>
              <h4>{role.name}</h4>
            </div>

            <p className="ri-description">{role.description}</p>

            <div className="ri-permissions">
              <span className="perm-count">{role.permissions.length} permissions</span>
            </div>

            <div className={`ri-actions ${hoveredId === role.id ? 'visible' : ''}`}>
              <button className="btn-edit" onClick={() => onEdit(role)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => onDelete(role.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomRolesList;
