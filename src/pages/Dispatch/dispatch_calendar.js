import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/page.css";
import "../../styles/buttons.css";
import "../../styles/theme.css";
import "../../styles/tables.css";

const sampleProjects = [
  { id: "proj-1", name: "Downtown Office Complex", status: "Active", priority: "High" },
  { id: "proj-2", name: "Highway Bridge Repair", status: "Active", priority: "Critical" },
  { id: "proj-3", name: "Residential Development", status: "Active", priority: "Medium" },
];

const sampleCrew = [
  { id: "crew-1", name: "John Smith", role: "Foreman", status: "Available", avatar: "👷‍♂️" },
  { id: "crew-2", name: "Anna Lee", role: "Heavy Equipment Operator", status: "Available", avatar: "👩‍🔧" },
  { id: "crew-3", name: "Mike Brown", role: "General Laborer", status: "Available", avatar: "👨‍🔧" },
  { id: "crew-4", name: "Sarah Wilson", role: "Site Supervisor", status: "Assigned", avatar: "👩‍💼" },
  { id: "crew-5", name: "David Chen", role: "Electrician", status: "Available", avatar: "⚡" },
];

const sampleEquipment = [
  { id: "equip-1", name: "CAT 320 Excavator", type: "Heavy Equipment", status: "Available", icon: "🚜" },
  { id: "equip-2", name: "Ford F-350 Pickup", type: "Vehicle", status: "Available", icon: "🚛" },
  { id: "equip-3", name: "Concrete Mixer Truck", type: "Specialized", status: "In Use", icon: "🚌" },
  { id: "equip-4", name: "Crane - 50 Ton", type: "Heavy Equipment", status: "Available", icon: "🏗️" },
  { id: "equip-5", name: "Dump Truck", type: "Vehicle", status: "Available", icon: "🚚" },
];

// Get current week dates
const getCurrentWeek = () => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const week = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    week.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString()
    });
  }
  return week;
};

