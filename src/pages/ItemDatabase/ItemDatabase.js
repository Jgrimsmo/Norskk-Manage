import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";
import { db } from "../../services/firebaseConfig";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { fetchCollection, addToCollection, updateDocById, deleteDocById } from "../../lib/utils/firebaseHelpers";

function AddItemModal({ show, onClose, onAdd }) {
  const [form, setForm] = useState({ category: "", description: "", unitType: "", unitPrice: "", supplier: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  if (!show) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.category && form.description && form.unitType && form.unitPrice && form.supplier) {
      setIsLoading(true);
      try {
        await onAdd(form);
        setForm({ category: "", description: "", unitType: "", unitPrice: "", supplier: "" });
      } catch (error) {
        console.error("Error adding item:", error);
        alert("Failed to add item. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="add-project-modal-bg" onClick={onClose}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()}>
        <h2>Add Item</h2>
        <form className="add-project-form" onSubmit={handleSubmit}>
          <input 
            name="category" 
            value={form.category} 
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
            placeholder="Category" 
            disabled={isLoading}
          />
          <input 
            name="description" 
            value={form.description} 
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            placeholder="Description" 
            disabled={isLoading}
          />
          <input 
            name="unitType" 
            value={form.unitType} 
            onChange={e => setForm(f => ({ ...f, unitType: e.target.value }))} 
            placeholder="Unit Type" 
            disabled={isLoading}
          />
          <input 
            name="unitPrice" 
            type="number" 
            min="0" 
            step="0.01" 
            value={form.unitPrice} 
            onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} 
            placeholder="Unit Price" 
            disabled={isLoading}
          />
          <input 
            name="supplier" 
            value={form.supplier} 
            onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} 
            placeholder="Supplier" 
            disabled={isLoading}
          />
          <div className="modal-actions">
            <button className="classic-button" type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add"}
            </button>
            <button className="classic-button" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExcelImportModal({ show, onClose, onImport }) {
  const [pastedData, setPastedData] = useState("");
  const [parsedItems, setParsedItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!show) return null;

  const parseExcelData = (data) => {
    if (!data.trim()) {
      setParsedItems([]);
      setErrors(["Please paste your Excel data"]);
      return;
    }

    const lines = data.trim().split('\n');
    const items = [];
    const errorMessages = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const columns = line.split('\t'); // Excel copy-paste uses tabs

      if (columns.length < 5) {
        errorMessages.push(`Line ${lineNumber}: Not enough columns (expected 5: Category, Description, Unit Type, Unit Price, Supplier)`);
        return;
      }

      const [category, description, unitType, unitPrice, supplier] = columns.map(col => col.trim());

      // Validate required fields
      if (!category) {
        errorMessages.push(`Line ${lineNumber}: Category is required`);
        return;
      }
      if (!description) {
        errorMessages.push(`Line ${lineNumber}: Description is required`);
        return;
      }
      if (!unitType) {
        errorMessages.push(`Line ${lineNumber}: Unit Type is required`);
        return;
      }
      if (!unitPrice) {
        errorMessages.push(`Line ${lineNumber}: Unit Price is required`);
        return;
      }
      if (!supplier) {
        errorMessages.push(`Line ${lineNumber}: Supplier is required`);
        return;
      }

      // Validate unit price is a number
      const priceNumber = parseFloat(unitPrice.replace(/[$,]/g, ''));
      if (isNaN(priceNumber)) {
        errorMessages.push(`Line ${lineNumber}: Unit Price must be a valid number`);
        return;
      }

      items.push({
        category,
        description,
        unitType,
        unitPrice: priceNumber,
        supplier
      });
    });

    setParsedItems(items);
    setErrors(errorMessages);
  };

  const handleDataChange = (e) => {
    const data = e.target.value;
    setPastedData(data);
    parseExcelData(data);
  };

  const handleImport = async () => {
    if (parsedItems.length === 0) {
      alert("No valid items to import");
      return;
    }

    if (errors.length > 0) {
      if (!window.confirm(`There are ${errors.length} errors. Import valid items anyway?`)) {
        return;
      }
    }

    setIsLoading(true);
    try {
      await onImport(parsedItems);
      setPastedData("");
      setParsedItems([]);
      setErrors([]);
      alert(`Successfully imported ${parsedItems.length} items!`);
      onClose();
    } catch (error) {
      console.error("Error importing items:", error);
      alert("Failed to import items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPastedData("");
    setParsedItems([]);
    setErrors([]);
    onClose();
  };

  return (
    <div className="add-project-modal-bg" onClick={handleClose}>
      <div className="add-project-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <h2>Import Items from Excel</h2>
        
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f8ff', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Instructions:</h3>
          <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '12px' }}>
            <li>In Excel, select your data with columns: <strong>Category | Description | Unit Type | Unit Price | Supplier</strong></li>
            <li>Copy the selected data (Ctrl+C)</li>
            <li>Paste it in the text area below (Ctrl+V)</li>
            <li>Review the parsed data and click Import</li>
          </ol>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
            <strong>Example:</strong><br/>
            <code>Concrete&nbsp;&nbsp;&nbsp;&nbsp;Ready-mix 30MPa&nbsp;&nbsp;&nbsp;&nbsp;m³&nbsp;&nbsp;&nbsp;&nbsp;180&nbsp;&nbsp;&nbsp;&nbsp;ABC Concrete</code>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
            Paste Excel Data:
          </label>
          <textarea
            value={pastedData}
            onChange={handleDataChange}
            placeholder="Paste your Excel data here (Category, Description, Unit Type, Unit Price, Supplier)"
            style={{ 
              width: '100%', 
              height: '150px', 
              padding: '8px', 
              border: '2px inset #c0c0c0',
              fontFamily: 'monospace',
              fontSize: '12px',
              resize: 'vertical'
            }}
            disabled={isLoading}
          />
        </div>

        {errors.length > 0 && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#d32f2f' }}>Errors:</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px', color: '#d32f2f' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {parsedItems.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Preview ({parsedItems.length} items):</h3>
            <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ddd' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'left' }}>Unit Type</th>
                    <th style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'left' }}>Unit Price</th>
                    <th style={{ padding: '4px', border: '1px solid #ddd', textAlign: 'left' }}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>{item.category}</td>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>{item.description}</td>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>{item.unitType}</td>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>${item.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '4px', border: '1px solid #ddd' }}>{item.supplier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="classic-button" 
            onClick={handleImport} 
            disabled={isLoading || parsedItems.length === 0}
            style={{ 
              backgroundColor: parsedItems.length > 0 && errors.length === 0 ? '#4CAF50' : undefined,
              color: parsedItems.length > 0 && errors.length === 0 ? 'white' : undefined
            }}
          >
            {isLoading ? "Importing..." : `Import ${parsedItems.length} Items`}
          </button>
          <button className="classic-button" onClick={handleClose} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ItemDatabasePage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    unitType: "",
    supplier: ""
  });
  const [filterDropdowns, setFilterDropdowns] = useState({
    category: false,
    unitType: false,
    supplier: false,
    sortDropdown: false
  });

  // Sort states
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Sample items for seeding the database
  const sampleItems = [
    { category: "Concrete", description: "Ready-mix 30MPa", unitType: "m³", unitPrice: 180, supplier: "ABC Concrete" },
    { category: "Lumber", description: "2x4 SPF Stud", unitType: "piece", unitPrice: 4.25, supplier: "XYZ Lumber" },
    { category: "Steel", description: "Rebar #4", unitType: "piece", unitPrice: 12.50, supplier: "Steel Supply Co" },
    { category: "Electrical", description: "14 AWG Wire", unitType: "ft", unitPrice: 0.85, supplier: "Electric Pro" }
  ];

  // Firebase collection reference
  const itemsCollection = collection(db, "items");

  // Filter and sort items whenever items, filters, or sortConfig change
  useEffect(() => {
    let filtered = items;

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters.unitType) {
      filtered = filtered.filter(item => item.unitType === filters.unitType);
    }
    if (filters.supplier) {
      filtered = filtered.filter(item => item.supplier === filters.supplier);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric sorting for unitPrice
        if (sortConfig.key === 'unitPrice') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else {
          // Handle string sorting (case insensitive)
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredItems(filtered);
  }, [items, filters, sortConfig]);

  // Get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    return [...new Set(items.map(item => item[field]).filter(Boolean))].sort();
  };

  // Handle filter selection
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setFilterDropdowns(prev => ({ ...prev, [field]: false }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ category: "", unitType: "", supplier: "" });
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Clear sorting
  const clearSort = () => {
    setSortConfig({ key: null, direction: 'asc' });
  };

  // Get sort indicator for column headers
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
      if (!event.target.closest('th') && !event.target.closest('.sort-dropdown-container')) {
        setFilterDropdowns({ category: false, unitType: false, supplier: false, sortDropdown: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load items from Firebase on component mount
  useEffect(() => {
    // First, seed the database if it's empty
    seedDatabase();
      const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error("Error fetching items:", error);
      setError("Failed to load items. Please try again.");
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Add new item to Firebase
  const handleAdd = async (formData) => {
    try {
      const itemData = {
        category: formData.category,
        description: formData.description,
        unitType: formData.unitType,
        unitPrice: parseFloat(formData.unitPrice),
        supplier: formData.supplier,
        createdAt: new Date().toISOString()
      };
      
      await addToCollection("items", itemData);
      setShowAdd(false);
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  };

  // Bulk import items from Excel
  const handleBulkImport = async (itemsToImport) => {
    try {
      const promises = itemsToImport.map(item => 
        addToCollection("items", {
          ...item,
          createdAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      setShowImport(false);
    } catch (error) {
      console.error("Error importing items:", error);
      throw error;
    }
  };

  // Delete item from Firebase
  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDocById("items", itemId);
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    }
  };

  // Start editing an item
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      category: item.category,
      description: item.description,
      unitType: item.unitType,
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Save edited item
  const handleSaveEdit = async (itemId) => {
    try {
      // Validate required fields
      if (!editForm.category || !editForm.description || !editForm.unitType || !editForm.unitPrice || !editForm.supplier) {
        alert("All fields are required.");
        return;
      }

      // Validate unit price is a number
      const unitPrice = parseFloat(editForm.unitPrice);
      if (isNaN(unitPrice) || unitPrice < 0) {
        alert("Unit price must be a valid number greater than or equal to 0.");
        return;
      }

      const updateData = {
        category: editForm.category.trim(),
        description: editForm.description.trim(),
        unitType: editForm.unitType.trim(),
        unitPrice: unitPrice,
        supplier: editForm.supplier.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateDocById("items", itemId, updateData);
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item. Please try again.");
    }
  };

  // Handle edit form changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle keyboard shortcuts for editing
  const handleEditKeyDown = (e, itemId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(itemId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Seed database with sample data if empty
  const seedDatabase = async () => {
    try {
      const existingItems = await fetchCollection("items");
      if (existingItems.length === 0) {
        console.log("Database is empty, seeding with sample data...");
        for (const item of sampleItems) {
          await addToCollection("items", {
            ...item,
            createdAt: new Date().toISOString()
          });
        }
        console.log("Sample data added successfully!");
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  };
  if (loading) {
    return (
      <Layout title="Item Database">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading items...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Item Database">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px', margin: '1rem' }}>
          {error}
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Item Database">
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <button
          className="classic-button add-item-button"
          onClick={() => setShowAdd(true)}
        >
          + Add Item
        </button>
        
        <button
          className="classic-button"
          onClick={() => setShowImport(true)}
          style={{ backgroundColor: '#2196f3', color: 'white' }}
        >
          📊 Import from Excel
        </button>
        
        <button
          className="classic-button"
          onClick={() => {
            const sampleData = `Concrete\tReady-mix 30MPa\tm³\t180\tABC Concrete
Lumber\t2x4 SPF Stud\tpiece\t4.25\tXYZ Lumber
Steel\tRebar #4\tpiece\t12.50\tSteel Supply Co
Electrical\t14 AWG Wire\tft\t0.85\tElectric Pro
Plumbing\tPVC Pipe 4"\tft\t3.50\tPlumbing Plus
Hardware\tBolts 1/2"\tpiece\t0.75\tHardware Store`;
            navigator.clipboard.writeText(sampleData).then(() => {
              alert('Sample data copied to clipboard! You can now paste it in the Excel Import dialog.');
            }).catch(() => {
              alert('Failed to copy to clipboard. Please copy manually.');
            });
          }}
          style={{ backgroundColor: '#ff9800', color: 'white' }}
          title="Copy sample data to clipboard for testing"
        >
          📋 Copy Sample Data
        </button>

        {/* Sort Dropdown */}
        <div style={{ position: 'relative', display: 'inline-block' }} className="sort-dropdown-container">
          <button
            className="classic-button"
            onClick={() => setFilterDropdowns(prev => ({ 
              ...prev, 
              sortDropdown: !prev.sortDropdown,
              category: false,
              unitType: false,
              supplier: false
            }))}
            style={{ backgroundColor: '#9c27b0', color: 'white' }}
            title="Sort items"
          >
            🔤 Sort {sortConfig.key ? getSortIndicator(sortConfig.key) : ''}
          </button>
          
          {filterDropdowns.sortDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: 'white',
              border: '2px outset #c0c0c0',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              zIndex: 1000,
              minWidth: '150px',
              fontSize: '12px'
            }}>
              <div 
                style={{ 
                  padding: '6px 12px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #d0d0d0',
                  fontWeight: 'bold',
                  backgroundColor: '#f5f5f5'
                }}
                onClick={() => {
                  clearSort();
                  setFilterDropdowns(prev => ({ ...prev, sortDropdown: false }));
                }}
              >
                Clear Sort
              </div>
              <div 
                style={{ 
                  padding: '6px 12px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #d0d0d0'
                }}
                onClick={() => {
                  handleSort('category');
                  setFilterDropdowns(prev => ({ ...prev, sortDropdown: false }));
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Sort by Category {getSortIndicator('category')}
              </div>
              <div 
                style={{ 
                  padding: '6px 12px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #d0d0d0'
                }}
                onClick={() => {
                  handleSort('description');
                  setFilterDropdowns(prev => ({ ...prev, sortDropdown: false }));
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Sort by Description {getSortIndicator('description')}
              </div>
              <div 
                style={{ 
                  padding: '6px 12px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #d0d0d0'
                }}
                onClick={() => {
                  handleSort('unitType');
                  setFilterDropdowns(prev => ({ ...prev, sortDropdown: false }));
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Sort by Unit Type {getSortIndicator('unitType')}
              </div>
              <div 
                style={{ 
                  padding: '6px 12px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #d0d0d0'
                }}
                onClick={() => {
                  handleSort('unitPrice');
                  setFilterDropdowns(prev => ({ ...prev, sortDropdown: false }));
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Sort by Price {getSortIndicator('unitPrice')}
              </div>
              <div 
                style={{ 
                  padding: '6px 12px', 
                  cursor: 'pointer'
                }}
                onClick={() => {
                  handleSort('supplier');
                  setFilterDropdowns(prev => ({ ...prev, sortDropdown: false }));
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Sort by Supplier {getSortIndicator('supplier')}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="table-section">
        {/* Filter & Sort Summary */}
        {(filters.category || filters.unitType || filters.supplier || sortConfig.key) && (
          <div style={{ 
            marginBottom: '12px', 
            padding: '8px 12px', 
            backgroundColor: '#f0f8ff', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 'bold' }}>Active Filters & Sort:</span>
            {filters.category && (
              <span style={{ backgroundColor: '#e3f2fd', padding: '2px 6px', borderRadius: '3px' }}>
                Category: {filters.category}
              </span>
            )}
            {filters.unitType && (
              <span style={{ backgroundColor: '#e8f5e8', padding: '2px 6px', borderRadius: '3px' }}>
                Unit Type: {filters.unitType}
              </span>
            )}
            {filters.supplier && (
              <span style={{ backgroundColor: '#fff3e0', padding: '2px 6px', borderRadius: '3px' }}>
                Supplier: {filters.supplier}
              </span>
            )}
            {sortConfig.key && (
              <span style={{ backgroundColor: '#f3e5f5', padding: '2px 6px', borderRadius: '3px' }}>
                Sort: {sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1)} {getSortIndicator(sortConfig.key)}
              </span>
            )}
            <button 
              className="classic-button" 
              onClick={() => {
                clearFilters();
                clearSort();
              }}
              style={{ fontSize: '11px', padding: '2px 6px' }}
            >
              Clear All
            </button>
            <span style={{ color: '#666', marginLeft: 'auto' }}>
              Showing {filteredItems.length} of {items.length} items
            </span>
          </div>
        )}
        
        <table className="norskk-table">
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
                    unitType: false,
                    supplier: false
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
              <th>Description</th>
              <th style={{ position: 'relative' }}>
                Unit Type
                <span 
                  style={{ 
                    marginLeft: '4px', 
                    cursor: 'pointer', 
                    color: '#666', 
                    fontSize: '10px' 
                  }}
                  onClick={() => setFilterDropdowns(prev => ({ 
                    ...prev, 
                    unitType: !prev.unitType,
                    category: false,
                    supplier: false
                  }))}
                  title="Filter Unit Type"
                >
                  ▼
                </span>
                {filterDropdowns.unitType && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'white',
                    border: '2px outset #c0c0c0',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    minWidth: '120px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '11px'
                  }}>
                    <div 
                      style={{ 
                        padding: '4px 8px', 
                        cursor: 'pointer', 
                        borderBottom: '1px solid #d0d0d0',
                        fontWeight: filters.unitType === "" ? 'bold' : 'normal',
                        backgroundColor: filters.unitType === "" ? '#e8f5e8' : 'transparent'
                      }}
                      onClick={() => handleFilterChange('unitType', '')}
                    >
                      All Unit Types
                    </div>
                    {getUniqueValues('unitType').map(unitType => (
                      <div 
                        key={unitType}
                        style={{ 
                          padding: '4px 8px', 
                          cursor: 'pointer', 
                          borderBottom: '1px solid #d0d0d0',
                          fontWeight: filters.unitType === unitType ? 'bold' : 'normal',
                          backgroundColor: filters.unitType === unitType ? '#e8f5e8' : 'transparent'
                        }}
                        onClick={() => handleFilterChange('unitType', unitType)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = filters.unitType === unitType ? '#e8f5e8' : 'transparent'}
                      >
                        {unitType}
                      </div>
                    ))}
                  </div>
                )}
              </th>
              <th>Unit Price</th>
              <th style={{ position: 'relative' }}>
                Supplier
                <span 
                  style={{ 
                    marginLeft: '4px', 
                    cursor: 'pointer', 
                    color: '#666', 
                    fontSize: '10px' 
                  }}
                  onClick={() => setFilterDropdowns(prev => ({ 
                    ...prev, 
                    supplier: !prev.supplier,
                    category: false,
                    unitType: false
                  }))}
                  title="Filter Supplier"
                >
                  ▼
                </span>
                {filterDropdowns.supplier && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'white',
                    border: '2px outset #c0c0c0',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    minWidth: '180px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '11px'
                  }}>
                    <div 
                      style={{ 
                        padding: '4px 8px', 
                        cursor: 'pointer', 
                        borderBottom: '1px solid #d0d0d0',
                        fontWeight: filters.supplier === "" ? 'bold' : 'normal',
                        backgroundColor: filters.supplier === "" ? '#fff3e0' : 'transparent'
                      }}
                      onClick={() => handleFilterChange('supplier', '')}
                    >
                      All Suppliers
                    </div>
                    {getUniqueValues('supplier').map(supplier => (
                      <div 
                        key={supplier}
                        style={{ 
                          padding: '4px 8px', 
                          cursor: 'pointer', 
                          borderBottom: '1px solid #d0d0d0',
                          fontWeight: filters.supplier === supplier ? 'bold' : 'normal',
                          backgroundColor: filters.supplier === supplier ? '#fff3e0' : 'transparent'
                        }}
                        onClick={() => handleFilterChange('supplier', supplier)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = filters.supplier === supplier ? '#fff3e0' : 'transparent'}
                      >
                        {supplier}
                      </div>
                    ))}
                  </div>
                )}
              </th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>
                  {items.length === 0 ? 
                    'No items found. Click "Add Item" to get started.' :
                    'No items match the current filters. Try adjusting your filters.'
                  }
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} style={{ backgroundColor: editingId === item.id ? '#fffacd' : 'transparent' }}>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => handleEditFormChange('category', e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        style={{
                          width: '100%',
                          padding: '2px 4px',
                          border: '1px solid #ccc',
                          fontSize: '12px',
                          fontFamily: 'Tahoma, sans-serif'
                        }}
                        placeholder="Category"
                        autoFocus
                      />
                    ) : (
                      item.category
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        style={{
                          width: '100%',
                          padding: '2px 4px',
                          border: '1px solid #ccc',
                          fontSize: '12px',
                          fontFamily: 'Tahoma, sans-serif'
                        }}
                        placeholder="Description"
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.unitType}
                        onChange={(e) => handleEditFormChange('unitType', e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        style={{
                          width: '100%',
                          padding: '2px 4px',
                          border: '1px solid #ccc',
                          fontSize: '12px',
                          fontFamily: 'Tahoma, sans-serif'
                        }}
                        placeholder="Unit Type"
                      />
                    ) : (
                      item.unitType
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.unitPrice}
                        onChange={(e) => handleEditFormChange('unitPrice', e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        style={{
                          width: '100%',
                          padding: '2px 4px',
                          border: '1px solid #ccc',
                          fontSize: '12px',
                          fontFamily: 'Tahoma, sans-serif'
                        }}
                        placeholder="0.00"
                      />
                    ) : (
                      `$${typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(2) : item.unitPrice}`
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.supplier}
                        onChange={(e) => handleEditFormChange('supplier', e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        style={{
                          width: '100%',
                          padding: '2px 4px',
                          border: '1px solid #ccc',
                          fontSize: '12px',
                          fontFamily: 'Tahoma, sans-serif'
                        }}
                        placeholder="Supplier"
                      />
                    ) : (
                      item.supplier
                    )}
                  </td>
                  <td className="actions">
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {editingId === item.id ? (
                        <>
                          <button 
                            className="classic-button" 
                            onClick={() => handleSaveEdit(item.id)}
                            style={{ 
                              fontSize: '11px', 
                              padding: '2px 6px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            title="Save changes"
                          >
                            ✓ Save
                          </button>
                          <button 
                            className="classic-button" 
                            onClick={handleCancelEdit}
                            style={{ 
                              fontSize: '11px', 
                              padding: '2px 6px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            title="Cancel editing"
                          >
                            ✗ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="classic-button" 
                            onClick={() => handleEdit(item)}
                            style={{ 
                              fontSize: '11px', 
                              padding: '2px 6px',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            title="Edit this item"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="classic-button" 
                            onClick={() => handleDelete(item.id)}
                            style={{ 
                              fontSize: '11px', 
                              padding: '2px 6px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            title="Delete this item"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>      
      
      <AddItemModal show={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      <ExcelImportModal show={showImport} onClose={() => setShowImport(false)} onImport={handleBulkImport} />
    </Layout>
  );
}
