import React, { useMemo } from 'react';
import './PermissionsMatrix.css';

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: Permission[];
}

interface Props {
  roles: Role[];
  permissions: Record<string, Permission[]>;
}

const PermissionsMatrix: React.FC<Props> = ({ roles, permissions }) => {
  const systemRoles = useMemo(() => roles.filter((r) => r.isSystem), [roles]);
  const modules = useMemo(() => Object.keys(permissions).sort(), [permissions]);

  const hasPermission = (role: Role, permissionName: string): boolean => {
    return role.permissions.some((p: any) => p.name === permissionName);
  };

  const getModuleIcon = (module: string): string => {
    const icons: Record<string, string> = {
      Dashboard: '📊',
      Users: '👥',
      Exams: '📝',
      Evaluation: '✍️',
      Analytics: '📈',
      Proctoring: '🔍',
      Settings: '⚙️',
      Audit: '📋',
    };
    return icons[module] || '📌';
  };

  return (
    <div className="permissions-matrix-container">
      <div className="pm-info">
        <h2>Permissions Matrix</h2>
        <p>View which permissions are assigned to each system role</p>
      </div>

      <div className="matrix-wrapper">
        <table className="permissions-matrix">
          <thead>
            <tr>
              <th className="module-header">Permission</th>
              {systemRoles.map((role) => (
                <th key={role.id} className="role-header">
                  <span className="role-name">{role.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <React.Fragment key={module}>
                <tr className="module-row">
                  <td colSpan={systemRoles.length + 1} className="module-cell">
                    <span className="module-icon">{getModuleIcon(module)}</span>
                    <span className="module-name">{module}</span>
                  </td>
                </tr>
                {permissions[module].map((permission) => (
                  <tr key={permission.id} className="permission-row">
                    <td className="permission-cell">
                      <span className="action-badge">{permission.action}</span>
                      <span className="permission-name">{permission.name}</span>
                    </td>
                    {systemRoles.map((role) => (
                      <td key={`${role.id}-${permission.id}`} className="permission-checkbox">
                        <div
                          className={`checkbox-visual ${
                            hasPermission(role, permission.name) ? 'checked' : ''
                          }`}
                        >
                          {hasPermission(role, permission.name) && <span>✓</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pm-legend">
        <div className="legend-item">
          <div className="checkbox-visual checked">
            <span>✓</span>
          </div>
          <span>Permission Assigned</span>
        </div>
        <div className="legend-item">
          <div className="checkbox-visual">
            <span></span>
          </div>
          <span>Permission Not Assigned</span>
        </div>
      </div>
    </div>
  );
};

export default PermissionsMatrix;
