import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WEATHER_OPTIONS } from '../lib/constants/appConstants';

export default function PDFPreviewModal({ show, onClose, report }) {
  const previewRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!show || !report) return null;

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = previewRef.current;
      
      // Set element to A4 proportions for PDF generation
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      element.style.width = '210mm';
      element.style.maxWidth = '210mm';
      
      const canvas = await html2canvas(element, {
        scale: 1.5, // Increased scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0
      });
      
      // Restore original styles
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate image dimensions to fit full page width
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `Daily_Report_${report.project.replace(/\s+/g, '_')}_${report.date}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeatherIcon = (weather) => {
    const weatherOption = WEATHER_OPTIONS.find(option => option.value === weather);
    return weatherOption ? weatherOption.icon : '🌤️';
  };

  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="pdf-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>PDF Preview - Daily Report</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="pdf-preview-content">
          <div ref={previewRef} className="pdf-preview-page">
            {/* Header */}
            <div className="pdf-header">
              <div className="company-info">
                <h1>NORSKK MANAGEMENT</h1>
                <p>Construction Management & Consulting</p>
              </div>
              <div className="report-title">
                <h2>DAILY SITE REPORT</h2>
                <p className="report-date">{formatDate(report.date)}</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="pdf-section">
              <h3>PROJECT INFORMATION</h3>
              <div className="pdf-info-grid">
                <div className="pdf-info-item">
                  <strong>Project:</strong>
                  <span>{report.project}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Supervisor:</strong>
                  <span>{report.supervisor}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Date:</strong>
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Weather:</strong>
                  <span>{getWeatherIcon(report.weather)} {report.weather}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Temperature:</strong>
                  <span>{report.temperature}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Workers on Site:</strong>
                  <span>{report.workersOnSite}</span>
                </div>
                {report.selectedCrewMembers && report.selectedCrewMembers.length > 0 && (
                  <div className="pdf-info-item crew-members">
                    <strong>Crew Members:</strong>
                    <div className="crew-members-list">
                      {report.selectedCrewMembers.map((member, index) => (
                        <span key={member.id} className="crew-member-item">
                          {member.name} ({member.role})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Work Progress */}
            <div className="pdf-section">
              <h3>WORK PROGRESS</h3>
              <div className="pdf-text-section">
                <div className="pdf-text-item">
                  <strong>Work Completed Today:</strong>
                  <p>{report.workCompleted}</p>
                </div>
                <div className="pdf-text-item">
                  <strong>Work Planned for Tomorrow:</strong>
                  <p>{report.workPlanned}</p>
                </div>
              </div>
            </div>

            {/* Safety & Issues */}
            <div className="pdf-section">
              <h3>SAFETY & ISSUES</h3>
              <div className="pdf-text-section">
                <div className="pdf-text-item">
                  <strong>Safety Incidents / Near Misses:</strong>
                  <p>{report.safetyIncidents || 'None reported'}</p>
                </div>
                <div className="pdf-text-item">
                  <strong>Issues or Delays:</strong>
                  <p>{report.issuesDelays || 'None reported'}</p>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="pdf-section">
              <h3>RESOURCES USED</h3>
              <div className="pdf-resources">
                <div className="pdf-text-item">
                  <strong>Equipment Used:</strong>
                  <div className="pdf-equipment-list">
                    {report.equipmentUsed.length > 0 ? (
                      report.equipmentUsed.map((equipment, index) => (
                        <span key={index} className="pdf-equipment-tag">• {equipment}</span>
                      ))
                    ) : (
                      <span>No equipment reported</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
              <div className="pdf-section">
                <h3>SITE PHOTOS</h3>
                <div className="pdf-photos">
                  {report.photos.map((photo, index) => (
                    <div key={index} className="pdf-photo-item">
                      <img 
                        src={photo.url} 
                        alt={`Site photo ${index + 1}`}
                        className="pdf-photo"
                      />
                      <p className="pdf-photo-caption">{photo.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pdf-footer">
              <div className="signature-section">
                <div className="signature-line">
                  <div className="signature-box"></div>
                  <p>Supervisor Signature: {report.supervisor}</p>
                </div>
                <div className="report-meta">
                  <p><strong>Report Status:</strong> {report.status}</p>
                  {report.submittedAt && (
                    <p><strong>Submitted:</strong> {new Date(report.submittedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pdf-preview-actions">
          <button 
            className="classic-button"
            onClick={generatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? '📄 Generating...' : '📄 Download PDF'}
          </button>
          <button 
            className="classic-button secondary"
            onClick={onClose}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
