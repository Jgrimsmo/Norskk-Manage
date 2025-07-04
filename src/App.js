// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import SidebarLayout from "./components/SidebarLayout";
import Login from "./components/Login";
import LoadingSpinner from "./components/LoadingSpinner";

// Import theme CSS
import "./styles/theme.css";

import Home from "./pages/Home";
import ItemDatabase from "./pages/ItemDatabase/ItemDatabase";
import TimeTracking from "./pages/TimeTracking/TimeTracking";
import ProjectDashboardDetail from "./pages/ProjectDashboard/ProjectDashboardDetail";
import ProjectDashboard from "./pages/ProjectDashboard/ProjectDashboard";
import ProjectEstimatePage from "./pages/estimate/ProjectEstimatePage";
import EstimateDashboard from "./pages/EstimateDashboard/EstimateDashboard";
import EquipmentPage from "./pages/equipment/equipment";
import DispatchPage from "./pages/Dispatch/dispatch_calendar";
import CrewPage from "./pages/Crew/crew";
import Settings from "./pages/Settings/Settings";
import EstimateSettings from "./pages/Settings/EstimateSettings";
import ManagementSettings from "./pages/Settings/ManagementSettings";
import ExportCalculator from "./pages/Tools/ExportCalculator";
import ImportCalculator from "./pages/Tools/ImportCalculator";
import ConstructionCalculator from "./pages/Tools/ConstructionCalculator";

// New pages we'll create
import AdminSettings from "./pages/Admin/AdminSettings";
import DailyReports from "./pages/Reports/DailyReports";
import DailyReportPDFPreview from "./pages/Reports/DailyReportPDFPreview";
import FLHAForms from "./pages/Forms/FLHAForms";
import ToolboxForms from "./pages/Forms/ToolboxForms";
import FormBuilder from "./pages/Forms/FormBuilder";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      {/* Full-screen routes (no sidebar) */}
      <Route path="/daily-reports/preview" element={<DailyReportPDFPreview />} />
      
      {/* Regular routes (with sidebar) */}
      <Route path="/*" element={
        <SidebarLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/items" element={<ItemDatabase />} />
            <Route path="/project" element={<EstimateDashboard />} />
            <Route path="/project/:projectId" element={<EstimateDashboard />} />
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/project-dashboard" element={<ProjectDashboard />} />
            <Route path="/project-dashboard/:projectId" element={<ProjectDashboardDetail />} />
            <Route path="/estimate-dashboard" element={<ProjectEstimatePage />} />
            <Route path="/estimate-dashboard/:slug" element={<EstimateDashboard useSlug={true} />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/crew" element={<CrewPage />} />
            <Route path="/item-database" element={<ItemDatabase />} />
            
            {/* New Routes */}
            <Route path="/admin-settings" element={<AdminSettings />} />
            <Route path="/daily-reports" element={<DailyReports />} />
            <Route path="/flha-forms" element={<FLHAForms />} />
            <Route path="/toolbox-forms" element={<ToolboxForms />} />
            <Route path="/form-builder" element={<FormBuilder />} />
            
            {/* Existing Routes */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/estimate-settings" element={<EstimateSettings />} />
            <Route path="/management-settings" element={<ManagementSettings />} />
            <Route path="/export-calculator" element={<ExportCalculator />} />
            <Route path="/import-calculator" element={<ImportCalculator />} />
            <Route path="/construction-calculator" element={<ConstructionCalculator />} />
          </Routes>
        </SidebarLayout>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

