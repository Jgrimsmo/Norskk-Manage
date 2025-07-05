import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import DailyReportPDF from './components/ReportPDF/DailyReportPDF';
import './DailyReportPDFPreview.css';

// Add Buffer polyfill for browser compatibility
if (typeof global === 'undefined') {
  window.global = window;
}
if (typeof Buffer === 'undefined') {
  window.Buffer = require('buffer').Buffer;
}

export default function DailyReportPDFPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Get report data from navigation state
      if (location.state?.report) {
        console.log('📄 Report data received:', location.state.report);
        setReport(location.state.report);
      } else {
        // If no report data, redirect back to reports page
        console.warn('⚠️ No report data found, redirecting...');
        navigate('/daily-reports');
      }
    } catch (err) {
      console.error('❌ Error setting up PDF preview:', err);
      setError(err.message);
    }
  }, [location.state, navigate]);

  const handleBack = () => {
    navigate('/daily-reports');
  };

  if (error) {
    return (
      <div className="pdf-preview-loading">
        <div className="loading-spinner">
          <h3>Error loading PDF preview</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="classic-button">
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="pdf-preview-loading">
        <div className="loading-spinner">Loading report preview...</div>
      </div>
    );
  }

  // Generate filename for download
  const generateFileName = () => {
    const projectName = report.project?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Report';
    const reportDate = report.date || new Date().toISOString().split('T')[0];
    return `${projectName}_Daily_Site_Report_${reportDate}.pdf`;
  };

  return (
    <div className="pdf-preview-fullscreen">
      {/* Enhanced Professional Header */}
      <div className="pdf-preview-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            <span className="button-icon">←</span>
            <span>Back to Reports</span>
          </button>
          <div className="header-title-section">
            <h1>Daily Site Report</h1>
            <div className="header-subtitle">
              <span className="project-name">{report.project || 'Untitled Project'}</span>
              <span className="report-date">{report.date || 'No Date'}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          {/* Enhanced Photo Info Banner */}
          {report.photos && report.photos.length > 0 && (
            <div className="photo-info-banner">
              <div className="info-item">
                <span className="info-icon">📷</span>
                <span className="info-text">{report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔗</span>
                <span className="info-text">Clickable in PDF</span>
              </div>
              {report.photos.some(photo => photo.pdfReady === false) && (
                <div className="info-item warning">
                  <span className="info-icon">⚠️</span>
                  <span className="info-text">Some images may not display</span>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="action-btn secondary"
              onClick={handleBack}
              title="Close PDF Preview"
            >
              <span className="btn-icon">✕</span>
              <span>Close</span>
            </button>
            <PDFDownloadLink 
              document={<DailyReportPDF reportData={report} />} 
              fileName={generateFileName()}
              className="action-btn primary"
              title="Download PDF Report"
            >
              {({ blob, url, loading, error }) => (
                <>
                  <span className="btn-icon">{loading ? '⏳' : '📄'}</span>
                  <span>{loading ? 'Generating...' : 'Download PDF'}</span>
                </>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="pdf-preview-main">
        <div className="pdf-viewer-container">
          {report ? (
            <PDFViewer 
              width="100%" 
              height="100%" 
              showToolbar={true}
              className="pdf-viewer"
            >
              <DailyReportPDF reportData={report} />
            </PDFViewer>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No report data available for preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
