// src/pages/EstimateDashboard.js
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { where } from "firebase/firestore";
import { fetchCollection, addToCollection, updateDocById, deleteDocById, fetchSubcollection, queryCollection } from "../../Utils/firebaseHelpers";
import "../../styles/page.css";
import "../../styles/tables.css"; // Shared table styles
import "../../styles/buttons.css"; // Importing buttons.css for button styles
import ScopeEstimateClassic from "../estimate/ScopeEstimateClassic";
import Layout from "../../components/Layout";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProposalModal from "./ProposalModal";

export default function EstimateDashboard({ useSlug }) {
  const params = useParams();
  const projectIdOrSlug = params.projectId || params.slug;
  const [project, setProject] = useState(null);
  const [scopes, setScopes] = useState([]);
  const [scopeItems, setScopeItems] = useState([]);
  const [newScopeName, setNewScopeName] = useState("");
  const [editFields, setEditFields] = useState({});
  const [inPlaceScopeId, setInPlaceScopeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingScopeLoading, setAddingScopeLoading] = useState(false);
  const [savingProjectLoading, setSavingProjectLoading] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [editingScopeId, setEditingScopeId] = useState(null);
  const [scopeDescription, setScopeDescription] = useState("");
  const [scopeName, setScopeName] = useState("");
  const [savingDescriptionLoading, setSavingDescriptionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scopeToDelete, setScopeToDelete] = useState(null);useEffect(() => {
    if (projectIdOrSlug) {
      loadAllData();
    }
  }, [projectIdOrSlug]);
  
  // Optimized: Load all data in parallel to avoid N+1 queries
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Run project and scopes fetch in parallel
      const [projectResult, allScopes] = await Promise.all([
        loadProject(),
        fetchCollection("scopes")
      ]);
      
      // Filter scopes for this project
      const projectScopes = allScopes.filter(scope => scope.projectId === projectIdOrSlug);
      setScopes(projectScopes);
      
      // Load all scope items in parallel (batch fetching)
      if (projectScopes.length > 0) {
        const scopeItemPromises = projectScopes.map(async (scope) => {
          const items = await fetchSubcollection(`scopes/${scope.id}`, "items");
          return { scopeName: scope.name, items };
        });
        
        const scopeItemsResults = await Promise.all(scopeItemPromises);
        setScopeItems(scopeItemsResults);
      } else {
        setScopeItems([]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadProject = async () => {
    let found;
    if (useSlug) {
      const results = await queryCollection("projects", where("slug", "==", projectIdOrSlug));
      if (results.length > 0) {
        found = results[0];
      }
    } else {
      const projects = await fetchCollection("projects");
      found = projects.find(project => project.id === projectIdOrSlug);
    }
    if (found) {
      setProject(found);
      
      // Format the date for HTML date input (YYYY-MM-DD)
      let formattedDate = "";
      if (found.estimateDate) {
        try {
          if (found.estimateDate.seconds) {
            // Firebase timestamp
            formattedDate = new Date(found.estimateDate.seconds * 1000).toISOString().split('T')[0];
          } else if (typeof found.estimateDate === 'string') {
            // ISO string or date string
            formattedDate = new Date(found.estimateDate).toISOString().split('T')[0];
          } else if (found.estimateDate instanceof Date) {
            // Date object
            formattedDate = found.estimateDate.toISOString().split('T')[0];
          }
        } catch (err) {
          console.warn("Error formatting date:", err);
          formattedDate = "";
        }
      }
      
      setEditFields({
        name: found.name || "",
        address: found.address || "",
        developer: found.developer || "",
        estimator: found.estimator || "",
        estimateDate: formattedDate,
        updatedDate: found.updatedDate || "",
      });
    }
    return found;
  };
  
  // Optimized: Reload only scopes and their items, reusing existing project data
  const loadScopesAndItems = async () => {
    try {
      const allScopes = await fetchCollection("scopes");
      const projectScopes = allScopes.filter(scope => scope.projectId === projectIdOrSlug);
      setScopes(projectScopes);
      
      // Load all scope items in parallel
      if (projectScopes.length > 0) {
        const scopeItemPromises = projectScopes.map(async (scope) => {
          const items = await fetchSubcollection(`scopes/${scope.id}`, "items");
          return { scopeName: scope.name, items };
        });
        
        const scopeItemsResults = await Promise.all(scopeItemPromises);
        setScopeItems(scopeItemsResults);
      } else {
        setScopeItems([]);
      }
    } catch (err) {
      console.error("Error loading scopes and items:", err);
    }
  };  const addScope = async () => {
    if (!newScopeName.trim()) return;
    
    try {
      setAddingScopeLoading(true);
      await addToCollection("scopes", {
        name: newScopeName,
        projectId: projectIdOrSlug,
      });
      setNewScopeName("");
      // Optimized: Only reload scopes and items, not the entire project
      await loadScopesAndItems();
    } catch (err) {
      console.error("Error adding scope:", err);
      setError("Failed to add scope. Please try again.");
    } finally {
      setAddingScopeLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };  const saveProjectDetails = async () => {
    try {
      setSavingProjectLoading(true);
      
      // Handle date properly to avoid timezone issues
      let saveData = { ...editFields };
      if (editFields.estimateDate) {
        // Keep the date as YYYY-MM-DD format to avoid timezone conversion issues
        saveData.estimateDate = editFields.estimateDate;
      }
      
      await updateDocById("projects", projectIdOrSlug, {
        ...saveData,
        updatedDate: new Date().toISOString(),
      });
      
      // Update the project state to reflect changes immediately
      setProject(prev => ({ ...prev, ...saveData, updatedDate: new Date().toISOString() }));
    } catch (err) {
      console.error("Error saving project details:", err);
      setError("Failed to save project details. Please try again.");
    } finally {
      setSavingProjectLoading(false);
    }
  };

  const handleEditScope = (scopeId) => {
    const scope = scopes.find(s => s.id === scopeId);
    if (scope) {
      setEditingScopeId(scopeId);
      setScopeDescription(scope.description || "");
      setScopeName(scope.name || "");
      // Clear the inPlaceScopeId to show scope editing mode
      setInPlaceScopeId(null);
    }
  };

  const saveScopeDescription = async () => {
    if (!editingScopeId) return;
    
    try {
      setSavingDescriptionLoading(true);
      await updateDocById("scopes", editingScopeId, {
        name: scopeName,
        description: scopeDescription,
        updatedDate: new Date().toISOString(),
      });
      // Don't clear editingScopeId here - keep the scope editing view open
      // Reload scopes to get updated data
      await loadScopesAndItems();
    } catch (err) {
      console.error("Error saving scope:", err);
      setError("Failed to save scope. Please try again.");
    } finally {
      setSavingDescriptionLoading(false);
    }
  };

  const handleScopeNavigation = (newScopeId) => {
    // Update the editing scope ID
    setEditingScopeId(newScopeId);
    
    // Update the scope details in the left card
    const scope = scopes.find(s => s.id === newScopeId);
    if (scope) {
      setScopeName(scope.name || "");
      setScopeDescription(scope.description || "");
    }
  };

  const cancelScopeEdit = () => {
    setEditingScopeId(null);
    setScopeDescription("");
    setScopeName("");
  };

  const handleDeleteScope = (scope, scopeData) => {
    setScopeToDelete({ scope, scopeData });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteScope = async () => {
    if (!scopeToDelete) return;
    
    try {
      await deleteDocById("scopes", scopeToDelete.scopeData?.id);
      await loadScopesAndItems();
      setShowDeleteConfirm(false);
      setScopeToDelete(null);
    } catch (err) {
      console.error("Error deleting scope:", err);
      setError("Failed to delete scope. Please try again.");
    }
  };

  const cancelDeleteScope = () => {
    setShowDeleteConfirm(false);
    setScopeToDelete(null);
  };

  // Helper function to format dates consistently
  const formatDate = (date) => {
    if (!date) return "Not set";
    
    // Handle Firebase timestamp
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    
    // Handle YYYY-MM-DD format (avoid timezone conversion)
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    }
    
    // Handle ISO string or other date formats
    if (typeof date === 'string' || date instanceof Date) {
      return new Date(date).toLocaleDateString();
    }
    
    return "Not set";
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

  // Function to calculate item total with auto PST and markup
  const calculateItemTotal = (item) => {
    const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
    const pst = calculateAutoPST(item);
    const subtotalWithPST = subtotal + pst;
    const markup = subtotalWithPST * ((item.markupPercent || 0) / 100);
    return subtotalWithPST + markup;
  };

  // Memoized calculation to prevent unnecessary re-computations
  const filteredRows = useMemo(() => {
    return scopeItems.flatMap(scope =>
      scope.items.map(item => ({
        scopeName: scope.scopeName,
        category: item.category || '',
        name: item.name || '',
        total: calculateItemTotal(item).toFixed(2)
      }))
    );
  }, [scopeItems]);

  // Memoized category summary calculation for the currently edited scope
  const categorySummary = useMemo(() => {
    if (!editingScopeId) return [];
    
    // Find the current scope's items
    const currentScope = scopeItems.find(scope => {
      const scopeData = scopes.find(s => s.name === scope.scopeName);
      return scopeData?.id === editingScopeId;
    });
    
    if (!currentScope || !currentScope.items) return [];
    
    // Group items by category
    const categoryMap = new Map();
    
    currentScope.items.forEach(item => {
      const category = item.category || 'Uncategorized';
      const itemTotal = calculateItemTotal(item);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          itemCount: 0,
          total: 0
        });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.itemCount += 1;
      categoryData.total += itemTotal;
    });
    
    // Convert to array and sort by total (descending)
    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  }, [editingScopeId, scopeItems, scopes]);

  // Memoized scope totals calculation for summary view
  const scopeTotals = useMemo(() => {
    const totals = new Map();
    
    scopeItems.forEach(scope => {
      const scopeTotal = scope.items.reduce((sum, item) => {
        return sum + calculateItemTotal(item);
      }, 0);
      
      totals.set(scope.scopeName, {
        name: scope.scopeName,
        itemCount: scope.items.length,
        total: scopeTotal
      });
    });
    
    return Array.from(totals.values());
  }, [scopeItems]);
  
  // Memoized total calculation
  const totalAmount = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + Number(r.total), 0).toFixed(2);
  }, [filteredRows]);

  // Memoized overall category summary calculation for all scopes
  const overallCategorySummary = useMemo(() => {
    const categoryMap = new Map();
    
    scopeItems.forEach(scope => {
      scope.items.forEach(item => {
        const category = item.category || 'Uncategorized';
        const itemTotal = calculateItemTotal(item);
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            total: 0
          });
        }
        
        const categoryData = categoryMap.get(category);
        categoryData.total += itemTotal;
      });
    });
    
    // Convert to array and sort by total (descending)
    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  }, [scopeItems]);
  if (loading) {
    return (
      <Layout title="Estimate Dashboard">
        <LoadingSpinner size="large" text="Loading project data..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Estimate Dashboard">        <div>
          <p>Error: {error}</p>
          <button className="classic-button" onClick={loadAllData}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={project?.name ? `Project: ${project.name}` : "Estimate Dashboard"}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: '100%' }}>
        
        {/* Left column: Project Details OR Scope Details */}
        <div style={{ minWidth: 320, maxWidth: 400, flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {editingScopeId ? (
            <>
              {/* Scope Details Card */}
              <div className="page-card">
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-primary-text)' }}>
                    Scope Name:
                  </label>
                  <input
                    value={scopeName}
                    onChange={(e) => setScopeName(e.target.value)}
                    placeholder="Enter scope name..."
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '2px inset var(--color-border-color)',
                      borderRadius: '0px',
                      fontWeight: 'bold',
                      fontFamily: 'inherit',
                      background: 'var(--color-card-background)',
                      color: 'var(--color-primary-text)'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--color-primary-text)' }}>
                    Description:
                  </label>
                  <textarea
                    value={scopeDescription}
                    onChange={(e) => setScopeDescription(e.target.value)}
                    placeholder="Enter a detailed description for this scope..."
                    rows={6}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '2px inset var(--color-border-color)', 
                      borderRadius: '0px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      background: 'var(--color-card-background)',
                      color: 'var(--color-primary-text)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="classic-button" 
                    onClick={saveScopeDescription}
                    disabled={savingDescriptionLoading}
                    style={{ flex: 1 }}
                  >
                    {savingDescriptionLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Category Summary Card */}
              <div className="page-card">
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--color-primary-text)', borderBottom: '2px solid var(--color-border-color)', paddingBottom: '8px' }}>Category Summary</h3>
                {categorySummary.length > 0 ? (
                  <table className="norskk-table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySummary.map((cat, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 'bold' }}>{cat.category}</td>
                          <td>${cat.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ textAlign: "right", fontWeight: 'bold' }}>
                          Total:
                        </td>
                        <td style={{ fontWeight: 'bold' }}>
                          ${categorySummary.reduce((sum, cat) => sum + cat.total, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                    No items in this scope yet. Add items to see category breakdown.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Project Details Card */
            <div className="page-card">
              <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--color-primary-text)', borderBottom: '2px solid var(--color-border-color)', paddingBottom: '8px' }}>Project Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ minWidth: '90px', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary-text)' }}>
                    Name:
                  </label>
                  <input
                    name="name"
                    value={editFields.name}
                    onChange={handleEditChange}
                    onBlur={saveProjectDetails}
                    placeholder="Project Name"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '2px inset var(--color-border-color)',
                      borderRadius: '0px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: 'var(--color-card-background)',
                      color: 'var(--color-primary-text)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ minWidth: '90px', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary-text)' }}>
                    Address:
                  </label>
                  <input
                    name="address"
                    value={editFields.address}
                    onChange={handleEditChange}
                    onBlur={saveProjectDetails}
                    placeholder="Address"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '2px inset var(--color-border-color)',
                      borderRadius: '0px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: 'var(--color-card-background)',
                      color: 'var(--color-primary-text)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ minWidth: '90px', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary-text)' }}>
                    Developer:
                  </label>
                  <input
                    name="developer"
                    value={editFields.developer}
                    onChange={handleEditChange}
                    onBlur={saveProjectDetails}
                    placeholder="Developer"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '2px inset var(--color-border-color)',
                      borderRadius: '0px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: 'var(--color-card-background)',
                      color: 'var(--color-primary-text)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ minWidth: '90px', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary-text)' }}>
                    Estimator:
                  </label>
                  <input
                    name="estimator"
                    value={editFields.estimator}
                    onChange={handleEditChange}
                    onBlur={saveProjectDetails}
                    placeholder="Estimator"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '2px inset var(--color-border-color)',
                      borderRadius: '0px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: 'var(--color-card-background)',
                      color: 'var(--color-primary-text)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ minWidth: '90px', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-primary-text)' }}>
                    Due Date:
                  </label>
                  <input
                    name="estimateDate"
                    type="date"
                    value={editFields.estimateDate}
                    onChange={handleEditChange}
                    onBlur={saveProjectDetails}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '2px inset var(--color-border-color)',
                      borderRadius: '0px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      background: 'var(--color-card-background)',
                      color: 'var(--color-primary-text)'
                    }}
                  />
                </div>

                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--color-border-color-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                    <strong>Last Updated:</strong> {formatDate(project?.updatedDate)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: '12px' }}>
                  <button className="classic-button" onClick={() => setShowProposalModal(true)}>
                    Create PDF Proposal
                  </button>
                  {savingProjectLoading && (
                    <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', alignSelf: 'center' }}>
                      Saving...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Overall Category Summary Card - Only show when not editing a scope */}
          {!editingScopeId && (
            <div className="page-card">
              <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--color-primary-text)', borderBottom: '2px solid var(--color-border-color)', paddingBottom: '8px' }}>Category Summary</h3>
              {overallCategorySummary.length > 0 ? (
                <table className="norskk-table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overallCategorySummary.map((cat, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 'bold' }}>{cat.category}</td>
                        <td>${cat.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ textAlign: "right", fontWeight: 'bold' }}>
                        Total:
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        ${overallCategorySummary.reduce((sum, cat) => sum + cat.total, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                  No items in project yet. Add scopes and items to see category breakdown.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Estimate Summary OR Scope Items */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="page-card">
            {editingScopeId ? (
              /* Scope Items Management */
              <ScopeEstimateClassic
                projectId={projectIdOrSlug}
                scopeId={editingScopeId}
                onBack={cancelScopeEdit}
                onScopeNavigation={handleScopeNavigation}
              />
            ) : inPlaceScopeId ? (
              /* Legacy scope editing - shouldn't happen now */
              <ScopeEstimateClassic
                projectId={projectIdOrSlug}
                scopeId={inPlaceScopeId}
                onBack={() => setInPlaceScopeId(null)}
                onScopeNavigation={handleScopeNavigation}
              />
            ) : (
              /* Estimate Summary */
              <>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600', color: 'var(--color-primary-text)', borderBottom: '2px solid var(--color-border-color)', paddingBottom: '8px' }}>Estimate Summary</h3>
                
                {/* Add New Scope Section */}
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--color-header-background)', borderRadius: '0px', border: '2px inset var(--color-border-color)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      value={newScopeName}
                      onChange={e => setNewScopeName(e.target.value)}
                      placeholder="Add new scope..."
                      style={{ flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newScopeName.trim() && !addingScopeLoading) {
                          addScope();
                        }
                      }}
                    />
                    <button 
                      className="classic-button" 
                      onClick={addScope}
                      disabled={addingScopeLoading || !newScopeName.trim()}
                    >
                      {addingScopeLoading ? "Adding..." : "Add Scope"}
                    </button>
                  </div>
                </div>

                <table className="norskk-table">
                  <thead>
                    <tr>
                      <th>Scope</th>
                      <th>Description</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopeTotals.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                          No estimate items found. Add a scope above to get started.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {scopeTotals.map((scope, i) => {
                          // Find the scope ID from the scopes array
                          const scopeData = scopes.find(s => s.name === scope.name);
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 'bold' }}>{scope.name}</td>
                              <td style={{ maxWidth: '200px' }}>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#666',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {scopeData?.description || <em style={{ color: '#999' }}>No description</em>}
                                </div>
                              </td>
                              <td>{scope.itemCount} item{scope.itemCount !== 1 ? 's' : ''}</td>
                              <td>${scope.total.toFixed(2)}</td>
                              <td className="actions">
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button 
                                    className="classic-button" 
                                    onClick={() => handleEditScope(scopeData?.id)}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="delete-item-button"
                                    onClick={() => handleDeleteScope(scope, scopeData)}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan="3" style={{ textAlign: "right" }}>
                            <strong>Total:</strong>
                          </td>
                          <td>
                            <strong>
                              ${totalAmount}
                            </strong>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Proposal Modal */}
      <ProposalModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        project={project}
        scopes={scopes}
        scopeItems={scopeItems}
        totalAmount={totalAmount}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={cancelDeleteScope}
        >
          <div 
            className="page-card"
            style={{
              maxWidth: '400px',
              margin: 0,
              padding: '24px',
              background: 'var(--color-card-background)',
              border: '2px solid var(--color-border-color)',
              borderRadius: '4px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '16px', 
              color: 'var(--color-danger)',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Confirm Delete
            </h3>
            <p style={{ 
              margin: '0 0 20px 0', 
              color: 'var(--color-primary-text)',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete the scope <strong>"{scopeToDelete?.scope?.name}"</strong>?
              <br />
              <span style={{ color: 'var(--color-danger)', fontSize: '14px' }}>
                This action cannot be undone.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="classic-button secondary"
                onClick={cancelDeleteScope}
                style={{ 
                  padding: '8px 16px',
                  background: 'var(--color-button-background)',
                  border: '1px solid var(--color-border-color)',
                  color: 'var(--color-primary-text)'
                }}
              >
                Cancel
              </button>
              <button 
                className="classic-button"
                onClick={confirmDeleteScope}
                style={{ 
                  padding: '8px 16px',
                  background: 'var(--color-danger)',
                  border: '1px solid var(--color-danger)',
                  color: 'white'
                }}
              >
                Delete Scope
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
