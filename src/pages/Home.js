import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchCollection } from "../lib/utils/firebaseHelpers";
import Layout from "../components/Layout";
import "../styles/page.css";
import "../styles/tables.css";
import "./Home.css";

export default function Home() {
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    crew: [],
    equipment: [],
    timeEntries: [],
    loading: true
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projects, crew, equipment, timeEntries] = await Promise.all([
        fetchCollection("managementProjects").catch(() => []),
        fetchCollection("crew").catch(() => []),
        fetchCollection("equipment").catch(() => []),
        fetchCollection("timeTracking").catch(() => [])
      ]);

      setDashboardData({
        projects,
        crew,
        equipment,
        timeEntries,
        loading: false
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getQuickStats = () => {
    const { projects, crew, equipment, timeEntries } = dashboardData;
    
    const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
    const availableCrew = crew.filter(c => c.status === 'Available' || !c.status).length;
    const availableEquipment = equipment.filter(e => e.status === 'Available' || !e.status).length;
    
    // Time entries for today
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = timeEntries.filter(entry => entry.date === today).length;

    return {
      activeProjects,
      totalProjects: projects.length,
      availableCrew,
      totalCrew: crew.length,
      availableEquipment,
      totalEquipment: equipment.length,
      todayTimeEntries: todayEntries
    };
  };

  const getRecentActivity = () => {
    const { projects, timeEntries } = dashboardData;
    const activities = [];

    // Recent projects (last 5)
    const recentProjects = projects
      .filter(p => p.updatedDate || p.createdDate)
      .sort((a, b) => {
        const dateA = new Date(a.updatedDate || a.createdDate);
        const dateB = new Date(b.updatedDate || b.createdDate);
        return dateB - dateA;
      })
      .slice(0, 3);

    recentProjects.forEach(project => {
      activities.push({
        type: 'project',
        title: `Project Updated: ${project.name}`,
        subtitle: `Status: ${project.status || 'Draft'}`,
        time: project.updatedDate || project.createdDate,
        icon: '📋'
      });
    });

    // Recent time entries (last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const recentTimeEntries = timeEntries
      .filter(entry => new Date(entry.date) >= threeDaysAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    recentTimeEntries.forEach(entry => {
      activities.push({
        type: 'time',
        title: `Time Entry: ${entry.employeeName || 'Unknown Employee'}`,
        subtitle: `${entry.hours} hours - ${entry.date}`,
        time: entry.date,
        icon: '⏱️'
      });
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  };

  const QuickActionCard = ({ to, title, description, icon, permission }) => {
    if (permission && !hasPermission(permission)) {
      return null;
    }

    return (
      <Link to={to} className="home-quick-action-card">
        <div className="quick-action-icon">{icon}</div>
        <div className="quick-action-content">
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <div className="quick-action-arrow">→</div>
      </Link>
    );
  };

  const stats = getQuickStats();
  const recentActivity = getRecentActivity();

  return (
    <Layout title="Home">
      <div className="home-container">
        {/* Welcome Header */}
        <div className="home-header">
          <div className="welcome-section">
            <h2>Welcome back, {user?.name || 'User'}!</h2>
            <div className="current-datetime">
              <div className="current-date">{formatDate(currentTime)}</div>
              <div className="current-time">{formatTime(currentTime)}</div>
            </div>
          </div>
          <div className="user-role-badge">
            <span className={`role-badge ${user?.role}`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="home-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeProjects}</div>
              <div className="stat-label">Active Projects</div>
              <div className="stat-sublabel">of {stats.totalProjects} total</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👷</div>
            <div className="stat-content">
              <div className="stat-number">{stats.availableCrew}</div>
              <div className="stat-label">Available Crew</div>
              <div className="stat-sublabel">of {stats.totalCrew} total</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🚛</div>
            <div className="stat-content">
              <div className="stat-number">{stats.availableEquipment}</div>
              <div className="stat-label">Available Equipment</div>
              <div className="stat-sublabel">of {stats.totalEquipment} total</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-number">{stats.todayTimeEntries}</div>
              <div className="stat-label">Time Entries Today</div>
              <div className="stat-sublabel">logged entries</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="home-main-grid">
          {/* Quick Actions */}
          <div className="home-section">
            <div className="section-header">
              <h3>🚀 Quick Actions</h3>
            </div>
            <div className="home-quick-actions">
              <QuickActionCard 
                to="/estimate-dashboard"
                title="Create Estimate"
                description="Start a new project estimate"
                icon="🧮"
                permission={PERMISSIONS.CREATE_ESTIMATES}
              />
              <QuickActionCard 
                to="/time-tracking"
                title="Track Time"
                description="Log work hours"
                icon="⏱️"
                permission={PERMISSIONS.VIEW_TIME_TRACKING}
              />
              <QuickActionCard 
                to="/dispatch"
                title="Schedule Work"
                description="Assign crew and equipment"
                icon="📅"
                permission={PERMISSIONS.SCHEDULE_WORK}
              />
              <QuickActionCard 
                to="/daily-reports"
                title="Daily Report"
                description="Submit progress report"
                icon="📝"
                permission={PERMISSIONS.CREATE_REPORTS}
              />
              <QuickActionCard 
                to="/flha-forms"
                title="FLHA Form"
                description="Submit safety assessment"
                icon="🛡️"
                permission={PERMISSIONS.SUBMIT_FLHA}
              />
              <QuickActionCard 
                to="/project-dashboard"
                title="View Projects"
                description="Manage active projects"
                icon="🏗️"
                permission={PERMISSIONS.VIEW_PROJECTS}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="home-section">
            <div className="section-header">
              <h3>📈 Recent Activity</h3>
            </div>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-subtitle">{activity.subtitle}</div>
                    </div>
                    <div className="activity-time">
                      {new Date(activity.time).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Tools */}
        <div className="home-section">
          <div className="section-header">
            <h3>🛠️ Tools & Resources</h3>
          </div>
          <div className="tools-grid">
            <QuickActionCard 
              to="/item-database"
              title="Item Database"
              description="Browse construction materials"
              icon="🗄️"
              permission={PERMISSIONS.VIEW_PROJECTS}
            />
            <QuickActionCard 
              to="/construction-calculator"
              title="Calculator"
              description="Construction calculations"
              icon="🧮"
            />
            <QuickActionCard 
              to="/equipment"
              title="Equipment"
              description="Manage equipment fleet"
              icon="⚙️"
              permission={PERMISSIONS.MANAGE_EQUIPMENT}
            />
            <QuickActionCard 
              to="/crew"
              title="Crew Management"
              description="Manage crew members"
              icon="👥"
              permission={PERMISSIONS.MANAGE_CREW}
            />
            {hasPermission(PERMISSIONS.MANAGE_USERS) && (
              <QuickActionCard 
                to="/admin-settings"
                title="Admin Settings"
                description="System administration"
                icon="⚙️"
                permission={PERMISSIONS.MANAGE_USERS}
              />
            )}
            <QuickActionCard 
              to="/settings"
              title="Settings"
              description="User preferences"
              icon="🔧"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
