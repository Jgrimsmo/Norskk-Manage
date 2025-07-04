import React, { useState, useEffect, useCallback } from "react";
import "../../styles/tables.css";
import Layout from "../../components/layout/Layout";
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from "../../lib/utils/firebaseHelpers";

// Predefined roles for dropdown
const CREW_ROLES = [
  "Foreman",
  "Operator",
  "Laborer", 
  "Director",
  "Accounting",
  "Project Manager",
  "Subcontractor"
];

// Fallback data for initial seeding
const initialCrew = [
  { name: "John Smith", role: "Foreman", phone: "555-0123" },
  { name: "Anna Lee", role: "Operator", phone: "555-0456" },
  { name: "Mike Brown", role: "Laborer", phone: "555-0789" }
];

function AddCrewModal({ show, onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", role: "", phone: "" });
  if (!show) return null;
  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()}>
        <h2>Add Crew Member</h2>
        <form className="add-project-form" onSubmit={e => { e.preventDefault(); if (form.name && form.role) { onAdd(form); setForm({ name: "", role: "", phone: "" }); }}}>
          <input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
          <select 
            name="role" 
            value={form.role} 
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #ccc', 
              borderRadius: '4px', 
              fontSize: '14px', 
              backgroundColor: 'white',
              marginTop: '8px',
              marginBottom: '8px',
              width: '100%',
              boxSizing: 'border-box',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 5\'><path fill=\'%23666\' d=\'M2 0L0 2h4zm0 5L0 3h4z\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '12px',
              paddingRight: '30px'
            }}
          >
            <option value="">Select Role</option>
            {CREW_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <input name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone Number" />
          <div className="modal-actions">
            <button className="classic-button" type="submit">Add</button>
            <button className="classic-button" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCrewModal({ show, member, editForm, setEditForm, onSave, onCancel }) {
  if (!show || !member) return null;
  
  return (
    <div className="add-project-modal-bg" onClick={onCancel}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()}>
        <h2>Edit Crew Member</h2>
        <form className="add-project-form" onSubmit={e => { e.preventDefault(); onSave(); }}>
          <input 
            name="name" 
            value={editForm.name} 
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} 
            placeholder="Name" 
          />
          <select 
            name="role" 
            value={editForm.role} 
            onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #ccc', 
              borderRadius: '4px', 
              fontSize: '14px', 
              backgroundColor: 'white',
              marginTop: '8px',
              marginBottom: '8px',
              width: '100%',
              boxSizing: 'border-box',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 5\'><path fill=\'%23666\' d=\'M2 0L0 2h4zm0 5L0 3h4z\'/></svg>")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '12px',
              paddingRight: '30px'
            }}
          >
            <option value="">Select Role</option>
            {CREW_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <input 
            name="phone" 
            value={editForm.phone} 
            onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} 
            placeholder="Phone Number" 
          />
          <div className="modal-actions">
            <button className="classic-button" type="submit">Save Changes</button>
            <button className="classic-button" type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CrewPage() {
  const [crew, setCrew] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMember, setEditingMember] = useState(null); // { crewId, name, role, phone }
  const [editForm, setEditForm] = useState({ name: '', role: '', phone: '' });
  
  // Group crew members by role
  const groupedCrew = crew.reduce((groups, member) => {
    const role = member.role || 'Unassigned';
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(member);
    return groups;
  }, {});

  // Load crew from Firebase on component mount
  const loadCrew = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const crewData = await fetchCollection("crew");
      
      // If no crew exists, seed with initial data
      if (crewData.length === 0) {
        console.log("No crew found, seeding with initial data...");
        await seedInitialCrew();
        return;
      }
      
      setCrew(crewData);
    } catch (err) {
      console.error("Error loading crew:", err);
      setError("Failed to load crew. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCrew();
  }, [loadCrew]);

  const seedInitialCrew = async () => {
    try {
      const promises = initialCrew.map(member => addToCollection("crew", member));
      await Promise.all(promises);
      
      // Reload crew after seeding
      const crewData = await fetchCollection("crew");
      setCrew(crewData);
    } catch (err) {
      console.error("Error seeding crew:", err);
      setError("Failed to initialize crew data.");
    }
  };

  const handleAdd = async (form) => {
    try {
      const newCrewId = await addToCollection("crew", form);
      const newCrewMember = { id: newCrewId, ...form };
      setCrew(prev => [...prev, newCrewMember]);
      setShowAdd(false);
    } catch (err) {
      console.error("Error adding crew member:", err);
      alert("Failed to add crew member. Please try again.");
    }
  };

  const handleDelete = async (crewId) => {
    if (!window.confirm("Are you sure you want to delete this crew member?")) {
      return;
    }
    
    try {
      await deleteDocById("crew", crewId);
      setCrew(prev => prev.filter(member => member.id !== crewId));
    } catch (err) {
      console.error("Error deleting crew member:", err);
      alert("Failed to delete crew member. Please try again.");
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name || '',
      role: member.role || '',
      phone: member.phone || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    
    try {
      await updateDocById("crew", editingMember.id, editForm);
      setCrew(prev => prev.map(member => 
        member.id === editingMember.id ? { ...member, ...editForm } : member
      ));
      setEditingMember(null);
      setEditForm({ name: '', role: '', phone: '' });
    } catch (err) {
      console.error("Error updating crew member:", err);
      alert("Failed to update crew member. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({ name: '', role: '', phone: '' });
  };

  if (loading) {
    return (
      <Layout title="Crew">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading crew members...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Crew">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          {error}
          <br />
          <button className="classic-button" onClick={loadCrew} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Crew">
      <div className="table-section">
        <table className="norskk-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crew.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                  No crew members found. Click "Add Crew Member" to get started.
                </td>
              </tr>
            ) : (
              Object.entries(groupedCrew).map(([role, members]) => (
                <React.Fragment key={role}>
                  {/* Role Header Row */}
                  <tr style={{ backgroundColor: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
                    <td colSpan="4" style={{ 
                      fontWeight: 'bold', 
                      fontSize: '16px', 
                      padding: '12px 8px',
                      color: '#495057',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      {role} ({members.length})
                    </td>
                  </tr>
                  {/* Crew Members for this Role */}
                  {members.map(member => (
                    <tr key={member.id} style={{ backgroundColor: '#fdfdfd' }}>
                      <td style={{ paddingLeft: '20px' }}>
                        {member.name}
                      </td>
                      <td>
                        {member.role}
                      </td>
                      <td>
                        {member.phone || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="classic-button"
                            onClick={() => handleEdit(member)}
                            style={{ backgroundColor: '#007bff', color: 'white', fontSize: '12px', padding: '4px 8px' }}
                          >
                            Edit
                          </button>
                          <button
                            className="classic-button"
                            onClick={() => handleDelete(member.id)}
                            style={{ backgroundColor: '#dc3545', color: 'white', fontSize: '12px', padding: '4px 8px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button
        className="classic-button add-item-button"
        style={{ marginTop: 16 }}
        onClick={() => setShowAdd(true)}
      >
        + Add Crew Member
      </button>
      <AddCrewModal show={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      <EditCrewModal 
        show={!!editingMember} 
        member={editingMember}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </Layout>
  );
}
