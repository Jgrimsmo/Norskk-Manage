import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import DailyReportPDF from '../../components/ReportPDF/DailyReportPDF';
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
      {/* Fixed Header with Actions */}
      <div className="pdf-preview-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            ← Back to Reports
          </button>
          <h1>PDF Preview - Daily Report</h1>
        </div>
        <div className="header-actions">
          {/* Photo Click Info */}
          {report.photos && report.photos.length > 0 && (
            <div className="photo-click-info">
              <span style={{ fontSize: '12px', color: '#6c757d', marginRight: '16px' }}>
                📷 Images are clickable in the downloaded PDF
              </span>
            </div>
          )}
          <button 
            className="classic-button secondary"
            onClick={handleBack}
          >
            Close Preview
          </button>
          <PDFDownloadLink 
            document={<DailyReportPDF reportData={report} />} 
            fileName={generateFileName()}
            className="classic-button"
          >
            {({ blob, url, loading, error }) =>
              loading ? '📄 Generating...' : '📄 Download PDF'
            }
          </PDFDownloadLink>
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
