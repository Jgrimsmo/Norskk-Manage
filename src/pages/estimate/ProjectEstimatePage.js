import React, { useEffect, useState, useRef, useMemo } from "react";
import { serverTimestamp } from "firebase/firestore";
import { fetchCollection, addToCollection, deleteDocById, fetchSubcollection, updateDocById } from "../../lib/utils/firebaseHelpers";
import { formatDate } from "../../lib/utils/dateUtils";
import { PROJECT_STATUS, ESTIMATE_STATUS_OPTIONS } from "../../lib/constants/appConstants";
import { Link } from "react-router-dom";
import '../../styles/tables.css';
import '../EstimateDashboard/AddEstimateModal.css';
import '../../styles/page.css';
import Layout from "../../components/Layout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ToastContainer } from "../../components/Toast";
import { useToast } from "../../hooks/useToast";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export default function ProjectEstimatePage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    developer: "",
    estimator: "",
    estimateDate: "",
    updatedDate: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [totalCosts, setTotalCosts] = useState({});
  const [statusUpdating, setStatusUpdating] = useState({});
  const [filters, setFilters] = useState({ developer: "", estimator: "", status: "" });
  const [filterDropdown, setFilterDropdown] = useState({ developer: false, estimator: false, status: false });  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingProject, setAddingProject] = useState(false);
  const [deletingProjects, setDeletingProjects] = useState(new Set());
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const filterRefs = {
    developer: useRef(),
    estimator: useRef(),
    status: useRef()
  };

  // Use status options from constants
  const STATUS_OPTIONS = ESTIMATE_STATUS_OPTIONS;

  // Helper function to format dates consistently using our utility
  const formatEstimateDate = (date) => {
    if (!date) return "N/A";
    
    // Handle Firebase timestamp
    if (date.seconds) {
      return formatDate(new Date(date.seconds * 1000).toISOString().split('T')[0]);
    }
    
    // Handle YYYY-MM-DD format
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return formatDate(date);
    }
    
    // Handle ISO string or other date formats
    if (typeof date === 'string' || date instanceof Date) {
      return formatDate(new Date(date).toISOString().split('T')[0]);
    }
    
    return "N/A";
  };

  useEffect(() => {
    loadProjects();
  }, []);  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Categories that should automatically have 7% PST applied
      const PST_CATEGORIES = ['Materials', 'Subcontractors', 'Trucking & Aggregates'];
      const PST_RATE = 0.07; // 7%

      // Function to calculate item total with auto PST
      const calculateItemTotal = (item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const subtotal = quantity * unitPrice;
        
        // Calculate PST - auto for qualifying categories, otherwise use stored value
        let pst = 0;
        if (PST_CATEGORIES.includes(item.category)) {
          pst = subtotal * PST_RATE;
        } else {
          pst = Number(item.pst) || 0;
        }
        
        const subtotalWithPST = subtotal + pst;
        const markupPercent = Number(item.markupPercent) || 0;
        const markup = subtotalWithPST * (markupPercent / 100);
        
        return subtotalWithPST + markup;
      };
      
      // Fetch all data in parallel to avoid N+1 queries
      const [projectsArr, allScopes] = await Promise.all([
        fetchCollection("projects"),
        fetchCollection("scopes")
      ]);
      
      setProjects(projectsArr);

      // Calculate costs efficiently with batched operations
      const costs = {};
      
      // Group scopes by project for efficient processing
      const scopesByProject = {};
      allScopes.forEach(scope => {
        if (!scopesByProject[scope.projectId]) {
          scopesByProject[scope.projectId] = [];
        }
        scopesByProject[scope.projectId].push(scope);
      });

      // Fetch all scope items in parallel
      const scopeItemPromises = allScopes.map(async (scope) => {
        const items = await fetchSubcollection(`scopes/${scope.id}`, "items");
        return { scopeId: scope.id, projectId: scope.projectId, items };
      });

      const allScopeItems = await Promise.all(scopeItemPromises);
      
      // Calculate totals efficiently using the new PST logic
      projectsArr.forEach(project => {
        let total = 0;
        const projectScopeItems = allScopeItems.filter(
          scopeData => scopeData.projectId === project.id
        );
        
        projectScopeItems.forEach(scopeData => {
          scopeData.items.forEach(item => {
            total += calculateItemTotal(item);
          });
        });
        
        costs[project.id] = total;
      });
      
      setTotalCosts(costs);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleFilterDropdownSelect = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setFilterDropdown((prev) => ({ ...prev, [key]: false }));
  };

  // Memoized filtered projects for better performance
  const filteredProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        (!filters.developer || p.developer === filters.developer) &&
        (!filters.estimator || p.estimator === filters.estimator) &&
        (!filters.status || p.status === filters.status)
    );
  }, [projects, filters]);

  // Function to handle status updates
  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      setStatusUpdating(prev => ({ ...prev, [projectId]: true }));
      
      await updateDocById("projects", projectId, {
        status: newStatus,
        updatedDate: new Date().toISOString()
      });
      
      // Update local state to reflect the change
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, status: newStatus, updatedDate: new Date().toISOString() }
            : project
        )
      );
      
      showSuccess(`Project status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Error updating project status:", err);
      showError("Failed to update project status. Please try again.");
    } finally {
      setStatusUpdating(prev => ({ ...prev, [projectId]: false }));
    }
  };

  return (
    <Layout title="Estimate Dashboard">
      <div className="estimate-container">
        <div className="estimate-card">
          <div className="project-list-section">            {loading && (
              <LoadingSpinner size="large" text="Loading projects and calculating costs..." />
            )}            {error && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px', margin: '1rem 0' }}>
                {error}
                <button 
                  onClick={loadProjects} 
                  className="classic-button"
                  style={{ marginLeft: '1rem' }}
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="table-section">
              <table className="norskk-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th style={{ position: "relative" }}>
                      Developer
                      <span
                        className="filter-icon"
                        onClick={() =>
                          setFilterDropdown((d) => ({ ...d, developer: !d.developer }))
                        }
                        title="Filter Developer"
                      >
                        ▼
                      </span>
                      {filterDropdown.developer && (
                        <div className="filter-dropdown" ref={filterRefs.developer}>
                          <div
                            className={`filter-dropdown-option${
                              filters.developer === "" ? " selected" : ""
                            }`}
                            onClick={() => handleFilterDropdownSelect("developer", "")}
                          >
                            All
                          </div>
                          {[...new Set(projects.map((p) => p.developer || ""))].map((dev) => (
                            <div
                              key={dev}
                              className={`filter-dropdown-option${
                                filters.developer === dev ? " selected" : ""
                              }`}
                              onClick={() => handleFilterDropdownSelect("developer", dev)}
                            >
                              {dev || "Unknown"}
                            </div>
                          ))}
                        </div>
                      )}
                    </th>
                    <th>Address</th>
                    <th style={{ position: "relative" }}>
                      Estimator
                      <span
                        className="filter-icon"
                        onClick={() =>
                          setFilterDropdown((d) => ({ ...d, estimator: !d.estimator }))
                        }
                        title="Filter Estimator"
                      >
                        ▼
                      </span>
                      {filterDropdown.estimator && (
                        <div className="filter-dropdown" ref={filterRefs.estimator}>
                          <div
                            className={`filter-dropdown-option${
                              filters.estimator === "" ? " selected" : ""
                            }`}
                            onClick={() => handleFilterDropdownSelect("estimator", "")}
                          >
                            All
                          </div>
                          {[...new Set(projects.map((p) => p.estimator || ""))].map((est) => (
                            <div
                              key={est}
                              className={`filter-dropdown-option${
                                filters.estimator === est ? " selected" : ""
                              }`}
                              onClick={() => handleFilterDropdownSelect("estimator", est)}
                            >
                              {est || "Unknown"}
                            </div>
                          ))}
                        </div>
                      )}
                    </th>
                    <th>Estimate Due Date</th>
                    <th>Created Date</th>
                    <th>Last Updated</th>
                    <th style={{ position: "relative" }}>
                      Status
                      <span
                        className="filter-icon"
                        onClick={() =>
                          setFilterDropdown((d) => ({ ...d, status: !d.status }))
                        }
                        title="Filter Status"
                      >
                        ▼
                      </span>
                      {filterDropdown.status && (
                        <div className="filter-dropdown" ref={filterRefs.status}>
                          <div
                            className={`filter-dropdown-option${
                              filters.status === "" ? " selected" : ""
                            }`}
                            onClick={() => handleFilterDropdownSelect("status", "")}
                          >
                            All
                          </div>
                          {[...new Set(projects.map((p) => p.status || ""))].map((status) => (
                            <div
                              key={status}
                              className={`filter-dropdown-option${
                                filters.status === status ? " selected" : ""
                              }`}
                              onClick={() => handleFilterDropdownSelect("status", status)}
                            >
                              {status || "Unknown"}
                            </div>
                          ))}
                        </div>
                      )}
                    </th>
                    <th>Total Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>                <tbody>
                  {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                          {projects.length === 0 
                            ? "No projects found. Click 'Add Estimate' to create your first project."
                            : "No projects match the current filters. Try adjusting your filter criteria."
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project) => (
                          <tr key={project.id}>
                            <td style={{ fontWeight: 'bold' }}>{project.name || "N/A"}</td>
                            <td>{project.developer || "N/A"}</td>
                            <td>{project.address || "N/A"}</td>
                            <td>{project.estimator || "N/A"}</td>
                            <td>{formatEstimateDate(project.estimateDate)}</td>
                            <td>
                              {formatEstimateDate(project.createdDate)}
                            </td>
                            <td>
                              {formatEstimateDate(project.updatedDate)}
                            </td>
                            <td>
                              <select
                                value={project.status || "In Progress"}
                                onChange={(e) => handleStatusUpdate(project.id, e.target.value)}
                                disabled={statusUpdating[project.id]}
                                style={{
                                  width: '100%',
                                  padding: '4px 8px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  backgroundColor: statusUpdating[project.id] ? '#f5f5f5' : 'white',
                                  cursor: statusUpdating[project.id] ? 'not-allowed' : 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                {STATUS_OPTIONS.map(status => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>${(totalCosts[project.id] || 0).toFixed(2)}</td>
                            <td>
                              <Link to={`/project/${project.id}`}>
                                <button className="classic-button">View</button>
                              </Link>                              <button 
                                className="classic-button delete-item-button" 
                                style={{ marginLeft: 8 }} 
                                disabled={deletingProjects.has(project.id)}                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this project?')) {
                                    try {
                                      setDeletingProjects(prev => new Set(prev).add(project.id));
                                      await deleteDocById('projects', project.id);
                                      // Optimized: Remove from state instead of full reload
                                      setProjects(prev => prev.filter(p => p.id !== project.id));
                                      setTotalCosts(prev => {
                                        const newCosts = { ...prev };
                                        delete newCosts[project.id];
                                        return newCosts;
                                      });
                                      showSuccess(`Project "${project.name}" deleted successfully`);
                                    } catch (err) {
                                      console.error('Error deleting project:', err);
                                      showError('Failed to delete project. Please try again.');
                                    } finally {
                                      setDeletingProjects(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(project.id);
                                        return newSet;
                                      });
                                    }
                                  }
                                }}
                              >
                                {deletingProjects.has(project.id) ? "Deleting..." : "Delete"}
                              </button>
                            </td>
                          </tr>
                        ))
                    )}</tbody>
              </table>
            </div>
            <button className="classic-button add-item-button" style={{ marginTop: 16, alignSelf: 'flex-start' }} onClick={() => setShowModal(true)}>
              + Add Estimate
            </button>
              </>
            )}
          </div>
        </div>

        {showModal && (
          <div className="add-estimate-modal-bg" onClick={() => setShowModal(false)}>
            <div className="add-estimate-modal" onClick={e => e.stopPropagation()}>
              <h3>Add Estimate </h3>              <form className="add-project-form" onSubmit={async (e) => {
                e.preventDefault();
                if (form.name.trim()) {
                  try {
                    setAddingProject(true);
                    const slug = slugify(form.name);
                    const newProjectData = {
                      ...form,
                      slug,
                      createdDate: serverTimestamp(),
                      updatedDate: serverTimestamp(),
                      status: "Draft"
                    };
                    const newProjectId = await addToCollection("projects", newProjectData);
                    
                    // Optimized: Add to state instead of full reload
                    const newProject = { 
                      id: newProjectId, 
                      ...newProjectData,
                      createdDate: { seconds: Date.now() / 1000 },
                      updatedDate: { seconds: Date.now() / 1000 }
                    };                    setProjects(prev => [...prev, newProject]);
                    setTotalCosts(prev => ({ ...prev, [newProjectId]: 0 }));
                    
                    setShowModal(false);
                    setForm({ name: "", address: "", developer: "", estimator: "", estimateDate: "", updatedDate: "" });
                    showSuccess(`Project "${form.name}" created successfully`);
                  } catch (err) {
                    console.error('Error adding project:', err);
                    showError('Failed to add project. Please try again.');
                  } finally {
                    setAddingProject(false);
                  }
                }
              }}>
                <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Project Name" />
                <input name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Project Address" />
                <input name="developer" value={form.developer} onChange={e => setForm({ ...form, developer: e.target.value })} placeholder="Developer" />
                <input name="estimator" value={form.estimator} onChange={e => setForm({ ...form, estimator: e.target.value })} placeholder="Estimator" />
                <input name="estimateDate" value={form.estimateDate} onChange={e => setForm({ ...form, estimateDate: e.target.value })} placeholder="Estimate Due Date" />                <div className="modal-actions">
                  <button 
                    className="classic-button" 
                    type="submit"
                    disabled={addingProject}
                  >
                    {addingProject ? "Adding..." : "Add"}
                  </button>
                  <button 
                    className="classic-button secondary" 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    disabled={addingProject}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Layout>
  );
}
