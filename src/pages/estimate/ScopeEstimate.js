import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../Firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { fetchCollection, fetchSubcollection, addToSubcollection, updateSubcollectionDoc, deleteSubcollectionDoc } from "../../lib/utils/firebaseHelpers";
import '../../styles/page.css';
import '../../styles/tables.css';
import Layout from "../../components/Layout";

// Accept projectId and scopeId as props for embedded use, fallback to useParams for routed use
export default function ScopeEstimate({ projectId: propProjectId, scopeId: propScopeId, onBack }) {
  const params = useParams();
  const projectId = propProjectId || params.projectId;
  const scopeId = propScopeId || params.scopeId;
  
  const [scope, setScope] = useState(null);
  const [allScopes, setAllScopes] = useState([]);
  const [items, setItems] = useState([]);
  const [databaseItems, setDatabaseItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    loadScope();
    loadDatabaseItems();
    // eslint-disable-next-line
  }, [projectId, scopeId]);

  const loadDatabaseItems = () => {
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDatabaseItems(itemsData);
    }, (error) => {
      console.error("Error fetching database items:", error);
    });

    return unsubscribe;
  };  const loadScope = async () => {
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
        setItems(items);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  const addItem = async () => {
    try {
      const newItem = { name: "", quantity: 0, unit: "", unitPrice: 0 };
      const itemId = await addToSubcollection(`scopes/${scopeId}`, "items", newItem);
      setItems(prev => [...prev, { ...newItem, id: itemId }]);
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const handleScopeNavigation = async (newScopeId) => {
    if (newScopeId === scopeId) return; // Already on this scope
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear all editing states
      setShowDropdown({});
      setSearchTerm("");
      
      // Load the new scope and its items
      const items = await fetchSubcollection(`scopes/${newScopeId}`, "items");
      const newScope = allScopes.find(scope => scope.id === newScopeId);
      
      if (newScope) {
        setScope(newScope);
        setItems(items);
        
        // Update the URL to reflect the new scope
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace(/\/[^\/]+$/, `/${newScopeId}`);
        window.history.pushState(null, '', newPath);
        
        // Force a page refresh to ensure all components update properly
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  const updateItem = async (itemId, field, value) => {
    try {
      const updates = { [field]: value };
      
      // If updating category, quantity, or unitPrice, automatically recalculate PST
      if (field === 'category' || field === 'quantity' || field === 'unitPrice') {
        const currentItem = items.find(item => item.id === itemId);
        const updatedItem = { ...currentItem, [field]: value };
        
        // Auto-calculate PST for qualifying categories
        if (PST_CATEGORIES.includes(updatedItem.category)) {
          const subtotal = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
          updates.pst = subtotal * PST_RATE;
        } else if (field === 'category' && !PST_CATEGORIES.includes(value)) {
          // Clear PST if category no longer qualifies
          updates.pst = 0;
        }
      }
      
      await updateSubcollectionDoc(`scopes/${scopeId}`, "items", itemId, updates);
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
    } catch (err) {
      console.error("Error updating item:", err);
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
  const selectDatabaseItem = async (itemId, databaseItem) => {
    try {
      const updates = {
        category: databaseItem.category,
        name: databaseItem.description,
        unit: databaseItem.unitType,
        unitPrice: databaseItem.unitPrice
      };

      // Auto-calculate PST for qualifying categories
      if (PST_CATEGORIES.includes(databaseItem.category)) {
        const currentItem = items.find(item => item.id === itemId);
        const subtotal = (currentItem?.quantity || 0) * databaseItem.unitPrice;
        updates.pst = subtotal * PST_RATE;
      } else {
        updates.pst = 0;
      }

      await updateSubcollectionDoc(`scopes/${scopeId}`, "items", itemId, updates);
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
      
      setShowDropdown(prev => ({ ...prev, [itemId]: false }));
      setSearchTerm("");
    } catch (error) {
      console.error("Error selecting database item:", error);
    }
  };
  const toggleDropdown = (itemId) => {
    setShowDropdown(prev => {
      const newState = { ...prev, [itemId]: !prev[itemId] };
      if (!newState[itemId]) {
        setSearchTerm(""); // Clear search when closing
      }
      return newState;
    });
  };

  const filteredDatabaseItems = (searchTerm) => {
    if (!searchTerm) return databaseItems;
    return databaseItems.filter(item => 
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDropdown({});
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <Layout title="Scope Estimate">
        <div>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Scope Estimate">
        <div>
          <p>Error: {error}</p>
          <button onClick={loadScope}>Retry</button>
        </div>
      </Layout>
    );
  }

  if (!scope) {
    return (
      <Layout title="Scope Estimate">
        <div>Scope not found</div>
      </Layout>
    );
  }

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

  const scopeTotal = items.reduce((acc, item) => acc + calculateItemTotal(item), 0);

  // Helper for formatting numbers with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '';
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Layout title="Scope Estimate">
      <div className="estimate-container" style={{background:'none',padding:'32px 32px 0 32px',maxWidth:'100%'}}>
        <div style={{background:'#223046',color:'#fff',padding:'10px 18px',borderRadius:'6px 6px 0 0',fontWeight:700,fontSize:18,marginBottom:0,letterSpacing:0.5}}>
          {scope?.name ? `${scope.name} - Estimate Items` : 'Estimate Items'}
        </div>
        
        <div style={{ padding: '12px', backgroundColor: '#f8fafc', marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', borderRadius: '0 0 6px 6px' }}>
          {onBack && (
            <button className="classic-button" onClick={onBack}>Back to Summary</button>
          )}
          
          {/* Scope Navigation Buttons */}
          {allScopes.length > 1 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
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

        <div className="table-section">
          <table className="norskk-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
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
            </thead><tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                    No items found. Click 'Add Item' to start building your estimate.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                <tr key={item.id} style={{background: idx % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e5e7eb',fontSize:13}}>                  <td>
                    <div style={{position:'relative'}} className="dropdown-container">
                      <input 
                        value={item.category || ""} 
                        onChange={e => updateItem(item.id, "category", e.target.value)} 
                        style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px',boxSizing:'border-box'}} 
                        placeholder="Category"
                      />
                      <button 
                        onClick={() => toggleDropdown(item.id)} 
                        style={{
                          position:'absolute',
                          right:4,
                          top:4,
                          border:'none',
                          background:'#0d5c7a',
                          color:'white',
                          borderRadius:'3px',
                          cursor:'pointer',
                          fontSize:'10px',
                          padding:'2px 4px'
                        }}
                      >
                        📋
                      </button>
                      {showDropdown[item.id] && (
                        <div style={{
                          position:'absolute',
                          top:'100%',
                          left:0,
                          minWidth:400,
                          width:'max-content',
                          maxWidth:500,
                          zIndex:1000,
                          background:'#fff',
                          border:'1px solid #d1d5db',
                          borderRadius:4,
                          boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                          maxHeight:200,
                          overflowY:'auto'
                        }} className="dropdown-container">
                          <div style={{padding:'8px', borderBottom:'1px solid #e5e7eb', fontWeight:'bold', fontSize:'12px'}}>
                            Select from Item Database:
                          </div>
                          <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                              width:'100%',
                              padding:'8px',
                              border:'none',
                              borderBottom:'1px solid #d1d5db',
                              fontSize:'12px',
                              boxSizing:'border-box'
                            }}
                          />
                          {filteredDatabaseItems(searchTerm).length === 0 ? (
                            <div style={{padding:'8px', fontSize:'12px', color:'#666'}}>
                              {searchTerm ? 'No items found' : 'No items in database'}
                            </div>
                          ) : (
                            filteredDatabaseItems(searchTerm).map(dbItem => (
                              <div
                                key={dbItem.id}
                                onClick={() => selectDatabaseItem(item.id, dbItem)}
                                style={{
                                  padding:'8px 12px',
                                  cursor:'pointer',
                                  borderBottom:'1px solid #f3f4f6',
                                  fontSize:'12px',
                                  whiteSpace:'nowrap',
                                  overflow:'hidden',
                                  textOverflow:'ellipsis'
                                }}
                                onMouseEnter={e => e.target.style.background = '#f8fafc'}
                                onMouseLeave={e => e.target.style.background = 'white'}
                              >
                                <div style={{fontWeight:'bold', color:'#0d5c7a', marginBottom:'2px'}}>{dbItem.category}</div>
                                <div style={{color:'#374151', marginBottom:'2px', fontWeight:'500'}}>{dbItem.description}</div>
                                <div style={{fontSize:'11px', color:'#6b7280', display:'flex', gap:'8px'}}>
                                  <span>{dbItem.unitType}</span>
                                  <span>${typeof dbItem.unitPrice === 'number' ? dbItem.unitPrice.toFixed(2) : dbItem.unitPrice}</span>
                                  <span>{dbItem.supplier}</span>
                                </div>
                              </div>
                            ))
                          )}
                          <div style={{padding:'8px', borderTop:'1px solid #e5e7eb'}}>
                            <button
                              onClick={() => {
                                setShowDropdown(prev => ({ ...prev, [item.id]: false }));
                                setSearchTerm("");
                              }}
                              style={{
                                background:'#6b7280',
                                color:'white',
                                border:'none',
                                padding:'4px 8px',
                                borderRadius:'3px',
                                fontSize:'11px',
                                cursor:'pointer',
                                width:'100%'
                              }}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td><input value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)} style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px',boxSizing:'border-box'}} /></td>
                  <td><input type="text" inputMode="decimal" pattern="[0-9]*" value={item.quantity === 0 ? '' : item.quantity} placeholder="Enter Qty" onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px',boxSizing:'border-box',textAlign:'center'}} /></td>
                  <td><input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px',boxSizing:'border-box'}} /></td>
                  <td style={{position:'relative'}}>
                    <span style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',color:'#888',fontSize:13}}>$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={item.unitPrice === 0 ? '' : item.unitPrice}
                      placeholder="Enter Price"
                      onChange={e => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px 4px 16px',boxSizing:'border-box',textAlign:'right'}}
                    />
                  </td>
                  <td style={{position:'relative'}}>
                    <span style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',color:'#888',fontSize:13}}>$</span>
                    {PST_CATEGORIES.includes(item.category) ? (
                      <span style={{
                        fontSize:13,
                        paddingLeft:16,
                        display:'block',
                        padding:'4px 2px 4px 16px'
                      }}>
                        {formatNumber(calculateAutoPST(item))}
                      </span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={item.pst === 0 ? '' : item.pst || ''}
                        placeholder=""
                        onChange={e => updateItem(item.id, "pst", parseFloat(e.target.value) || 0)}
                        style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px 4px 16px',boxSizing:'border-box',textAlign:'right'}}
                      />
                    )}
                  </td>
                  <td style={{fontSize:13,position:'relative'}}>
                    <span style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',color:'#888',fontSize:13}}>$</span>
                    <span style={{paddingLeft:16}}>{formatNumber((item.quantity || 0) * (item.unitPrice || 0) + calculateAutoPST(item))}</span>
                  </td>
                  <td style={{position:'relative'}}>
                    <span style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',color:'#888',fontSize:13}}>%</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={item.markupPercent === 0 ? '' : item.markupPercent}
                      placeholder="Add %"
                      onChange={e => updateItem(item.id, "markupPercent", parseFloat(e.target.value) || 0)}
                      style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px 4px 16px',boxSizing:'border-box',textAlign:'right'}}
                    />
                  </td>
                  <td style={{fontSize:13,position:'relative'}}>
                    <span style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',color:'#888',fontSize:13}}>$</span>
                    <span style={{paddingLeft:16}}>{formatNumber(((item.quantity || 0) * (item.unitPrice || 0) + calculateAutoPST(item)) * ((item.markupPercent || 0) / 100))}</span>
                  </td>
                  <td style={{fontSize:13,position:'relative'}}>
                    <span style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',color:'#888',fontSize:13}}>$</span>
                    <span style={{paddingLeft:16}}>{formatNumber(calculateItemTotal(item))}</span>
                  </td>                  <td><input value={item.notes || ""} onChange={e => updateItem(item.id, "notes", e.target.value)} style={{fontSize:13,width:'100%',background:'transparent',border:'none',padding:'4px 2px',boxSizing:'border-box'}} /></td>
                  <td><button className="classic-button delete-item-button" onClick={() => deleteItem(item.id)}>Delete</button></td>
                </tr>
              )))}
            </tbody>
          </table>        </div>
        <button className="classic-button add-item-button" style={{ marginTop: 16 }} onClick={addItem}>+ Add Item</button>
        <div className="scope-total" style={{marginTop:18,fontWeight:700,fontSize:15,color:'#223046',background:'#f8fafd',padding:'10px 18px',borderRadius:6,display:'inline-block'}}>
          Scope Total: $ {formatNumber(scopeTotal)}
        </div>
      </div>
    </Layout>
  );
}
