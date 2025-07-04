import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchDocById, updateDocById } from "../../lib/utils/firebaseHelpers";
import Layout from "../../components/layout/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";

export default function ProjectDashboardDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [costCodes, setCostCodes] = useState([]);
  const [newCostCode, setNewCostCode] = useState("");
  const [scopeList, setScopeList] = useState([]);
  const [newScope, setNewScope] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [newTask, setNewTask] = useState({ name: "", start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Inline editing states for cost codes
  const [editingCostCode, setEditingCostCode] = useState(null);
  const [tempCostCode, setTempCostCode] = useState("");
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("costCodes");

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectData = await fetchDocById("managementProjects", projectId);
      if (projectData) {
        setProject(projectData);
        setCostCodes(projectData.costCodes || []);
        setScopeList(projectData.scopeOfWork || []);
        setSchedule(projectData.schedule || []);
      } else {
        setError("Project not found.");
      }
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Failed to load project. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // --- Cost Codes ---
  const handleAddCostCode = async () => {
    if (newCostCode.trim()) {
      const updated = [...costCodes, newCostCode.trim()];
      setCostCodes(updated);
      setNewCostCode("");
      await updateDocById("managementProjects", projectId, { costCodes: updated });
    }
  };
  const handleRemoveCostCode = async (idx) => {
    const updated = costCodes.filter((_, i) => i !== idx);
    setCostCodes(updated);
    await updateDocById("managementProjects", projectId, { costCodes: updated });
  };

  // Cost code inline editing handlers
  const handleEditCostCode = (idx, currentValue) => {
    setEditingCostCode(idx);
    setTempCostCode(currentValue);
  };

  const handleCostCodeChange = (e) => {
    setTempCostCode(e.target.value);
  };

  const handleSaveCostCode = async (idx) => {
    if (tempCostCode.trim()) {
      const updated = [...costCodes];
      updated[idx] = tempCostCode.trim();
      setCostCodes(updated);
      await updateDocById("managementProjects", projectId, { costCodes: updated });
      setEditingCostCode(null);
      setTempCostCode("");
    }
  };

  const handleCancelCostCodeEdit = () => {
    setEditingCostCode(null);
    setTempCostCode("");
  };

  const handleCostCodeKeyPress = (e, idx) => {
    if (e.key === 'Enter') {
      handleSaveCostCode(idx);
    } else if (e.key === 'Escape') {
      handleCancelCostCodeEdit();
    }
  };
  // --- Scope of Work ---
  const handleAddScope = async () => {
    if (newScope.trim()) {
      const updated = [...scopeList, newScope.trim()];
      setScopeList(updated);
      setNewScope("");
      await updateDocById("managementProjects", projectId, { scopeOfWork: updated });
    }
  };
  const handleRemoveScope = async (idx) => {
    const updated = scopeList.filter((_, i) => i !== idx);
    setScopeList(updated);
    await updateDocById("managementProjects", projectId, { scopeOfWork: updated });
  };
  // --- Schedule ---
  const handleAddTask = async () => {
    if (newTask.name.trim()) {
      const updated = [...schedule, { ...newTask }];
      setSchedule(updated);
      setNewTask({ name: "", start: "", end: "" });
      await updateDocById("managementProjects", projectId, { schedule: updated });
    }
  };
  const handleRemoveTask = async (idx) => {
    const updated = schedule.filter((_, i) => i !== idx);
    setSchedule(updated);
    await updateDocById("managementProjects", projectId, { schedule: updated });
  };

  // Direct field change handler for immediate updates
  const handleDirectFieldChange = async (fieldName, value) => {
    try {
      const updateData = {
        [fieldName]: value,
        updatedDate: new Date().toISOString()
      };
      
      await updateDocById("managementProjects", projectId, updateData);
      
      // Update local state optimistically
      setProject(prev => ({
        ...prev,
        [fieldName]: value,
        updatedDate: new Date().toISOString()
      }));
    } catch (err) {
      console.error(`Error updating ${fieldName}:`, err);
      setError(`Failed to update ${fieldName}. Please try again.`);
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "costCodes":
        return (
          <div className="page-card">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              padding: '0 0 8px 0', 
              borderBottom: '1px solid var(--color-border-color)',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'var(--color-primary-text)'
            }}>Cost Codes</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input
                value={newCostCode}
                onChange={e => setNewCostCode(e.target.value)}
                placeholder="Add cost code"
                style={{ 
                  flex: 1,
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              />
              <button className="classic-button" onClick={handleAddCostCode}>Add</button>
            </div>
            <table className="norskk-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Cost Code</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {costCodes.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
                      No cost codes yet.
                    </td>
                  </tr>
                ) : (
                  costCodes.map((c, i) => (
                    <tr key={i}>
                      <td>
                        {editingCostCode === i ? (
                          <input
                            value={tempCostCode}
                            onChange={handleCostCodeChange}
                            onKeyPress={(e) => handleCostCodeKeyPress(e, i)}
                            onBlur={() => handleSaveCostCode(i)}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              border: '2px inset var(--color-border-color)',
                              borderRadius: '0px',
                              fontSize: '14px',
                              fontFamily: 'inherit',
                              background: 'var(--color-card-background)',
                              color: 'var(--color-primary-text)'
                            }}
                          />
                        ) : (
                          <span>{c}</span>
                        )}
                      </td>
                      <td className="actions">
                        <div style={{ display: 'flex', gap: 4 }}>
                          {editingCostCode === i ? (
                            <>
                              <button 
                                className="classic-button" 
                                onClick={() => handleSaveCostCode(i)}
                                style={{ fontSize: '11px', padding: '2px 4px', minWidth: '40px' }}
                              >
                                Save
                              </button>
                              <button 
                                className="delete-item-button" 
                                onClick={handleCancelCostCodeEdit}
                                style={{ fontSize: '11px', padding: '2px 4px', minWidth: '40px' }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="classic-button" 
                                onClick={() => handleEditCostCode(i, c)}
                                style={{ fontSize: '11px', padding: '2px 4px', minWidth: '30px' }}
                              >
                                Edit
                              </button>
                              <button 
                                className="delete-item-button" 
                                onClick={() => handleRemoveCostCode(i)}
                                style={{ fontSize: '11px', padding: '2px 4px', minWidth: '40px' }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      
      case "scopeOfWork":
        return (
          <div className="page-card">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              padding: '0 0 8px 0', 
              borderBottom: '1px solid var(--color-border-color)',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'var(--color-primary-text)'
            }}>Scope of Work</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input
                value={newScope}
                onChange={e => setNewScope(e.target.value)}
                placeholder="Add scope of work"
                style={{ 
                  flex: 1,
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              />
              <button className="classic-button" onClick={handleAddScope}>Add</button>
            </div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {scopeList.length === 0 && <li style={{ color: '#888' }}>No scope of work yet.</li>}
              {scopeList.map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s}
                  <button className="delete-item-button" style={{ marginLeft: 6 }} onClick={() => handleRemoveScope(i)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        );
      
      case "schedule":
        return (
          <div className="page-card">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              padding: '0 0 8px 0', 
              borderBottom: '1px solid var(--color-border-color)',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'var(--color-primary-text)'
            }}>Schedule</h3>
            <table className="norskk-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedule.length === 0 && (
                  <tr><td colSpan={4} style={{ color: '#888', textAlign: 'center' }}>No schedule tasks yet.</td></tr>
                )}
                {schedule.map((task, i) => (
                  <tr key={i}>
                    <td>{task.name}</td>
                    <td>{task.start}</td>
                    <td>{task.end}</td>
                    <td className="actions">
                      <button className="delete-item-button" onClick={() => handleRemoveTask(i)}>Delete</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td><input value={newTask.name} onChange={e => setNewTask(t => ({ ...t, name: e.target.value }))} placeholder="Task name" style={{ width: '100%' }} /></td>
                  <td><input value={newTask.start} onChange={e => setNewTask(t => ({ ...t, start: e.target.value }))} placeholder="Start" style={{ width: '100%' }} /></td>
                  <td><input value={newTask.end} onChange={e => setNewTask(t => ({ ...t, end: e.target.value }))} placeholder="End" style={{ width: '100%' }} /></td>
                  <td><button className="classic-button" onClick={handleAddTask}>Add</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout title="Project Details">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Loading project...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Project Details">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px', margin: '1rem' }}>
          {error}
          <button 
            onClick={loadProject} 
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={project?.name ? `Project: ${project.name}` : "Project Details"}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: '100%' }}>
        {/* Left column: Project Details */}
        <div style={{ minWidth: 320, maxWidth: 400, flex: '0 0 360px' }}>
          {/* Project Details Card */}
          <div className="page-card">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              padding: '0 0 8px 0', 
              borderBottom: '1px solid var(--color-border-color)',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'var(--color-primary-text)'
            }}>Project Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px 12px', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold', textAlign: 'right' }}>Name:</label>
              <input
                type="text"
                value={project?.name || ""}
                onChange={(e) => handleDirectFieldChange('name', e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              />
              
              <label style={{ fontWeight: 'bold', textAlign: 'right' }}>Developer:</label>
              <input
                type="text"
                value={project?.developer || ""}
                onChange={(e) => handleDirectFieldChange('developer', e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              />
              
              <label style={{ fontWeight: 'bold', textAlign: 'right' }}>Owner:</label>
              <input
                type="text"
                value={project?.owner || ""}
                onChange={(e) => handleDirectFieldChange('owner', e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              />
              
              <label style={{ fontWeight: 'bold', textAlign: 'right' }}>Status:</label>
              <select
                value={project?.status || "Active"}
                onChange={(e) => handleDirectFieldChange('status', e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              
              <label style={{ fontWeight: 'bold', textAlign: 'right' }}>Start Date:</label>
              <input
                type="date"
                value={project?.startDate || ""}
                onChange={(e) => handleDirectFieldChange('startDate', e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              />
              
              <label style={{ fontWeight: 'bold', textAlign: 'right' }}>Address:</label>
              <input
                type="text"
                value={project?.address || ""}
                onChange={(e) => handleDirectFieldChange('address', e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '2px inset var(--color-border-color)',
                  borderRadius: '0px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'var(--color-card-background)',
                  color: 'var(--color-primary-text)'
                }}
              />
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className={`classic-button ${activeTab === 'costCodes' ? 'active' : ''}`}
              onClick={() => setActiveTab('costCodes')}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: activeTab === 'costCodes' ? 'var(--color-button-active-background, #e0e0e0)' : 'var(--color-button-background)',
                border: '2px outset var(--color-border-color)',
                borderRadius: '0px',
                fontSize: '14px',
                fontWeight: activeTab === 'costCodes' ? 'bold' : 'normal'
              }}
            >
              Cost Codes
            </button>
            <button 
              className={`classic-button ${activeTab === 'scopeOfWork' ? 'active' : ''}`}
              onClick={() => setActiveTab('scopeOfWork')}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: activeTab === 'scopeOfWork' ? 'var(--color-button-active-background, #e0e0e0)' : 'var(--color-button-background)',
                border: '2px outset var(--color-border-color)',
                borderRadius: '0px',
                fontSize: '14px',
                fontWeight: activeTab === 'scopeOfWork' ? 'bold' : 'normal'
              }}
            >
              Scope of Work
            </button>
            <button 
              className={`classic-button ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: activeTab === 'schedule' ? 'var(--color-button-active-background, #e0e0e0)' : 'var(--color-button-background)',
                border: '2px outset var(--color-border-color)',
                borderRadius: '0px',
                fontSize: '14px',
                fontWeight: activeTab === 'schedule' ? 'bold' : 'normal'
              }}
            >
              Schedule
            </button>
          </div>
        </div>
        
        {/* Right column: Dynamic content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
}
