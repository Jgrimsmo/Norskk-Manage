import React from 'react';
import { WEATHER_OPTIONS } from '../lib/constants/appConstants';

export default function ReportDetails({ report, onExportPDF }) {
  if (!report) {
    return (
      <div className="no-report-selected">
        <h3>Select a report to view details</h3>
        <p>Click on a report from the list to view its details.</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    return status === 'submitted' ? '✅' : '📝';
  };

  const getWeatherIcon = (weather) => {
    const weatherOption = WEATHER_OPTIONS.find(option => option.value === weather);
    return weatherOption ? weatherOption.icon : '🌤️';
  };

  return (
    <div className="report-details">
      <div className="report-details-header">
        <div className="report-title-section">
          <h3>Daily Report - {new Date(report.date).toLocaleDateString()}</h3>
          <div className="report-meta">
            <span className="status-badge">{getStatusIcon(report.status)} {report.status}</span>
            {report.submittedAt && (
              <span className="submitted-time">
                Submitted: {new Date(report.submittedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="report-actions-header">
          <button 
            className="classic-button small"
            onClick={onExportPDF}
            title="Export to PDF"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="report-section">
          <h4>Project Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <strong>Project:</strong> {report.project}
            </div>
            <div className="info-item">
              <strong>Supervisor:</strong> {report.supervisor}
            </div>
            <div className="info-item">
              <strong>Weather:</strong> {getWeatherIcon(report.weather)} {report.weather}
            </div>
            <div className="info-item">
              <strong>Temperature:</strong> {report.temperature}
            </div>
            <div className="info-item">
              <strong>Workers on Site:</strong> {report.workersOnSite}
            </div>
            {report.selectedCrewMembers && report.selectedCrewMembers.length > 0 && (
              <div className="info-item crew-members-display">
                <strong>Crew Members:</strong>
                <div className="crew-list">
                  {report.selectedCrewMembers.map((member, index) => (
                    <span key={member.id} className="crew-member-badge">
                      {member.name} ({member.role})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="report-section">
          <h4>Work Progress</h4>
          <div className="text-content">
            <div className="content-item">
              <strong>Work Completed:</strong>
              <p>{report.workCompleted}</p>
            </div>
            <div className="content-item">
              <strong>Work Planned:</strong>
              <p>{report.workPlanned}</p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Safety & Issues</h4>
          <div className="text-content">
            <div className="content-item">
              <strong>Safety Incidents:</strong>
              <p>{report.safetyIncidents || 'None reported'}</p>
            </div>
            <div className="content-item">
              <strong>Issues/Delays:</strong>
              <p>{report.issuesDelays || 'None reported'}</p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h4>Resources</h4>
          <div className="resources-content">
            <div className="content-item">
              <strong>Equipment Used:</strong>
              <div className="equipment-tags">
                {report.equipmentUsed.map((equipment, index) => (
                  <span key={index} className="equipment-tag">{equipment}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {report.photos && report.photos.length > 0 && (
          <div className="report-section">
            <h4>Site Photos ({report.photos.length}) 🔗</h4>
            <p className="photo-note">💡 <em>In the PDF export, click on any image to view the full-size photo in your browser</em></p>
            <div className="report-photos">
              {report.photos.map((photo, index) => {
                console.log(`ReportDetails Photo ${index}:`, photo);
                return (
                  <div key={index} className="report-photo-item">
                    <div className="photo-container">
                      <img 
                        src={photo.url} 
                        alt={`Site photo ${index + 1}`}
                        className="report-photo"
                        onClick={() => window.open(photo.url, '_blank')}
                        onError={(e) => {
                          console.error(`Failed to load photo ${index} in ReportDetails:`, photo.url);
                          e.target.style.border = '2px solid red';
                          e.target.style.background = '#ffe6e6';
                        }}
                        onLoad={() => {
                          console.log(`Photo ${index} loaded in ReportDetails:`, photo.url);
                        }}
                      />
                      <div className="photo-link-indicator">🔗</div>
                    </div>
                    <span className="report-photo-name">{photo.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
