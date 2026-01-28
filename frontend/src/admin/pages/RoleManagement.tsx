import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CreateRoleModal from './CreateRoleModal';
import EditRoleModal from './EditRoleModal';
import RoleCards from './RoleCards';
import PermissionsMatrix from './PermissionsMatrix';
import CustomRolesList from './CustomRolesList';
import './RoleManagement.css';

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: any[];
}

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string;
}

const RoleManagement: React.FC = () => {
  const { userId, accessToken } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'system' | 'custom' | 'matrix'>('system');

  // Fetch roles and permissions
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${accessToken}` };

      const [rolesRes, permsRes] = await Promise.all([
        fetch('http://localhost:3001/api/roles', { headers }),
        fetch('http://localhost:3001/api/roles/permissions', { headers }),
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json();
        setPermissions(permsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  const handleCreateRole = async (data: { name: string; description: string; permissionIds: string[] }) => {
    try {
      const response = await fetch('http://localhost:3001/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async (roleId: string, data: any) => {
    try {
      const response = await fetch(`http://localhost:3001/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedRole(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/roles/${roleId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  if (loading) {
    return (
      <div className="role-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="role-management">
      <div className="rm-header">
        <div className="rm-title-section">
          <h1>Role Management</h1>
          <p>Configure system roles, create custom roles, and manage permissions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Custom Role
        </button>
      </div>

      <div className="rm-tabs">
        <button
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System Roles ({systemRoles.length})
        </button>
        <button
          className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Roles ({customRoles.length})
        </button>
        <button
          className={`tab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          Permissions Matrix
        </button>
      </div>

      <div className="rm-content">
        {activeTab === 'system' && (
          <RoleCards
            roles={systemRoles}
            onSelectRole={(role) => {
              setSelectedRole(role);
              setShowEditModal(true);
            }}
          />
        )}

        {activeTab === 'custom' && (
          <CustomRolesList
            roles={customRoles}
            onEdit={(role: Role) => {
              setSelectedRole(role);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteRole}
          />
        )}

        {activeTab === 'matrix' && (
          <PermissionsMatrix roles={roles} permissions={permissions} />
        )}
      </div>

      {showCreateModal && (
        <CreateRoleModal
          permissions={permissions}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRole}
        />
      )}

      {showEditModal && selectedRole && (
        <EditRoleModal
          role={selectedRole}
          permissions={permissions}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSubmit={handleUpdateRole}
        />
      )}
    </div>
  );
};

export default RoleManagement;
