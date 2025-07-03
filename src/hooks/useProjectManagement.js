import { useState, useEffect } from 'react';
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from '../lib/utils/firebaseHelpers';

// Fallback data for initial seeding
const INITIAL_PROJECTS = [
  { 
    name: "Downtown Office Complex", 
    owner: "City Development Corp",
    number: "001",
    address: "123 Main St, Downtown",
    status: "Active", 
    startDate: new Date().toISOString().split('T')[0],
    priority: "High", 
    color: "#e74c3c" 
  },
  { 
    name: "Highway Bridge Repair", 
    owner: "State DOT",
    number: "002", 
    address: "Highway 101 Bridge",
    status: "Active", 
    startDate: new Date().toISOString().split('T')[0],
    priority: "Critical", 
    color: "#c0392b" 
  },
  { 
    name: "Residential Development", 
    owner: "Green Valley Homes",
    number: "003",
    address: "456 Oak Ave, Suburbs",
    status: "Active", 
    startDate: new Date().toISOString().split('T')[0],
    priority: "Medium", 
    color: "#f39c12" 
  }
];

export function useProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load projects from Firebase on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsData = await fetchCollection("managementProjects");
      
      // If no projects exist, seed with initial data
      if (projectsData.length === 0) {
        console.log("No projects found, seeding with initial data...");
        await seedInitialProjects();
        return;
      }
      
      setProjects(projectsData);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const seedInitialProjects = async () => {
    try {
      const promises = INITIAL_PROJECTS.map(project => addToCollection("managementProjects", project));
      await Promise.all(promises);
      
      // Reload projects after seeding
      const projectsData = await fetchCollection("managementProjects");
      setProjects(projectsData);
    } catch (err) {
      console.error("Error seeding projects:", err);
      setError("Failed to initialize project data.");
    }
  };

  const addProject = async (projectData) => {
    try {
      const newProjectId = await addToCollection("managementProjects", projectData);
      const newProject = { id: newProjectId, ...projectData };
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error("Error adding project:", err);
      throw new Error("Failed to add project. Please try again.");
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      await updateDocById("managementProjects", projectId, updates);
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, ...updates } : project
      ));
    } catch (err) {
      console.error("Error updating project:", err);
      throw new Error("Failed to update project. Please try again.");
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await deleteDocById("managementProjects", projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      throw new Error("Failed to delete project. Please try again.");
    }
  };

  return {
    projects,
    loading,
    error,
    loadProjects,
    addProject,
    updateProject,
    deleteProject
  };
}
