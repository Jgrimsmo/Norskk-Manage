import React, { useState, useEffect } from "react";
import "./dispatch.css";
import Layout from "../../components/Layout";
import { useProjectManagement } from "../../hooks/useProjectManagement";
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from "../../lib/utils/firebaseHelpers";

export default function DispatchPageFresh() {
  const [assignments, setAssignments] = useState({});
  const [crew, setCrew] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the project management hook
  const { projects, loading: projectsLoading } = useProjectManagement();

  // Load crew and equipment data on component mount
  useEffect(() => {
    loadDispatchData();
  }, []);

  // Set selected project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const loadDispatchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load crew and equipment data
      const [crewData, equipmentData, assignmentsData] = await Promise.all([
        loadCrewData(),
        loadEquipmentData(),
        fetchCollection("assignments")
      ]);

      setCrew(crewData);
      setEquipment(equipmentData);
      
      // Convert assignments array to object for easier lookup
      const assignmentsObj = {};
      assignmentsData.forEach(assignment => {
        assignmentsObj[assignment.id] = assignment;
      });
      setAssignments(assignmentsObj);

    } catch (err) {
      console.error("Error loading dispatch data:", err);
      setError("Failed to load dispatch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCrewData = async () => {
    try {
      const crewData = await fetchCollection("crew");
      // Use existing crew data from the Crew page
      return crewData.map(member => ({
        ...member,
        status: member.status || 'Available', // Add status if not present
        avatar: "👷‍♂️" // Add default avatar for display
      }));
    } catch (err) {
      console.error("Error loading crew:", err);
      // Return empty array if crew collection doesn't exist yet
      return [];
    }
  };

  const loadEquipmentData = async () => {
    try {
      const equipmentData = await fetchCollection("equipment");
      // Use existing equipment data from the Equipment page
      return equipmentData.map(item => ({
        ...item,
        status: item.status || 'Available', // Add status if not present
        location: item.location || 'Unknown', // Add location if not present
        icon: getEquipmentIcon(item.type) // Add icon based on type
      }));
    } catch (err) {
      console.error("Error loading equipment:", err);
      // Return empty array if equipment collection doesn't exist yet
      return [];
    }
  };

  // Helper function to get equipment icon based on type
  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'Excavator': return '🚜';
      case 'Skid Steer': return '🚛';
      case 'Attachment': return '🔧';
      case 'Compactor': return '🚌';
      default: return '⚙️';
    }
  };

  // Add assignment function
  const addAssignment = async (resourceId, resourceType) => {
    try {
      const selectedProjectData = projects.find(p => p.id === selectedProject);
      const newAssignment = {
        resourceId,
        resourceType,
        projectId: selectedProject,
        projectName: selectedProjectData?.name || 'Unknown Project',
        date: new Date().toISOString().split('T')[0],
        status: 'Scheduled'
      };
      
      // Save to Firebase
      const assignmentId = await addToCollection("assignments", newAssignment);
      const assignmentWithId = { id: assignmentId, ...newAssignment };
      
      setAssignments(prev => ({
        ...prev,
        [assignmentId]: assignmentWithId
      }));

      // Update resource status
      if (resourceType === 'crew') {
        await updateDocById("crew", resourceId, { status: 'Assigned' });
        setCrew(prev => prev.map(c => 
          c.id === resourceId ? { ...c, status: 'Assigned' } : c
        ));
      } else {
        await updateDocById("equipment", resourceId, { status: 'In Use' });
        setEquipment(prev => prev.map(e => 
          e.id === resourceId ? { ...e, status: 'In Use' } : e
        ));
      }
    } catch (err) {
      console.error("Error adding assignment:", err);
      alert("Failed to create assignment. Please try again.");
    }
  };

  const removeAssignment = async (assignmentId) => {
    try {
      const assignment = assignments[assignmentId];
      if (!assignment) return;

      // Delete from Firebase
      await deleteDocById("assignments", assignmentId);
      
      // Update local state
      setAssignments(prev => {
        const updated = { ...prev };
        delete updated[assignmentId];
        return updated;
      });

      // Update resource status back to available
      if (assignment.resourceType === 'crew') {
        await updateDocById("crew", assignment.resourceId, { status: 'Available' });
        setCrew(prev => prev.map(c => 
          c.id === assignment.resourceId ? { ...c, status: 'Available' } : c
        ));
      } else {
        await updateDocById("equipment", assignment.resourceId, { status: 'Available' });
        setEquipment(prev => prev.map(e => 
          e.id === assignment.resourceId ? { ...e, status: 'Available' } : e
        ));
      }
    } catch (err) {
      console.error("Error removing assignment:", err);
      alert("Failed to remove assignment. Please try again.");
    }
  };

  if (loading || projectsLoading) {
    return (
      <Layout title="Smart Dispatch & Scheduling">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading dispatch data...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Smart Dispatch & Scheduling">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          {error}
          <br />
          <button className="classic-button" onClick={loadDispatchData} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

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
            <div key={assignment.id} className="assignment-card" style={{ display: "flex", alignItems: "center", gap: "15px", padding: "16px", marginBottom: "12px", background: "#fef3c7", border: "2px solid #fbbf24", borderRadius: "12px" }}>                <div className="assignment-info" style={{ flex: 1 }}>
                  <div className="resource-name" style={{ fontWeight: "600", color: "#1f2937", marginBottom: "4px", fontSize: "16px" }}>
                    {assignment.resourceType === 'crew' 
                      ? crew.find(c => c.id === assignment.resourceId)?.name || 'Unknown Crew Member'
                      : equipment.find(e => e.id === assignment.resourceId)?.name || 'Unknown Equipment'
                    }
                  </div>
                  <div className="project-name" style={{ color: "#6b7280", marginBottom: "4px", fontSize: "14px" }}>{assignment.projectName}</div>
                  <div className="assignment-type" style={{ color: "#d97706", fontSize: "12px", fontWeight: "500", textTransform: "uppercase", background: "#fed7aa", padding: "2px 8px", borderRadius: "12px", display: "inline-block" }}>{assignment.resourceType}</div>
                </div>
                <button 
                  onClick={() => removeAssignment(assignment.id)}
                  style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}
                >
                  Remove
                </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
