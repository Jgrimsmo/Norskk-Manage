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
          marginLeft: sidebarCollapsed ? '60px' : '210px',
          transition: 'margin-left 0.3s ease',
          flex: 1,
          minWidth: 0
        }}
      >
        {children}
      </main>
    </div>
  );
}
