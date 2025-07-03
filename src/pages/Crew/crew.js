import React, { useState, useEffect } from "react";
import "../../styles/tables.css";
import Layout from "../../components/Layout";
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from "../../lib/utils/firebaseHelpers";

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
          <input name="role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Role" />
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

export default function CrewPage() {
  const [crew, setCrew] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { crewId, field }
  const [editValue, setEditValue] = useState('');

  // Load crew from Firebase on component mount
  useEffect(() => {
    loadCrew();
  }, []);

  const loadCrew = async () => {
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
  };

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

  const handleEdit = (crewId, field, currentValue) => {
    setEditingCell({ crewId, field });
    setEditValue(currentValue || '');
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    try {
      const { crewId, field } = editingCell;
      await updateDocById("crew", crewId, { [field]: editValue });
      setCrew(prev => prev.map(member => 
        member.id === crewId ? { ...member, [field]: editValue } : member
      ));
      setEditingCell(null);
      setEditValue('');
    } catch (err) {
      console.error("Error updating crew member:", err);
      alert("Failed to update crew member. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
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
              crew.map(member => (
                <tr key={member.id}>
                  <td>
                    {editingCell?.crewId === member.id && editingCell?.field === 'name' ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                        />
                        <button
                          onClick={handleSaveEdit}
                          style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleEdit(member.id, 'name', member.name)}
                        style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Click to edit"
                      >
                        {member.name}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingCell?.crewId === member.id && editingCell?.field === 'role' ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                        />
                        <button
                          onClick={handleSaveEdit}
                          style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleEdit(member.id, 'role', member.role)}
                        style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Click to edit"
                      >
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingCell?.crewId === member.id && editingCell?.field === 'phone' ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                          placeholder="Phone Number"
                        />
                        <button
                          onClick={handleSaveEdit}
                          style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleEdit(member.id, 'phone', member.phone)}
                        style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Click to edit"
                      >
                        {member.phone || '-'}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="classic-button"
                      onClick={() => handleDelete(member.id)}
                      style={{ backgroundColor: '#dc3545', color: 'white', fontSize: '12px', padding: '4px 8px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
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
    </Layout>
  );
}
