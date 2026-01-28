import React, { useState } from 'react';
import './CreateRoleModal.css';

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

interface Props {
  permissions: Record<string, Permission[]>;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; permissionIds: string[] }) => void;
}

const CreateRoleModal: React.FC<Props> = ({ permissions, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['Dashboard', 'Users']));

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

    if (!name.trim()) {
      alert('Role name is required');
      return;
    }

    onSubmit({
      name,
      description,
      permissionIds: Array.from(selectedPermissions),
    });
  };

  const modules = Object.keys(permissions).sort();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Custom Role</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-role-form">
          <div className="form-section">
            <h3>Role Details</h3>

            <div className="form-group">
              <label htmlFor="name">Role Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Junior Evaluator"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this role..."
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Assign Permissions</h3>
              <span className="perm-count">
                {selectedPermissions.size} selected
              </span>
            </div>

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
                      <button
                        type="button"
                        className="btn-select-all"
                        onClick={() => selectAllPermissionsInModule(module)}
                        title={allSelected ? 'Unselect all' : 'Select all'}
                      >
                        {allSelected ? 'Unselect All' : 'Select All'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="module-permissions">
                        {modulePerms.map((perm) => (
                          <label key={perm.id} className="permission-checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.has(perm.id)}
                              onChange={() => togglePermission(perm.id)}
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
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleModal;
