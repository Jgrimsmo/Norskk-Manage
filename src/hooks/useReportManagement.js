import { useState, useEffect } from 'react';
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from '../lib/utils/firebaseHelpers';

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
      const editingReport = reports.find(r => r.id === reportData.id);
      
      if (editingReport) {
        // Update existing report
        await updateDocById("dailyReports", editingReport.id, {
          ...reportData,
          updatedAt: new Date().toISOString()
        });
        setReports(reports.map(r => r.id === editingReport.id ? { ...reportData, id: editingReport.id } : r));
      } else {
        // Create new report
        const newReport = {
          ...reportData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addToCollection("dailyReports", newReport);
        setReports([...reports, { ...newReport, id: docRef.id }]);
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
