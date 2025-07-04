import React, { useEffect, useState } from "react";
import { fetchCollection, fetchSubcollection, addToSubcollection, updateSubcollectionDoc, deleteSubcollectionDoc } from "../../lib/utils/firebaseHelpers";
import '../../styles/page.css';
import '../../styles/tables.css';
import Layout from "../../components/layout/Layout";

export default function ScopeEstimateClassic({ projectId, scopeId, onBack, onScopeNavigation }) {
  const [scope, setScope] = useState(null);
  const [allScopes, setAllScopes] = useState([]);
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState({}); // { [itemId_field]: true }
  const [editValues, setEditValues] = useState({}); // { [itemId_field]: value }
  const [itemDatabase, setItemDatabase] = useState([]);
  const [dropdownIdx, setDropdownIdx] = useState(null); // row index for dropdown
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    description: ''
  });
  const [filterDropdowns, setFilterDropdowns] = useState({
    category: false,
    description: false
  });
  
  useEffect(() => {
    loadScope();
    loadItemDatabase();
    // eslint-disable-next-line
  }, [projectId, scopeId]);

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('th')) {
        setFilterDropdowns({ category: false, description: false });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadScope = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!scopeId) return;
      const scopes = await fetchCollection("scopes");
      const projectScopes = scopes.filter(scope => scope.projectId === projectId);
      setAllScopes(projectScopes);
      const found = projectScopes.find(scope => scope.id === scopeId);
      if (found) {
        setScope(found);
        const items = await fetchSubcollection(`scopes/${scopeId}`, "items");
        // Sort items consistently to prevent jumping around
        setItems(sortItems(items));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const loadItemDatabase = async () => {
    try {
      // Fetch all items from Firestore 'items' collection (or use your preferred collection)
      const items = await fetchCollection("items");
      setItemDatabase(items);
    } catch (err) {
      console.error("Error loading item database:", err);
    }
  };

  // Helper function to sort items consistently
  const sortItems = (items) => {
    return items.sort((a, b) => {
      // Primary sort: by category (alphabetical)
      if (a.category && b.category) {
        const categoryCompare = a.category.localeCompare(b.category);
        if (categoryCompare !== 0) return categoryCompare;
      } else if (a.category && !b.category) {
        return -1;
      } else if (!a.category && b.category) {
        return 1;
      }
      
      // Secondary sort: by name (alphabetical)
      if (a.name && b.name) {
        return a.name.localeCompare(b.name);
      } else if (a.name && !b.name) {
        return -1;
      } else if (!a.name && b.name) {
        return 1;
      }
      
      // Tertiary sort: by ID for consistent ordering
      return (a.id || '').localeCompare(b.id || '');
    });
  };

  const addItem = async () => {
    try {
      // Create new item with filter values pre-populated when filters are active
      const newItem = { 
        name: filters.description || "", // Pre-populate name/description with description filter
        category: filters.category || "", // Pre-populate category with category filter
        quantity: 0, 
        unit: "", 
        unitPrice: 0, 
        pst: 0, 
        markupPercent: 0, 
        notes: "" 
      };
      
      // If category is auto-PST category, prepare for PST calculation (will be 0 since quantity/price are 0)
      if (PST_CATEGORIES.includes(newItem.category)) {
        newItem.pst = 0; // Will be recalculated when quantity/price are added
      }
      
      const itemId = await addToSubcollection(`scopes/${scopeId}`, "items", newItem);
      setItems(prev => sortItems([...prev, { ...newItem, id: itemId }]));
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };
  
  // Categories that should automatically have 7% PST applied
  const PST_CATEGORIES = ['Materials', 'Subcontractors', 'Trucking & Aggregates'];
  const PST_RATE = 0.07; // 7%

  // Function to automatically calculate PST for qualifying categories
  const calculateAutoPST = (item) => {
    if (PST_CATEGORIES.includes(item.category)) {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      return subtotal * PST_RATE;
    }
    return item.pst || 0;
  };

  // Function to calculate item total with auto PST
  const calculateItemTotal = (item) => {
    const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
    const pst = calculateAutoPST(item);
    const subtotalWithPST = subtotal + pst;
    const markup = subtotalWithPST * ((item.markupPercent || 0) / 100);
    return subtotalWithPST + markup;
  };

  const updateItem = async (itemId, field, value) => {
    try {
      const updatedItem = { [field]: value };
      
      // Auto-calculate PST when category, quantity, or price changes
      if (['category', 'quantity', 'unitPrice'].includes(field)) {
        const currentItem = items.find(item => item.id === itemId);
        const newItem = { ...currentItem, ...updatedItem };
        if (PST_CATEGORIES.includes(newItem.category)) {
          const subtotal = (newItem.quantity || 0) * (newItem.unitPrice || 0);
          updatedItem.pst = subtotal * PST_RATE;
        } else if (field === 'category' && !PST_CATEGORIES.includes(value)) {
          // Reset PST when changing to a non-auto category
          updatedItem.pst = 0;
        }
      }

      await updateSubcollectionDoc(`scopes/${scopeId}`, "items", itemId, updatedItem);
      setItems(prev => sortItems(prev.map(item => item.id === itemId ? { ...item, ...updatedItem } : item)));
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };
  
  const handleScopeNavigation = async (newScopeId) => {
    if (newScopeId === scopeId) return; // Already on this scope
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear all editing states
      setEditing({});
      setEditValues({});
      setDropdownIdx(null);
      setDropdownOptions([]);
      
      // Clear filter states when navigating
      setFilters({ category: '', description: '' });
      setFilterDropdowns({ category: false, description: false });
      
      // If we have an onScopeNavigation prop (embedded in EstimateDashboard), use that
      if (onScopeNavigation) {
        onScopeNavigation(newScopeId);
        // Don't set loading to false here - let the useEffect handle it when the new scopeId loads
        return;
      }
      
      // Otherwise, handle navigation for standalone route
      const items = await fetchSubcollection(`scopes/${newScopeId}`, "items");
      const newScope = allScopes.find(scope => scope.id === newScopeId);
      
      if (newScope) {
        setScope(newScope);
        setItems(sortItems(items));
        
        // Update the URL to reflect the new scope
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace(/\/[^/]+$/, `/${newScopeId}`);
        window.history.pushState(null, '', newPath);
        
        // Force a page refresh to ensure all components update properly
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await deleteSubcollectionDoc(`scopes/${scopeId}`, "items", itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleCellClick = (itemId, field, value) => {
    setEditing({ ...editing, [`${itemId}_${field}`]: true });
    setEditValues({ ...editValues, [`${itemId}_${field}`]: value });
  };

  const handleEditChange = (itemId, field, value) => {
    setEditValues({ ...editValues, [`${itemId}_${field}`]: value });
  };

  const handleEditBlur = async (itemId, field) => {
    setEditing({ ...editing, [`${itemId}_${field}`]: false });
    await updateItem(itemId, field, editValues[`${itemId}_${field}`]);
  };

  if (loading) {
    return onBack ? (
      <div>Loading...</div>
    ) : (
      <Layout title="Scope Estimate Classic">
        <div>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return onBack ? (
      <div>
        <p>Error: {error}</p>
        <button onClick={loadScope}>Retry</button>
      </div>
    ) : (
      <Layout title="Scope Estimate Classic">
        <div>
          <p>Error: {error}</p>
          <button onClick={loadScope}>Retry</button>
        </div>
      </Layout>
    );
  }

  if (!scope) return onBack ? <div>Scope not found</div> : <Layout title="Scope Estimate Classic"><div>Scope not found</div></Layout>;

  // Helper for formatting numbers with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '';
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Filter items based on filter criteria and apply consistent sorting
  const filteredItems = sortItems(items.filter(item => {
    const categoryMatch = !filters.category || 
      (item.category && item.category.toLowerCase().includes(filters.category.toLowerCase()));
    const descriptionMatch = !filters.description || 
      (item.name && item.name.toLowerCase().includes(filters.description.toLowerCase()));
    
    return categoryMatch && descriptionMatch;
  }));

  // Calculate totals
  const scopeTotal = items.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  const filteredTotal = filteredItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ category: '', description: '' });
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    const values = items.map(item => {
      if (field === 'category') return item.category || '';
      if (field === 'description') return item.name || '';
      return '';
    }).filter(Boolean);
    return [...new Set(values)].sort();
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setFilterDropdowns(prev => ({ ...prev, [field]: false }));
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');
  
  const content = (
    <div style={{ margin: 0, padding: 0 }}>
      <div style={{ padding: 0, margin: 0, maxWidth: '100%', height: 'auto', minHeight: 0 }}>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {onBack && (
              <button
                className="classic-button"
                onClick={onBack}
              >
                Back to Summary
              </button>
            )}
            
            {/* Scope Navigation Buttons */}
            {allScopes.length > 1 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {allScopes.map((sc) => (
                  <button
                    key={sc.id}
                    className="classic-button"
                    onClick={() => handleScopeNavigation(sc.id)}
                    style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      backgroundColor: sc.id === scopeId ? '#4CAF50' : undefined,
                      color: sc.id === scopeId ? 'white' : undefined,
                      border: sc.id === scopeId ? '1px solid #4CAF50' : undefined
                    }}
                    disabled={sc.id === scopeId}
                  >
                    {sc.name || `Scope ${sc.id.slice(-4)}`}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Filter Status */}
          {hasActiveFilters && (
            <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#1976d2' }}>
                  Filters active - Showing {filteredItems.length} of {items.length} items
                </span>
                <button 
                  className="classic-button"
                  onClick={clearAllFilters}
                  style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#dc3545', color: 'white' }}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
          
          <table className="norskk-table">
              <colgroup>
                <col /> {/* Category */}
                <col /> {/* Description */}
                <col style={{ width: '70px' }} /> {/* Qty - just wide enough for helper text */}
                <col style={{ width: '70px' }} /> {/* Unit - just wide enough for helper text */}
                <col /> {/* Unit Price */}
                <col /> {/* PST */}
                <col /> {/* Subtotal */}
                <col style={{ width: '90px' }} /> {/* Markup % - widened */}
                <col /> {/* Markup $ */}
                <col /> {/* Total */}
                <col /> {/* Notes */}
                <col /> {/* Actions */}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ position: 'relative' }}>
                    Category
                    <span 
                      style={{ 
                        marginLeft: '4px', 
                        cursor: 'pointer', 
                        color: '#666', 
                        fontSize: '10px' 
                      }}
                      onClick={() => setFilterDropdowns(prev => ({ 
                        ...prev, 
                        category: !prev.category,
                        description: false
                      }))}
                      title="Filter Category"
                    >
                      ▼
                    </span>
                    {filterDropdowns.category && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: 'white',
                        border: '2px outset #c0c0c0',
                        boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        minWidth: '150px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        fontSize: '11px'
                      }}>
                        <div 
                          style={{ 
                            padding: '4px 8px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #d0d0d0',
                            fontWeight: filters.category === "" ? 'bold' : 'normal',
                            backgroundColor: filters.category === "" ? '#e3f2fd' : 'transparent'
                          }}
                          onClick={() => handleFilterChange('category', '')}
                        >
                          All Categories
                        </div>
                        {getUniqueValues('category').map(category => (
                          <div 
                            key={category}
                            style={{ 
                              padding: '4px 8px', 
                              cursor: 'pointer', 
                              borderBottom: '1px solid #d0d0d0',
                              fontWeight: filters.category === category ? 'bold' : 'normal',
                              backgroundColor: filters.category === category ? '#e3f2fd' : 'transparent'
                            }}
                            onClick={() => handleFilterChange('category', category)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = filters.category === category ? '#e3f2fd' : 'transparent'}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                  </th>
                  <th style={{ position: 'relative' }}>
                    Description
                    <span 
                      style={{ 
                        marginLeft: '4px', 
                        cursor: 'pointer', 
                        color: '#666', 
                        fontSize: '10px' 
                      }}
                      onClick={() => setFilterDropdowns(prev => ({ 
                        ...prev, 
                        description: !prev.description,
                        category: false
                      }))}
                      title="Filter Description"
                    >
                      ▼
                    </span>
                    {filterDropdowns.description && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: 'white',
                        border: '2px outset #c0c0c0',
                        boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        minWidth: '200px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        fontSize: '11px'
                      }}>
                        <div 
                          style={{ 
                            padding: '4px 8px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #d0d0d0',
                            fontWeight: filters.description === "" ? 'bold' : 'normal',
                            backgroundColor: filters.description === "" ? '#e3f2fd' : 'transparent'
                          }}
                          onClick={() => handleFilterChange('description', '')}
                        >
                          All Descriptions
                        </div>
                        {getUniqueValues('description').map(description => (
                          <div 
                            key={description}
                            style={{ 
                              padding: '4px 8px', 
                              cursor: 'pointer', 
                              borderBottom: '1px solid #d0d0d0',
                              fontWeight: filters.description === description ? 'bold' : 'normal',
                              backgroundColor: filters.description === description ? '#e3f2fd' : 'transparent'
                            }}
                            onClick={() => handleFilterChange('description', description)}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = filters.description === description ? '#e3f2fd' : 'transparent'}
                          >
                            {description}
                          </div>
                        ))}
                      </div>
                    )}
                  </th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>PST</th>
                  <th>Subtotal</th>
                  <th>Markup %</th>
                  <th>Markup $</th>
                  <th>Total</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                      {items.length === 0 ? "No items found. Click 'Add Item' to start building your estimate." : "No items match the current filters."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    // Calculate values with auto PST
                    const qty = Number(item.quantity) || 0;
                    const unitPrice = Number(item.unitPrice) || 0;
                    const subtotal = qty * unitPrice;
                    const pst = calculateAutoPST(item);
                    const subtotalWithPST = subtotal + pst;
                    const markupPercent = Number(item.markupPercent) || 0;
                    const markupDollar = subtotalWithPST * (markupPercent / 100);
                    const total = subtotalWithPST + markupDollar;
                    return (
                    <tr key={item.id}>
                      {/* Category */}
                      <td onClick={() => handleCellClick(item.id, 'category', item.category || "")}
                          style={{cursor:'pointer'}}>
                        {editing[`${item.id}_category`] ? (
                          <input
                            autoFocus
                            value={editValues[`${item.id}_category`]}
                            onChange={e => handleEditChange(item.id, 'category', e.target.value)}
                            onBlur={() => handleEditBlur(item.id, 'category')}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                            style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                          />
                        ) : (
                          item.category || ''
                        )}
                      </td>
                      {/* Description */}
                      <td onClick={() => handleCellClick(item.id, 'name', item.name || "")}
                          style={{cursor:'pointer', position:'relative'}}>
                        {editing[`${item.id}_name`] ? (
                          <>
                            <input
                              autoFocus
                              value={editValues[`${item.id}_name`]
}
                              onChange={e => {
                                handleEditChange(item.id, 'name', e.target.value);
                                // Show dropdown if input is not empty
                                if (e.target.value.length > 0) {
                                  setDropdownIdx(idx);
                                  setDropdownOptions(itemDatabase.filter(itm => itm.description && itm.description.toLowerCase().includes(e.target.value.toLowerCase())));
                                } else {
                                  setDropdownIdx(null);
                                  setDropdownOptions([]);
                                }
                              }}
                              onBlur={() => { setTimeout(() => { setDropdownIdx(null); }, 200); handleEditBlur(item.id, 'name'); }}
                              onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                              style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                            />
                            {dropdownIdx === idx && dropdownOptions.length > 0 && (
                              <div style={{ 
                                position: 'absolute', 
                                zIndex: 10, 
                                background: '#fff', 
                                border: '1px solid #aaa', 
                                minWidth: '400px',
                                width: 'max-content',
                                maxWidth: '500px',
                                maxHeight: 300, 
                                overflowY: 'auto', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.12)' 
                              }}>
                                {dropdownOptions.map(option => (
                                  <div
                                    key={option.id}
                                    style={{ 
                                      padding: '8px 12px', 
                                      cursor: 'pointer', 
                                      borderBottom: '1px solid #eee',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                    onMouseDown={() => {
                                      // Autofill columns with auto PST calculation
                                      const databaseItem = option;
                                      updateItem(item.id, 'name', databaseItem.description);
                                      updateItem(item.id, 'category', databaseItem.category);
                                      updateItem(item.id, 'unit', databaseItem.unitType);
                                      updateItem(item.id, 'unitPrice', databaseItem.unitPrice);
                                      
                                      // Auto-calculate PST for qualifying categories
                                      if (PST_CATEGORIES.includes(databaseItem.category)) {
                                        const subtotal = (item.quantity || 0) * (databaseItem.unitPrice || 0);
                                        updateItem(item.id, 'pst', subtotal * PST_RATE);
                                      }
                                      
                                      setEditValues(v => ({ ...v, [`${item.id}_name`]: databaseItem.description }));
                                      setDropdownIdx(null);
                                      setDropdownOptions([]);
                                    }}
                                    onMouseEnter={e => e.target.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.target.style.background = 'white'}
                                  >
                                    <div style={{marginBottom: '2px'}}>
                                      <strong style={{color: '#0d5c7a'}}>{option.category}</strong>
                                    </div>
                                    <div style={{fontWeight: '500', marginBottom: '2px'}}>
                                      {option.description}
                                    </div>
                                    <div style={{fontSize: '11px', color: '#6b7280', display: 'flex', gap: '8px'}}>
                                      <span>{option.unitType}</span>
                                      <span>${typeof option.unitPrice === 'number' ? option.unitPrice.toFixed(2) : option.unitPrice}</span>
                                      <span>{option.supplier || 'No supplier'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          item.name || ''
                        )}
                      </td>
                      {/* Qty */}
                      <td onClick={() => handleCellClick(item.id, 'quantity', item.quantity || "")}
                          style={{cursor:'pointer'}}>
                        {editing[`${item.id}_quantity`] ? (
                          <input
                            autoFocus
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            value={editValues[`${item.id}_quantity`]}
                            onChange={e => handleEditChange(item.id, 'quantity', e.target.value)}
                            onBlur={() => handleEditBlur(item.id, 'quantity')}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                            style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                          />
                        ) : (
                          item.quantity === 0 || item.quantity === undefined ? '' : item.quantity
                        )}
                      </td>
                      {/* Unit */}
                      <td onClick={() => handleCellClick(item.id, 'unit', item.unit || "")}
                          style={{cursor:'pointer'}}>
                        {editing[`${item.id}_unit`] ? (
                          <input
                            autoFocus
                            value={editValues[`${item.id}_unit`]}
                            onChange={e => handleEditChange(item.id, 'unit', e.target.value)}
                            onBlur={() => handleEditBlur(item.id, 'unit')}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                            style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                          />
                        ) : (
                          item.unit || ''
                        )}
                      </td>
                      {/* Unit Price */}
                      <td onClick={() => handleCellClick(item.id, 'unitPrice', item.unitPrice || "")}
                          style={{cursor:'pointer'}}>
                        {editing[`${item.id}_unitPrice`] ? (
                          <input
                            autoFocus
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            value={editValues[`${item.id}_unitPrice`]}
                            onChange={e => handleEditChange(item.id, 'unitPrice', e.target.value)}
                            onBlur={() => handleEditBlur(item.id, 'unitPrice')}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                            style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                          />
                        ) : (
                          item.unitPrice === 0 || item.unitPrice === undefined ? '' : item.unitPrice
                        )}
                      </td>
                      {/* PST */}
                      <td style={{cursor: PST_CATEGORIES.includes(item.category) ? 'default' : 'pointer'}}
                          onClick={() => !PST_CATEGORIES.includes(item.category) && handleCellClick(item.id, 'pst', item.pst || "")}>
                        {PST_CATEGORIES.includes(item.category) ? (
                          <span style={{
                            fontSize: '12px'
                          }}>
                            {formatNumber(pst)}
                          </span>
                        ) : (
                          editing[`${item.id}_pst`] ? (
                            <input
                              autoFocus
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9]*"
                              value={editValues[`${item.id}_pst`]}
                              onChange={e => handleEditChange(item.id, 'pst', e.target.value)}
                              onBlur={() => handleEditBlur(item.id, 'pst')}
                              onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                              style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                            />
                          ) : (
                            item.pst === 0 || item.pst === undefined ? '' : item.pst
                          )
                        )}
                      </td>
                      {/* Subtotal (not editable) */}
                      <td>{formatNumber(subtotalWithPST)}</td>
                      {/* Markup % */}
                      <td onClick={() => handleCellClick(item.id, 'markupPercent', item.markupPercent || "")}
                          style={{cursor:'pointer'}}>
                        {editing[`${item.id}_markupPercent`] ? (
                          <input
                            autoFocus
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            value={editValues[`${item.id}_markupPercent`]}
                            onChange={e => handleEditChange(item.id, 'markupPercent', e.target.value)}
                            onBlur={() => handleEditBlur(item.id, 'markupPercent')}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                            style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                          />
                        ) : (
                          item.markupPercent === 0 || item.markupPercent === undefined ? '' : item.markupPercent
                        )}
                      </td>
                      {/* Markup $ (not editable) */}
                      <td>{formatNumber(markupDollar)}</td>
                      {/* Total (not editable) */}
                      <td>{formatNumber(total)}</td>
                      {/* Notes */}
                      <td onClick={() => handleCellClick(item.id, 'notes', item.notes || "")}
                          style={{cursor:'pointer'}}>
                        {editing[`${item.id}_notes`] ? (
                          <input
                            autoFocus
                            value={editValues[`${item.id}_notes`]}
                            onChange={e => handleEditChange(item.id, 'notes', e.target.value)}
                            onBlur={() => handleEditBlur(item.id, 'notes')}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                            style={{width:'100%', minWidth: 0, boxSizing: 'border-box'}}
                          />
                        ) : (
                          item.notes || ''
                        )}
                      </td>                      {/* Actions */}
                      <td><button className="classic-button delete-item-button" onClick={() => deleteItem(item.id)}>Delete</button></td>
                    </tr>
                  );
                }))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="9" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {hasActiveFilters ? 'Filtered Total:' : 'Total:'}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    {formatNumber(hasActiveFilters ? filteredTotal : scopeTotal)}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>            </table>
          <div style={{marginTop: 16,display:'flex',alignItems:'center'}}>
            <button className="classic-button add-item-button" onClick={addItem}>+ Add Item</button>
          </div>
        </div>
    </div>
  );

  // Only wrap in Layout if not embedded (i.e., if no onBack prop)
  if (onBack) {
    return content;
  } else {
    return <Layout title="Scope Estimate Classic">{content}</Layout>;
  }
}
