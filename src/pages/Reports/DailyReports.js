import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import '../../styles/page.css';
import './DailyReports.css';

const SAMPLE_REPORTS = [
  {
    id: '1',
    date: '2025-01-20',
    project: 'Downtown Office Complex',
    supervisor: 'Mike Johnson',
    weather: 'Sunny',
    temperature: '22°C',
    workersOnSite: 8,
    workCompleted: 'Completed foundation pour for Building A east wing. Installed structural steel on levels 1-2.',
    safetyIncidents: 'None reported',
    issuesDelays: 'Minor delay due to late concrete delivery - resolved by 10:30 AM',
    equipmentUsed: ['Crane', 'Concrete Mixer', 'Excavator'],
    materials: 'Concrete: 45 cubic yards, Steel beams: 12 tons, Rebar: 800 lbs',
    status: 'submitted',
    submittedAt: '2025-01-20T17:30:00Z'
  },
  {
    id: '2',
    date: '2025-01-19',
    project: 'Highway Extension Project',
    supervisor: 'Sarah Williams',
    weather: 'Cloudy',
    temperature: '18°C',
    workersOnSite: 12,
    workCompleted: 'Completed excavation for drainage system. Laid 200m of drainage pipe.',
    safetyIncidents: 'Near miss - worker almost slipped on wet surface. Safety briefing conducted.',
    issuesDelays: 'Weather slowed progress by 2 hours in the morning',
    equipmentUsed: ['Excavator', 'Bulldozer', 'Dump Truck'],
    materials: 'Drainage pipe: 200m, Gravel: 50 tons, Cement: 20 bags',
    status: 'draft',
    submittedAt: null
  }
];

