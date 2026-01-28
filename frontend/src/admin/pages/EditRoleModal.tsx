import React, { useState } from 'react';
import './EditRoleModal.css';

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
}

interface Props {
  role: Role;
  permissions: Record<string, Permission[]>;
  onClose: () => void;
  onSubmit: (roleId: string, data: { name?: string; description?: string; permissionIds?: string[] }) => void;
}

const EditRoleModal: React.FC<Props> = ({ role, permissions, onClose, onSubmit }) => {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions.map((p) => p.id)),
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['Dashboard', 'Users']));

  const isSystemRole = role.isSystem;

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (permId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permId)) {
      newSelected.delete(permId);
    } else {
      newSelected.add(permId);
    }
    setSelectedPermissions(newSelected);
  };

  const selectAllPermissionsInModule = (module: string) => {
    const modulePerms = permissions[module] || [];
    const newSelected = new Set(selectedPermissions);

    const allSelected = modulePerms.every((p) => newSelected.has(p.id));

    if (allSelected) {
      modulePerms.forEach((p) => newSelected.delete(p.id));
    } else {
      modulePerms.forEach((p) => newSelected.add(p.id));
    }

    setSelectedPermissions(newSelected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSystemRole) {
      // System roles can't be edited, just view
      onClose();
      return;
    }

    const updateData: any = {
      permissionIds: Array.from(selectedPermissions),
    };

    if (name.trim() !== role.name) {
      updateData.name = name;
    }

    if (description !== role.description) {
      updateData.description = description;
    }

    onSubmit(role.id, updateData);
  };

  const modules = Object.keys(permissions).sort();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{isSystemRole ? 'View System Role' : 'Edit Custom Role'}</h2>
            {isSystemRole && <p className="system-role-badge">System Role - View Only</p>}
          </div>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-role-form">
          <div className="form-section">
            <h3>Role Details</h3>

            <div className="form-group">
              <label htmlFor="name">Role Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSystemRole}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSystemRole}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Permissions</h3>
              <span className="perm-count">{selectedPermissions.size} assigned</span>
            </div>

            {isSystemRole && (
              <div className="info-box">
                System roles have predefined permissions that cannot be modified. You can view the permissions assigned to this role below.
              </div>
            )}

            <div className="permissions-list">
              {modules.map((module) => {
                const modulePerms = permissions[module] || [];
                const isExpanded = expandedModules.has(module);
                const allSelected = modulePerms.every((p) => selectedPermissions.has(p.id));
                const someSelected = modulePerms.some((p) => selectedPermissions.has(p.id));

                return (
                  <div key={module} className="permission-module">
                    <div className="module-header-row">
                      <button
                        type="button"
                        className="module-toggle"
                        onClick={() => toggleModule(module)}
                      >
                        <span className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
                        <span className="module-title">{module}</span>
                        <span className={`module-check ${allSelected ? 'all' : someSelected ? 'partial' : ''}`}>
                          {allSelected ? '✓' : someSelected ? '−' : '○'}
                        </span>
                      </button>
                      {!isSystemRole && (
                        <button
                          type="button"
                          className="btn-select-all"
                          onClick={() => selectAllPermissionsInModule(module)}
                        >
                          {allSelected ? 'Unselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="module-permissions">
                        {modulePerms.map((perm) => (
                          <label key={perm.id} className="permission-checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.has(perm.id)}
                              onChange={() => {
                                if (!isSystemRole) {
                                  togglePermission(perm.id);
                                }
                              }}
                              disabled={isSystemRole}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="permission-label">
                              <span className="action-badge">{perm.action}</span>
                              <span className="permission-name">{perm.name}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            {!isSystemRole && (
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;