// Get current month dates
const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Start from Sunday of the week containing the first day
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  // End at Saturday of the week containing the last day
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  
  const monthDates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    monthDates.push({
      date: currentDate.toISOString().split('T')[0],
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: currentDate.getDate(),
      isToday: currentDate.toDateString() === new Date().toDateString(),
      isCurrentMonth: currentDate.getMonth() === month,
      monthName: currentDate.toLocaleDateString('en-US', { month: 'long' }),
      year: currentDate.getFullYear()
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return monthDates;
};

export default function DispatchCalendar() {
  const [assignments, setAssignments] = useState({});
  const [crew, setCrew] = useState(sampleCrew);
  const [projects, setProjects] = useState(sampleProjects);
  const [equipment, setEquipment] = useState(sampleEquipment);
  const [selectedProject, setSelectedProject] = useState('proj-1');
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [selectedResources, setSelectedResources] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const addAssignment = (date) => {
    if (selectedResources.length === 0) {
      setWarningMessage('Please select at least one crew member or equipment first');
      setShowWarning(true);
      return;
    }

    const selectedProjectData = projects.find(p => p.id === selectedProject);
    
    // Check for existing assignments on this date
    const existingAssignments = Object.values(assignments).filter(assignment => assignment.date === date);
    const alreadyAssigned = [];
    
    selectedResources.forEach(selectedResource => {
      const isAlreadyAssigned = existingAssignments.some(assignment => 
        assignment.resourceId === selectedResource.id
      );
      
      if (isAlreadyAssigned) {
        const resourceName = selectedResource.data.name;
        const resourceType = selectedResource.type === 'crew' ? 'crew member' : 'equipment';
        alreadyAssigned.push(`${resourceName} (${resourceType})`);
      }
    });

    // Show warning if any resources are already assigned
    if (alreadyAssigned.length > 0) {
      const message = alreadyAssigned.length === 1
        ? `${alreadyAssigned[0]} is already assigned for this date.`
        : `The following resources are already assigned for this date:\n\n${alreadyAssigned.join('\n')}\n\nPlease remove them from selection or choose a different date.`;
      
      setWarningMessage(message);
      setShowWarning(true);
      return;
    }
    
    // Create assignments for all selected resources
    selectedResources.forEach(selectedResource => {
      const newAssignment = {
        id: `assign-${Date.now()}-${selectedResource.id}`,
        resourceId: selectedResource.id,
        resourceType: selectedResource.type,
        projectId: selectedProject,
        projectName: selectedProjectData?.name || 'Unknown Project',
        date: date,
        status: 'Scheduled'
      };
      
      setAssignments(prev => ({
        ...prev,
        [newAssignment.id]: newAssignment
      }));
    });

    // Keep selections for adding to multiple dates
    // setSelectedResources([]) - removed auto-clear
  };

  const removeAssignment = (assignmentId) => {
    const assignment = assignments[assignmentId];
    if (!assignment) return;

    // Remove assignment
    setAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[assignmentId];
      return newAssignments;
    });
  };

  const navigateWeek = (direction) => {
    const startDate = new Date(currentWeek[0].date);
    startDate.setDate(startDate.getDate() + (direction * 7));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      week.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    setCurrentWeek(week);
  };

  const navigateMonth = (direction) => {
    const currentDate = new Date(currentMonth[15].date); // Use middle date to avoid edge cases
    currentDate.setMonth(currentDate.getMonth() + direction);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // End at Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const monthDates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      monthDates.push({
        date: current.toISOString().split('T')[0],
        dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: current.getDate(),
        isToday: current.toDateString() === new Date().toDateString(),
        isCurrentMonth: current.getMonth() === month,
        monthName: current.toLocaleDateString('en-US', { month: 'long' }),
        year: current.getFullYear()
      });
      current.setDate(current.getDate() + 1);
    }
    
    setCurrentMonth(monthDates);
  };

  // Helper function to toggle resource selection
  const toggleResourceSelection = (resource) => {
    setSelectedResources(prev => {
      const isSelected = prev.some(r => r.id === resource.id);
      if (isSelected) {
        // Remove from selection
        return prev.filter(r => r.id !== resource.id);
      } else {
        // Add to selection
        return [...prev, resource];
      }
    });
  };

  // Helper function to check if resource is selected
  const isResourceSelected = (resourceId) => {
    return selectedResources.some(r => r.id === resourceId);
  };

  return (
    <Layout title="Dispatch & Scheduling">
      {/* Warning Modal */}
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#c0c0c0',
            border: '2px outset #c0c0c0',
            borderRadius: '0',
            minWidth: '400px',
            maxWidth: '600px',
            padding: '0',
            fontFamily: 'MS Sans Serif, sans-serif',
            fontSize: '11px'
          }}>
            {/* Title Bar */}
            <div style={{
              backgroundColor: '#008080',
              color: 'white',
              padding: '2px 6px',
              fontWeight: 'bold',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>⚠️ Assignment Warning</span>
            </div>
            
            {/* Content */}
            <div style={{
              padding: '16px',
              lineHeight: '1.4'
            }}>
              <div style={{ 
                marginBottom: '16px',
                whiteSpace: 'pre-line'
              }}>
                {warningMessage}
              </div>
              
              <div style={{ 
                textAlign: 'center',
                borderTop: '1px solid #808080',
                paddingTop: '12px'
              }}>
                <button
                  onClick={() => setShowWarning(false)}
                  className="classic-button"
                  style={{
                    minWidth: '75px',
                    padding: '4px 16px'
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        
        {/* Left Panel - Resources Tables */}
        <div style={{ flex: "0 0 350px" }}>
          
          {/* Clear Selection Button */}
          <div style={{ marginBottom: "10px" }}>
            <button 
              onClick={() => setSelectedResources([])}
              className="classic-button"
              disabled={selectedResources.length === 0}
              style={{ 
                width: "100%",
                backgroundColor: selectedResources.length > 0 ? "#ff6b6b" : "#ccc",
                color: "white",
                fontWeight: "bold"
              }}
            >
              Clear Selection ({selectedResources.length} selected)
            </button>
          </div>

          {/* Projects Table */}
          <div className="table-section">
            <h3>📋 Projects</h3>
            <table className="norskk-table">
              <thead>
                <tr>
                  <th style={{ width: "30px" }}>✓</th>
                  <th>Project Name</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr 
                    key={project.id}
                    style={{ 
                      backgroundColor: selectedProject === project.id ? "#e6f3ff" : "transparent"
                    }}
                  >
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedProject === project.id}
                        onChange={() => setSelectedProject(project.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td>{project.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Crew Table */}
          <div className="table-section">
            <h3>👥 Crew Members</h3>
            <table className="norskk-table">
              <thead>
                <tr>
                  <th style={{ width: "30px" }}>✓</th>
                  <th>Name</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {crew.map(member => (
                  <tr 
                    key={member.id}
                    style={{ 
                      backgroundColor: isResourceSelected(member.id) ? "#e6f3ff" : "transparent"
                    }}
                  >
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isResourceSelected(member.id)}
                        onChange={() => toggleResourceSelection({ id: member.id, type: 'crew', data: member })}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td>
                      {member.name}
                    </td>
                    <td>{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Equipment Table */}
          <div className="table-section">
            <h3>🚜 Equipment</h3>
            <table className="norskk-table">
              <thead>
                <tr>
                  <th style={{ width: "30px" }}>✓</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map(item => (
                  <tr 
                    key={item.id}
                    style={{ 
                      backgroundColor: isResourceSelected(item.id) ? "#e6f3ff" : "transparent"
                    }}
                  >
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isResourceSelected(item.id)}
                        onChange={() => toggleResourceSelection({ id: item.id, type: 'equipment', data: item })}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td>
                      {item.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Calendar */}
        <div style={{ flex: "1" }}>
          <div className="page-section">
            
            {/* Calendar Navigation */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "25px" 
            }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
                  className="classic-button"
                >
                  ← Previous
                </button>
                <button 
                  onClick={() => {
                    if (viewMode === 'week') {
                      setCurrentWeek(getCurrentWeek());
                    } else {
                      setCurrentMonth(getCurrentMonth());
                    }
                  }}
                  className="classic-button"
                >
                  Today
                </button>
                <button 
                  onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)}
                  className="classic-button"
                >
                  Next →
                </button>
              </div>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {viewMode === 'month' && (
                  <span style={{ fontWeight: "bold", marginRight: "10px" }}>
                    {currentMonth[15]?.monthName} {currentMonth[15]?.year}
                  </span>
                )}
                {viewMode === 'week' && (
                  <span style={{ fontWeight: "bold", marginRight: "10px" }}>
                    {currentWeek[3]?.dayName ? 
                      new Date(currentWeek[3].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    }
                  </span>
                )}
                <button 
                  onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                  className="classic-button"
                  style={{ backgroundColor: viewMode === 'month' ? "#4CAF50" : "#2196F3", color: "white" }}
                >
                  {viewMode === 'week' ? 'Month View' : 'Week View'}
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(7, 1fr)", 
              gap: "2px",
              border: "2px inset #c0c0c0",
              background: "#c0c0c0"
            }}>
              {/* Day Headers for Month View */}
              {viewMode === 'month' && (
                <>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                    <div key={dayName} style={{
                      background: "#e0e0e0",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "12px",
                      border: "1px solid #999"
                    }}>
                      {dayName}
                    </div>
                  ))}
                </>
              )}
              
              {(viewMode === 'week' ? currentWeek : currentMonth).map((day, index) => (
                <div 
                  key={day.date}
                  style={{ 
                    background: day.isToday ? "#fff3cd" : 
                              viewMode === 'month' && !day.isCurrentMonth ? "#f5f5f5" : "white",
                    padding: viewMode === 'month' ? "4px" : "8px", 
                    minHeight: viewMode === 'month' ? "120px" : "180px",
                    border: day.isToday ? "2px solid #ffc107" : "2px outset #c0c0c0",
                    opacity: viewMode === 'month' && !day.isCurrentMonth ? 0.6 : 1
                  }}
                >
                  {/* Day Header */}
                  <div style={{ 
                    textAlign: "center", 
                    fontWeight: "bold", 
                    marginBottom: viewMode === 'month' ? "4px" : "8px",
                    fontSize: viewMode === 'month' ? "10px" : "12px",
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "2px"
                  }}>
                    {viewMode === 'week' && <div>{day.dayName}</div>}
                    <div style={{ 
                      fontSize: viewMode === 'month' ? "12px" : "16px", 
                      color: day.isToday ? "#ffc107" : "#333" 
                    }}>
                      {day.dayNumber}
                    </div>
                  </div>

                  {/* Add Button */}
                  <div style={{ marginBottom: viewMode === 'month' ? "4px" : "8px" }}>
                    <button 
                      onClick={() => addAssignment(day.date)}
                      className="classic-button"
                      disabled={selectedResources.length === 0}
                      style={{ 
                        fontSize: viewMode === 'month' ? "8px" : "10px", 
                        padding: viewMode === 'month' ? "2px 4px" : "4px 8px", 
                        width: "100%",
                        backgroundColor: selectedResources.length > 0 ? "#4CAF50" : "#ccc",
                        color: "white"
                      }}
                    >
                      {selectedResources.length > 0 
                        ? (viewMode === 'month' ? 
                           `+${selectedResources.length}` : 
                           `Add ${selectedResources.length} Resource${selectedResources.length > 1 ? 's' : ''}`)
                        : (viewMode === 'month' ? 'Select' : 'Select Resources First')
                      }
                    </button>
                  </div>

                  {/* Assignments */}
                  <div>
                    {(() => {
                      const dayAssignments = Object.values(assignments).filter(assignment => assignment.date === day.date);
                      const groupedByProject = dayAssignments.reduce((groups, assignment) => {
                        const projectId = assignment.projectId;
                        if (!groups[projectId]) {
                          groups[projectId] = {
                            projectName: assignment.projectName,
                            assignments: []
                          };
                        }
                        groups[projectId].assignments.push(assignment);
                        return groups;
                      }, {});

                      return Object.entries(groupedByProject).map(([projectId, group]) => (
                        <div key={projectId} style={{ marginBottom: viewMode === 'month' ? "4px" : "8px" }}>
                          {/* Project Header */}
                          <div style={{
                            fontSize: viewMode === 'month' ? "9px" : "11px",
                            fontWeight: "bold",
                            color: "#333",
                            backgroundColor: "#f0f0f0",
                            padding: viewMode === 'month' ? "2px 4px" : "3px 6px",
                            borderRadius: "3px",
                            marginBottom: "2px",
                            border: "1px solid #ddd"
                          }}>
                            📋 {group.projectName}
                          </div>

                          {/* Resources under this project */}
                          {group.assignments.map(assignment => (
                            <div 
                              key={assignment.id}
                              style={{ 
                                padding: viewMode === 'month' ? "2px 4px" : "3px 6px", 
                                marginBottom: "1px", 
                                marginLeft: viewMode === 'month' ? "4px" : "8px",
                                background: assignment.resourceType === 'crew' ? "#e3f2fd" : "#f1f8e9", 
                                border: "1px solid #ddd",
                                fontSize: viewMode === 'month' ? "8px" : "10px",
                                borderRadius: "3px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                            >
                              <div style={{ 
                                overflow: "hidden", 
                                textOverflow: "ellipsis", 
                                whiteSpace: "nowrap",
                                flex: 1
                              }}>
                                <span style={{ fontSize: viewMode === 'month' ? "7px" : "9px" }}>
                                  {assignment.resourceType === 'crew' ? '👥' : '🚜'}
                                </span>{' '}
                                {assignment.resourceType === 'crew' 
                                  ? crew.find(c => c.id === assignment.resourceId)?.name 
                                  : equipment.find(e => e.id === assignment.resourceId)?.name
                                }
                              </div>
                              <button 
                                onClick={() => removeAssignment(assignment.id)}
                                style={{
                                  fontSize: viewMode === 'month' ? "6px" : "7px",
                                  padding: "1px 2px",
                                  background: "#f44336",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "2px",
                                  cursor: "pointer",
                                  marginLeft: "4px"
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

