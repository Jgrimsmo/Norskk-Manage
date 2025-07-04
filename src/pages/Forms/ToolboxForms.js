import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import '../../styles/page.css';

const SAMPLE_TOOLBOX_FORMS = [
  {
    id: '1',
    date: '2025-01-20',
    project: 'Downtown Office Complex',
    topic: 'Ladder Safety',
    presenter: 'Mike Johnson',
    attendees: ['John Smith', 'Anna Lee', 'Mike Brown', 'Sarah Wilson'],
    keyPoints: [
      'Always maintain 3-point contact',
      'Check ladder condition before use',
      'Set ladder at proper angle (4:1 ratio)',
      'Never exceed weight capacity'
    ],
    questions: 'What should you do if ladder feels unstable?',
    followUpActions: 'Review ladder inspection checklist with all crew',
    duration: 15,
    status: 'completed'
  }
];

const COMMON_TOPICS = [
  'Ladder Safety',
  'Fall Protection',
  'Personal Protective Equipment',
  'Electrical Safety',
  'Machine Guarding',
  'Hazard Communication',
  'Emergency Procedures',
  'Heat Stress Prevention',
  'Back Injury Prevention',
  'Chemical Safety',
  'Fire Safety',
  'First Aid/CPR',
  'Confined Space',
  'Lockout/Tagout',
  'Vehicle Safety'
];

