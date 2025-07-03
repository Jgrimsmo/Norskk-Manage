import React from 'react';
import { WEATHER_OPTIONS } from '../lib/constants/appConstants';

export default function ReportList({ 
  reports, 
  selectedReport, 
  onSelectReport, 
  onEditReport, 
  onDeleteReport, 
  canCreateReports, 
  onAddReport 
}) {
  const getStatusIcon = (status) => {
    return status === 'submitted' ? '✅' : '📝';
  };

  const getWeatherIcon = (weather) => {
    const weatherOption = WEATHER_OPTIONS.find(option => option.value === weather);
    return weatherOption ? weatherOption.icon : '🌤️';
  };

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <p>No reports found</p>
        {canCreateReports && (
          <button className="classic-button" onClick={onAddReport}>
            Create First Report
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="reports-list">
      {reports.map(report => (
        <div
          key={report.id}
          className={`report-item ${selectedReport?.id === report.id ? 'selected' : ''}`}
          onClick={() => onSelectReport(report)}
        >
          <div className="report-header">
            <div className="report-date">
              {new Date(report.date).toLocaleDateString()}
            </div>
            <div className="report-status">
              {getStatusIcon(report.status)} {report.status}
            </div>
          </div>
          
          <div className="report-project">{report.project}</div>
          <div className="report-supervisor">Supervisor: {report.supervisor}</div>
          
          <div className="report-summary">
            <span className="weather-info">
              {getWeatherIcon(report.weather)} {report.weather}
            </span>
            <span className="workers-info">
              👷 {report.workersOnSite} workers
            </span>
          </div>

          <div className="report-actions">
            {canCreateReports && (
              <>
                <button
                  className="classic-button small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditReport(report);
                  }}
                >
                  Edit
                </button>
                <button
                  className="classic-button small danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReport(report.id);
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
