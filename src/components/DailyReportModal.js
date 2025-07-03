import React, { useState, useEffect } from 'react';
import { validateRequired, validateForm } from '../lib/validators/formValidators';
import { fetchCollection } from '../lib/utils/firebaseHelpers';
import { WEATHER_OPTIONS, FILE_UPLOAD_LIMITS } from '../lib/constants/appConstants';
import { useWeatherIntegration } from '../hooks/useWeatherIntegration';

export default function DailyReportModal({ show, onClose, report = null, onSave }) {
  const [form, setForm] = useState(report || {
    date: new Date().toISOString().split('T')[0],
    project: '',
    supervisor: '',
    weather: 'Sunny',
    temperature: '',
    workersOnSite: 0,
    workCompleted: '',
    workPlanned: '',
    safetyIncidents: '',
    issuesDelays: '',
    equipmentUsed: [],
    materials: '',
    photos: [],
    status: 'draft'
  });

  const [equipmentInput, setEquipmentInput] = useState('');
  const [errors, setErrors] = useState({});
  const [photoFiles, setPhotoFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [crewMembers, setCrewMembers] = useState([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);
  const [crewSearchTerm, setCrewSearchTerm] = useState('');
  const [showCrewDropdown, setShowCrewDropdown] = useState(false);

  // Use weather integration hook
  const { loadWeatherForProject, weatherLoading } = useWeatherIntegration(
    form.project, 
    projects, 
    (weatherData) => setForm(f => ({
      ...f,
      weather: weatherData.condition,
      temperature: weatherData.temperature
    }))
  );

  // Load projects and crew when modal opens
  useEffect(() => {
    if (show) {
      loadProjects();
      loadCrewMembers();
    }
  }, [show]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await fetchCollection("managementProjects");
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadCrewMembers = async () => {
    try {
      setLoadingCrew(true);
      const crewData = await fetchCollection("crew");
      // If no crew collection exists, use sample data
      if (crewData.length === 0) {
        setCrewMembers([
          { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
          { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
          { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
          { id: '4', name: 'Sarah Wilson', role: 'Worker', status: 'Active' },
          { id: '5', name: 'Tom Johnson', role: 'Worker', status: 'Active' },
        ]);
      } else {
        setCrewMembers(crewData.filter(member => member.status === 'Active'));
      }
    } catch (error) {
      console.error("Error loading crew members:", error);
      // Use sample data as fallback
      setCrewMembers([
        { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
        { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
        { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
      ]);
    } finally {
      setLoadingCrew(false);
    }
  };

  // Initialize selectedCrewMembers from existing report
  useEffect(() => {
    if (report && report.selectedCrewMembers) {
      setSelectedCrewMembers(report.selectedCrewMembers);
    }
  }, [report]);

  // Update workers count when crew selection changes
  useEffect(() => {
    setForm(f => ({ ...f, workersOnSite: selectedCrewMembers.length }));
  }, [selectedCrewMembers]);

  // Crew selection functions
  const filteredCrewMembers = crewMembers.filter(member =>
    member.name.toLowerCase().includes(crewSearchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(crewSearchTerm.toLowerCase())
  );

  const addCrewMember = (member) => {
    if (!selectedCrewMembers.find(selected => selected.id === member.id)) {
      setSelectedCrewMembers(prev => [...prev, member]);
    }
    setCrewSearchTerm('');
    setShowCrewDropdown(false);
  };

  const removeCrewMember = (memberId) => {
    setSelectedCrewMembers(prev => prev.filter(member => member.id !== memberId));
  };

  if (!show) return null;

  const validateFormData = () => {
    const newErrors = {};
    
    if (!form.project.trim()) newErrors.project = 'Project name is required';
    if (!form.supervisor.trim()) newErrors.supervisor = 'Supervisor name is required';
    if (!form.workCompleted.trim()) newErrors.workCompleted = 'Work completed is required';
    if (!form.workPlanned.trim()) newErrors.workPlanned = 'Work planned is required';
    if (form.workersOnSite < 0) newErrors.workersOnSite = 'Number of workers cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    const reportData = {
      ...form,
      selectedCrewMembers,
      submittedAt: form.status === 'submitted' ? new Date().toISOString() : null
    };

    onSave(reportData);
    onClose();
    setErrors({});
  };

  const handleSaveAsDraft = () => {
    const updatedForm = { 
      ...form, 
      status: 'draft',
      selectedCrewMembers 
    };
    onSave({
      ...updatedForm,
      submittedAt: null
    });
    onClose();
    setErrors({});
  };

  const handleSubmitReport = () => {
    if (!validateFormData()) {
      return;
    }
    
    const updatedForm = { 
      ...form, 
      status: 'submitted',
      selectedCrewMembers 
    };
    onSave({
      ...updatedForm,
      submittedAt: new Date().toISOString()
    });
    onClose();
    setErrors({});
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

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not added. Please ensure all files are images under 5MB.');
    }

    setPhotoFiles(prev => [...prev, ...validFiles]);
    setForm(f => ({
      ...f,
      photos: [...f.photos, ...validFiles.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file: file
      }))]
    }));
  };

  const removePhoto = (index) => {
    const photoToRemove = form.photos[index];
    if (photoToRemove?.url) {
      URL.revokeObjectURL(photoToRemove.url);
    }
    
    setForm(f => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index)
    }));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="daily-report-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{report ? 'Edit Daily Report' : 'New Daily Report'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form className="daily-report-form" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-field">
                <label>Project *</label>
                <select
                  value={form.project}
                  onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                  className={errors.project ? 'error' : ''}
                  required
                  disabled={loadingProjects}
                >
                  <option value="">
                    {loadingProjects ? 'Loading projects...' : 'Select a project'}
                  </option>
                  {projects.map(project => (
                    <option key={project.id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.project && <span className="error-text">{errors.project}</span>}
              </div>

              <div className="form-field">
                <label>Supervisor *</label>
                <input
                  type="text"
                  value={form.supervisor}
                  onChange={e => setForm(f => ({ ...f, supervisor: e.target.value }))}
                  placeholder="Supervisor name"
                  className={errors.supervisor ? 'error' : ''}
                  required
                />
                {errors.supervisor && <span className="error-text">{errors.supervisor}</span>}
              </div>
            </div>
          </div>

          {/* Site Conditions Section */}
          <div className="form-section">
            <h3 className="section-title">Site Conditions</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Weather {weatherLoading && <span className="loading-text">(Loading...)</span>}</label>
                <select
                  value={form.weather}
                  onChange={e => setForm(f => ({ ...f, weather: e.target.value }))}
                  disabled={weatherLoading}
                >
                  {WEATHER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {weatherLoading && <small className="field-hint">Auto-loading weather for project location...</small>}
              </div>

              <div className="form-field">
                <label>Temperature {weatherLoading && <span className="loading-text">(Auto-loading...)</span>}</label>
                <input
                  type="text"
                  value={form.temperature}
                  onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                  placeholder="e.g., 22°C or 72°F"
                  disabled={weatherLoading}
                />
              </div>

              <div className="form-field">
                <label>Workers on Site * ({selectedCrewMembers.length})</label>
                <div className="crew-selection-container">
                  <div className="crew-search-input">
                    <input
                      type="text"
                      value={crewSearchTerm}
                      onChange={e => {
                        setCrewSearchTerm(e.target.value);
                        setShowCrewDropdown(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowCrewDropdown(crewSearchTerm.length > 0)}
                      placeholder={loadingCrew ? "Loading crew..." : "Search crew members to add..."}
                      disabled={loadingCrew}
                    />
                    {showCrewDropdown && filteredCrewMembers.length > 0 && (
                      <div className="crew-dropdown">
                        {filteredCrewMembers.map(member => (
                          <div
                            key={member.id}
                            className="crew-dropdown-item"
                            onClick={() => addCrewMember(member)}
                          >
                            <span className="crew-name">{member.name}</span>
                            <span className="crew-role">({member.role})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedCrewMembers.length > 0 && (
                    <div className="selected-crew-members">
                      {selectedCrewMembers.map(member => (
                        <span key={member.id} className="crew-tag">
                          {member.name} - {member.role}
                          <button 
                            type="button" 
                            onClick={() => removeCrewMember(member.id)}
                            className="remove-crew"
                            title="Remove crew member"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <small className="field-hint">
                    Search and select crew members who worked on site today. The worker count is automatically updated.
                  </small>
                  
                  {/* Manual override for workers count */}
                  <div className="manual-worker-count">
                    <label>Manual override (if needed):</label>
                    <input
                      type="number"
                      value={form.workersOnSite}
                      onChange={e => setForm(f => ({ ...f, workersOnSite: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className={errors.workersOnSite ? 'error' : ''}
                      placeholder="Override worker count"
                    />
                  </div>
                </div>
                {errors.workersOnSite && <span className="error-text">{errors.workersOnSite}</span>}
              </div>
            </div>
          </div>

          {/* Work Progress Section */}
          <div className="form-section">
            <h3 className="section-title">Work Progress</h3>
            <div className="form-field">
              <label>Work Completed Today *</label>
              <textarea
                value={form.workCompleted}
                onChange={e => setForm(f => ({ ...f, workCompleted: e.target.value }))}
                placeholder="Describe the work completed today in detail..."
                rows="3"
                className={errors.workCompleted ? 'error' : ''}
                required
              />
              {errors.workCompleted && <span className="error-text">{errors.workCompleted}</span>}
            </div>

            <div className="form-field">
              <label>Work Planned for Tomorrow *</label>
              <textarea
                value={form.workPlanned}
                onChange={e => setForm(f => ({ ...f, workPlanned: e.target.value }))}
                placeholder="Describe the work planned for tomorrow..."
                rows="3"
                className={errors.workPlanned ? 'error' : ''}
                required
              />
              {errors.workPlanned && <span className="error-text">{errors.workPlanned}</span>}
            </div>
          </div>

          {/* Safety & Issues Section */}
          <div className="form-section">
            <h3 className="section-title">Safety & Issues</h3>
            <div className="form-field">
              <label>Safety Incidents / Near Misses</label>
              <textarea
                value={form.safetyIncidents}
                onChange={e => setForm(f => ({ ...f, safetyIncidents: e.target.value }))}
                placeholder="Report any safety incidents, near misses, or safety observations..."
                rows="2"
              />
              <small className="field-hint">Leave blank if no incidents occurred</small>
            </div>

            <div className="form-field">
              <label>Issues or Delays</label>
              <textarea
                value={form.issuesDelays}
                onChange={e => setForm(f => ({ ...f, issuesDelays: e.target.value }))}
                placeholder="Report any issues, delays, or challenges encountered..."
                rows="2"
              />
              <small className="field-hint">Leave blank if no issues occurred</small>
            </div>
          </div>

          {/* Resources Section */}
          <div className="form-section">
            <h3 className="section-title">Resources Used</h3>
            <div className="form-field">
              <label>Equipment Used</label>
              <div className="equipment-input">
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={e => setEquipmentInput(e.target.value)}
                  placeholder="Type equipment name and press Enter or click Add"
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
                      title="Remove equipment"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {form.equipmentUsed.length === 0 && (
                <small className="field-hint">Add equipment used on site today</small>
              )}
            </div>

            <div className="form-field">
              <label>Materials Used</label>
              <textarea
                value={form.materials}
                onChange={e => setForm(f => ({ ...f, materials: e.target.value }))}
                placeholder="List materials and quantities used (e.g., Concrete: 45 cubic yards, Steel beams: 12 tons)..."
                rows="2"
              />
            </div>
          </div>

          {/* Photos Section */}
          <div className="form-section">
            <h3 className="section-title">Site Photos</h3>
            <div className="form-field">
              <label>Add Photos</label>
              <div className="photo-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="photo-input"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="photo-upload-button">
                  📷 Choose Photos
                </label>
                <small className="field-hint">
                  Supported formats: JPG, PNG, GIF (Max 5MB per image)
                </small>
              </div>
              
              {form.photos && form.photos.length > 0 && (
                <div className="photo-gallery">
                  {form.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={photo.url} 
                        alt={`Site photo ${index + 1}`}
                        className="photo-thumbnail"
                      />
                      <div className="photo-overlay">
                        <span className="photo-name">{photo.name}</span>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="remove-photo"
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {form.photos?.length === 0 && (
                <small className="field-hint">Add photos to document site conditions and work progress</small>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <div className="action-group primary-actions">
              <button 
                type="button" 
                className="classic-button"
                onClick={handleSubmitReport}
              >
                📋 Submit Report
              </button>
              <button 
                type="button" 
                className="classic-button secondary"
                onClick={handleSaveAsDraft}
              >
                💾 Save as Draft
              </button>
            </div>
            <div className="action-group secondary-actions">
              <button type="button" className="classic-button tertiary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
