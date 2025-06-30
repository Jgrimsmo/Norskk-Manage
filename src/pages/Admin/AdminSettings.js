import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Layout from '../../components/Layout';
import '../../styles/page.css';
import './AdminSettings.css';

const SAMPLE_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@norskk.com', role: 'admin', status: 'active', lastLogin: '2025-01-20' },
  { id: '2', name: 'John Manager', email: 'manager@norskk.com', role: 'manager', status: 'active', lastLogin: '2025-01-19' },
  { id: '3', name: 'Mike Foreman', email: 'foreman@norskk.com', role: 'foreman', status: 'active', lastLogin: '2025-01-18' },
  { id: '4', name: 'Anna Worker', email: 'worker@norskk.com', role: 'worker', status: 'inactive', lastLogin: '2025-01-15' }
];

// Available permissions across the system
const AVAILABLE_PERMISSIONS = {
  // Project Management
  'projects.view': 'View Projects',
  'projects.create': 'Create Projects',
  'projects.edit': 'Edit Projects',
  'projects.delete': 'Delete Projects',
  
  // Estimates
  'estimates.view': 'View Estimates',
  'estimates.create': 'Create Estimates',
  'estimates.edit': 'Edit Estimates',
  'estimates.delete': 'Delete Estimates',
  
  // Crew Management
  'crew.view': 'View Crew',
  'crew.manage': 'Manage Crew',
  'crew.schedule': 'Schedule Crew',
  
  // Equipment
  'equipment.view': 'View Equipment',
  'equipment.manage': 'Manage Equipment',
  'equipment.maintenance': 'Equipment Maintenance',
  
  // Reports
  'reports.view': 'View Reports',
  'reports.create': 'Create Reports',
  'reports.daily': 'Daily Reports',
  'reports.export': 'Export Reports',
  
  // Forms
  'forms.view': 'View Forms',
  'forms.submit': 'Submit Forms',
  'forms.flha': 'FLHA Forms',
  'forms.toolbox': 'Toolbox Forms',
  
  // Time Tracking
  'time.view': 'View Time Tracking',
  'time.track': 'Track Time',
  'time.approve': 'Approve Time',
  
  // Administration
  'admin.users': 'Manage Users',
  'admin.permissions': 'Manage Permissions',
  'admin.settings': 'System Settings',
  'admin.backup': 'Backup & Export',
  
  // Resources
  'resources.view': 'View Resources',
  'resources.manage': 'Manage Resources',
  
  // Financial
  'finance.view': 'View Financial Data',
  'finance.proposals': 'Create Proposals',
  'finance.invoicing': 'Invoicing'
};

const ROLE_PERMISSIONS = {
  admin: Object.keys(AVAILABLE_PERMISSIONS), // All permissions
  manager: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'estimates.view', 'estimates.create', 'estimates.edit', 'estimates.delete',
    'crew.view', 'crew.manage', 'crew.schedule',
    'equipment.view', 'equipment.manage', 'equipment.maintenance',
    'reports.view', 'reports.create', 'reports.daily', 'reports.export',
    'forms.view', 'forms.submit',
    'time.view', 'time.track', 'time.approve',
    'resources.view', 'resources.manage',
    'finance.view', 'finance.proposals', 'finance.invoicing'
  ],
  foreman: [
    'projects.view', 'projects.edit',
    'estimates.view', 'estimates.create', 'estimates.edit',
    'crew.view', 'crew.schedule',
    'equipment.view', 'equipment.manage',
    'reports.view', 'reports.daily',
    'forms.view', 'forms.submit', 'forms.flha', 'forms.toolbox',
    'time.view', 'time.track',
    'resources.view'
  ],
  worker: [
    'projects.view',
    'estimates.view',
    'crew.view',
    'equipment.view',
    'reports.view',
    'forms.view', 'forms.submit', 'forms.flha', 'forms.toolbox',
    'time.view', 'time.track',
    'resources.view'
  ],
  viewer: [
    'projects.view',
    'estimates.view',
    'crew.view',
    'equipment.view',
    'reports.view',
    'resources.view'
  ]
};

