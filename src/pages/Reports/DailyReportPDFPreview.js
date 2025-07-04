import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WEATHER_OPTIONS } from '../../lib/constants/appConstants';
import './DailyReportPDFPreview.css';

export default function DailyReportPDFPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const previewRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Get report data from navigation state
    if (location.state?.report) {
      setReport(location.state.report);
    } else {
      // If no report data, redirect back to reports page
      navigate('/daily-reports');
    }
  }, [location.state, navigate]);

  if (!report) {
    return (
      <div className="pdf-preview-loading">
        <div className="loading-spinner">Loading report preview...</div>
      </div>
    );
  }

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      console.log('Starting PDF generation...');
      const documentElement = previewRef.current;
      if (!documentElement) {
        throw new Error('PDF document element not found - previewRef is null');
      }
      
      console.log('Document element found:', documentElement.className);
      
      // Add PDF generation class for styling
      documentElement.classList.add('pdf-generation-mode');
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Creating canvas...');
      // Create canvas with simpler, more reliable configuration
      const canvas = await html2canvas(documentElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Simple styling for cloned document
          const clonedElement = clonedDoc.body.firstElementChild;
          if (clonedElement && clonedElement.classList.contains('pdf-document')) {
            clonedElement.style.padding = '40px';
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.fontFamily = 'Arial, sans-serif';
            clonedElement.style.fontSize = '12px';
            clonedElement.style.lineHeight = '1.4';
            clonedElement.style.color = '#333';
          }
        }
      });
      
      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);
      
      // Remove the PDF generation class
      documentElement.classList.remove('pdf-generation-mode');
      
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png', 0.95);
      console.log('Image data created');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('PDF dimensions calculated:', imgWidth, 'x', imgHeight);
      
      // Add image to PDF
      if (imgHeight <= pdfHeight - 20) {
        // Single page
        console.log('Adding single page...');
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        // Multiple pages
        console.log('Adding multiple pages...');
        let position = 0;
        const pageHeight = pdfHeight - 20;
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage();
          }
          
          const sourceY = (position * canvas.height) / imgHeight;
          const sourceHeight = Math.min((pageHeight * canvas.height) / imgHeight, canvas.height - sourceY);
          
          // Create a temporary canvas for this page
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          
          tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          const pageImgData = tempCanvas.toDataURL('image/png', 0.95);
          const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
          
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageImgHeight);
          
          position += pageHeight;
        }
      }

      // Generate filename and save
      const projectName = report.project?.replace(/[^a-zA-Z0-9]/g, '_') || 'Report';
      const reportDate = report.date || new Date().toISOString().split('T')[0];
      const fileName = `Daily_Report_${projectName}_${reportDate}.pdf`;
      
      console.log('Saving PDF as:', fileName);
      pdf.save(fileName);
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date provided';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateStr; // Return as-is if date parsing fails
    }
  };

  const getWeatherIcon = (weather) => {
    if (!weather) return '🌤️';
    const weatherOption = WEATHER_OPTIONS.find(option => option.value === weather);
    return weatherOption ? weatherOption.icon : '🌤️';
  };

  const handleBack = () => {
    navigate('/daily-reports');
  };

  // Safety check for report data
  const safeReport = {
    project: report?.project || 'No project specified',
    supervisor: report?.supervisor || 'No supervisor specified',
    date: report?.date || new Date().toISOString().split('T')[0],
    weather: report?.weather || 'Sunny',
    temperature: report?.temperature || 'Not recorded',
    workersOnSite: report?.workersOnSite || 0,
    workCompleted: report?.workCompleted || 'No work details provided',
    workPlanned: report?.workPlanned || 'No planning details provided',
    safetyIncidents: report?.safetyIncidents || '',
    issuesDelays: report?.issuesDelays || '',
    equipmentUsed: report?.equipmentUsed || [],
    selectedCrewMembers: report?.selectedCrewMembers || [],
    photos: report?.photos || [],
    status: report?.status || 'draft',
    submittedAt: report?.submittedAt || null
  };

  // Debug: Log photo data
  console.log('Report photos data:', safeReport.photos);
  console.log('Photos count:', safeReport.photos.length);

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
          <button 
            className="classic-button secondary"
            onClick={handleBack}
          >
            Close Preview
          </button>
          <button 
            className="classic-button"
            onClick={generatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? '📄 Generating...' : '📄 Download PDF'}
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="pdf-preview-main">
        {/* PDF Generation Overlay */}
        {isGenerating && (
          <div className="pdf-generation-overlay">
            <div className="pdf-generation-message">
              <div className="loading-spinner-pdf">📄</div>
              <p>Generating PDF...</p>
              <p className="generation-tip">Please wait while we create your PDF with exact formatting</p>
            </div>
          </div>
        )}
        
        <div className="pdf-preview-container">
          <div ref={previewRef} className="pdf-document">
            {/* Header */}
            <div className="pdf-header">
              <div className="company-info">
                <h1>NORSKK MANAGEMENT</h1>
                <p>Construction Management & Consulting</p>
              </div>
              <div className="report-title">
                <h2>DAILY SITE REPORT</h2>
                <p className="report-date">{formatDate(safeReport.date)}</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="pdf-section">
              <h3>PROJECT INFORMATION</h3>
              <div className="pdf-info-grid">
                <div className="pdf-info-item">
                  <strong>Project:</strong>
                  <span>{safeReport.project}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Date:</strong>
                  <span>{new Date(safeReport.date).toLocaleDateString()}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Supervisor:</strong>
                  <span>{safeReport.supervisor}</span>
                </div>
                
                <div className="pdf-info-item">
                  <strong>Weather:</strong>
                  <span>{getWeatherIcon(safeReport.weather)} {safeReport.weather}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Temperature:</strong>
                  <span>{safeReport.temperature}</span>
                </div>
                <div className="pdf-info-item">
                  <strong>Workers Count:</strong>
                  <span>{safeReport.workersOnSite}</span>
                </div>
              </div>
              
              {safeReport.selectedCrewMembers && safeReport.selectedCrewMembers.length > 0 && (
                <div className="pdf-info-item crew-members">
                  <strong>Crew Members:</strong>
                  <div className="crew-members-list">
                    {safeReport.selectedCrewMembers.map((member, index) => (
                      <span key={member.id} className="crew-member-item">
                        {member.name} ({member.role})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Work Progress */}
            <div className="pdf-section">
              <h3>WORK PROGRESS</h3>
              <div className="pdf-text-section">
                <div className="pdf-text-item">
                  <strong>Work Completed Today:</strong>
                  <p>{safeReport.workCompleted}</p>
                </div>
                <div className="pdf-text-item">
                  <strong>Work Planned for Tomorrow:</strong>
                  <p>{safeReport.workPlanned}</p>
                </div>
              </div>
            </div>

            {/* Safety & Issues */}
            <div className="pdf-section">
              <h3>SAFETY & ISSUES</h3>
              <div className="pdf-text-section">
                <div className="pdf-text-item">
                  <strong>Safety Incidents / Near Misses:</strong>
                  <p>{safeReport.safetyIncidents || 'None reported'}</p>
                </div>
                <div className="pdf-text-item">
                  <strong>Issues or Delays:</strong>
                  <p>{safeReport.issuesDelays || 'None reported'}</p>
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
                    {safeReport.equipmentUsed && safeReport.equipmentUsed.length > 0 ? (
                      safeReport.equipmentUsed.map((equipment, index) => (
                        <span key={index} className="pdf-equipment-tag">
                          • {equipment.name || equipment}
                        </span>
                      ))
                    ) : (
                      <span>No equipment reported</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            {safeReport.photos && safeReport.photos.length > 0 && (
              <div className="pdf-section">
                <h3>SITE PHOTOS</h3>
                <div className="pdf-photos">
                  {safeReport.photos.map((photo, index) => {
                    console.log(`Photo ${index}:`, photo);
                    return (
                      <div key={index} className="pdf-photo-item">
                        <img 
                          src={photo.url} 
                          alt={`Site photo ${index + 1}`}
                          className="pdf-photo"
                          onError={(e) => {
                            console.error(`Failed to load photo ${index}:`, photo.url);
                            e.target.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log(`Photo ${index} loaded successfully:`, photo.url);
                          }}
                        />
                        <p className="pdf-photo-caption">{photo.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pdf-footer">
              <div className="signature-section">
                <div className="signature-line">
                  <div className="signature-box"></div>
                  <p>Supervisor Signature: {safeReport.supervisor}</p>
                </div>
                <div className="report-meta">
                  <p><strong>Report Status:</strong> {safeReport.status}</p>
                  {safeReport.submittedAt && (
                    <p><strong>Submitted:</strong> {new Date(safeReport.submittedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
