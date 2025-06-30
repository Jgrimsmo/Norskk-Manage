import React, { useState } from "react";
import "../../styles/tables.css";
import Layout from "../../components/Layout";
import "../Project Dashboard/AddProjectModal.css";

const initialEquipment = [
  { id: 1, name: "Excavator", type: "Heavy", status: "Available" },
  { id: 2, name: "Bulldozer", type: "Heavy", status: "In Use" },
  { id: 3, name: "Pickup Truck", type: "Vehicle", status: "Available" },
  { id: 4, name: "Concrete Mixer", type: "Tool", status: "Maintenance" }
];

function AddEquipmentModal({ show, onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", type: "", status: "Available" });
  if (!show) return null;
  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()}>
        <h2>Add Equipment</h2>
        <form className="add-project-form" onSubmit={e => { e.preventDefault(); if (form.name && form.type) { onAdd(form); setForm({ name: "", type: "", status: "Available" }); }}}>
          <input
            name="name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Name"
          />
          <input
            name="type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            placeholder="Type"
          />
          <select
            name="status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          >
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
          </select>
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
  const [equipment, setEquipment] = useState(initialEquipment);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (form) => {
    setEquipment(eqs => [
      ...eqs,
      { id: Date.now(), ...form }
    ]);
    setShowAdd(false);
  };

  return (
    <Layout title="Equipment">
      <div className="table-section">
        <table className="norskk-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(eq => (
              <tr key={eq.id}>
                <td>{eq.name}</td>
                <td>{eq.type}</td>
                <td>{eq.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>      <button
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
