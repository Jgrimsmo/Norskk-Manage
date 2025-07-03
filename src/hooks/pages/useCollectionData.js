// Custom hook for managing collections with common CRUD operations
import { useState, useEffect } from 'react';
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from '../../lib/utils/firebaseHelpers';

export function useCollectionData(collectionName, initialLoad = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(initialLoad);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await fetchCollection(collectionName);
      setData(results);
    } catch (err) {
      setError(err.message);
      console.error(`Error loading ${collectionName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      const newDoc = await addToCollection(collectionName, {
        ...itemData,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      });
      setData(prev => [...prev, { id: newDoc.id, ...itemData }]);
      return newDoc;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (id, updates) => {
    try {
      await updateDocById(collectionName, id, {
        ...updates,
        updatedDate: new Date().toISOString()
      });
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDocById(collectionName, id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (initialLoad) {
      loadData();
    }
  }, [collectionName, initialLoad]);

  return {
    data,
    setData,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch: loadData
  };
}
