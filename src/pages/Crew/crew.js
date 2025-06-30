import React, { useState } from "react";
import "../../styles/tables.css";
import Layout from "../../components/Layout";

const initialCrew = [
  { id: 1, name: "John Smith", role: "Foreman", status: "Active" },
  { id: 2, name: "Anna Lee", role: "Operator", status: "Active" },
  { id: 3, name: "Mike Brown", role: "Laborer", status: "Inactive" }
];

function AddCrewModal({ show, onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", role: "", status: "Active" });
  if (!show) return null;
  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()}>
        <h2>Add Crew Member</h2>
        <form className="add-project-form" onSubmit={e => { e.preventDefault(); if (form.name && form.role) { onAdd(form); setForm({ name: "", role: "", status: "Active" }); }}}>
          <input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" />
          <input name="role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Role" />
          <select name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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

export default function CrewPage() {
  const [crew, setCrew] = useState(initialCrew);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (form) => {
    setCrew(c => [
      ...c,
      { id: Date.now(), ...form }
    ]);
    setShowAdd(false);
  };

  return (
    <Layout title="Crew">
      <div className="table-section">
        <table className="norskk-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {crew.map(member => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{member.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>      <button
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
