// src/components/SidebarLayout.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SidebarLayout.css';
import Sidebar from "./Sidebar";

export default function SidebarLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar} 
      />      <main 
        className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{ 
          marginLeft: sidebarCollapsed ? '-145px' : '5px',
          marginRight: '0px',
          transition: 'margin-left 0.3s ease',
          padding: 0,
          width: sidebarCollapsed ? 'calc(100vw - 70px)' : 'calc(100vw - 220px)'
        }}
      >
        {children}
      </main>
    </div>
  );
}
