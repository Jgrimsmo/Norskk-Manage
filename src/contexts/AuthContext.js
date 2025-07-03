import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Sample user roles and permissions
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  FOREMAN: 'foreman',
  WORKER: 'worker',
  VIEWER: 'viewer'
};

const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Project permissions
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  VIEW_PROJECTS: 'view_projects',
  
  // Estimate permissions
  CREATE_ESTIMATES: 'create_estimates',
  EDIT_ESTIMATES: 'edit_estimates',
  APPROVE_ESTIMATES: 'approve_estimates',
  
  // Crew & Equipment
  MANAGE_CREW: 'manage_crew',
  MANAGE_EQUIPMENT: 'manage_equipment',
  
  // Reports & Forms
  CREATE_REPORTS: 'create_reports',
  VIEW_REPORTS: 'view_reports',
  SUBMIT_FLHA: 'submit_flha',
  SUBMIT_TOOLBOX: 'submit_toolbox',
  
  // Dispatch
  SCHEDULE_WORK: 'schedule_work',
  VIEW_SCHEDULE: 'view_schedule',
  
  // Time Tracking
  APPROVE_TIME_ENTRIES: 'approve_time_entries',
  VIEW_TIME_TRACKING: 'view_time_tracking'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_ESTIMATES,
    PERMISSIONS.EDIT_ESTIMATES,
    PERMISSIONS.APPROVE_ESTIMATES,
    PERMISSIONS.MANAGE_CREW,
    PERMISSIONS.MANAGE_EQUIPMENT,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.SCHEDULE_WORK,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.APPROVE_TIME_ENTRIES,
    PERMISSIONS.VIEW_TIME_TRACKING
  ],
  [ROLES.FOREMAN]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_ESTIMATES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORTS,
    PERMISSIONS.SUBMIT_FLHA,
    PERMISSIONS.SUBMIT_TOOLBOX,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.SCHEDULE_WORK,
    PERMISSIONS.VIEW_TIME_TRACKING
  ],
  [ROLES.WORKER]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.SUBMIT_FLHA,
    PERMISSIONS.SUBMIT_TOOLBOX,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_TIME_TRACKING
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_TIME_TRACKING
  ]
};

// Sample users - in a real app, this would come from Firebase Auth and Firestore
const SAMPLE_USERS = [
  {
    id: '1',
    email: 'admin@norskk.com',
    password: 'admin123',
    name: 'Admin User',
    role: ROLES.ADMIN,
    avatar: null
  },
  {
    id: '2', 
    email: 'manager@norskk.com',
    password: 'manager123',
    name: 'John Manager',
    role: ROLES.MANAGER,
    avatar: null
  },
  {
    id: '3',
    email: 'foreman@norskk.com', 
    password: 'foreman123',
    name: 'Mike Foreman',
    role: ROLES.FOREMAN,
    avatar: null
  },
  {
    id: '4',
    email: 'worker@norskk.com',
    password: 'worker123', 
    name: 'Anna Worker',
    role: ROLES.WORKER,
    avatar: null
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved login
    const savedUser = localStorage.getItem('norskk_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simple authentication - in a real app, use Firebase Auth
      const foundUser = SAMPLE_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (foundUser) {
        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;
        
        setUser(userWithoutPassword);
        localStorage.setItem('norskk_user', JSON.stringify(userWithoutPassword));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('norskk_user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const canAccess = (requiredPermissions = []) => {
    if (!user) return false;
    if (requiredPermissions.length === 0) return true;
    return hasAnyPermission(requiredPermissions);
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    canAccess,
    loading,
    ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { ROLES, PERMISSIONS };