function UserManagementModal({ show, onClose, user = null, onSave, rolePermissions }) {
  const [form, setForm] = useState(user || {
    name: '',
    email: '',
    role: 'worker',
    status: 'active'
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const getPermissionPreview = (role) => {
    const permissions = rolePermissions[role] || [];
    if (role === 'admin') return ['All System Permissions'];
    
    const groupedPermissions = {};
    permissions.forEach(perm => {
      const category = perm.split('.')[0];
      const label = AVAILABLE_PERMISSIONS[perm];
      if (!groupedPermissions[category]) {
        groupedPermissions[category] = [];
      }
      groupedPermissions[category].push(label);
    });
    
    return Object.entries(groupedPermissions).map(([category, perms]) => 
      `${category.toUpperCase()}: ${perms.join(', ')}`
    );
  };

  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()}>
        <h2>{user ? 'Edit User' : 'Add New User'}</h2>
        <form className="add-project-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-field">
            <label>Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="foreman">Foreman</option>
              <option value="worker">Worker</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          
          <div className="form-field">
            <label>Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="permission-preview">
            <h4>Permissions for {form.role}:</h4>
            <div className="permission-summary">
              {getPermissionPreview(form.role).map((permGroup, index) => (
                <div key={index} className="permission-group-preview">
                  {permGroup}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="classic-button">
              {user ? 'Update User' : 'Add User'}
            </button>
            <button type="button" className="classic-button secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const { currentTheme, themes, changeTheme } = useTheme();
  const [users, setUsers] = useState(SAMPLE_USERS);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('users');
  const [rolePermissions, setRolePermissions] = useState(ROLE_PERMISSIONS);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [permissionChanges, setPermissionChanges] = useState({});

  // Check if user has admin permissions
  if (!hasPermission(PERMISSIONS.MANAGE_USERS)) {
    return (
      <Layout title="Access Denied">
        <div className="page-card">
          <div className="error-message">
            <h3>Access Denied</h3>
            <p>You don't have permission to access admin settings.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...userData, id: editingUser.id } : u));
    } else {
      setUsers([...users, { ...userData, id: Date.now().toString(), lastLogin: 'Never' }]);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  // Permission management functions
  const handleTogglePermission = (role, permission) => {
    if (!editingPermissions || role === 'admin') return; // Admin always has all permissions
    
    const currentPermissions = permissionChanges[role] || rolePermissions[role] || [];
    const hasPermission = currentPermissions.includes(permission);
    
    const updatedPermissions = hasPermission 
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    setPermissionChanges(prev => ({
      ...prev,
      [role]: updatedPermissions
    }));
  };

  const handleStartEditingPermissions = () => {
    setEditingPermissions(true);
    setPermissionChanges({});
  };

  const handleSavePermissions = () => {
    const updatedRolePermissions = { ...rolePermissions };
    
    Object.entries(permissionChanges).forEach(([role, permissions]) => {
      updatedRolePermissions[role] = permissions;
    });
    
    setRolePermissions(updatedRolePermissions);
    setEditingPermissions(false);
    setPermissionChanges({});
    
    // Here you would typically save to backend/Firebase
    console.log('Saving permissions:', updatedRolePermissions);
  };

  const handleCancelEditingPermissions = () => {
    setEditingPermissions(false);
    setPermissionChanges({});
  };

  const getEffectivePermissions = (role) => {
    if (role === 'admin') return Object.keys(AVAILABLE_PERMISSIONS);
    return permissionChanges[role] || rolePermissions[role] || [];
  };

  const groupPermissionsByCategory = () => {
    const categories = {};
    
    Object.entries(AVAILABLE_PERMISSIONS).forEach(([key, label]) => {
      const category = key.split('.')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ key, label });
    });
    
    return categories;
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑',
      manager: '👔',
      foreman: '🏗️',
      worker: '👷',
      viewer: '👁️'
    };
    return icons[role] || '👤';
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status === 'active' ? '✅' : '❌'} {status}
      </span>
    );
  };

  return (
    <Layout title="Admin Settings">
      <div className="admin-tabs">
        <button 
          className={`tab-button ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          👥 User Management
        </button>
        <button 
          className={`tab-button ${selectedTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setSelectedTab('permissions')}
        >
          🔐 Role Permissions
        </button>
        <button 
          className={`tab-button ${selectedTab === 'system' ? 'active' : ''}`}
          onClick={() => setSelectedTab('system')}
        >
          ⚙️ System Settings
        </button>
      </div>

      {selectedTab === 'users' && (
        <div className="tab-content">
          <div className="section-header">
            <h3>User Management</h3>
            <button className="classic-button" onClick={handleAddUser}>
              + Add New User
            </button>
          </div>

          <div className="table-section">
            <table className="norskk-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-icon">{getRoleIcon(u.role)}</span>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{getStatusBadge(u.status)}</td>
                    <td>{new Date(u.lastLogin).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="classic-button small"
                          onClick={() => handleEditUser(u)}
                        >
                          Edit
                        </button>
                        {u.id !== user.id && (
                          <button 
                            className="classic-button small danger"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'permissions' && (
        <div className="tab-content">
          <div className="section-header">
            <h3>Role Permissions Management</h3>
            {!editingPermissions ? (
              <button className="classic-button" onClick={handleStartEditingPermissions}>
                ✏️ Edit Permissions
              </button>
            ) : (
              <div className="edit-actions">
                <button className="classic-button" onClick={handleSavePermissions}>
                  💾 Save Changes
                </button>
                <button className="classic-button secondary" onClick={handleCancelEditingPermissions}>
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>

          {editingPermissions && (
            <div className="edit-notice">
              <p>⚠️ You are now editing role permissions. Changes will affect all users with these roles.</p>
            </div>
          )}

          <div className="permissions-management">
            {Object.keys(rolePermissions).map((role) => (
              <div key={role} className="role-permissions-card">
                <div className="role-header">
                  <span className="role-icon">{getRoleIcon(role)}</span>
                  <h4>{role.charAt(0).toUpperCase() + role.slice(1)} Role</h4>
                  {role === 'admin' && <span className="admin-badge">Super User</span>}
                </div>

                {role === 'admin' ? (
                  <div className="admin-permissions">
                    <p>🔓 <strong>All System Permissions</strong></p>
                    <p className="admin-note">Admin role has unrestricted access to all features and cannot be modified.</p>
                  </div>
                ) : (
                  <div className="permission-categories">
                    {Object.entries(groupPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="permission-category">
                        <h5 className="category-title">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h5>
                        <div className="permission-grid">
                          {permissions.map(({ key, label }) => {
                            const hasPermission = getEffectivePermissions(role).includes(key);
                            return (
                              <label 
                                key={key} 
                                className={`permission-item ${hasPermission ? 'granted' : 'denied'} ${editingPermissions ? 'editable' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={hasPermission}
                                  onChange={() => handleTogglePermission(role, key)}
                                  disabled={!editingPermissions}
                                />
                                <span className="permission-label">{label}</span>
                                <span className={`permission-status ${hasPermission ? 'granted' : 'denied'}`}>
                                  {hasPermission ? '✅' : '❌'}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="role-summary">
                  <strong>Total Permissions: </strong>
                  <span className="permission-count">
                    {role === 'admin' ? Object.keys(AVAILABLE_PERMISSIONS).length : getEffectivePermissions(role).length}
                    {' / '}
                    {Object.keys(AVAILABLE_PERMISSIONS).length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'system' && (        <div className="tab-content">
          <h3>System Settings</h3>
          <div className="system-settings">
            <div className="setting-group">
              <h4>🎨 Appearance & Theme</h4>
              <div className="setting-item theme-selector">
                <label>Color Scheme</label>
                <div className="theme-options">
                  {themes.map(theme => (
                    <div 
                      key={theme.id}
                      className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                      onClick={() => changeTheme(theme.id)}
                    >
                      <div className="theme-preview">
                        <div 
                          className="theme-color-1" 
                          style={{ backgroundColor: theme.colors.background }}
                        ></div>
                        <div 
                          className="theme-color-2" 
                          style={{ backgroundColor: theme.colors.headerBackground }}
                        ></div>
                        <div 
                          className="theme-color-3" 
                          style={{ backgroundColor: theme.colors.buttonBackground }}
                        ></div>
                      </div>
                      <span className="theme-name">{theme.name}</span>
                      {currentTheme === theme.id && <span className="theme-active">✓</span>}
                    </div>
                  ))}
                </div>
                <p className="theme-description">
                  Choose a color scheme for the application. Changes apply immediately.
                </p>
              </div>
            </div>

            <div className="setting-group">
              <h4>Security Settings</h4>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Require strong passwords
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Enable two-factor authentication
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" />
                  Auto-logout after inactivity
                </label>
              </div>
            </div>

            <div className="setting-group">
              <h4>System Maintenance</h4>
              <div className="setting-item">
                <button className="classic-button">Clear Cache</button>
                <span>Clear system cache and temporary files</span>
              </div>
              <div className="setting-item">
                <button className="classic-button">Export Data</button>
                <span>Export all system data for backup</span>
              </div>
              <div className="setting-item">
                <button className="classic-button danger">Reset System</button>
                <span>Reset system to default settings (WARNING)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserManagementModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={editingUser}
        onSave={handleSaveUser}
        rolePermissions={rolePermissions}
      />
    </Layout>
  );
}
