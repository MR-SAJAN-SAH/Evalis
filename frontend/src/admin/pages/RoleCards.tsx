import React from 'react';
import type { Role } from '../types/roleTypes';
import './RoleCards.css';

interface Props {
  roles: Role[];
  onSelectRole: (role: Role) => void;
}

const getRoleIcon = (roleName: string): string => {
  const icons: Record<string, string> = {
    SUPERADMIN: '👑',
    ADMIN: '🔐',
    TEACHER: '👨‍🏫',
    EVALUATOR: '✍️',
    PROCTOR: '🔍',
    CANDIDATE: '👤',
  };
  return icons[roleName] || '👥';
};

const getRoleColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    SUPERADMIN: '#e74c3c',
    ADMIN: '#3498db',
    TEACHER: '#f39c12',
    EVALUATOR: '#9b59b6',
    PROCTOR: '#1abc9c',
    CANDIDATE: '#95a5a6',
  };
  return colors[roleName] || '#34495e';
};

const RoleCards: React.FC<Props> = ({ roles, onSelectRole }) => {
  return (
    <div className="role-cards-container">
      {roles.map((role) => (
        <div key={role.id} className="role-card" onClick={() => onSelectRole(role)}>
          <div className="rc-icon" style={{ backgroundColor: getRoleColor(role.name) }}>
            {getRoleIcon(role.name)}
          </div>
          <div className="rc-content">
            <h3>{role.name}</h3>
            <p>{role.description}</p>
          </div>
          <div className="rc-stats">
            <div className="stat">
              <span className="stat-value">{role.userCount}</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="stat">
              <span className="stat-value">{role.permissions.length}</span>
              <span className="stat-label">Permissions</span>
            </div>
          </div>
          <div className="rc-actions">
            <button className="btn-view">View Details →</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoleCards;
