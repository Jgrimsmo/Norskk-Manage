// Custom hook specifically for estimate dashboard functionality
import { useState, useEffect } from 'react';
import { fetchCollection, fetchSubcollection, addToCollection, updateDocById, deleteDocById } from '../../lib/utils/firebaseHelpers';

export function useEstimateDashboard(projectId) {
  const [scopes, setScopes] = useState([]);
  const [scopeItems, setScopeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all scopes and their items
  const loadScopesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all scopes for this project
      const allScopes = await fetchCollection("scopes");
      const projectScopes = allScopes.filter(scope => scope.projectId === projectId);
      setScopes(projectScopes);
      
      // Load all scope items in parallel
      if (projectScopes.length > 0) {
        const scopeItemPromises = projectScopes.map(async (scope) => {
          const items = await fetchSubcollection(`scopes/${scope.id}`, "items");
          return { scopeName: scope.name, scopeId: scope.id, items };
        });
        
        const scopeItemsResults = await Promise.all(scopeItemPromises);
        setScopeItems(scopeItemsResults);
      } else {
        setScopeItems([]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loading scopes data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new scope
  const addScope = async (scopeData) => {
    try {
      const newScope = await addToCollection("scopes", {
        ...scopeData,
        projectId,
        createdDate: new Date().toISOString()
      });
      setScopes(prev => [...prev, { id: newScope.id, ...scopeData, projectId }]);
      return newScope;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update scope
  const updateScope = async (scopeId, updates) => {
    try {
      await updateDocById("scopes", scopeId, {
        ...updates,
        updatedDate: new Date().toISOString()
      });
      setScopes(prev => prev.map(scope => 
        scope.id === scopeId ? { ...scope, ...updates } : scope
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete scope
  const deleteScope = async (scopeId) => {
    try {
      await deleteDocById("scopes", scopeId);
      setScopes(prev => prev.filter(scope => scope.id !== scopeId));
      setScopeItems(prev => prev.filter(item => item.scopeId !== scopeId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalLabor = 0;
    let totalMaterial = 0;
    let totalEquipment = 0;

    scopeItems.forEach(scopeItemGroup => {
      scopeItemGroup.items.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const laborRate = parseFloat(item.laborRate) || 0;
        const materialCost = parseFloat(item.materialCost) || 0;
        const equipmentCost = parseFloat(item.equipmentCost) || 0;

        totalLabor += quantity * laborRate;
        totalMaterial += quantity * materialCost;
        totalEquipment += quantity * equipmentCost;
      });
    });

    return {
      totalLabor,
      totalMaterial,
      totalEquipment,
      grandTotal: totalLabor + totalMaterial + totalEquipment
    };
  };

  useEffect(() => {
    if (projectId) {
      loadScopesData();
    }
  }, [projectId]);

  return {
    scopes,
    scopeItems,
    loading,
    error,
    addScope,
    updateScope,
    deleteScope,
    calculateTotals,
    refetch: loadScopesData
  };
}
