// Custom hook for editing state management (inline editing, etc.)
import { useState } from 'react';

export function useEditingState() {
  const [editingItems, setEditingItems] = useState(new Set());
  const [tempValues, setTempValues] = useState({});

  const startEditing = (itemId, currentValue = '') => {
    setEditingItems(prev => new Set([...prev, itemId]));
    setTempValues(prev => ({ ...prev, [itemId]: currentValue }));
  };

  const stopEditing = (itemId) => {
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    setTempValues(prev => {
      const { [itemId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const updateTempValue = (itemId, value) => {
    setTempValues(prev => ({ ...prev, [itemId]: value }));
  };

  const isEditing = (itemId) => editingItems.has(itemId);

  const getTempValue = (itemId) => tempValues[itemId] || '';

  const cancelEditing = (itemId) => {
    stopEditing(itemId);
  };

  const saveEdit = async (itemId, onSave) => {
    try {
      const value = tempValues[itemId];
      await onSave(itemId, value);
      stopEditing(itemId);
      return true;
    } catch (error) {
      console.error('Error saving edit:', error);
      return false;
    }
  };

  return {
    startEditing,
    stopEditing,
    updateTempValue,
    isEditing,
    getTempValue,
    cancelEditing,
    saveEdit
  };
}
