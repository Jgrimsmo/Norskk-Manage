import React, { useState, useEffect } from 'react';
import { fetchCollection } from '../lib/utils/firebaseHelpers';
import { WEATHER_OPTIONS } from '../lib/constants/appConstants';
import { useWeatherIntegration } from '../hooks/useWeatherIntegration';

// Debug function to make testing easier
window.debugFirebaseStorage = async () => {
  console.log('🔍 Starting Firebase Storage debug test...');
  try {
    // Test Firebase imports
    console.log('📦 Testing Firebase imports...');
    const { storage } = await import('../Firebase/firebaseConfig');
    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
    console.log('✅ Firebase modules imported successfully');
    
    // Test basic storage reference
    console.log('🔗 Testing storage reference...');
    const testRef = ref(storage, 'debug-test.txt');
    console.log('✅ Storage reference created:', testRef);
    
    // Test upload
    console.log('📤 Testing file upload...');
    const testData = new Blob(['Debug test from console'], { type: 'text/plain' });
    const testFile = new File([testData], 'debug-test.txt', { type: 'text/plain' });
    
    const uploadTask = uploadBytesResumable(testRef, testFile);
    
    const result = await new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('📊 Upload progress:', Math.round(progress) + '%');
        },
        (error) => {
          console.error('❌ Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('✅ Upload completed! URL:', downloadURL);
            resolve(downloadURL);
          } catch (urlError) {
            console.error('❌ Error getting download URL:', urlError);
            reject(urlError);
          }
        }
      );
    });
    
    console.log('🎉 Debug test completed successfully!', result);
    return result;
    
  } catch (error) {
    console.error('💥 Debug test failed:', error);
    throw error;
  }
};

console.log('🛠️ Debug function loaded. Run window.debugFirebaseStorage() in console to test.');

