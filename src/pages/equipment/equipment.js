import React, { useState, useEffect, useCallback } from "react";
import "../../styles/tables.css";
import Layout from "../../components/Layout";
import "../ProjectDashboard/AddProjectModal.css";
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from "../../lib/utils/firebaseHelpers";

// Type options for equipment
const equipmentTypes = ["Excavator", "Skid Steer", "Attachment", "Compactor", "Misc"];

// Fallback data for initial seeding
const initialEquipment = [
  { name: "CAT 320", type: "Excavator" },
  { name: "Bobcat S650", type: "Skid Steer" },
  { name: "Hydraulic Hammer", type: "Attachment" },
  { name: "Plate Compactor", type: "Compactor" }
];

function AddEquipmentModal({ show, onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", type: "Excavator" });
  if (!show) return null;
  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()}>
        <h2>Add Equipment</h2>
        <form className="add-project-form" onSubmit={e => { e.preventDefault(); if (form.name && form.type) { onAdd(form); setForm({ name: "", type: "Excavator" }); }}}>
          <select
            name="type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
          >
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            name="name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Equipment Name"
          />
          <div className="modal-actions">
            <button className="classic-button" type="submit">Add</button>
            <button className="classic-button" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { equipmentId, field }
  const [editValue, setEditValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const seedInitialEquipment = useCallback(async () => {
    try {
      const promises = initialEquipment.map(item => addToCollection("equipment", item));
      await Promise.all(promises);
      
      // Reload equipment after seeding
      const equipmentData = await fetchCollection("equipment");
      setEquipment(equipmentData);
    } catch (err) {
      console.error("Error seeding equipment:", err);
      setError("Failed to initialize equipment data.");
    }
  }, []);

  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const equipmentData = await fetchCollection("equipment");
      
      // If no equipment exists, seed with initial data
      if (equipmentData.length === 0) {
        console.log("No equipment found, seeding with initial data...");
        await seedInitialEquipment();
        return;
      }
      
      setEquipment(equipmentData);
    } catch (err) {
      console.error("Error loading equipment:", err);
      setError("Failed to load equipment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [seedInitialEquipment]);

  // Load equipment from Firebase on component mount
  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTypeFilter && !event.target.closest('th')) {
        setShowTypeFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTypeFilter]);

  const handleAdd = async (form) => {
    try {
      const newEquipmentId = await addToCollection("equipment", form);
      const newEquipment = { id: newEquipmentId, ...form };
      setEquipment(prev => [...prev, newEquipment]);
      setShowAdd(false);
    } catch (err) {
      console.error("Error adding equipment:", err);
      alert("Failed to add equipment. Please try again.");
    }
  };

  const handleDelete = async (equipmentId) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) {
      return;
    }
    
    try {
      await deleteDocById("equipment", equipmentId);
      setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
    } catch (err) {
      console.error("Error deleting equipment:", err);
      alert("Failed to delete equipment. Please try again.");
    }
  };

  const handleEdit = (equipmentId, field, currentValue) => {
    setEditingCell({ equipmentId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    try {
      const { equipmentId, field } = editingCell;
      await updateDocById("equipment", equipmentId, { [field]: editValue });
      setEquipment(prev => prev.map(eq => 
        eq.id === equipmentId ? { ...eq, [field]: editValue } : eq
      ));
      setEditingCell(null);
      setEditValue('');
    } catch (err) {
      console.error("Error updating equipment:", err);
      alert("Failed to update equipment. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Filter equipment based on type filter
  const filteredEquipment = equipment.filter(eq => {
    if (!typeFilter) return true;
    return eq.type === typeFilter;
  });

  const handleTypeFilterSelect = (type) => {
    setTypeFilter(type);
    setShowTypeFilter(false);
  };

  if (loading) {
    return (
      <Layout title="Equipment">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading equipment...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Equipment">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          {error}
          <br />
          <button className="classic-button" onClick={loadEquipment} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Equipment">
      <div className="table-section">
        <table className="norskk-table">
          <thead>
            <tr>
              <th style={{ position: 'relative' }}>
                Type
                <span 
                  className="filter-icon" 
                  onClick={() => setShowTypeFilter(!showTypeFilter)}
                  style={{ 
                    marginLeft: '8px', 
                    cursor: 'pointer', 
                    fontSize: '12px',
                    color: typeFilter ? '#007bff' : '#666'
                  }}
                  title="Filter by Type"
                >
                  ▼
                </span>
                {showTypeFilter && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '150px'
                    }}
                  >
                    <div 
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: !typeFilter ? '#f0f0f0' : 'white'
                      }}
                      onClick={() => handleTypeFilterSelect('')}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = !typeFilter ? '#f0f0f0' : 'white'}
                    >
                      All Types
                    </div>
                    {equipmentTypes.map(type => (
                      <div 
                        key={type}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: typeFilter === type ? '#f0f0f0' : 'white'
                        }}
                        onClick={() => handleTypeFilterSelect(type)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = typeFilter === type ? '#f0f0f0' : 'white'}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                  {typeFilter 
                    ? `No equipment found for type "${typeFilter}". Try selecting a different type or clear the filter.`
                    : "No equipment found. Click \"Add Equipment\" to get started."
                  }
                </td>
              </tr>
            ) : (
              filteredEquipment.map(eq => (
                <tr key={eq.id}>
                  <td>
                    {editingCell?.equipmentId === eq.id && editingCell?.field === 'type' ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                        >
                          {equipmentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
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
                        onClick={() => handleEdit(eq.id, 'type', eq.type)}
                        style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Click to edit"
                      >
                        {eq.type}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingCell?.equipmentId === eq.id && editingCell?.field === 'name' ? (
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
                        onClick={() => handleEdit(eq.id, 'name', eq.name)}
                        style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Click to edit"
                      >
                        {eq.name}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="classic-button"
                      onClick={() => handleDelete(eq.id)}
                      title="Delete this equipment"
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
        + Add Equipment
      </button>
      <AddEquipmentModal show={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </Layout>
  );
}