function DailyReportModal({ show, onClose, report = null, onSave }) {
  const [form, setForm] = useState(report || {
    date: new Date().toISOString().split('T')[0],
    project: '',
    supervisor: '',
    weather: 'Sunny',
    temperature: '',
    workersOnSite: 0,
    workCompleted: '',
    safetyIncidents: '',
    issuesDelays: '',
    equipmentUsed: [],
    materials: '',
    photos: [],
    status: 'draft'
  });

  const [equipmentInput, setEquipmentInput] = useState('');

  const [equipmentInput, setEquipmentInput] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      submittedAt: form.status === 'submitted' ? new Date().toISOString() : null
    });
    onClose();
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setForm(f => ({
        ...f,
        equipmentUsed: [...f.equipmentUsed, equipmentInput.trim()]
      }));
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index) => {
    setForm(f => ({
      ...f,
      equipmentUsed: f.equipmentUsed.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="daily-report-modal" onClick={e => e.stopPropagation()}>
        <h2>{report ? 'Edit Daily Report' : 'New Daily Report'}</h2>
        <form className="daily-report-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-field">
              <label>Project</label>
              <input
                type="text"
                value={form.project}
                onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                placeholder="Project name"
                required
              />
            </div>

            <div className="form-field">
              <label>Supervisor</label>
              <input
                type="text"
                value={form.supervisor}
                onChange={e => setForm(f => ({ ...f, supervisor: e.target.value }))}
                placeholder="Supervisor name"
                required
              />
            </div>

            <div className="form-field">
              <label>Weather</label>
              <select
                value={form.weather}
                onChange={e => setForm(f => ({ ...f, weather: e.target.value }))}
              >
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
                <option value="Snow">Snow</option>
                <option value="Windy">Windy</option>
                <option value="Foggy">Foggy</option>
              </select>
            </div>

            <div className="form-field">
              <label>Temperature</label>
              <input
                type="text"
                value={form.temperature}
                onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                placeholder="e.g., 22°C"
              />
            </div>

            <div className="form-field">
              <label>Workers on Site</label>
              <input
                type="number"
                value={form.workersOnSite}
                onChange={e => setForm(f => ({ ...f, workersOnSite: parseInt(e.target.value) || 0 }))}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Work Completed Today</label>
            <textarea
              value={form.workCompleted}
              onChange={e => setForm(f => ({ ...f, workCompleted: e.target.value }))}
              placeholder="Describe work completed today..."
              rows="3"
              required
            />
          </div>

          <div className="form-field">
            <label>Work Planned for Tomorrow</label>
            <textarea
              value={form.workPlanned}
              onChange={e => setForm(f => ({ ...f, workPlanned: e.target.value }))}
              placeholder="Describe work planned for tomorrow..."
              rows="3"
              required
            />
          </div>

          <div className="form-field">
            <label>Safety Incidents / Near Misses</label>
            <textarea
              value={form.safetyIncidents}
              onChange={e => setForm(f => ({ ...f, safetyIncidents: e.target.value }))}
              placeholder="Report any safety incidents or near misses..."
              rows="2"
            />
          </div>

          <div className="form-field">
            <label>Issues or Delays</label>
            <textarea
              value={form.issuesDelays}
              onChange={e => setForm(f => ({ ...f, issuesDelays: e.target.value }))}
              placeholder="Report any issues or delays encountered..."
              rows="2"
            />
          </div>

          <div className="form-field">
            <label>Equipment Used</label>
            <div className="equipment-input">
              <input
                type="text"
                value={equipmentInput}
                onChange={e => setEquipmentInput(e.target.value)}
                placeholder="Add equipment"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
              />
              <button type="button" className="classic-button small" onClick={addEquipment}>
                Add
              </button>
            </div>
            <div className="equipment-list">
              {form.equipmentUsed.map((equipment, index) => (
                <span key={index} className="equipment-tag">
                  {equipment}
                  <button 
                    type="button" 
                    onClick={() => removeEquipment(index)}
                    className="remove-equipment"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>Materials Used</label>
            <textarea
              value={form.materials}
              onChange={e => setForm(f => ({ ...f, materials: e.target.value }))}
              placeholder="List materials and quantities used..."
              rows="2"
            />
          </div>

          <div className="modal-actions">
            <button 
              type="submit" 
              className="classic-button"
              onClick={() => setForm(f => ({ ...f, status: 'submitted' }))}
            >
              Submit Report
            </button>
            <button 
              type="submit" 
              className="classic-button secondary"
              onClick={() => setForm(f => ({ ...f, status: 'draft' }))}
            >
              Save as Draft
            </button>
            <button type="button" className="classic-button secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DailyReports() {
  const { user, hasPermission, PERMISSIONS } = useAuth();
  const [reports, setReports] = useState(SAMPLE_REPORTS);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    enabled: false
  });

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

  const handleSaveReport = (reportData) => {
    if (editingReport) {
      setReports(reports.map(r => r.id === editingReport.id ? { ...reportData, id: editingReport.id } : r));
    } else {
      setReports([...reports, { ...reportData, id: Date.now().toString() }]);
    }
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(r => r.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
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

  const getStatusIcon = (status) => {
    return status === 'submitted' ? '✅' : '📝';
  };

  const getWeatherIcon = (weather) => {
    const icons = {
      'Sunny': '☀️',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Snow': '❄️',
      'Windy': '💨',
      'Foggy': '🌫️'
    };
    return icons[weather] || '🌤️';
  };

  return (
    <Layout title="Daily Site Reports">
      <div className="reports-container">
        <div className="reports-header">
          <div className="reports-filters">
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
              <option value="all">All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
            
            <div className="date-filter">
              <label className="date-filter-toggle">
                <input
                  type="checkbox"
                  checked={dateFilter.enabled}
                  onChange={e => setDateFilter(prev => ({ 
                    ...prev, 
                    enabled: e.target.checked,
                    startDate: e.target.checked ? prev.startDate : '',
                    endDate: e.target.checked ? prev.endDate : ''
                  }))}
                />
                Filter by Date
              </label>
              
              {dateFilter.enabled && (
                <div className="date-inputs">
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={e => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    placeholder="Start date"
                    title="Start date"
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={e => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    placeholder="End date"
                    title="End date"
                  />
                  {(dateFilter.startDate || dateFilter.endDate) && (
                    <button
                      type="button"
                      className="clear-dates"
                      onClick={() => setDateFilter(prev => ({ ...prev, startDate: '', endDate: '' }))}
                      title="Clear dates"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {canCreateReports && (
            <button className="classic-button" onClick={handleAddReport}>
              + New Daily Report
            </button>
          )}
        </div>

        <div className="reports-layout">
          <div className="reports-list">
            {filteredReports.length === 0 ? (
              <div className="empty-state">
                <p>No reports found</p>
                {canCreateReports && (
                  <button className="classic-button" onClick={handleAddReport}>
                    Create First Report
                  </button>
                )}
              </div>
            ) : (
              filteredReports.map(report => (
                <div
                  key={report.id}
                  className={`report-item ${selectedReport?.id === report.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="report-header">
                    <div className="report-date">
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                    <div className="report-status">
                      {getStatusIcon(report.status)} {report.status}
                    </div>
                  </div>
                  
                  <div className="report-project">{report.project}</div>
                  <div className="report-supervisor">Supervisor: {report.supervisor}</div>
                  
                  <div className="report-summary">
                    <span className="weather-info">
                      {getWeatherIcon(report.weather)} {report.weather}
                    </span>
                    <span className="workers-info">
                      👷 {report.workersOnSite} workers
                    </span>
                  </div>

                  <div className="report-actions">
                    {canCreateReports && (
                      <>
                        <button
                          className="classic-button small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditReport(report);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="classic-button small danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(report.id);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedReport && (
            <div className="report-details">
              <div className="report-details-header">
                <h3>Daily Report - {new Date(selectedReport.date).toLocaleDateString()}</h3>
                <div className="report-meta">
                  <span className="status-badge">{getStatusIcon(selectedReport.status)} {selectedReport.status}</span>
                  {selectedReport.submittedAt && (
                    <span className="submitted-time">
                      Submitted: {new Date(selectedReport.submittedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="report-content">
                <div className="report-section">
                  <h4>Project Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Project:</strong> {selectedReport.project}
                    </div>
                    <div className="info-item">
                      <strong>Supervisor:</strong> {selectedReport.supervisor}
                    </div>
                    <div className="info-item">
                      <strong>Weather:</strong> {getWeatherIcon(selectedReport.weather)} {selectedReport.weather}
                    </div>
                    <div className="info-item">
                      <strong>Temperature:</strong> {selectedReport.temperature}
                    </div>
                    <div className="info-item">
                      <strong>Workers on Site:</strong> {selectedReport.workersOnSite}
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h4>Work Progress</h4>
                  <div className="text-content">
                    <div className="content-item">
                      <strong>Work Completed:</strong>
                      <p>{selectedReport.workCompleted}</p>
                    </div>
                    <div className="content-item">
                      <strong>Work Planned:</strong>
                      <p>{selectedReport.workPlanned}</p>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h4>Safety & Issues</h4>
                  <div className="text-content">
                    <div className="content-item">
                      <strong>Safety Incidents:</strong>
                      <p>{selectedReport.safetyIncidents || 'None reported'}</p>
                    </div>
                    <div className="content-item">
                      <strong>Issues/Delays:</strong>
                      <p>{selectedReport.issuesDelays || 'None reported'}</p>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h4>Resources</h4>
                  <div className="resources-content">
                    <div className="content-item">
                      <strong>Equipment Used:</strong>
                      <div className="equipment-tags">
                        {selectedReport.equipmentUsed.map((equipment, index) => (
                          <span key={index} className="equipment-tag">{equipment}</span>
                        ))}
                      </div>
                    </div>
                    <div className="content-item">
                      <strong>Materials:</strong>
                      <p>{selectedReport.materials}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedReport && (
            <div className="no-report-selected">
              <h3>Select a report to view details</h3>
              <p>Click on a report from the list to view its details.</p>
            </div>
          )}
        </div>
      </div>

      <DailyReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={editingReport}
        onSave={handleSaveReport}
      />
    </Layout>
  );
}
