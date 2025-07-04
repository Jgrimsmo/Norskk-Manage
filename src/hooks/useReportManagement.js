import { useState, useEffect } from 'react';
import { fetchCollection, addToCollection, updateDocById, deleteDocById, uploadPhotos } from '../lib/utils/firebaseHelpers';

export function useReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    enabled: false
  });

  // Load reports from Firebase on component mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportsData = await fetchCollection("dailyReports");
      setReports(reportsData);
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async (reportData) => {
    try {
      console.log('handleSaveReport called with:', reportData);
      const editingReport = reports.find(r => r.id === reportData.id);
      
      if (editingReport) {
        // Update existing report
        console.log('Updating existing report:', editingReport.id);
        
        // Handle photo uploads if there are photos
        let uploadedPhotos = [];
        if (reportData.photos && reportData.photos.length > 0) {
          console.log('Uploading photos for existing report, count:', reportData.photos.length);
          uploadedPhotos = await uploadPhotos(reportData.photos, editingReport.id);
        }
        
        // Create the report data without File objects
        const cleanReportData = {
          ...reportData,
          photos: uploadedPhotos,
          updatedAt: new Date().toISOString()
        };
        delete cleanReportData.id; // Remove ID from data to avoid conflicts
        
        await updateDocById("dailyReports", editingReport.id, cleanReportData);
        setReports(reports.map(r => r.id === editingReport.id ? { ...cleanReportData, id: editingReport.id } : r));
        console.log('Report updated successfully');
      } else {
        // Create new report
        console.log('Creating new report');
        
        // Separate photos from report data to avoid serialization issues
        const photosToUpload = reportData.photos || [];
        const reportDataWithoutPhotos = { ...reportData };
        delete reportDataWithoutPhotos.photos;
        
        // First, create the report without photos
        const newReportWithoutPhotos = {
          ...reportDataWithoutPhotos,
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('Adding report to Firestore (without photos)');
        const docRef = await addToCollection("dailyReports", newReportWithoutPhotos);
        console.log('Report created with ID:', docRef.id);
        
        // Now upload photos with the real report ID
        let uploadedPhotos = [];
        if (photosToUpload.length > 0) {
          console.log('Uploading photos for new report, count:', photosToUpload.length);
          try {
            uploadedPhotos = await uploadPhotos(photosToUpload, docRef.id);
            console.log('Photos uploaded successfully:', uploadedPhotos.length);
            
            // Update the report with the photo URLs
            await updateDocById("dailyReports", docRef.id, { photos: uploadedPhotos });
            console.log('Report updated with photo URLs');
          } catch (photoError) {
            console.error('Error uploading photos, but report was saved:', photoError);
            // Continue even if photo upload fails
          }
        }
        
        const finalReport = { ...newReportWithoutPhotos, id: docRef.id, photos: uploadedPhotos };
        setReports([...reports, finalReport]);
        console.log('Report saved successfully:', finalReport.id);
      }
    } catch (err) {
      console.error("Error saving report:", err);
      setError("Failed to save report. Please try again.");
      throw err;
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteDocById("dailyReports", reportId);
        setReports(reports.filter(r => r.id !== reportId));
        if (selectedReport?.id === reportId) {
          setSelectedReport(null);
        }
      } catch (err) {
        console.error("Error deleting report:", err);
        setError("Failed to delete report. Please try again.");
      }
    }
  };

  // Get unique project names for filter dropdown
  const uniqueProjects = [...new Set(reports.map(report => report.project))];

  const filteredReports = reports.filter(report => {
    // Filter by project
    if (projectFilter !== 'all' && report.project !== projectFilter) {
      return false;
    }
    
    // Filter by date range if enabled
    if (dateFilter.enabled) {
      const reportDate = new Date(report.date);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
      
      if (startDate && reportDate < startDate) return false;
      if (endDate && reportDate > endDate) return false;
    }
    
    return true;
  });

  return {
    reports,
    loading,
    error,
    selectedReport,
    setSelectedReport,
    projectFilter,
    setProjectFilter,
    dateFilter,
    setDateFilter,
    uniqueProjects,
    filteredReports,
    handleSaveReport,
    handleDeleteReport,
    loadReports
  };
}
