import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import '../../styles/page.css';

const SAMPLE_FLHA_FORMS = [
  {
    id: '1',
    date: '2025-01-20',
    project: 'Downtown Office Complex',
    task: 'Concrete Pouring - Foundation',
    hazards: ['Heavy machinery operation', 'Wet concrete exposure', 'Lifting heavy materials'],
    controls: ['PPE mandatory', 'Machine operator certification', 'Spotter assigned'],
    workers: ['John Smith', 'Mike Brown', 'Anna Lee'],
    supervisor: 'Mike Johnson',
    status: 'approved',
    submittedAt: '2025-01-20T07:30:00Z'
  }
];

function FLHAFormModal({ show, onClose, form = null, onSave }) {
  const [formData, setFormData] = useState(form || {
    date: new Date().toISOString().split('T')[0],
    project: '',
    task: '',
    hazards: [''],
    controls: [''],
    workers: [''],
    supervisor: '',
    status: 'pending'
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      submittedAt: new Date().toISOString(),
      hazards: formData.hazards.filter(h => h.trim()),
      controls: formData.controls.filter(c => c.trim()),
      workers: formData.workers.filter(w => w.trim())
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
        <h2>{form ? 'Edit FLHA Form' : 'New FLHA Form'}</h2>
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
              <label>Task/Activity</label>
              <input
                type="text"
                value={formData.task}
                onChange={e => setFormData(f => ({ ...f, task: e.target.value }))}
                placeholder="Describe the task"
                required
              />
            </div>

            <div className="form-field">
              <label>Supervisor</label>
              <input
                type="text"
                value={formData.supervisor}
                onChange={e => setFormData(f => ({ ...f, supervisor: e.target.value }))}
                placeholder="Supervisor name"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Identified Hazards</label>
            {formData.hazards.map((hazard, index) => (
              <div key={index} className="equipment-input">
                <input
                  type="text"
                  value={hazard}
                  onChange={e => updateField('hazards', index, e.target.value)}
                  placeholder={`Hazard ${index + 1}`}
                />
                <button 
                  type="button" 
                  className="classic-button small danger"
                  onClick={() => removeField('hazards', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="classic-button small"
              onClick={() => addField('hazards')}
            >
              + Add Hazard
            </button>
          </div>

          <div className="form-field">
            <label>Control Measures</label>
            {formData.controls.map((control, index) => (
              <div key={index} className="equipment-input">
                <input
                  type="text"
                  value={control}
                  onChange={e => updateField('controls', index, e.target.value)}
                  placeholder={`Control measure ${index + 1}`}
                />
                <button 
                  type="button" 
                  className="classic-button small danger"
                  onClick={() => removeField('controls', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="classic-button small"
              onClick={() => addField('controls')}
            >
              + Add Control
            </button>
          </div>

          <div className="form-field">
            <label>Workers Involved</label>
            {formData.workers.map((worker, index) => (
              <div key={index} className="equipment-input">
                <input
                  type="text"
                  value={worker}
                  onChange={e => updateField('workers', index, e.target.value)}
                  placeholder={`Worker ${index + 1}`}
                />
                <button 
                  type="button" 
                  className="classic-button small danger"
                  onClick={() => removeField('workers', index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="classic-button small"
              onClick={() => addField('workers')}
            >
              + Add Worker
            </button>
          </div>

          <div className="modal-actions">
            <button type="submit" className="classic-button">
              Submit FLHA
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

export default function FLHAForms() {
  const { hasPermission, PERMISSIONS } = useAuth();
  const [forms, setForms] = useState(SAMPLE_FLHA_FORMS);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);

  const canSubmitFLHA = hasPermission(PERMISSIONS.SUBMIT_FLHA);

  if (!canSubmitFLHA) {
    return (
      <Layout title="Access Denied">
        <div className="page-card">
          <div className="error-message">
            <h3>Access Denied</h3>
            <p>You don't have permission to access FLHA forms.</p>
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
    if (window.confirm('Are you sure you want to delete this FLHA form?')) {
      setForms(forms.filter(f => f.id !== formId));
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌'
    };
    return icons[status] || '📋';
  };

  return (
    <Layout title="FLHA Forms">
      <div className="page-header">
        <h3>Field Level Hazard Assessment Forms</h3>
        <button className="classic-button" onClick={handleAddForm}>
          + New FLHA Form
        </button>
      </div>

      <div className="table-section">
        <table className="norskk-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Project</th>
              <th>Task</th>
              <th>Supervisor</th>
              <th>Hazards</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-state">
                  <p>No FLHA forms submitted</p>
                  <button className="classic-button" onClick={handleAddForm}>
                    Submit First FLHA
                  </button>
                </td>
              </tr>
            ) : (
              forms.map(form => (
                <tr key={form.id}>
                  <td>{new Date(form.date).toLocaleDateString()}</td>
                  <td>{form.project}</td>
                  <td>{form.task}</td>
                  <td>{form.supervisor}</td>
                  <td>{form.hazards.length} identified</td>
                  <td>
                    <span className="status-badge">
                      {getStatusIcon(form.status)} {form.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="classic-button small"
                        onClick={() => handleEditForm(form)}
                      >
                        View/Edit
                      </button>
                      <button 
                        className="classic-button small danger"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FLHAFormModal
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        form={editingForm}
        onSave={handleSaveForm}
      />
    </Layout>
  );
}
