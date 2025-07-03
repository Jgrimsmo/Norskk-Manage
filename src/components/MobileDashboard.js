import React from 'react';
import { Link } from 'react-router-dom';
import './MobileDashboard.css';

const MobileDashboard = () => {
  const mobileNavItems = [
    {
      title: 'Project Dashboard',
      icon: '📊',
      path: '/projects',
      description: 'View and manage projects'
    },
    {
      title: 'Time Tracking',
      icon: '⏰',
      path: '/time-tracking',
      description: 'Log work hours'
    },
    {
      title: 'Dispatch',
      icon: '🚛',
      path: '/dispatch',
      description: 'Equipment & crew dispatch'
    },
    {
      title: 'Daily Reports',
      icon: '📝',
      path: '/reports',
      description: 'Create daily reports'
    },
    {
      title: 'FLHA Forms',
      icon: '⚠️',
      path: '/forms/flha',
      description: 'Field Level Hazard Assessment'
    },
    {
      title: 'Toolbox Talks',
      icon: '🧰',
      path: '/forms/toolbox',
      description: 'Safety meetings & talks'
    }
  ];

  return (
    <div className="mobile-dashboard">
      <div className="mobile-header">
        <h1>Norskk Management</h1>
        <p>Field Operations</p>
      </div>
      
      <div className="mobile-app-nav">
        {mobileNavItems.map((item, index) => (
          <Link key={index} to={item.path} className="mobile-nav-button">
            <span className="icon">{item.icon}</span>
            <span className="title">{item.title}</span>
            <span className="description">{item.description}</span>
          </Link>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mobile-quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-action-buttons">
          <Link to="/time-tracking/quick" className="quick-action-btn">
            ⚡ Quick Time Entry
          </Link>
          <Link to="/emergency" className="quick-action-btn emergency">
            🚨 Emergency
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
