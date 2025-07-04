import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { WEATHER_OPTIONS } from '../constants/appConstants';

/**
 * Utility functions for PDF generation in daily reports
 */

export const generateReportPDF = async (report, previewElementRef) => {
  try {
    const element = previewElementRef.current;
    
    // Wait for all images to load before generating PDF
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => {
          console.warn('Image failed to load:', img.src);
          resolve(); // Continue even if image fails
        };
        // Timeout after 10 seconds
        setTimeout(() => {
          console.warn('Image load timeout:', img.src);
          resolve();
        }, 10000);
      });
    });
    
    console.log(`Waiting for ${images.length} images to load...`);
    await Promise.all(imagePromises);
    console.log('All images loaded, generating PDF...');
    
    // Set element to A4 proportions for PDF generation and get measurements BEFORE canvas capture
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    element.style.width = '210mm';
    element.style.maxWidth = '210mm';
    
    // Get element measurements after styling but before canvas
    const elementRect = element.getBoundingClientRect();
    
    // Collect image information for clickable links AFTER styling is applied
    const imageData = Array.from(images).map(img => {
      const rect = img.getBoundingClientRect();
      return {
        src: img.src,
        rect: rect,
        alt: img.alt || 'Report Image',
        // Store relative position within the element
        relativeX: rect.left - elementRect.left,
        relativeY: rect.top - elementRect.top,
        width: rect.width,
        height: rect.height
      };
    });
    
    console.log('Element rect:', elementRect);
    console.log('Image data:', imageData);
    
    const canvas = await html2canvas(element, {
      scale: 1.5, // Increased scale for better quality
      useCORS: true,
      allowTaint: false, // Changed to false for better cross-origin handling
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scrollX: 0,
      scrollY: 0,
      logging: false, // Disable logging for cleaner output
      foreignObjectRendering: false, // Better compatibility with images
      imageTimeout: 15000, // Give images more time to load
      onclone: function(clonedDoc) {
        // Fix image URLs in the cloned document to ensure they load properly
        const images = clonedDoc.querySelectorAll('img');
        images.forEach(img => {
          if (img.src.startsWith('blob:')) {
            console.warn('Found blob URL in PDF, this may not render correctly:', img.src);
          }
          // Add crossorigin attribute for Firebase Storage images
          if (img.src.includes('firebasestorage.googleapis.com')) {
            img.crossOrigin = 'anonymous';
          }
        });
      }
    });
    
    // Restore original styles
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Calculate scaling factors
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    const scaleX = pdfWidth / elementRect.width;
    const scaleY = imgHeight / elementRect.height;
    
    console.log(`PDF scaling - scaleX: ${scaleX}, scaleY: ${scaleY}`);
    console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
    console.log(`PDF image size: ${imgWidth}x${imgHeight}mm`);
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    
    // Try both annotation and link methods for better compatibility
    imageData.forEach((img, index) => {
      // Calculate position relative to the PDF using relative positioning
      const x = img.relativeX * scaleX;
      const y = img.relativeY * scaleY;
      const width = img.width * scaleX;
      const height = img.height * scaleY;
      
      // Only add link if image is on the first page
      if (y + height < pdfHeight) {
        console.log(`Adding clickable link ${index} at (${x.toFixed(2)}, ${y.toFixed(2)}) size (${width.toFixed(2)}, ${height.toFixed(2)}) URL: ${img.src}`);
        
        // Method 1: Try createAnnotation
        try {
          pdf.createAnnotation({
            type: 'link',
            bounds: {
              x: x,
              y: y,
              w: width,
              h: height
            },
            contents: 'View full size image',
            url: img.src
          });
          console.log(`Annotation added successfully for image ${index}`);
        } catch (annotationError) {
          console.error('Error adding annotation:', annotationError);
          
          // Method 2: Fallback to link method
          try {
            pdf.link(x, y, width, height, { url: img.src });
            console.log(`Link added successfully for image ${index}`);
          } catch (linkError) {
            console.error('Both annotation and link methods failed:', linkError);
          }
        }
      }
    });
    
    // Add a new page with clickable text links as a backup
    if (imageData.length > 0) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Image Links', 20, 20);
      pdf.setFontSize(12);
      
      let yPosition = 40;
      imageData.forEach((img, index) => {
        const linkText = `📷 Image ${index + 1}: ${img.alt || `Site Photo ${index + 1}`}`;
        pdf.text(linkText, 20, yPosition);
        
        // Add clickable link on the text
        try {
          pdf.link(20, yPosition - 5, 170, 10, { url: img.src });
          console.log(`Text link added for image ${index + 1}`);
        } catch (error) {
          console.error(`Failed to add text link for image ${index + 1}:`, error);
        }
        
        yPosition += 15;
        
        // If we're running out of space, add another page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }
    
    heightLeft -= pdfHeight;

    // Add additional pages if content is longer than one page
    let pageNumber = 1;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pageNumber++;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      
      // Add clickable links for images on this page
      imageData.forEach((img, index) => {
        const x = img.relativeX * scaleX;
        const y = img.relativeY * scaleY;
        const width = img.width * scaleX;
        const height = img.height * scaleY;
        
        // Check if image is visible on this page
        const pageStartY = (pageNumber - 1) * pdfHeight;
        const pageEndY = pageNumber * pdfHeight;
        
        if (y >= pageStartY && y < pageEndY) {
          const linkY = y - pageStartY;
          console.log(`Adding clickable link ${index} on page ${pageNumber} at (${x.toFixed(2)}, ${linkY.toFixed(2)}) size (${width.toFixed(2)}, ${height.toFixed(2)})`);
          try {
            // Use createAnnotation instead of link for better compatibility
            pdf.createAnnotation({
              type: 'link',
              bounds: {
                x: x,
                y: linkY,
                w: width,
                h: height
              },
              contents: 'View full size image',
              url: img.src
            });
          } catch (linkError) {
            console.error('Error adding annotation on page:', linkError);
            // Fallback to original link method
            try {
              pdf.link(x, linkY, width, height, { url: img.src });
            } catch (fallbackError) {
              console.error('Fallback link method also failed on page:', fallbackError);
            }
          }
        }
      });
      
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
