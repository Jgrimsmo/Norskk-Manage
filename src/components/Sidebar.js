import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { db } from "../Firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import "./Sidebar.css";

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const [projects, setProjects] = useState([]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission, PERMISSIONS } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const snapshot = await getDocs(collection(db, "projects"));
    const projectsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProjects(projectsData);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ to, permission, icon, children, className = "" }) => {
    if (permission && !hasPermission(permission)) {
      return null;
    }

    return (
      <Link to={to} className={`sidebar-link ${className}`} title={isCollapsed ? children : ""}>
        <i className={`${icon} sidebar-icon`}></i>
        {!isCollapsed && <span>{children}</span>}
      </Link>
    );
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo-container">
          <img src={require("../assets/logos/norskk-logo.png")} alt="Norskk Management Logo" className="sidebar-logo" />
          {!isCollapsed && <span className="sidebar-title">Norskk Management</span>}
        </Link>
        <button 
          className="sidebar-toggle" 
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fa ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      {!isCollapsed && <div className="sidebar-section">ESTIMATES</div>}

      <NavLink to="/estimate-dashboard" permission={PERMISSIONS.VIEW_PROJECTS} icon="fa fa-calculator">
        Estimate Dashboard
      </NavLink>

      <NavLink to="/item-database" permission={PERMISSIONS.VIEW_PROJECTS} icon="fa fa-database">
        Item Database
      </NavLink>

      {!isCollapsed && <div className="sidebar-section">MANAGEMENT</div>}

      <NavLink to="/project-dashboard" permission={PERMISSIONS.VIEW_PROJECTS} icon="fa fa-columns">
        Project Dashboard
      </NavLink>

      <NavLink to="/time-tracking" icon="fa fa-clock">
        Time Tracking
      </NavLink>

      <NavLink to="/equipment" permission={PERMISSIONS.MANAGE_EQUIPMENT} icon="fa fa-tools">
        Equipment
      </NavLink>

      <NavLink to="/dispatch" permission={PERMISSIONS.VIEW_SCHEDULE} icon="fa fa-shipping-fast">
        Dispatch
      </NavLink>

      <NavLink to="/crew" permission={PERMISSIONS.MANAGE_CREW} icon="fa fa-users">
        Crew
      </NavLink>

      {!isCollapsed && <div className="sidebar-section">REPORTS & FORMS</div>}

      <NavLink to="/daily-reports" permission={PERMISSIONS.CREATE_REPORTS} icon="fa fa-file-alt">
        Daily Reports
      </NavLink>

      <NavLink to="/flha-forms" permission={PERMISSIONS.SUBMIT_FLHA} icon="fa fa-shield-alt">
        FLHA Forms
      </NavLink>

      <NavLink to="/toolbox-forms" permission={PERMISSIONS.SUBMIT_TOOLBOX} icon="fa fa-toolbox">
        Toolbox Talks
      </NavLink>

      <NavLink to="/form-builder" permission={PERMISSIONS.MANAGE_SETTINGS} icon="fa fa-edit">
        Form Builder
      </NavLink>

      {!isCollapsed && <div className="sidebar-section">TOOLS</div>}

      <NavLink to="/export-calculator" icon="fa fa-calculator">
        Export Calculator
      </NavLink>

      <NavLink to="/import-calculator" icon="fa fa-plus-circle">
        Import Calculator
      </NavLink>

      <NavLink to="/construction-calculator" icon="fa fa-wrench">
        Construction Calculator
      </NavLink>

      <div style={{ flex: 1 }}></div>

      {!isCollapsed && user && (
        <div className="sidebar-user-info">
          <div className="user-avatar">
            <i className="fa fa-user-circle"></i>
          </div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      )}

      <NavLink to="/admin-settings" permission={PERMISSIONS.MANAGE_USERS} icon="fa fa-users-cog">
        Admin Settings
      </NavLink>

      <NavLink to="/settings" icon="fa fa-cog">
        Settings
      </NavLink>

      <button
        className="sidebar-link sidebar-logout"
        onClick={handleLogout}
        title={isCollapsed ? "Logout" : ""}
      >
        <i className="fa fa-sign-out-alt sidebar-icon"></i>
        {!isCollapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}
