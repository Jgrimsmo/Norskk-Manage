import React, { useState, useEffect, useCallback } from "react";
import "../../styles/tables.css";
import Layout from "../../components/layout/Layout";
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
  const [editingCell, setEditingCell] = useState(null); // { equipmentId, field }
  const [editValue, setEditValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null); // For equipment details view

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

  // Memoize grouped equipment by type
  const groupedEquipment = React.useMemo(() => {
    const equipmentToGroup = typeFilter ? filteredEquipment : equipment;
    return equipmentToGroup.reduce((acc, item) => {
      const type = item.type || 'Other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});
  }, [equipment, typeFilter, filteredEquipment]);

  // eslint-disable-next-line no-unused-vars
  const handleTypeFilterSelect = (type) => {
    setTypeFilter(type);
    setShowTypeFilter(false);
  };

  // Equipment details view component
  const EquipmentDetailsView = ({ equipment, onBack }) => {
    return (
      <div className="table-section">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            className="classic-button" 
            onClick={onBack}
            style={{ marginRight: '16px' }}
          >
            ← Back to Equipment List
          </button>
          <h2 style={{ margin: 0 }}>{equipment.name}</h2>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {/* Basic Information Card */}
          <div style={{ 
            border: '2px inset #c0c0c0', 
            padding: '16px', 
            backgroundColor: '#f5f5f5' 
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #999', paddingBottom: '8px' }}>
              Basic Information
            </h3>
            <div style={{ lineHeight: '1.6' }}>
              <div><strong>Name:</strong> {equipment.name}</div>
              <div><strong>Type:</strong> {equipment.type}</div>
              <div><strong>Status:</strong> {equipment.status || 'Available'}</div>
              <div><strong>Added:</strong> {equipment.createdAt ? new Date(equipment.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          {/* Equipment Hours Card */}
          <div style={{ 
            border: '2px inset #c0c0c0', 
            padding: '16px', 
            backgroundColor: '#f5f5f5' 
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #999', paddingBottom: '8px' }}>
              Equipment Hours
            </h3>
            <div style={{ lineHeight: '1.6' }}>
              <div><strong>Total Hours:</strong> {equipment.totalHours || '0'} hrs</div>
              <div><strong>This Month:</strong> {equipment.monthlyHours || '0'} hrs</div>
              <div><strong>Last Used:</strong> {equipment.lastUsed || 'Never'}</div>
              <div><strong>Average Daily:</strong> {equipment.avgDailyHours || '0'} hrs</div>
            </div>
          </div>

          {/* Maintenance & Inspections Card */}
          <div style={{ 
            border: '2px inset #c0c0c0', 
            padding: '16px', 
            backgroundColor: '#f5f5f5' 
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #999', paddingBottom: '8px' }}>
              Maintenance & Inspections
            </h3>
            <div style={{ lineHeight: '1.6' }}>
              <div><strong>Last Service:</strong> {equipment.lastService || 'Never'}</div>
              <div><strong>Next Service Due:</strong> {equipment.nextService || 'TBD'}</div>
              <div><strong>Last Inspection:</strong> {equipment.lastInspection || 'Never'}</div>
              <div><strong>Inspection Status:</strong> 
                <span style={{ 
                  color: equipment.inspectionStatus === 'Passed' ? '#28a745' : 
                        equipment.inspectionStatus === 'Failed' ? '#dc3545' : '#ffc107',
                  fontWeight: 'bold',
                  marginLeft: '8px'
                }}>
                  {equipment.inspectionStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Issues & Notes Card */}
          <div style={{ 
            border: '2px inset #c0c0c0', 
            padding: '16px', 
            backgroundColor: '#f5f5f5' 
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #999', paddingBottom: '8px' }}>
              Issues & Notes
            </h3>
            <div style={{ lineHeight: '1.6' }}>
              <div><strong>Active Issues:</strong> {equipment.activeIssues || '0'}</div>
              <div><strong>Priority Issues:</strong> {equipment.priorityIssues || '0'}</div>
              <div style={{ marginTop: '12px' }}>
                <strong>Notes:</strong>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  backgroundColor: 'white', 
                  border: '1px inset #c0c0c0',
                  minHeight: '60px',
                  fontSize: '14px'
                }}>
                  {equipment.notes || 'No notes available.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button 
            className="classic-button"
            onClick={() => handleEdit(equipment.id, 'name', equipment.name)}
            style={{ backgroundColor: '#007bff', color: 'white' }}
          >
            Edit Equipment
          </button>
          <button 
            className="classic-button"
            style={{ backgroundColor: '#28a745', color: 'white' }}
          >
            Add Inspection
          </button>
          <button 
            className="classic-button"
            style={{ backgroundColor: '#ffc107', color: '#212529' }}
          >
            Log Service
          </button>
          <button 
            className="classic-button"
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            Report Issue
          </button>
        </div>
      </div>
    );
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
      {selectedEquipment ? (
        <EquipmentDetailsView 
          equipment={selectedEquipment} 
          onBack={() => setSelectedEquipment(null)} 
        />
      ) : (
        <>
          <div className="table-section">
            <table className="norskk-table">
              <colgroup>
                <col style={{ width: '70%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                {Object.entries(groupedEquipment).length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                      {typeFilter 
                        ? `No equipment found for type "${typeFilter}". Try selecting a different type or clear the filter.`
                        : "No equipment found. Click \"Add Equipment\" to get started."
                      }
                    </td>
                  </tr>
                ) : (
                  Object.entries(groupedEquipment).map(([type, items]) => (
                    <React.Fragment key={type}>
                      <tr>
                        <td 
                          colSpan="2"
                          style={{ 
                            fontWeight: 'bold', 
                            backgroundColor: '#c0b8a8',
                            color: '#222',
                            textAlign: 'left',
                            padding: '4px 8px',
                            fontSize: '14px'
                          }}
                        >
                          {type}
                        </td>
                      </tr>
                      {items.map(eq => (
                        <tr key={eq.id}>
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
                                  style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', flex: 1 }}
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
                              eq.name
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="classic-button"
                                onClick={() => setSelectedEquipment(eq)}
                                title="View equipment details"
                                style={{ backgroundColor: '#007bff', color: 'white' }}
                              >
                                View
                              </button>
                              <button
                                className="classic-button"
                                onClick={() => handleEdit(eq.id, 'name', eq.name)}
                                title="Edit equipment name"
                              >
                                Edit
                              </button>
                              <button
                                className="classic-button"
                                onClick={() => handleDelete(eq.id)}
                                title="Delete this equipment"
                                style={{ backgroundColor: '#dc3545', color: 'white' }}
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
            + Add Equipment
          </button>
          <AddEquipmentModal show={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        </>
      )}
    </Layout>
  );
}