function ToolboxFormModal({ show, onClose, form = null, onSave }) {
  const [formData, setFormData] = useState(form || {
    date: new Date().toISOString().split('T')[0],
    project: '',
    topic: '',
    presenter: '',
    attendees: [''],
    keyPoints: [''],
    questions: '',
    followUpActions: '',
    duration: 15,
    status: 'completed'
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      submittedAt: new Date().toISOString(),
      attendees: formData.attendees.filter(a => a.trim()),
      keyPoints: formData.keyPoints.filter(k => k.trim())
    });
    onClose();
  };

  const addField = (field) => {
    setFormData(f => ({
      ...f,
      [field]: [...f[field], '']
    }));
  };

  const updateField = (field, index, value) => {
    setFormData(f => ({
      ...f,
      [field]: f[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeField = (field, index) => {
    setFormData(f => ({
      ...f,
      [field]: f[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="daily-report-modal" onClick={e => e.stopPropagation()}>
        <h2>{form ? 'Edit Toolbox Talk' : 'New Toolbox Talk'}</h2>
        <form className="daily-report-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-field">
              <label>Project</label>
              <input
                type="text"
                value={formData.project}
                onChange={e => setFormData(f => ({ ...f, project: e.target.value }))}
                placeholder="Project name"
                required
              />
            </div>

            <div className="form-field">
              <label>Topic</label>
              <select
                value={formData.topic}
                onChange={e => setFormData(f => ({ ...f, topic: e.target.value }))}
                required
              >
                <option value="">Select topic...</option>
                {COMMON_TOPICS.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
              {formData.topic === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify topic"
                  onChange={e => setFormData(f => ({ ...f, topic: e.target.value }))}
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            <div className="form-field">
              <label>Presenter</label>
              <input
                type="text"
                value={formData.presenter}
                onChange={e => setFormData(f => ({ ...f, presenter: e.target.value }))}
                placeholder="Presenter name"
                required
              />
            </div>

            <div className="form-field">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={e => setFormData(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))}
                min="5"
                max="60"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Attendees</label>
            {formData.attendees.map((attendee, index) => (
              <div key={index} className="equipment-input">
                <input
                  type="text"
                  value={attendee}
                  onChange={e => updateField('attendees', index, e.target.value)}
                  placeholder={`Attendee ${index + 1}`}
                />
                <button 
                  type="button" 
                  className="classic-button small danger"
                  onClick={() => removeField('attendees', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="classic-button small"
              onClick={() => addField('attendees')}
            >
              + Add Attendee
            </button>
          </div>

          <div className="form-field">
            <label>Key Points Covered</label>
            {formData.keyPoints.map((point, index) => (
              <div key={index} className="equipment-input">
                <input
                  type="text"
                  value={point}
                  onChange={e => updateField('keyPoints', index, e.target.value)}
                  placeholder={`Key point ${index + 1}`}
                />
                <button 
                  type="button" 
                  className="classic-button small danger"
                  onClick={() => removeField('keyPoints', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="classic-button small"
              onClick={() => addField('keyPoints')}
            >
              + Add Key Point
            </button>
          </div>

          <div className="form-field">
            <label>Questions/Discussion</label>
            <textarea
              value={formData.questions}
              onChange={e => setFormData(f => ({ ...f, questions: e.target.value }))}
              placeholder="Any questions or discussions during the talk..."
              rows="3"
            />
          </div>

          <div className="form-field">
            <label>Follow-up Actions</label>
            <textarea
              value={formData.followUpActions}
              onChange={e => setFormData(f => ({ ...f, followUpActions: e.target.value }))}
              placeholder="Any follow-up actions required..."
              rows="2"
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="classic-button">
              Submit Toolbox Talk
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

export default function ToolboxForms() {
  const { hasPermission, PERMISSIONS } = useAuth();
  const [forms, setForms] = useState(SAMPLE_TOOLBOX_FORMS);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);

  const canSubmitToolbox = hasPermission(PERMISSIONS.SUBMIT_TOOLBOX);

  if (!canSubmitToolbox) {
    return (
      <Layout title="Access Denied">
        <div className="page-card">
          <div className="error-message">
            <h3>Access Denied</h3>
            <p>You don't have permission to access toolbox talks.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddForm = () => {
    setEditingForm(null);
    setShowFormModal(true);
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    setShowFormModal(true);
  };

  const handleSaveForm = (formData) => {
    if (editingForm) {
      setForms(forms.map(f => f.id === editingForm.id ? { ...formData, id: editingForm.id } : f));
    } else {
      setForms([...forms, { ...formData, id: Date.now().toString() }]);
    }
  };

  const handleDeleteForm = (formId) => {
    if (window.confirm('Are you sure you want to delete this toolbox talk?')) {
      setForms(forms.filter(f => f.id !== formId));
      if (selectedForm?.id === formId) {
        setSelectedForm(null);
      }
    }
  };

  return (
    <Layout title="Toolbox Talks">
      <div className="reports-container">
        <div className="page-header">
          <h3>Safety Toolbox Talks</h3>
          <button className="classic-button" onClick={handleAddForm}>
            + New Toolbox Talk
          </button>
        </div>

        <div className="reports-layout">
          <div className="reports-list">
            {forms.length === 0 ? (
              <div className="empty-state">
                <p>No toolbox talks recorded</p>
                <button className="classic-button" onClick={handleAddForm}>
                  Create First Toolbox Talk
                </button>
              </div>
            ) : (
              forms.map(form => (
                <div
                  key={form.id}
                  className={`report-item ${selectedForm?.id === form.id ? 'selected' : ''}`}
                  onClick={() => setSelectedForm(form)}
                >
                  <div className="report-header">
                    <div className="report-date">
                      {new Date(form.date).toLocaleDateString()}
                    </div>
                    <div className="report-status">
                      ✅ {form.status}
                    </div>
                  </div>
                  
                  <div className="report-project">{form.project}</div>
                  <div className="toolbox-topic">{form.topic}</div>
                  <div className="report-supervisor">Presenter: {form.presenter}</div>
                  
                  <div className="report-summary">
                    <span className="workers-info">
                      👥 {form.attendees.length} attendees
                    </span>
                    <span className="duration-info">
                      ⏱️ {form.duration} min
                    </span>
                  </div>

                  <div className="report-actions">
                    <button
                      className="classic-button small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditForm(form);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="classic-button small danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteForm(form.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedForm && (
            <div className="report-details">
              <div className="report-details-header">
                <h3>Toolbox Talk - {selectedForm.topic}</h3>
                <div className="report-meta">
                  <span className="status-badge">✅ {selectedForm.status}</span>
                  <span className="submitted-time">
                    {new Date(selectedForm.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="report-content">
                <div className="report-section">
                  <h4>Session Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Project:</strong> {selectedForm.project}
                    </div>
                    <div className="info-item">
                      <strong>Topic:</strong> {selectedForm.topic}
                    </div>
                    <div className="info-item">
                      <strong>Presenter:</strong> {selectedForm.presenter}
                    </div>
                    <div className="info-item">
                      <strong>Duration:</strong> {selectedForm.duration} minutes
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h4>Attendees ({selectedForm.attendees.length})</h4>
                  <div className="attendees-list">
                    {selectedForm.attendees.map((attendee, index) => (
                      <span key={index} className="attendee-tag">{attendee}</span>
                    ))}
                  </div>
                </div>

                <div className="report-section">
                  <h4>Key Points Covered</h4>
                  <ul className="key-points-list">
                    {selectedForm.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>

                {selectedForm.questions && (
                  <div className="report-section">
                    <h4>Questions/Discussion</h4>
                    <div className="content-item">
                      <p>{selectedForm.questions}</p>
                    </div>
                  </div>
                )}

                {selectedForm.followUpActions && (
                  <div className="report-section">
                    <h4>Follow-up Actions</h4>
                    <div className="content-item">
                      <p>{selectedForm.followUpActions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedForm && (
            <div className="no-report-selected">
              <h3>Select a toolbox talk to view details</h3>
              <p>Click on a toolbox talk from the list to view its details.</p>
            </div>
          )}
        </div>
      </div>

      <ToolboxFormModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        form={editingForm}
        onSave={handleSaveForm}
      />
    </Layout>
  );
}
