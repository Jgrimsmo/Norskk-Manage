import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import ReportFilters from './components/ReportFilters';
import { useReportManagement } from '../../hooks/useReportManagement';
import '../../styles/page.css';
import '../../styles/tables.css';
import '../../styles/buttons.css';
import './DailyReports.css';

export default function DailyReports() {
  const navigate = useNavigate();
  const { hasPermission, PERMISSIONS } = useAuth();
  const {
    projectFilter,
    setProjectFilter,
    dateFilter,
    setDateFilter,
    uniqueProjects,
    filteredReports,
    handleDeleteReport,
    loadReports
  } = useReportManagement();

  // Group reports by project for table display
  const groupedReports = React.useMemo(() => {
    const groups = {};
    filteredReports.forEach(report => {
      const projectName = report.project || 'Unknown Project';
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      groups[projectName].push(report);
    });
    
    // Sort reports within each project by date (newest first)
    Object.keys(groups).forEach(projectName => {
      groups[projectName].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return groups;
  }, [filteredReports]);

  const handleEditReport = (report) => {
    // Navigate to edit page instead of modal
    navigate('/daily-reports/edit', { 
      state: { report } 
    });
  };

  const handleDeleteReportWithConfirm = async (report) => {
    if (window.confirm(`Are you sure you want to delete the report for ${report.project} on ${new Date(report.date).toLocaleDateString()}?`)) {
      try {
        await handleDeleteReport(report.id);
        await loadReports(); // Refresh the list
      } catch (error) {
        alert('Failed to delete report: ' + error.message);
      }
    }
  };

  const canCreateReports = hasPermission(PERMISSIONS.CREATE_REPORTS);
  const canViewReports = hasPermission(PERMISSIONS.VIEW_REPORTS);

  if (!canViewReports) {
    return (
      <Layout title="Access Denied">
        <div className="page-card">
          <div className="error-message">
            <h3>Access Denied</h3>
            <p>You don't have permission to view daily reports.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddReport = () => {
    // Navigate to edit page without any report data for creating a new report
    navigate('/daily-reports/edit');
  };

  return (
    <Layout title="Daily Site Reports">
      <div className="reports-container">
        <ReportFilters
          projectFilter={projectFilter}
          onProjectFilterChange={setProjectFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          uniqueProjects={uniqueProjects}
          onAddReport={handleAddReport}
          canCreateReports={canCreateReports}
        />

        <div className="reports-table-container">
          {Object.keys(groupedReports).length === 0 ? (
            <div className="no-reports">
              <p>No reports found for the selected filters.</p>
              {canCreateReports && (
                <button 
                  className="classic-button"
                  onClick={handleAddReport}
                >
                  Create First Report
                </button>
              )}
            </div>
          ) : (
            Object.entries(groupedReports).map(([projectName, reports]) => (
              <div key={projectName} className="project-group">
                <h3 className="project-group-title">{projectName}</h3>
                <div className="table-section">
                  <table className="norskk-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weather</th>
                        <th>Crew Size</th>
                        <th>Work Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td>
                            <span className="report-date">
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <span className="weather-info">
                              {report.weather || 'N/A'}
                              {report.temperature && (
                                <span className="temp"> ({report.temperature})</span>
                              )}
                            </span>
                          </td>
                          <td>
                            <span className="crew-size">
                              {report.selectedCrewMembers?.length || report.workersOnSite || 0} members
                            </span>
                          </td>
                          <td>
                            <span className="work-description">
                              {report.workCompleted || 'No description'}
                            </span>
                          </td>
                          <td>
                            <div className="norskk-table-actions">
                              {canCreateReports && (
                                <button 
                                  className="classic-button"
                                  onClick={() => handleEditReport(report)}
                                  title="View/Edit Report"
                                >
                                  View
                                </button>
                              )}
                              {hasPermission(PERMISSIONS.DELETE_REPORTS) && (
                                <button 
                                  className="classic-button delete-item-button"
                                  onClick={() => handleDeleteReportWithConfirm(report)}
                                  title="Delete Report"
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
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}