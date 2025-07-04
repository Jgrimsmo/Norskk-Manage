import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useReportManagement } from '../../hooks/useReportManagement';
import { fetchCollection } from '../../lib/utils/firebaseHelpers';
import { enhancedImageLoad } from '../../lib/utils/corsProxyUtils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import '../../styles/page.css';
import './DailyReportEdit.css';

export default function DailyReportEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, PERMISSIONS } = useAuth();
  const { handleSaveReport } = useReportManagement();
  
  const report = location.state?.report;
  const isEditing = !!report;

  // Form state - matching the modal structure
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    supervisor: '',
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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data loading states
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [crewMembers, setCrewMembers] = useState([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  
  // Selection states
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  
  // Dropdown states
  const [crewSearchTerm, setCrewSearchTerm] = useState('');
  const [showCrewDropdown, setShowCrewDropdown] = useState(false);
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  // Initialize form with report data when editing
  useEffect(() => {
    if (report) {
      // Process photos to ensure they have the correct structure for PDF handling
      const processedPhotos = (report.photos || []).map(photo => {
        // If photo already has pdfReady property, it's been processed
        if (photo.hasOwnProperty('pdfReady')) {
          return photo;
        }
        
        // For legacy photos or Firebase photos, add the necessary properties
        return {
          ...photo,
          pdfReady: false, // Will be processed when PDF is generated
          originalUrl: photo.url // Keep original Firebase URL for reference
        };
      });

      setForm({
        date: report.date || new Date().toISOString().split('T')[0],
        project: report.project || '',
        supervisor: report.supervisor || '',
        workersOnSite: report.workersOnSite || 0,
        workCompleted: report.workCompleted || '',
        workPlanned: report.workPlanned || '',
        safetyIncidents: report.safetyIncidents || '',
        issuesDelays: report.issuesDelays || '',
        equipmentUsed: report.equipmentUsed || [],
        photos: processedPhotos,
        status: 'submitted'
      });
    }
  }, [report]);

  // Load data on component mount
  useEffect(() => {
    loadProjects();
    loadCrewMembers();
    loadEquipment();
  }, []);

  // Initialize selected crew members and equipment from existing report
  useEffect(() => {
    if (report && report.selectedCrewMembers) {
      setSelectedCrewMembers(report.selectedCrewMembers);
    }
  }, [report]);

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
      
      if (crewData.length > 0) {
        const transformedCrew = crewData.map((member, index) => ({
          id: member.id || `crew-${index}`,
          name: member.name,
          role: member.role,
          phone: member.phone || '',
          status: 'Active'
        }));
        setCrewMembers(transformedCrew);
      } else {
        // Sample data if no crew exists
        setCrewMembers([
          { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
          { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
          { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
          { id: '4', name: 'Sarah Wilson', role: 'Worker', status: 'Active' },
          { id: '5', name: 'Tom Johnson', role: 'Worker', status: 'Active' },
        ]);
      }
    } catch (error) {
      console.error("Error loading crew members:", error);
      setCrewMembers([
        { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
        { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
        { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
      ]);
    } finally {
      setLoadingCrew(false);
    }
  };

  const loadEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const equipmentData = await fetchCollection("equipment");
      
      if (equipmentData.length > 0) {
        const transformedEquipment = equipmentData.map((item, index) => ({
          id: item.id || `equipment-${index}`,
          name: item.name,
          type: item.type || 'Equipment'
        }));
        setEquipment(transformedEquipment);
      } else {
        // Sample data if no equipment exists
        setEquipment([
          { id: '1', name: 'CAT 320', type: 'Excavator' },
          { id: '2', name: 'Bobcat S650', type: 'Skid Steer' },
          { id: '3', name: 'Hydraulic Hammer', type: 'Attachment' },
          { id: '4', name: 'Plate Compactor', type: 'Compactor' },
          { id: '5', name: 'Generator 50kW', type: 'Misc' },
        ]);
      }
    } catch (error) {
      console.error("Error loading equipment:", error);
      setEquipment([
        { id: '1', name: 'CAT 320', type: 'Excavator' },
        { id: '2', name: 'Bobcat S650', type: 'Skid Steer' },
        { id: '3', name: 'Hydraulic Hammer', type: 'Attachment' },
      ]);
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Crew selection functions
  // Crew selection functions (improved search and dropdown logic)
  const filteredCrewMembers = crewMembers.filter(member => {
    const isNotSelected = !selectedCrewMembers.find(selected => selected.id === member.id);
    const search = crewSearchTerm.trim().toLowerCase();
    const matchesSearch =
      search.length === 0 ||
      (member.name && member.name.toLowerCase().includes(search)) ||
      (member.role && member.role.toLowerCase().includes(search));
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

  // Equipment selection functions (improved search and dropdown logic)
  const filteredEquipment = equipment.filter(item => {
    const isNotSelected = !selectedEquipment.find(selected => selected.id === item.id);
    const search = equipmentSearchTerm.trim().toLowerCase();
    const matchesSearch =
      search.length === 0 ||
      (item.name && item.name.toLowerCase().includes(search)) ||
      (item.type && item.type.toLowerCase().includes(search));
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

  const validateFormData = () => {
    const newErrors = {};
    
    if (!form.project.trim()) newErrors.project = 'Project name is required';
    if (!form.supervisor.trim()) newErrors.supervisor = 'Supervisor name is required';
    if (!form.workCompleted.trim()) newErrors.workCompleted = 'Work completed is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to create optimized thumbnails for PDF
  const createOptimizedThumbnail = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to convert Firebase Storage URLs to base64 for PDF compatibility
  const convertFirebaseUrlToBase64 = async (url) => {
    try {
      // If it's already a data URL, return as is
      if (url.startsWith('data:')) {
        return url;
      }
      
      // If it's a blob URL, return as is (from local uploads)
      if (url.startsWith('blob:')) {
        return url;
      }
      
      // For Firebase Storage URLs, fetch and convert to base64
      if (url.includes('firebasestorage.googleapis.com')) {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          console.warn('Failed to fetch Firebase image, using placeholder');
          return null;
        }
        
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => {
            console.warn('Failed to convert to base64, using placeholder');
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
      }
      
      return url;
    } catch (error) {
      console.warn('Error converting Firebase URL to base64:', error);
      return null;
    }
  };

  // Helper function to handle photo loading errors and provide fallbacks
  const handlePhotoLoadError = (photo, index) => {
    console.warn(`Failed to load photo ${index}: ${photo.name}. Using fallback.`);
    return {
      ...photo,
      url: null, // This will trigger the placeholder view
      pdfReady: false
    };
  };

  // Enhanced function to prepare photos for PDF with better error handling
  const preparePhotosForPDFEnhanced = async (photos) => {
    if (!photos || photos.length === 0) return [];
    
    console.log('🔄 Preparing photos for PDF with enhanced loading strategies...');
    const pdfPhotos = await Promise.allSettled(
      photos.map(async (photo, index) => {
        try {
          // If it's already a data URL or blob, use as is
          if (photo.url?.startsWith('data:') || photo.url?.startsWith('blob:')) {
            return {
              ...photo,
              pdfReady: true
            };
          }
          
          // For Firebase Storage URLs, try enhanced loading with multiple strategies
          if (photo.url?.includes('firebasestorage.googleapis.com')) {
            console.log(`🔧 Trying enhanced loading for photo ${index}: ${photo.name}`);
            
            try {
              const base64Image = await enhancedImageLoad(photo.url);
              console.log(`✅ Successfully loaded photo ${index} with enhanced method`);
              
              return {
                ...photo,
                url: base64Image,
                pdfReady: true
              };
            } catch (enhancedError) {
              console.warn(`❌ Enhanced loading failed for photo ${index}: ${photo.name}`, enhancedError.message);
              
              // Fall back to original method
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              
              try {
                const response = await fetch(photo.url, {
                  mode: 'cors',
                  credentials: 'omit',
                  signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }
                
                const blob = await response.blob();
                const base64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                
                return {
                  ...photo,
                  url: base64,
                  pdfReady: true
                };
              } catch (fallbackError) {
                clearTimeout(timeoutId);
                console.warn(`❌ All loading methods failed for photo ${index}: ${photo.name}`);
                return {
                  ...photo,
                  url: null,
                  pdfReady: false,
                  originalUrl: photo.url
                };
              }
            }
          }
          
          // For other URLs, try as is
          return {
            ...photo,
            pdfReady: true
          };
        } catch (error) {
          console.warn(`Error preparing photo ${index}: ${photo.name}`, error);
          return {
            ...photo,
            url: null,
            pdfReady: false
          };
        }
      })
    );
    
    // Convert PromiseSettledResult to actual values
    const results = pdfPhotos.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.warn(`Photo ${index} preparation failed:`, result.reason);
        return {
          ...photos[index],
          url: null,
          pdfReady: false
        };
      }
    });
    
    const successCount = results.filter(p => p.pdfReady).length;
    const failedCount = results.length - successCount;
    
    if (failedCount > 0) {
      console.warn(`⚠️ ${failedCount} photo(s) couldn't be loaded due to CORS restrictions. They will appear as placeholders in the PDF.`);
      console.info('💡 To fix this permanently, apply CORS settings. See CORS_SETUP_INSTRUCTIONS.md for step-by-step instructions.');
    }
    
    console.log(`✅ Successfully prepared ${successCount}/${photos.length} photos for PDF`);
    
    return results;
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not added. Please ensure all files are images under 5MB.');
    }
    
    // Process files with optimized thumbnails for PDF
    const photoPromises = validFiles.map(async (file) => {
      try {
        // Create optimized thumbnail for PDF display
        const pdfThumbnail = await createOptimizedThumbnail(file);
        
        // Create object URL for form preview
        const previewUrl = URL.createObjectURL(file);
        
        return {
          name: file.name,
          url: pdfThumbnail, // Optimized for PDF rendering
          previewUrl: previewUrl, // Full quality for form preview
          file: file // Keep the original file for Firebase upload
        };
      } catch (error) {
        console.error('Error processing photo:', file.name, error);
        // Fallback to object URL if optimization fails
        return {
          name: file.name,
          url: URL.createObjectURL(file),
          previewUrl: URL.createObjectURL(file),
          file: file
        };
      }
    });

    try {
      const newPhotos = await Promise.all(photoPromises);
      setForm(f => ({
        ...f,
        photos: [...f.photos, ...newPhotos]
      }));
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('Error processing photos. Please try again.');
    }
  };

  const removePhoto = (index) => {
    const photoToRemove = form.photos[index];
    if (photoToRemove?.url && photoToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.url);
    }
    if (photoToRemove?.previewUrl && photoToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.previewUrl);
    }
    
    setForm(f => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index)
    }));
  };

  const canCreateReports = hasPermission(PERMISSIONS.CREATE_REPORTS);

  if (!canCreateReports) {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>You don't have permission to create or edit daily reports.</p>
        <button onClick={() => navigate('/daily-reports')} className="btn btn-primary">
          Back to Reports
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    setIsSaving(true);
    try {
      const reportData = {
        ...form,
        selectedCrewMembers,
        selectedEquipment,
        equipmentUsed: selectedEquipment.map(item => item.name), // Keep backward compatibility
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      await handleSaveReport(reportData, report);
      navigate('/daily-reports');
    } catch (error) {
      console.error('Error saving report:', error);
      setErrors({ general: 'Failed to save report. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/daily-reports');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading report...</p>
      </div>
    );
  }

  return (
    <div className="daily-report-edit">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="edit-loading-overlay">
          <div className="loading-content">
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>💾</div>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Saving Report...</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {form.photos?.length > 0 ? `Uploading ${form.photos.length} photo(s)...` : 'Please wait...'}
            </div>
          </div>
        </div>
      )}

      <div className="edit-header">
        <h1>{isEditing ? 'Edit Daily Report' : 'Create Daily Report'}</h1>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={async () => {
              try {
                setIsSaving(true);
                console.log('🔄 Starting PDF preview preparation...');
                console.log('📸 Original photos:', form.photos);
                
                // Prepare photos for PDF (convert Firebase URLs to base64 with fallbacks)
                const pdfReadyPhotos = await preparePhotosForPDFEnhanced(form.photos);
                console.log('✅ PDF-ready photos:', pdfReadyPhotos);
                
                // Create a preview report object with current form data and PDF-ready photos
                const previewReport = {
                  ...form,
                  photos: pdfReadyPhotos,
                  selectedCrewMembers,
                  selectedEquipment,
                  equipmentUsed: selectedEquipment.map(item => item.name),
                  id: report?.id || 'preview',
                  createdAt: report?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                console.log('📄 Final preview report:', previewReport);
                navigate('/daily-reports/preview', { state: { report: previewReport } });
              } catch (error) {
                console.error('Error preparing PDF preview:', error);
                alert('Error preparing PDF preview. Please try again.');
              } finally {
                setIsSaving(false);
              }
            }}
            className="btn btn-outline"
            disabled={isSaving}
          >
            📄 Preview PDF
          </button>
          <button 
            type="submit" 
            form="report-form"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (isEditing ? 'Update Report' : 'Create Report')}
          </button>
        </div>
      </div>

      <div className="edit-content">
        <form id="report-form" onSubmit={handleSubmit} className="report-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="project">Project *</label>
                <select
                  id="project"
                  value={form.project}
                  onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                  required
                  className={errors.project ? 'error' : ''}
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
                {errors.project && <span className="error-message">{errors.project}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="supervisor">Supervisor *</label>
                <input
                  type="text"
                  id="supervisor"
                  value={form.supervisor}
                  onChange={e => setForm(f => ({ ...f, supervisor: e.target.value }))}
                  placeholder="Supervisor name"
                  className={errors.supervisor ? 'error' : ''}
                  required
                />
                {errors.supervisor && <span className="error-message">{errors.supervisor}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="crewCount">Number of Crew Members</label>
                <div 
                  id="crewCount"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f8f9fa',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#333',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {selectedCrewMembers.length}
                </div>
                <small className="field-hint" style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  This count updates automatically when you select workers below
                </small>
              </div>
            </div>
          </div>

          {/* Workers & Equipment */}
          <div className="form-section">
            <h3>Workers & Equipment</h3>
            
            {/* Workers Sub-section */}
            <div className="form-group full-width">
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
                    className="search-input"
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
                  <div className="selected-crew-members" style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '12px', 
                    padding: '8px', 
                    background: '#f8f9fa', 
                    borderRadius: '4px' 
                  }}>
                    {selectedCrewMembers.map(member => (
                      <span key={member.id} className="crew-tag" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: '#007acc',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        gap: '6px'
                      }}>
                        {member.name} - {member.role}
                        <button 
                          type="button" 
                          onClick={() => removeCrewMember(member.id)}
                          className="remove-crew"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '0',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remove crew member"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <small className="field-hint" style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Search and select crew members for today.
                </small>
              </div>
            </div>

            {/* Equipment Sub-section */}
            <div className="form-group full-width">
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
                    className="search-input"
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
                  <div className="selected-equipment" style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '12px', 
                    padding: '8px', 
                    background: '#f8f9fa', 
                    borderRadius: '4px' 
                  }}>
                    {selectedEquipment.map(item => (
                      <span key={item.id} className="equipment-tag" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: '#007acc',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '500',
                        gap: '6px'
                      }}>
                        {item.name} - {item.type}
                        <button 
                          type="button" 
                          onClick={() => removeEquipmentItem(item.id)}
                          className="remove-equipment"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '16px',
                            cursor: 'pointer',
                            padding: '0',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remove equipment"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <small className="field-hint" style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Search and select equipment used today.
                </small>
              </div>
            </div>
          </div>

          {/* Work Progress */}
          <div className="form-section">
            <h3>Work Progress</h3>
            <div className="form-group full-width">
              <label htmlFor="workCompleted">Work Completed Today *</label>
              <textarea
                id="workCompleted"
                value={form.workCompleted}
                onChange={e => setForm(f => ({ ...f, workCompleted: e.target.value }))}
                placeholder="Describe the work completed today in detail..."
                rows={4}
                className={errors.workCompleted ? 'error' : ''}
                required
              />
              {errors.workCompleted && <span className="error-message">{errors.workCompleted}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="issuesDelays">Issues or Delays</label>
              <textarea
                id="issuesDelays"
                value={form.issuesDelays}
                onChange={e => setForm(f => ({ ...f, issuesDelays: e.target.value }))}
                placeholder="Report any issues, delays, or challenges encountered..."
                rows={3}
              />
              <small className="field-hint">Leave blank if no issues occurred</small>
            </div>
          </div>

          {/* Photos */}
          <div className="form-section">
            <h3>Site Photos</h3>
            <div className="form-group full-width">
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
                  <br />
                  📷 Photos will be clickable links in the PDF to view full-size images
                </small>
              </div>
              
              {form.photos && form.photos.length > 0 && (
                <div className="photo-gallery">
                  {form.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={photo.previewUrl || photo.url} 
                        alt={`Site photo ${index + 1}`}
                        className="photo-thumbnail"
                      />
                      <div className="photo-overlay">
                        <span className="photo-name">{photo.name}</span>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="remove-photo"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="error-message-general">
              {errors.general}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
