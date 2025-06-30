import React, { useState } from "react";
import "./dispatch.css";
import Layout from "../../components/Layout";

const sampleProjects = [
  { id: "proj-1", name: "Downtown Office Complex", status: "Active", priority: "High", color: "#e74c3c" },
  { id: "proj-2", name: "Highway Bridge Repair", status: "Active", priority: "Critical", color: "#c0392b" },
  { id: "proj-3", name: "Residential Development", status: "Active", priority: "Medium", color: "#f39c12" },
];

const sampleCrew = [
  { id: "crew-1", name: "John Smith", role: "Foreman", status: "Available", skills: ["Leadership", "Safety"], rating: 4.8, avatar: "👷‍♂️" },
  { id: "crew-2", name: "Anna Lee", role: "Heavy Equipment Operator", status: "Available", skills: ["Excavator", "Bulldozer"], rating: 4.9, avatar: "👩‍🔧" },
  { id: "crew-3", name: "Mike Brown", role: "General Laborer", status: "Available", skills: ["Construction", "Cleanup"], rating: 4.5, avatar: "👨‍🔧" },
];

const sampleEquipment = [
  { id: "equip-1", name: "CAT 320 Excavator", type: "Heavy Equipment", status: "Available", location: "Yard A", icon: "🚜" },
  { id: "equip-2", name: "Ford F-350 Pickup", type: "Vehicle", status: "Available", location: "Office", icon: "🚛" },
  { id: "equip-3", name: "Concrete Mixer Truck", type: "Specialized", status: "In Use", location: "Site B", icon: "🚌" },
];

export default function DispatchPageFresh() {
  const [assignments, setAssignments] = useState({});
  const [crew, setCrew] = useState(sampleCrew);
  const [projects, setProjects] = useState(sampleProjects);
  const [equipment, setEquipment] = useState(sampleEquipment);
  const [selectedProject, setSelectedProject] = useState('proj-1');
  const [searchTerm, setSearchTerm] = useState('');

  // Add assignment function
  const addAssignment = (resourceId, resourceType) => {
    const selectedProjectData = projects.find(p => p.id === selectedProject);
    const newAssignment = {
      id: `assign-${Date.now()}`,
      resourceId,
      resourceType,
      projectId: selectedProject,
      projectName: selectedProjectData?.name || 'Unknown Project',
      date: new Date().toISOString().split('T')[0],
      status: 'Scheduled'
    };
    
    setAssignments(prev => ({
      ...prev,
      [newAssignment.id]: newAssignment
    }));

    // Update resource status
    if (resourceType === 'crew') {
      setCrew(prev => prev.map(c => 
        c.id === resourceId ? { ...c, status: 'Assigned' } : c
      ));
    } else {
      setEquipment(prev => prev.map(e => 
        e.id === resourceId ? { ...e, status: 'In Use' } : e
      ));
    }
  };

  return (
    <Layout title="Smart Dispatch & Scheduling">
      <div className="dispatch-container" style={{ padding: "20px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        <h1 style={{ color: "#1f2937", marginBottom: "20px", fontSize: "28px", fontWeight: "700" }}>🚀 Smart Dispatch & Scheduling</h1>
        
        <div className="dispatch-controls" style={{ display: "flex", gap: "20px", marginBottom: "30px", alignItems: "center", padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", minWidth: "250px" }}
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.priority})
              </option>
            ))}
          </select>
          
          <input 
            type="text"
            placeholder="Search crew..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "250px" }}
          />
        </div>

        <div className="crew-list" style={{ background: "white", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#374151", fontSize: "18px", fontWeight: "600" }}>Crew Members ({crew.length})</h3>
          {crew.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.role.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(member => (
            <div key={member.id} className="crew-card" style={{ display: "flex", alignItems: "center", gap: "15px", padding: "16px", marginBottom: "12px", background: "#f8fafc", border: "2px solid #f1f5f9", borderRadius: "12px", transition: "all 0.3s ease" }}>
              <span className="avatar" style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", background: "#e0e7ff", borderRadius: "12px" }}>{member.avatar}</span>
              <div className="crew-info" style={{ flex: 1 }}>
                <div className="name" style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px", fontSize: "16px" }}>{member.name}</div>
                <div className="role" style={{ color: "#6b7280", marginBottom: "6px", fontSize: "14px" }}>{member.role}</div>
                <div className="skills" style={{ color: "#374151", fontSize: "13px", marginBottom: "4px" }}>{member.skills.join(', ')}</div>
                <div className="rating" style={{ color: "#f59e0b", fontSize: "14px", fontWeight: "500" }}>⭐ {member.rating}</div>
              </div>
              <div className="status" style={{ padding: "6px 12px", background: "#d1fae5", color: "#065f46", borderRadius: "20px", fontSize: "12px", fontWeight: "500", textTransform: "uppercase" }}>{member.status}</div>
            </div>
          ))}
        </div>

        <div className="equipment-list" style={{ background: "white", borderRadius: "10px", padding: "20px", marginTop: "20px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#374151", fontSize: "18px", fontWeight: "600" }}>Available Equipment ({equipment.filter(e => e.status === 'Available').length})</h3>
          {equipment.filter(item => item.status === "Available").map(item => (
            <div key={item.id} className="equipment-card" style={{ display: "flex", alignItems: "center", gap: "15px", padding: "16px", marginBottom: "12px", background: "#f8fafc", border: "2px solid #f1f5f9", borderRadius: "12px", transition: "all 0.3s ease" }}>
              <span className="icon" style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", background: "#d1fae5", borderRadius: "12px" }}>{item.icon}</span>
              <div className="equipment-info" style={{ flex: 1 }}>
                <div className="name" style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px", fontSize: "16px" }}>{item.name}</div>
                <div className="type" style={{ color: "#6b7280", marginBottom: "6px", fontSize: "14px" }}>{item.type}</div>
                <div className="location" style={{ color: "#374151", fontSize: "13px" }}>📍 {item.location}</div>
              </div>
              <button 
                className="assign-btn"
                onClick={() => addAssignment(item.id, 'equipment')}
                style={{ background: "#10b981", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease" }}
              >
                Assign to Project
              </button>
            </div>
          ))}
        </div>

        <div className="assignments-section" style={{ background: "white", borderRadius: "10px", padding: "20px", marginTop: "20px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#374151", fontSize: "18px", fontWeight: "600" }}>Today's Assignments ({Object.keys(assignments).length})</h3>
          {Object.values(assignments).map(assignment => (
            <div key={assignment.id} className="assignment-card" style={{ display: "flex", alignItems: "center", gap: "15px", padding: "16px", marginBottom: "12px", background: "#fef3c7", border: "2px solid #fbbf24", borderRadius: "12px" }}>
              <div className="assignment-info" style={{ flex: 1 }}>
                <div className="resource-name" style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px", fontSize: "16px" }}>
                  {assignment.resourceType === 'crew' 
                    ? crew.find(c => c.id === assignment.resourceId)?.name 
                    : equipment.find(e => e.id === assignment.resourceId)?.name
                  }
                </div>
                <div className="project-name" style={{ color: "#6b7280", marginBottom: "4px", fontSize: "14px" }}>{assignment.projectName}</div>
                <div className="assignment-type" style={{ color: "#d97706", fontSize: "12px", fontWeight: "500", textTransform: "uppercase", background: "#fed7aa", padding: "2px 8px", borderRadius: "12px", display: "inline-block" }}>{assignment.resourceType}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
