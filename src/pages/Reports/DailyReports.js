import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import DailyReportModal from '../../components/DailyReportModal';
import PDFPreviewModal from '../../components/PDFPreviewModal';
import ReportList from '../../components/ReportList';
import ReportDetails from '../../components/ReportDetails';
import ReportFilters from '../../components/ReportFilters';
import { useReportManagement } from '../../hooks/useReportManagement';
import '../../styles/page.css';
import './DailyReports.css';

export default function DailyReports() {
  const { user, hasPermission, PERMISSIONS } = useAuth();
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
    handleDeleteReport
  } = useReportManagement();

  const [showReportModal, setShowReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

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

  const handleSaveReportWrapper = (reportData) => {
    handleSaveReport(reportData);
    setShowReportModal(false);
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
            onExportPDF={() => setShowPDFPreview(true)}
          />
        </div>
      </div>

      <DailyReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={editingReport}
        onSave={handleSaveReportWrapper}
      />
      
      <PDFPreviewModal
        show={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        report={selectedReport}
      />
    </Layout>
  );
}