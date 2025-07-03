import { useState, useEffect } from 'react';
import { fetchCollection } from '../lib/utils/firebaseHelpers';

/**
 * Custom hook for managing crew member selection
 * Handles loading crew members, filtering, and selection state
 */
export const useCrewManagement = () => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);
  const [crewSearchTerm, setCrewSearchTerm] = useState('');
  const [showCrewDropdown, setShowCrewDropdown] = useState(false);

  const loadCrewMembers = async () => {
    try {
      setLoadingCrew(true);
      const crewData = await fetchCollection("crew");
      // If no crew collection exists, use sample data
      if (crewData.length === 0) {
        setCrewMembers([
          { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
          { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
          { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
          { id: '4', name: 'Sarah Wilson', role: 'Worker', status: 'Active' },
          { id: '5', name: 'Tom Johnson', role: 'Worker', status: 'Active' },
        ]);
      } else {
        setCrewMembers(crewData.filter(member => member.status === 'Active'));
      }
    } catch (error) {
      console.error("Error loading crew members:", error);
      // Use sample data as fallback
      setCrewMembers([
        { id: '1', name: 'John Smith', role: 'Foreman', status: 'Active' },
        { id: '2', name: 'Anna Lee', role: 'Operator', status: 'Active' },
        { id: '3', name: 'Mike Brown', role: 'Laborer', status: 'Active' },
      ]);
    } finally {
      setLoadingCrew(false);
    }
  };

  const filteredCrewMembers = crewMembers.filter(member =>
    member.name.toLowerCase().includes(crewSearchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(crewSearchTerm.toLowerCase())
  );

  const addCrewMember = (member) => {
    if (!selectedCrewMembers.find(selected => selected.id === member.id)) {
      setSelectedCrewMembers(prev => [...prev, member]);
    }
    setCrewSearchTerm('');
    setShowCrewDropdown(false);
  };

  const removeCrewMember = (memberId) => {
    setSelectedCrewMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const initializeSelectedCrew = (reportCrewMembers) => {
    if (reportCrewMembers) {
      setSelectedCrewMembers(reportCrewMembers);
    }
  };

  return {
    crewMembers,
    loadingCrew,
    selectedCrewMembers,
    crewSearchTerm,
    showCrewDropdown,
    filteredCrewMembers,
    setCrewSearchTerm,
    setShowCrewDropdown,
    loadCrewMembers,
    addCrewMember,
    removeCrewMember,
    initializeSelectedCrew,
    setSelectedCrewMembers
  };
};