export default function DailyReportModal({ show, onClose, report = null, onSave }) {
  const [form, setForm] = useState({
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
    photos: [],
    status: 'submitted'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [crewMembers, setCrewMembers] = useState([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);
  const [crewSearchTerm, setCrewSearchTerm] = useState('');
  const [showCrewDropdown, setShowCrewDropdown] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  // Use weather integration hook
  const { weatherLoading } = useWeatherIntegration(
    form.project, 
    projects, 
    (weatherData) => setForm(f => ({
      ...f,
      weather: weatherData.condition,
      temperature: weatherData.temperature
    }))
  );

  // Initialize form with report data when editing
  useEffect(() => {
    if (report) {
      setForm({
        date: report.date || new Date().toISOString().split('T')[0],
        project: report.project || '',
        supervisor: report.supervisor || '',
        weather: report.weather || 'Sunny',
        temperature: report.temperature || '',
        workersOnSite: report.workersOnSite || 0,
        workCompleted: report.workCompleted || '',
        workPlanned: report.workPlanned || '',
        safetyIncidents: report.safetyIncidents || '',
        issuesDelays: report.issuesDelays || '',
        equipmentUsed: report.equipmentUsed || [],
        photos: report.photos || [],
        status: 'submitted'
      });
    } else {
      // Reset form for new report
      setForm({
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
        photos: [],
        status: 'submitted'
      });
    }
  }, [report]);

  // Load projects and crew when modal opens
  useEffect(() => {
    if (show) {
      console.log('🎯 DailyReportModal opened, testing functions available...');
      console.log('testFirebaseStorage available:', typeof testFirebaseStorage);
      loadProjects();
      loadCrewMembers();
      loadEquipment();
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
      
      // Always use actual crew data if available, fallback to sample data only if empty
      if (crewData.length > 0) {
        // Transform crew data to include necessary fields
        const transformedCrew = crewData.map((member, index) => ({
          id: member.id || `crew-${index}`, // Fallback ID if not present
          name: member.name,
          role: member.role,
          phone: member.phone || '',
          status: 'Active' // Assume all crew members are active
        }));
        setCrewMembers(transformedCrew);
      } else {
        // Use sample data only if no crew exists in Firebase
        setCrewMembers([
          { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
          { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
          { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
          { id: '4', name: 'Sarah Wilson', role: 'Worker', status: 'Active' },
          { id: '5', name: 'Tom Johnson', role: 'Worker', status: 'Active' },
          { id: '6', name: 'Carlos Rodriguez', role: 'Equipment Operator', status: 'Active' },
          { id: '7', name: 'Lisa Chen', role: 'Safety Inspector', status: 'Active' },
          { id: '8', name: 'Jason Miller', role: 'Electrician', status: 'Active' },
          { id: '9', name: 'Jessica Brown', role: 'Plumber', status: 'Active' },
        ]);
      }
    } catch (error) {
      console.error("Error loading crew members:", error);
      // Use sample data as fallback on error
      setCrewMembers([
        { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
        { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
        { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
        { id: '4', name: 'Sarah Wilson', role: 'Worker', status: 'Active' },
        { id: '5', name: 'Tom Johnson', role: 'Worker', status: 'Active' },
        { id: '8', name: 'Jason Miller', role: 'Electrician', status: 'Active' },
        { id: '9', name: 'Jessica Brown', role: 'Plumber', status: 'Active' },
      ]);
    } finally {
      setLoadingCrew(false);
    }
  };

  const loadEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const equipmentData = await fetchCollection("equipment");
      
      // Always use actual equipment data if available, fallback to sample data only if empty
      if (equipmentData.length > 0) {
        // Transform equipment data to include necessary fields
        const transformedEquipment = equipmentData.map((item, index) => ({
          id: item.id || `equipment-${index}`, // Fallback ID if not present
          name: item.name,
          type: item.type || 'Equipment'
        }));
        setEquipment(transformedEquipment);
      } else {
        // Use sample data only if no equipment exists in Firebase
        setEquipment([
          { id: '1', name: 'CAT 320', type: 'Excavator' },
          { id: '2', name: 'Bobcat S650', type: 'Skid Steer' },
          { id: '3', name: 'Hydraulic Hammer', type: 'Attachment' },
          { id: '4', name: 'Plate Compactor', type: 'Compactor' },
          { id: '5', name: 'Generator 50kW', type: 'Misc' },
          { id: '6', name: 'Water Pump', type: 'Misc' },
        ]);
      }
    } catch (error) {
      console.error("Error loading equipment:", error);
      // Use sample data as fallback on error
      setEquipment([
        { id: '1', name: 'CAT 320', type: 'Excavator' },
        { id: '2', name: 'Bobcat S650', type: 'Skid Steer' },
        { id: '3', name: 'Hydraulic Hammer', type: 'Attachment' },
        { id: '4', name: 'Plate Compactor', type: 'Compactor' },
        { id: '5', name: 'Generator 50kW', type: 'Misc' },
      ]);
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Initialize selectedCrewMembers from existing report
  useEffect(() => {
    if (report && report.selectedCrewMembers) {
      setSelectedCrewMembers(report.selectedCrewMembers);
    }
  }, [report]);

  // Initialize selectedEquipment from existing report
  useEffect(() => {
    if (report && report.selectedEquipment) {
      setSelectedEquipment(report.selectedEquipment);
    } else if (report && report.equipmentUsed) {
      // Convert old format (array of strings) to new format (array of objects)
      const convertedEquipment = report.equipmentUsed.map((name, index) => ({
        id: `legacy-${index}`,
        name: name,
        type: 'Equipment'
      }));
      setSelectedEquipment(convertedEquipment);
    }
  }, [report]);

  // Update workers count when crew selection changes
  useEffect(() => {
    setForm(f => ({ ...f, workersOnSite: selectedCrewMembers.length }));
  }, [selectedCrewMembers]);

  // Crew selection functions
  const filteredCrewMembers = crewMembers.filter(member => {
    // Filter out already selected members
    const isNotSelected = !selectedCrewMembers.find(selected => selected.id === member.id);
    // Filter by search term (show all if no search term)
    const matchesSearch = crewSearchTerm.length === 0 || 
      member.name.toLowerCase().includes(crewSearchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(crewSearchTerm.toLowerCase());
    
    return isNotSelected && matchesSearch;
  });

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

  // Equipment selection functions
  const filteredEquipment = equipment.filter(item => {
    // Filter out already selected equipment
    const isNotSelected = !selectedEquipment.find(selected => selected.id === item.id);
    // Filter by search term (show all if no search term)
    const matchesSearch = equipmentSearchTerm.length === 0 || 
      item.name.toLowerCase().includes(equipmentSearchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(equipmentSearchTerm.toLowerCase());
    
    return isNotSelected && matchesSearch;
  });

  const addEquipmentItem = (item) => {
    if (!selectedEquipment.find(selected => selected.id === item.id)) {
      setSelectedEquipment(prev => [...prev, item]);
    }
    setEquipmentSearchTerm('');
    setShowEquipmentDropdown(false);
  };

  const removeEquipmentItem = (itemId) => {
    setSelectedEquipment(prev => prev.filter(item => item.id !== itemId));
  };

  if (!show) return null;

  const validateFormData = () => {
    const newErrors = {};
    
    if (!form.project.trim()) newErrors.project = 'Project name is required';
    if (!form.supervisor.trim()) newErrors.supervisor = 'Supervisor name is required';
    if (!form.workCompleted.trim()) newErrors.workCompleted = 'Work completed is required';
    if (!form.workPlanned.trim()) newErrors.workPlanned = 'Work planned is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('DailyReportModal: Starting save process...');
      console.log('Form data:', form);
      console.log('Photos count:', form.photos?.length || 0);
      
      const reportData = {
        ...form,
        selectedCrewMembers,
        selectedEquipment,
        equipmentUsed: selectedEquipment.map(item => item.name), // Keep backward compatibility
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      console.log('DailyReportModal: Calling onSave...', { reportData, editingReport: report });
      await onSave(reportData, report);
      console.log('DailyReportModal: Save completed successfully');
      onClose();
      setErrors({});
    } catch (error) {
      console.error('DailyReportModal: Error saving report:', error);
      setErrors({ general: 'Failed to save report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Photo upload triggered with files:', files);
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      console.log(`File ${file.name}: type=${file.type}, size=${file.size}, valid=${isValidType && isValidSize}`);
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not added. Please ensure all files are images under 5MB.');
    }

    console.log('Valid files for upload:', validFiles);
    
    const newPhotos = validFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    console.log('Adding photos to form:', newPhotos);
    
    setForm(f => ({
      ...f,
      photos: [...f.photos, ...newPhotos]
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
  };

  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="daily-report-modal" onClick={e => e.stopPropagation()}>
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="modal-loading-overlay" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>💾</div>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Saving Report...</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {form.photos?.length > 0 ? `Uploading ${form.photos.length} photo(s)...` : 'Please wait...'}
            </div>
          </div>
        )}
        
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
            </div>
          </div>

          {/* Workers & Equipment Section */}
          <div className="form-section">
            <h3 className="section-title">Workers & Equipment</h3>
            
            {/* Workers Sub-section */}
            <div className="form-field">
              <label>Select Workers * ({selectedCrewMembers.length} selected)</label>
              <div className="crew-selection-container">
                <div className="crew-search-input" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={crewSearchTerm}
                    onChange={e => {
                      setCrewSearchTerm(e.target.value);
                      setShowCrewDropdown(true);
                    }}
                    onFocus={() => setShowCrewDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCrewDropdown(false), 200)} // Delay to allow clicks
                    placeholder={loadingCrew ? "Loading crew..." : "Search crew members..."}
                    disabled={loadingCrew}
                  />
                  {showCrewDropdown && !loadingCrew && (
                    <div 
                      className="crew-dropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000
                      }}
                    >
                      {crewMembers.length === 0 ? (
                        <div className="crew-dropdown-item" style={{ color: '#999', fontStyle: 'italic', padding: '8px 12px' }}>
                          No crew members available
                        </div>
                      ) : filteredCrewMembers.length > 0 ? (
                        filteredCrewMembers.map(member => (
                          <div
                            key={member.id}
                            className="crew-dropdown-item"
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => addCrewMember(member)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            <span className="crew-name" style={{ fontWeight: '500', color: '#333' }}>{member.name}</span>
                            <span className="crew-role" style={{ color: '#666' }}>({member.role})</span>
                          </div>
                        ))
                      ) : crewSearchTerm ? (
                        <div className="crew-dropdown-item" style={{ color: '#999', fontStyle: 'italic', padding: '8px 12px' }}>
                          No crew members match "{crewSearchTerm}"
                        </div>
                      ) : (
                        <div className="crew-dropdown-item" style={{ color: '#999', fontStyle: 'italic', padding: '8px 12px' }}>
                          All crew members are already selected
                        </div>
                      )}
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
                  Search and select crew members for today.
                </small>
                
                {loadingCrew && (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                    Loading crew members...
                  </div>
                )}
                
                {!loadingCrew && crewMembers.length === 0 && (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                    No crew members available. Add crew members in the Crew section first.
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Sub-section */}
            <div className="form-field">
              <label>Equipment Used ({selectedEquipment.length} selected)</label>
              <div className="equipment-selection-container">
                <div className="equipment-search-input" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={equipmentSearchTerm}
                    onChange={e => {
                      setEquipmentSearchTerm(e.target.value);
                      setShowEquipmentDropdown(true);
                    }}
                    onFocus={() => setShowEquipmentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEquipmentDropdown(false), 200)} // Delay to allow clicks
                    placeholder={loadingEquipment ? "Loading equipment..." : "Search equipment..."}
                    disabled={loadingEquipment}
                  />
                  {showEquipmentDropdown && !loadingEquipment && (
                    <div 
                      className="equipment-dropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000
                      }}
                    >
                      {equipment.length === 0 ? (
                        <div className="equipment-dropdown-item" style={{ color: '#999', fontStyle: 'italic', padding: '8px 12px' }}>
                          No equipment available
                        </div>
                      ) : filteredEquipment.length > 0 ? (
                        filteredEquipment.map(item => (
                          <div
                            key={item.id}
                            className="equipment-dropdown-item"
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onClick={() => addEquipmentItem(item)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            <span className="equipment-name" style={{ fontWeight: '500', color: '#333' }}>{item.name}</span>
                            <span className="equipment-type" style={{ color: '#666' }}>({item.type})</span>
                          </div>
                        ))
                      ) : equipmentSearchTerm ? (
                        <div className="equipment-dropdown-item" style={{ color: '#999', fontStyle: 'italic', padding: '8px 12px' }}>
                          No equipment matches "{equipmentSearchTerm}"
                        </div>
                      ) : (
                        <div className="equipment-dropdown-item" style={{ color: '#999', fontStyle: 'italic', padding: '8px 12px' }}>
                          All equipment is already selected
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedEquipment.length > 0 && (
                  <div className="selected-equipment">
                    {selectedEquipment.map(item => (
                      <span key={item.id} className="equipment-tag">
                        {item.name} - {item.type}
                        <button 
                          type="button" 
                          onClick={() => removeEquipmentItem(item.id)}
                          className="remove-equipment"
                          title="Remove equipment"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <small className="field-hint">
                  Search and select equipment used today.
                </small>
                
                {loadingEquipment && (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                    Loading equipment...
                  </div>
                )}
                
                {!loadingEquipment && equipment.length === 0 && (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                    No equipment available. Add equipment in the Equipment section first.
                  </div>
                )}
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
            {errors.general && (
              <div className="error-message" style={{ marginBottom: '16px', color: '#d32f2f', fontSize: '14px' }}>
                {errors.general}
              </div>
            )}
            <div className="action-group primary-actions">
              <button 
                type="submit" 
                className="classic-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? '💾 Saving...' : '💾 Save Report'}
              </button>
              {/* Test Firebase Storage Button - Remove in production */}
              <button 
                type="button" 
                className="classic-button secondary"
                onClick={async () => {
                  console.log('🧪 Test Storage button clicked!');
                  
                  // Step 1: Check if Firebase Storage is configured
                  try {
                    console.log('🔍 Step 1: Testing Firebase configuration...');
                    const { storage } = await import('../Firebase/firebaseConfig');
                    console.log('✅ Firebase storage imported:', storage);
                    console.log('Storage app:', storage.app);
                    
                    // Step 2: Test creating a storage reference
                    console.log('🔍 Step 2: Testing storage reference creation...');
                    const { ref } = await import('firebase/storage');
                    const testRef = ref(storage, 'debug-test.txt');
                    console.log('✅ Storage reference created:', testRef);
                    
                    // Step 3: Test basic upload functionality
                    console.log('🔍 Step 3: Testing file upload...');
                    const { uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
                    
                    const testData = new Blob(['Debug test - ' + new Date().toISOString()], { type: 'text/plain' });
                    const testFile = new File([testData], 'debug-test.txt', { type: 'text/plain' });
                    
                    const uploadTask = uploadBytesResumable(testRef, testFile);
                    
                    console.log('📤 Starting upload...');
                    alert('📤 Upload started - check console for progress');
                    
                    const result = await new Promise((resolve, reject) => {
                      // Set a 10 second timeout
                      const timeout = setTimeout(() => {
                        console.error('⏰ Upload timeout after 10 seconds');
                        uploadTask.cancel();
                        reject(new Error('Upload timeout'));
                      }, 10000);
                      
                      uploadTask.on('state_changed',
                        (snapshot) => {
                          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                          console.log('📊 Upload progress:', Math.round(progress) + '%');
                        },
                        (error) => {
                          clearTimeout(timeout);
                          console.error('❌ Upload error:', error);
                          console.error('Error code:', error.code);
                          console.error('Error message:', error.message);
                          
                          // Check for common Firebase Storage errors
                          if (error.code === 'storage/unauthorized') {
                            console.error('🚫 PERMISSION DENIED: Firebase Storage security rules are blocking this upload');
                            console.error('💡 Solution: Update Firebase Storage security rules to allow uploads');
                          } else if (error.code === 'storage/unknown') {
                            console.error('❓ UNKNOWN ERROR: Possible network issue or Firebase Storage not enabled');
                          } else if (error.code === 'storage/retry-limit-exceeded') {
                            console.error('🔄 RETRY LIMIT: Network connection issues');
                          }
                          
                          reject(error);
                        },
                        async () => {
                          clearTimeout(timeout);
                          try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            console.log('✅ Upload completed! URL:', downloadURL);
                            resolve(downloadURL);
                          } catch (urlError) {
                            console.error('❌ Error getting download URL:', urlError);
                            reject(urlError);
                          }
                        }
                      );
                    });
                    
                    console.log('🎉 Test successful! URL:', result);
                    alert('✅ Firebase Storage test successful! Check console for details.');
                    
                  } catch (error) {
                    console.error('💥 Firebase Storage test failed:', error);
                    console.error('Error details:', {
                      name: error.name,
                      message: error.message,
                      code: error.code,
                      stack: error.stack
                    });
                    
                    let errorMessage = '❌ Test failed: ' + error.message;
                    
                    if (error.code === 'storage/unauthorized') {
                      errorMessage += '\n\n🚫 PERMISSION DENIED\nFirebase Storage security rules are blocking uploads.\n\nTo fix this:\n1. Go to Firebase Console\n2. Go to Storage > Rules\n3. Update rules to allow uploads';
                    } else if (error.message.includes('Firebase Storage is not available')) {
                      errorMessage += '\n\n📦 STORAGE NOT ENABLED\nFirebase Storage might not be enabled for this project.\n\nTo fix this:\n1. Go to Firebase Console\n2. Enable Storage for your project';
                    }
                    
                    alert(errorMessage);
                  }
                }}
                style={{ fontSize: '12px', padding: '8px 12px', backgroundColor: '#ff6b6b', color: 'white' }}
              >
                🧪 Test Storage
              </button>
            </div>
            <div className="action-group secondary-actions">
              <button 
                type="button" 
                className="classic-button tertiary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
