// src/pages/ProjectDashboard.js

import React, { useState, useEffect } from "react";
import { fetchCollection, addToCollection, deleteDocById, updateDocById } from "../../Utils/firebaseHelpers";
import { useNavigate } from "react-router-dom";
import "../../styles/tables.css";
import "../../styles/page.css";
import "./AddProjectModal.css";
import Layout from "../../components/Layout";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    owner: "",
    number: "",
    address: "",
    status: "Active",
    startDate: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [editingProjectNumber, setEditingProjectNumber] = useState(null);
  const [tempProjectNumber, setTempProjectNumber] = useState("");
  const [editingStartDate, setEditingStartDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);
  const [tempAddress, setTempAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await fetchCollection("managementProjects");
      setProjects(projects);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      setUpdatingStatus(projectId);
      await updateDocById("managementProjects", projectId, {
        status: newStatus,
        updatedDate: new Date().toISOString(),
      });
      
      // Update the project in the local state
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, status: newStatus, updatedDate: new Date().toISOString() } 
          : p
      ));
    } catch (err) {
      console.error("Error updating project status:", err);
      setError("Failed to update project status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleProjectNumberClick = (projectId, currentNumber) => {
    setEditingProjectNumber(projectId);
    setTempProjectNumber(currentNumber || "");
  };

  const handleProjectNumberChange = (e) => {
    setTempProjectNumber(e.target.value);
  };

  const handleProjectNumberSave = async (projectId) => {
    try {
      await updateDocById("managementProjects", projectId, {
        number: tempProjectNumber,
        updatedDate: new Date().toISOString(),
      });
      
      // Update the project in the local state
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, number: tempProjectNumber, updatedDate: new Date().toISOString() } 
          : p
      ));
      
      setEditingProjectNumber(null);
      setTempProjectNumber("");
    } catch (err) {
      console.error("Error updating project number:", err);
      setError("Failed to update project number. Please try again.");
    }
  };

  const handleProjectNumberCancel = () => {
    setEditingProjectNumber(null);
    setTempProjectNumber("");
  };

  const handleProjectNumberKeyPress = (e, projectId) => {
    if (e.key === 'Enter') {
      handleProjectNumberSave(projectId);
    } else if (e.key === 'Escape') {
      handleProjectNumberCancel();
    }
  };

  // Start Date inline editing handlers
  const handleStartDateClick = (projectId, currentStartDate) => {
    setEditingStartDate(projectId);
    setTempStartDate(currentStartDate || "");
  };

  const handleStartDateChange = (e) => {
    setTempStartDate(e.target.value);
  };

  const handleStartDateSave = async (projectId) => {
    try {
      await updateDocById("managementProjects", projectId, {
        startDate: tempStartDate,
        updatedDate: new Date().toISOString()
      });
      
      // Update local state optimistically
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === projectId 
          ? { ...p, startDate: tempStartDate, updatedDate: new Date().toISOString() } 
          : p
        )
      );
      setEditingStartDate(null);
      setTempStartDate("");
    } catch (err) {
      console.error("Error updating start date:", err);
      setError("Failed to update start date. Please try again.");
    }
  };

  const handleStartDateCancel = () => {
    setEditingStartDate(null);
    setTempStartDate("");
  };

  const handleStartDateKeyPress = (e, projectId) => {
    if (e.key === 'Enter') {
      handleStartDateSave(projectId);
    } else if (e.key === 'Escape') {
      handleStartDateCancel();
    }
  };

  // Address inline editing handlers
  const handleAddressClick = (projectId, currentAddress) => {
    setEditingAddress(projectId);
    setTempAddress(currentAddress || "");
  };

  const handleAddressChange = (e) => {
    setTempAddress(e.target.value);
  };

  const handleAddressSave = async (projectId) => {
    try {
      await updateDocById("managementProjects", projectId, {
        address: tempAddress,
        updatedDate: new Date().toISOString()
      });
      
      // Update local state optimistically
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === projectId 
          ? { ...p, address: tempAddress, updatedDate: new Date().toISOString() } 
          : p
        )
      );
      setEditingAddress(null);
      setTempAddress("");
    } catch (err) {
      console.error("Error updating address:", err);
      setError("Failed to update address. Please try again.");
    }
  };

  const handleAddressCancel = () => {
    setEditingAddress(null);
    setTempAddress("");
  };

  const handleAddressKeyPress = (e, projectId) => {
    if (e.key === 'Enter') {
      handleAddressSave(projectId);
    } else if (e.key === 'Escape') {
      handleAddressCancel();
    }
  };

  const handleAddProject = async () => {
    if (form.name.trim()) {
      await addToCollection("managementProjects", form);
      setForm({
        name: "",
        owner: "",
        number: "",
        address: "",
        status: "Active",
        startDate: "",
      });
      setShowModal(false);
      loadProjects();
    }
  };
  return (
    <Layout title="Project Dashboard">
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Loading projects...
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px', margin: '1rem 0' }}>
          {error}
          <button 
            onClick={loadProjects} 
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}      {!loading && !error && (
        <>
          <div className="table-section">
        <table className="norskk-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{width: '180px'}}>Name</th>
              <th style={{width: '120px'}}>Owner</th>
              <th style={{width: '120px'}}>Project #</th>
              <th style={{width: '100px'}}>Status</th>
              <th style={{width: '120px'}}>Start Date</th>
              <th style={{width: '160px'}}>Address</th>
              <th style={{width: '120px'}}>Actions</th>
            </tr>
          </thead>          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                  No projects found. Click 'Add Project' to create your first project.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="table-row">
                  <td>{p.name}</td>
                  <td>{p.owner}</td>
                  <td>
                    {editingProjectNumber === p.id ? (
                      <input
                        value={tempProjectNumber}
                        onChange={handleProjectNumberChange}
                        onKeyPress={(e) => handleProjectNumberKeyPress(e, p.id)}
                        onBlur={() => handleProjectNumberSave(p.id)}
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
                      <span
                        onClick={() => handleProjectNumberClick(p.id, p.number)}
                        style={{
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'block',
                          borderRadius: '0px',
                          minHeight: '20px'
                        }}
                        title="Click to edit project number"
                      >
                        {p.number || <em style={{ color: 'var(--color-secondary-text)' }}>Click to add</em>}
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      value={p.status || "Active"}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      disabled={updatingStatus === p.id}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        border: '2px inset var(--color-border-color)',
                        borderRadius: '0px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: 'var(--color-card-background)',
                        color: 'var(--color-primary-text)',
                        cursor: updatingStatus === p.id ? 'wait' : 'pointer'
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {editingStartDate === p.id ? (
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={handleStartDateChange}
                        onKeyPress={(e) => handleStartDateKeyPress(e, p.id)}
                        onBlur={() => handleStartDateSave(p.id)}
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
                      <span
                        onClick={() => handleStartDateClick(p.id, p.startDate)}
                        style={{
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'block',
                          borderRadius: '0px',
                          minHeight: '20px'
                        }}
                        title="Click to edit start date"
                      >
                        {p.startDate || <em style={{ color: 'var(--color-secondary-text)' }}>Click to add</em>}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingAddress === p.id ? (
                      <input
                        type="text"
                        value={tempAddress}
                        onChange={handleAddressChange}
                        onKeyPress={(e) => handleAddressKeyPress(e, p.id)}
                        onBlur={() => handleAddressSave(p.id)}
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
                      <span
                        onClick={() => handleAddressClick(p.id, p.address)}
                        style={{
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'block',
                          borderRadius: '0px',
                          minHeight: '20px'
                        }}
                        title="Click to edit address"
                      >
                        {p.address || <em style={{ color: 'var(--color-secondary-text)' }}>Click to add</em>}
                      </span>
                    )}
                  </td>
                  <td className="actions">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="classic-button" onClick={() => navigate(`/project-dashboard/${p.id}`)}>View</button>                      <button
                        className="delete-item-button"
                        onClick={async () => {
                          if (window.confirm(`Delete project '${p.name}'? This cannot be undone.`)) {
                            await deleteDocById("managementProjects", p.id);
                            loadProjects();
                          }
                        }}
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
      </div>      <button className="classic-button add-item-button" style={{ marginTop: 16, alignSelf: 'flex-start' }} onClick={() => setShowModal(true)}>
        Add Project
      </button>
        </>
      )}
      {showModal && (
        <div className="add-project-modal-bg" onClick={() => setShowModal(false)}>
          <div className="add-project-modal" onClick={e => e.stopPropagation()}>
            <h2>Add Project</h2>
            <form className="add-project-form" onSubmit={e => { e.preventDefault(); handleAddProject(); }}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Project Name" />
              <input name="owner" value={form.owner} onChange={handleChange} placeholder="Owner" />
              <input name="number" value={form.number} onChange={handleChange} placeholder="Project #" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
              <input name="startDate" value={form.startDate} onChange={handleChange} placeholder="Start Date" />
              <div className="modal-actions">
                <button className="classic-button" type="submit">Add</button>
                <button className="classic-button" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
