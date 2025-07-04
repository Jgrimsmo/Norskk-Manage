import React, { useState, useEffect } from "react";
import "./dispatch.css";
import Layout from "../../components/Layout";
import { useProjectManagement } from "../../hooks/useProjectManagement";
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from "../../lib/utils/firebaseHelpers";

export default function DispatchPage() {
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
        skills: member.skills || [member.role || 'General'], // Use role as skill if no skills
        rating: member.rating || 4.5, // Default rating
        avatar: "�‍♂️" // Add default avatar for display
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
      case 'Dump Truck': return '🚚';
      case 'Crane': return '🏗️';
      case 'Bulldozer': return '🚜';
      case 'Loader': return '🚛';
      default: return '🔧';
    }
  };

  // Add assignment function
  const addAssignment = async (resourceId, resourceType) => {
    const selectedProjectData = projects.find(p => p.id === selectedProject);
    const newAssignment = {
      resourceId,
      resourceType,
      projectId: selectedProject,
      projectName: selectedProjectData?.name || 'Unknown Project',
      date: new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };
    
    try {
      // Add to Firebase
      const assignmentId = await addToCollection("assignments", newAssignment);
      
      // Update local state
      setAssignments(prev => ({
        ...prev,
        [assignmentId]: { ...newAssignment, id: assignmentId }
      }));

      // Update resource status locally (Firebase update would be needed for persistence)
      if (resourceType === 'crew') {
        setCrew(prev => prev.map(c => 
          c.id === resourceId ? { ...c, status: 'Assigned' } : c
        ));
      } else {
        setEquipment(prev => prev.map(e => 
          e.id === resourceId ? { ...e, status: 'In Use' } : e
        ));
      }
    } catch (err) {
      console.error("Error adding assignment:", err);
      setError("Failed to add assignment. Please try again.");
    }
  };

  if (loading || projectsLoading) {
    return (
      <Layout title="Smart Dispatch & Scheduling">
        <div className="dispatch-container">
          <h1>🚀 Smart Dispatch & Scheduling</h1>
          <div>Loading dispatch data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Smart Dispatch & Scheduling">
        <div className="dispatch-container">
          <h1>🚀 Smart Dispatch & Scheduling</h1>
          <div className="error-message">
            Error: {error}
            <button onClick={loadDispatchData} style={{ marginLeft: '10px' }}>
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Smart Dispatch & Scheduling">
      <div className="dispatch-container">
        <h1>🚀 Smart Dispatch & Scheduling</h1>
        
        <div className="dispatch-controls">
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
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
          />
        </div>

        <div className="crew-list">
          <h3>Crew Members ({crew.length})</h3>
          {crew.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.role.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(member => (
            <div key={member.id} className="crew-card">
              <span className="avatar">{member.avatar}</span>
              <div className="crew-info">
                <div className="name">{member.name}</div>
                <div className="role">{member.role}</div>
                <div className="skills">{Array.isArray(member.skills) ? member.skills.join(', ') : member.role}</div>
                <div className="rating">⭐ {member.rating}</div>
              </div>
              <div className="status">{member.status}</div>
              <button 
                className="assign-btn"
                onClick={() => addAssignment(member.id, 'crew')}
                disabled={member.status === 'Assigned'}
              >
                {member.status === 'Assigned' ? 'Assigned' : 'Assign to Project'}
              </button>
            </div>
          ))}
        </div>

        <div className="equipment-list">
          <h3>Available Equipment ({equipment.filter(e => e.status === 'Available').length})</h3>
          {equipment.filter(item => item.status === "Available").map(item => (
            <div key={item.id} className="equipment-card">
              <span className="icon">{item.icon}</span>
              <div className="equipment-info">
                <div className="name">{item.name}</div>
                <div className="type">{item.type}</div>
                <div className="location">📍 {item.location}</div>
              </div>
              <button 
                className="assign-btn"
                onClick={() => addAssignment(item.id, 'equipment')}
              >
                Assign to Project
              </button>
            </div>
          ))}
        </div>

        <div className="assignments-section">
          <h3>Today's Assignments ({Object.keys(assignments).length})</h3>
          {Object.values(assignments).map(assignment => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-info">
                <div className="resource-name">
                  {assignment.resourceType === 'crew' 
                    ? crew.find(c => c.id === assignment.resourceId)?.name 
                    : equipment.find(e => e.id === assignment.resourceId)?.name
                  }
                </div>
                <div className="project-name">{assignment.projectName}</div>
                <div className="assignment-type">{assignment.resourceType}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}