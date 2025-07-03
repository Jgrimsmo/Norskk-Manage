import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WEATHER_OPTIONS } from '../constants/appConstants';

/**
 * Utility functions for PDF generation in daily reports
 */

export const generateReportPDF = async (report, previewElementRef) => {
  try {
    const element = previewElementRef.current;
    
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
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: 'Error generating PDF. Please try again.' };
  }
};

export const formatDateForPDF = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getWeatherIcon = (weather) => {
  const weatherOption = WEATHER_OPTIONS.find(option => option.value === weather);
  return weatherOption ? weatherOption.icon : '🌤️';
};
