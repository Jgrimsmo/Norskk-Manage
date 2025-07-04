import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import DailyReportModal from '../../components/DailyReportModal';
import ReportList from '../../components/ReportList';
import ReportDetails from '../../components/ReportDetails';
import ReportFilters from '../../components/ReportFilters';
import { useReportManagement } from '../../hooks/useReportManagement';
import '../../styles/page.css';
import './DailyReports.css';

export default function DailyReports() {
  const navigate = useNavigate();
  const { hasPermission, PERMISSIONS } = useAuth();
  const {
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
  } = useReportManagement();

  const [showReportModal, setShowReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const handleExportPDF = () => {
    if (selectedReport) {
      navigate('/daily-reports/preview', { 
        state: { report: selectedReport } 
      });
    }
  };

  const canCreateReports = hasPermission(PERMISSIONS.CREATE_REPORTS);
  const canViewReports = hasPermission(PERMISSIONS.VIEW_REPORTS);

  if (!canViewReports) {
    return (
      <Layout title="Access Denied">
        <div className="page-card">
          <div className="error-message">
            <h3>Access Denied</h3>
            <p>You don't have permission to view daily reports.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddReport = () => {
    setEditingReport(null);
    setShowReportModal(true);
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowReportModal(true);
  };

  const handleSaveReportWrapper = async (reportData, editingReport) => {
    try {
      console.log('DailyReports: Starting save process for report...', { editingReport });
      await handleSaveReport(reportData, editingReport);
      console.log('DailyReports: Report saved successfully, closing modal...');
      setShowReportModal(false);
      // Refresh the reports list to show the new/updated report
      console.log('DailyReports: Refreshing reports list...');
      await loadReports();
      console.log('DailyReports: Reports list refreshed');
    } catch (error) {
      console.error('DailyReports: Error in save wrapper:', error);
      // Don't close modal so user can try again
      alert('Failed to save report: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <Layout title="Daily Site Reports">
      <div className="reports-container">
        <ReportFilters
          projectFilter={projectFilter}
          onProjectFilterChange={setProjectFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          uniqueProjects={uniqueProjects}
          onAddReport={handleAddReport}
          canCreateReports={canCreateReports}
        />

        <div className="reports-layout">
          <ReportList
            reports={filteredReports}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
            onEditReport={handleEditReport}
            onDeleteReport={handleDeleteReport}
            canCreateReports={canCreateReports}
            onAddReport={handleAddReport}
          />

          <ReportDetails
            report={selectedReport}
            onExportPDF={handleExportPDF}
          />
        </div>
      </div>

      <DailyReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={editingReport}
        onSave={handleSaveReportWrapper}
      />
    </Layout>
  );
}