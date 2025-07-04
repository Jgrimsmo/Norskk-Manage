import { useState, useEffect } from 'react';
import { fetchCollection } from '../lib/utils/firebaseHelpers';

/**
 * Custom hook for daily report form management
 * Handles form state, validation, and submission logic
 */
export const useDailyReportForm = (report = null) => {
  const [form, setForm] = useState(report || {
    date: new Date().toISOString().split('T')[0],
    project: '',
    supervisor: '',
    weather: 'Sunny',
    temperature: '',
    workersOnSite: 0,
    workCompleted: '',
    workPlanned: '',
    safetyIncidents: '',
    issuesDelays: '',
    equipmentUsed: [],
    photos: [],
    status: 'draft'
  });

  const [equipmentInput, setEquipmentInput] = useState('');
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Load projects when hook initializes
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await fetchCollection("managementProjects");
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.project.trim()) newErrors.project = 'Project name is required';
    if (!form.supervisor.trim()) newErrors.supervisor = 'Supervisor name is required';
    if (!form.workCompleted.trim()) newErrors.workCompleted = 'Work completed is required';
    if (!form.workPlanned.trim()) newErrors.workPlanned = 'Work planned is required';
    if (form.workersOnSite < 0) newErrors.workersOnSite = 'Number of workers cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setForm(f => ({
        ...f,
        equipmentUsed: [...f.equipmentUsed, equipmentInput.trim()]
      }));
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index) => {
    setForm(f => ({
      ...f,
      equipmentUsed: f.equipmentUsed.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      project: '',
      supervisor: '',
      weather: 'Sunny',
      temperature: '',
      workersOnSite: 0,
      workCompleted: '',
      workPlanned: '',
      safetyIncidents: '',
      issuesDelays: '',
      equipmentUsed: [],
      photos: [],
      status: 'draft'
    });
    setEquipmentInput('');
    setErrors({});
  };

  return {
    form,
    setForm,
    equipmentInput,
    setEquipmentInput,
    errors,
    setErrors,
    projects,
    loadingProjects,
    validateForm,
    addEquipment,
    removeEquipment,
    resetForm,
    loadProjects
  };
};
