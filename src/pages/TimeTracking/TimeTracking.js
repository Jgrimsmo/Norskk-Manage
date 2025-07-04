import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "../../styles/tables.css";
import "../../styles/page.css";
import "./TimeTrackingPDFPreview.css";
import "./TimeTracking.css";
import Layout from "../../components/layout/Layout";
import { fetchCollection } from "../../lib/utils/firebaseHelpers";
import { useAuth } from "../../contexts/AuthContext";
import { PERMISSIONS } from "../../contexts/AuthContext";
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { addToCollection, updateDocById, deleteDocById } from "../../lib/utils/firebaseHelpers";

// Autocomplete Employee Dropdown Component
function EmployeeAutocomplete({ value, onChange, crew, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredCrew, setFilteredCrew] = useState(crew);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    setFilteredCrew(crew);
  }, [crew]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const searchValue = e.target.value;
    setInputValue(searchValue);
    onChange(searchValue);

    // Filter crew members based on input
    const filtered = crew.filter(member =>
      member.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredCrew(filtered);
    setIsOpen(searchValue.length > 0 && filtered.length > 0);
  };

  const handleSelectEmployee = (employeeName) => {
    setInputValue(employeeName);
    onChange(employeeName);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (!disabled && crew.length > 0) {
      setFilteredCrew(crew);
      setIsOpen(true);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder="Start typing employee name..."
        className="table-input"
        disabled={disabled}
        style={{
          width: '100%',
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />
      {isOpen && filteredCrew.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {filteredCrew.map(member => (
            <div
              key={member.id}
              onClick={() => handleSelectEmployee(member.name)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: '500' }}>{member.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{member.role}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getPayPeriodDates(start, end) {
  const dates = [];
  let current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// Function to get current pay period based on today's date
function getCurrentPayPeriod() {
  const today = new Date();
  
  // Find the pay period that contains today's date
  for (const period of PAY_PERIODS) {
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    
    if (today >= startDate && today <= endDate) {
      return period;
    }
  }
  
  // If no current period found, return the most recent one (first in array)
  return PAY_PERIODS[0];
}

// List of pay periods (add more as needed)
const PAY_PERIODS = [
  { label: "July 13 - July 26, 2025", start: "2025-07-13", end: "2025-07-26" },
  { label: "June 29 - July 12, 2025", start: "2025-06-29", end: "2025-07-12" },
  { label: "June 15 - June 28, 2025", start: "2025-06-15", end: "2025-06-28" },
  { label: "June 1 - June 14, 2025", start: "2025-06-01", end: "2025-06-14" },
  { label: "May 18 - May 31, 2025", start: "2025-05-18", end: "2025-05-31" }
];

// Get current pay period dynamically
const CURRENT_PAY_PERIOD = getCurrentPayPeriod();
const PAY_PERIOD_START = CURRENT_PAY_PERIOD.start;
const PAY_PERIOD_END = CURRENT_PAY_PERIOD.end;
const payPeriodDates = getPayPeriodDates(PAY_PERIOD_START, PAY_PERIOD_END);

// Sample crew data (fallback if no crew collection exists)
const SAMPLE_CREW = [
  { id: "1", name: "John Smith", role: "Foreman", phone: "555-0123" },
  { id: "2", name: "Anna Lee", role: "Operator", phone: "555-0456" },
  { id: "3", name: "Mike Brown", role: "Laborer", phone: "555-0789" }
];

// Sample cost codes (fallback if projects don't have cost codes)
const SAMPLE_COST_CODES = [
  "01-Site Preparation",
  "02-Excavation", 
  "03-Foundation",
  "04-Concrete Work",
  "05-Framing",
  "06-Electrical",
  "07-Plumbing",
  "08-HVAC",
  "09-Finishing",
  "10-Cleanup"
];

// Work type options
const WORK_TYPES = [
  "T&M",
  "Lump Sum"
];

function formatDateString(dateString) {
  // Safely format YYYY-MM-DD as local date string
  const [year, month, day] = dateString.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

// PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subheader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  tableContainer: {
    marginTop: 15,
    border: '1pt solid #333',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    padding: 6,
    fontWeight: 'bold',
    borderBottom: '1pt solid #333',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottom: '0.5pt solid #ddd',
    minHeight: 18,
  },
  dateRow: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderBottom: '1pt solid #bbb',
    borderTop: '0.5pt solid #bbb',
  },
  // Optimized column widths for better content fit
  col1: { width: '12%', borderRight: '0.5pt solid #ddd', paddingRight: 4 }, // Date
  col2: { width: '18%', borderRight: '0.5pt solid #ddd', paddingRight: 4 }, // Employee  
  col3: { width: '16%', borderRight: '0.5pt solid #ddd', paddingRight: 4 }, // Project
  col4: { width: '14%', borderRight: '0.5pt solid #ddd', paddingRight: 4 }, // Equipment
  col5: { width: '14%', borderRight: '0.5pt solid #ddd', paddingRight: 4 }, // Cost Code
  col6: { width: '8%', borderRight: '0.5pt solid #ddd', paddingRight: 4 },  // Work Type
  col7: { width: '6%', borderRight: '0.5pt solid #ddd', paddingRight: 4, textAlign: 'center' },  // Hours
  col8: { width: '12%', paddingRight: 4 }, // Notes
  text: {
    fontSize: 8,
    lineHeight: 1.2,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 1.1,
  },
  dateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#444',
  },
  summary: {
    marginTop: 15,
    padding: 8,
    backgroundColor: '#f0f0f0',
    border: '1pt solid #ccc',
    borderRadius: 3,
  },
  filterInfo: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#f9f9f9',
    border: '0.5pt solid #ddd',
    borderRadius: 2,
  },
});

// PDF Document component
const TimeTrackingPDF = ({ entries, dateRange, filters, formatDateString }) => {
  const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
  
  // Group entries by date
  const entriesByDate = entries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});

  const sortedDates = Object.keys(entriesByDate).sort();

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>Time Tracking Report</Text>
        <Text style={pdfStyles.subheader}>
          {dateRange} • Total Hours: {totalHours.toFixed(2)}
        </Text>
        
        {Object.keys(filters).some(key => filters[key]) && (
          <View style={pdfStyles.filterInfo}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>Applied Filters:</Text>
            {Object.entries(filters).map(([key, value]) => value && (
              <Text key={key} style={{ fontSize: 8, marginLeft: 8, marginBottom: 1 }}>
                • {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
              </Text>
            ))}
          </View>
        )}

        <View style={pdfStyles.tableContainer}>
          {/* Table Header */}
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.headerText, pdfStyles.col1]}>Date</Text>
            <Text style={[pdfStyles.headerText, pdfStyles.col2]}>Employee</Text>
            <Text style={[pdfStyles.headerText, pdfStyles.col3]}>Project</Text>
            <Text style={[pdfStyles.headerText, pdfStyles.col4]}>Equipment</Text>
            <Text style={[pdfStyles.headerText, pdfStyles.col5]}>Cost Code</Text>
            <Text style={[pdfStyles.headerText, pdfStyles.col6]}>Type</Text>
            <Text style={[pdfStyles.headerText, pdfStyles.col7]}>Hrs</Text>
            <Text style={[pdfStyles.headerText, pdfStyles.col8]}>Notes</Text>
          </View>

          {/* Table Rows */}
          {sortedDates.map(date => (
            <View key={date}>
              <View style={pdfStyles.dateRow}>
                <Text style={[pdfStyles.dateText, { width: '100%' }]}>
                  {formatDateString(date)}
                </Text>
              </View>
              {entriesByDate[date].map((entry, index) => (
                <View key={`${date}-${index}`} style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.text, pdfStyles.col1]}></Text>
                  <Text style={[pdfStyles.text, pdfStyles.col2]}>{entry.employee || '-'}</Text>
                  <Text style={[pdfStyles.text, pdfStyles.col3]}>{entry.project || '-'}</Text>
                  <Text style={[pdfStyles.text, pdfStyles.col4]}>{entry.equipment || '-'}</Text>
                  <Text style={[pdfStyles.text, pdfStyles.col5]}>{entry.costCode || '-'}</Text>
                  <Text style={[pdfStyles.text, pdfStyles.col6]}>{entry.workType || '-'}</Text>
                  <Text style={[pdfStyles.text, pdfStyles.col7]}>{entry.hours || '-'}</Text>
                  <Text style={[pdfStyles.text, pdfStyles.col8]}>{(entry.notes || '-').length > 20 ? (entry.notes || '-').substring(0, 17) + '...' : (entry.notes || '-')}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={pdfStyles.summary}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>
            Summary: {entries.length} entries • {totalHours.toFixed(2)} total hours
          </Text>
          <Text style={{ fontSize: 8, color: '#666' }}>
            Generated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// PDF Preview Modal component
const TimeTrackingPDFPreviewModal = ({ isOpen, onClose, entries, dateRange, filters, formatDateString }) => {
  if (!isOpen) return null;

  const pdfDocument = (
    <TimeTrackingPDF 
      entries={entries}
      dateRange={dateRange}
      filters={filters}
      formatDateString={formatDateString}
    />
  );

  // Generate filename with current date and filters
  const today = new Date().toISOString().slice(0, 10);
  const filterString = Object.values(filters).filter(Boolean).length > 0 ? '_filtered' : '';
  const fileName = `time_tracking_${today}${filterString}.pdf`;

  // Use React Portal to render modal at document body level
  return createPortal(
    <div className="pdf-preview-modal">
      <div className="pdf-preview-overlay" onClick={onClose}></div>
      <div className="pdf-preview-content">
        <div className="pdf-preview-header">
          <h3>Time Tracking Report Preview</h3>
          <div className="pdf-preview-actions">
            <PDFDownloadLink
              document={pdfDocument}
              fileName={fileName}
              className="btn btn-primary"
              style={{ textDecoration: 'none', marginRight: '10px' }}
            >
              {({ blob, url, loading, error }) => (
                loading ? 'Preparing download...' : '📄 Download PDF'
              )}
            </PDFDownloadLink>
            <button onClick={onClose} className="btn btn-secondary">Close</button>
            <button 
              onClick={onClose} 
              className="pdf-preview-close-btn"
              title="Close preview"
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '5px',
                lineHeight: '1'
              }}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="pdf-preview-viewer">
          <PDFViewer width="100%" height="600px">
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function TimeTracking() {
  const { user, hasPermission } = useAuth();
  
  // Store all entries as an array of objects, each with a date
  const [entries, setEntries] = useState([]);
  const [filters, setFilters] = useState({ date: "", employee: "", project: "", equipment: "", costCode: "", workType: "", status: "" });
  const [filterDropdown, setFilterDropdown] = useState({ date: false, employee: false, project: false, equipment: false, costCode: false, workType: false, status: false });  const [dateMode, setDateMode] = useState("payperiod"); // payperiod, month, range
  const [customRange, setCustomRange] = useState({ start: PAY_PERIOD_START, end: PAY_PERIOD_END });
  const [selectedMonth, setSelectedMonth] = useState(PAY_PERIOD_START.slice(0, 7)); // YYYY-MM
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(getCurrentPayPeriod());
  const [projects, setProjects] = useState([]);
  const [crew, setCrew] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [projectCostCodes, setProjectCostCodes] = useState({}); // Store cost codes by project ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const filterRefs = {
    date: useRef(),
    employee: useRef(),
    project: useRef(),
    equipment: useRef(),
    costCode: useRef(),
    workType: useRef(),
    status: useRef()
  };  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch projects, crew, equipment, and time entries in parallel
        const [projectData, crewData, equipmentData, timeEntriesData] = await Promise.all([
          fetchCollection("managementProjects"),
          fetchCollection("crew").catch(() => []), // Use empty array if crew collection doesn't exist
          fetchCollection("equipment").catch(() => []), // Load equipment from Firebase
          fetchCollection("timeEntries").catch(() => []) // Load existing time entries
        ]);
        
        const projectsList = projectData.map(doc => ({ id: doc.id, name: doc.name, costCodes: doc.costCodes || [] }));
        setProjects(projectsList);
        
        // Build cost codes mapping by project
        const costCodesMap = {};
        projectsList.forEach(project => {
          costCodesMap[project.name] = project.costCodes || [];
        });
        setProjectCostCodes(costCodesMap);
        
        // Use sample crew data if no crew collection exists
        const crewList = crewData.length > 0 
          ? crewData.map(doc => ({ id: doc.id, name: doc.name, role: doc.role, phone: doc.phone }))
          : SAMPLE_CREW;
        setCrew(crewList);
        
        // Load equipment from Firebase, use fallback if empty
        const equipmentList = equipmentData.length > 0 
          ? equipmentData.map(doc => ({ id: doc.id, name: doc.name, type: doc.type }))
          : [
              { id: '1', name: "CAT 320", type: "Excavator" },
              { id: '2', name: "Bobcat S650", type: "Skid Steer" },
              { id: '3', name: "Hydraulic Hammer", type: "Attachment" },
              { id: '4', name: "Plate Compactor", type: "Compactor" }
            ];
        setEquipment(equipmentList);
        
        // Load existing time entries
        const entriesList = timeEntriesData.map(doc => ({
          id: doc.id,
          date: doc.date,
          employee: doc.employee || "",
          project: doc.project || "",
          equipment: doc.equipment || "",
          costCode: doc.costCode || "",
          workType: doc.workType || "",
          hours: doc.hours || "",
          notes: doc.notes || "",
          status: doc.status || (doc.approved ? "Approved" : "Pending"), // Support both new and legacy fields
          approved: doc.approved || false, // Keep for backward compatibility
          approvedBy: doc.approvedBy || null,
          approvedDate: doc.approvedDate || null,
          createdBy: doc.createdBy || "",
          createdDate: doc.createdDate || ""
        }));
        setEntries(entriesList);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again.");
        // Use sample crew as fallback even on error
        setCrew(SAMPLE_CREW);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper function to check if user can assign employees to others
  const canAssignEmployees = () => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  // Helper function to get default employee name
  const getDefaultEmployeeName = () => {
    return canAssignEmployees() ? "" : (user?.name || user?.email || "");
  };

  // Helper function to get cost codes for a specific project
  const getCostCodesForProject = (projectName) => {
    if (!projectName) return []; // No project selected
    const costCodes = projectCostCodes[projectName] || [];
    // Use sample cost codes if project has no cost codes defined
    return costCodes.length > 0 ? costCodes : SAMPLE_COST_CODES;
  };

  // Helper to get dates for current selection
  let visibleDates = [];
  if (dateMode === "payperiod") {
    visibleDates = getPayPeriodDates(selectedPayPeriod.start, selectedPayPeriod.end);
  } else if (dateMode === "month") {
    const [year, month] = selectedMonth.split("-");
    const first = new Date(Number(year), Number(month) - 1, 1);
    const last = new Date(Number(year), Number(month), 0);
    visibleDates = getPayPeriodDates(
      first.toISOString().slice(0, 10),
      last.toISOString().slice(0, 10)
    );
  } else if (dateMode === "range") {
    visibleDates = getPayPeriodDates(customRange.start, customRange.end);
  }

  const handleChange = async (id, field, value) => {
    try {
      // Update local state immediately for responsive UI
      setEntries(entries => entries.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, [field]: value };
          
          // If project changes, clear cost code since it's project-specific
          if (field === 'project') {
            updatedEntry.costCode = '';
          }
          
          return updatedEntry;
        }
        return entry;
      }));

      // Prepare update data for Firebase
      const updateData = { [field]: value };
      if (field === 'project') {
        updateData.costCode = ''; // Clear cost code when project changes
      }

      // Update in Firebase
      await updateDocById("timeEntries", id, updateData);
    } catch (error) {
      console.error("Error updating time entry:", error);
      // Optionally show error message to user
      setError("Failed to save changes. Please try again.");
    }
  };

  const handleAddEntry = async (date) => {
    try {
      // Use the date string as-is, no conversion
      const formattedDate = date;
      const newEntryData = {
        date: formattedDate,
        employee: getDefaultEmployeeName(),
        project: "",
        equipment: "",
        costCode: "",
        workType: "",
        hours: "",
        notes: "",
        status: "Pending",
        approved: false, // Keep for backward compatibility
        createdBy: user?.name || user?.email || "",
        createdDate: new Date().toISOString()
      };

      // Add to Firebase first
      const newEntryId = await addToCollection("timeEntries", newEntryData);
      
      // Create entry with Firebase ID for local state
      const newEntry = {
        id: newEntryId,
        ...newEntryData
      };

      // Update local state
      setEntries(entries => {
        const lastIndex = entries.map(e => e.date).lastIndexOf(formattedDate);
        if (lastIndex === -1) {
          const dateIdx = payPeriodDates.indexOf(formattedDate);
          let insertAt = entries.length;
          for (let i = dateIdx + 1; i < payPeriodDates.length; i++) {
            const nextDate = payPeriodDates[i];
            const nextIdx = entries.findIndex(e => e.date === nextDate);
            if (nextIdx !== -1) {
              insertAt = nextIdx;
              break;
            }
          }
          return [
            ...entries.slice(0, insertAt),
            newEntry,
            ...entries.slice(insertAt)
          ];
        } else {
          return [
            ...entries.slice(0, lastIndex + 1),
            newEntry,
            ...entries.slice(lastIndex + 1)
          ];
        }
      });
    } catch (error) {
      console.error("Error adding time entry:", error);
      setError("Failed to add entry. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      // Delete from Firebase first
      await deleteDocById("timeEntries", id);
      
      // Update local state
      setEntries(entries => entries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("Error deleting time entry:", error);
      setError("Failed to delete entry. Please try again.");
    }
  };

  // Handle entry approval (only for admin/manager roles)
  const handleApprove = async (id) => {
    if (!canApproveEntries()) {
      alert("You don't have permission to approve entries.");
      return;
    }
    
    try {
      const approvalData = {
        status: "Approved",
        approved: true, // Keep for backward compatibility
        approvedBy: user?.name || user?.email,
        approvedDate: new Date().toISOString()
      };

      // Update in Firebase first
      await updateDocById("timeEntries", id, approvalData);
      
      // Update local state
      setEntries(entries => entries.map(entry => {
        if (entry.id === id) {
          return { ...entry, ...approvalData };
        }
        return entry;
      }));
    } catch (error) {
      console.error("Error approving time entry:", error);
      setError("Failed to approve entry. Please try again.");
    }
  };

  // Handle entry un-approval (only for admin/manager roles)
  const handleUnApprove = async (id) => {
    if (!canApproveEntries()) {
      alert("You don't have permission to un-approve entries.");
      return;
    }
    
    try {
      const unapprovalData = {
        status: "Pending",
        approved: false, // Keep for backward compatibility
        approvedBy: null,
        approvedDate: null
      };

      // Update in Firebase first
      await updateDocById("timeEntries", id, unapprovalData);
      
      // Update local state
      setEntries(entries => entries.map(entry => {
        if (entry.id === id) {
          return { ...entry, ...unapprovalData };
        }
        return entry;
      }));
    } catch (error) {
      console.error("Error un-approving time entry:", error);
      setError("Failed to un-approve entry. Please try again.");
    }
  };

  // Handle marking entry for review (available to all users)
  const handleNeedsReview = async (id) => {
    if (!canApproveEntries()) {
      alert("You don't have permission to mark entries for review.");
      return;
    }
    
    try {
      const reviewData = {
        status: "Needs Review",
        approved: false, // Keep for backward compatibility
        reviewBy: user?.name || user?.email,
        reviewDate: new Date().toISOString()
      };

      // Update in Firebase first
      await updateDocById("timeEntries", id, reviewData);
      
      // Update local state
      setEntries(entries => entries.map(entry => {
        if (entry.id === id) {
          return { ...entry, ...reviewData };
        }
        return entry;
      }));
    } catch (error) {
      console.error("Error marking entry for review:", error);
      setError("Failed to mark entry for review. Please try again.");
    }
  };

  // Helper function to check if user can approve entries
  const canApproveEntries = () => {
    return hasPermission(PERMISSIONS.APPROVE_TIME_ENTRIES);
  };

  // Reload data from Firebase
  const reloadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timeEntriesData = await fetchCollection("timeEntries");
      const entriesList = timeEntriesData.map(doc => ({
        id: doc.id,
        date: doc.date,
        employee: doc.employee || "",
        project: doc.project || "",
        equipment: doc.equipment || "",
        costCode: doc.costCode || "",
        workType: doc.workType || "",
        hours: doc.hours || "",
        notes: doc.notes || "",
        approved: doc.approved || false,
        approvedBy: doc.approvedBy || null,
        approvedDate: doc.approvedDate || null,
        createdBy: doc.createdBy || "",
        createdDate: doc.createdDate || ""
      }));
      setEntries(entriesList);
    } catch (error) {
      console.error("Error reloading data:", error);
      setError("Failed to reload data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add sample data for testing (can be removed in production)
  const addSampleData = async () => {
    try {
      const sampleEntries = [
        {
          date: PAY_PERIOD_START,
          employee: "John Smith",
          project: "Sample Project",
          equipment: "Excavator",
          costCode: "01-Site Preparation",
          workType: "T&M",
          hours: "8",
          notes: "Site preparation work",
          status: "Pending",
          approved: false, // Keep for backward compatibility
          createdBy: user?.name || user?.email || "System",
          createdDate: new Date().toISOString()
        },
        {
          date: PAY_PERIOD_START,
          employee: "Mike Johnson",
          project: "Sample Project",
          equipment: "Bulldozer",
          costCode: "02-Excavation",
          workType: "Lump Sum",
          hours: "6",
          notes: "Excavation activities",
          status: "Approved",
          approved: true, // Keep for backward compatibility
          approvedBy: "Admin User",
          approvedDate: new Date().toISOString(),
          createdBy: user?.name || user?.email || "System",
          createdDate: new Date().toISOString()
        }
      ];

      // Add each sample entry to Firebase
      const promises = sampleEntries.map(entry => addToCollection("timeEntries", entry));
      const newIds = await Promise.all(promises);
      
      // Update local state with the new entries including Firebase IDs
      const entriesWithIds = sampleEntries.map((entry, index) => ({
        id: newIds[index],
        ...entry
      }));
      
      setEntries(prev => [...prev, ...entriesWithIds]);
    } catch (error) {
      console.error("Error adding sample data:", error);
      setError("Failed to add sample data. Please try again.");
    }
  };

  // Unique values for dropdowns
  const uniqueValues = {
    date: Array.from(new Set(entries.map(e => e.date))).sort(),
    employee: Array.from(new Set(entries.map(e => e.employee).filter(Boolean))).sort(),
    project: Array.from(new Set(entries.map(e => e.project).filter(Boolean))).sort(),
    equipment: Array.from(new Set(entries.map(e => e.equipment).filter(Boolean))).sort(),
    costCode: Array.from(new Set(entries.map(e => e.costCode).filter(Boolean))).sort(),
    workType: Array.from(new Set(entries.map(e => e.workType).filter(Boolean))).sort(),
    status: ["Approved", "Pending", "Needs Review"]
  };

  // Helper function to get status from entry
  const getEntryStatus = (entry) => {
    if (entry.status) {
      return entry.status; // Use the new status field if it exists
    }
    // Fallback to legacy approved field for backward compatibility
    return entry.approved ? "Approved" : "Pending";
  };

  // Dropdown select handler
  const handleFilterDropdownSelect = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setFilterDropdown(prev => ({ ...prev, [key]: false }));
  };

  // Filter function for each row
  const filterRow = row => {
    const dateMatch = !filters.date || row.date === filters.date;
    const employeeMatch = !filters.employee || row.employee === filters.employee;
    const projectMatch = !filters.project || row.project === filters.project;
    const equipmentMatch = !filters.equipment || row.equipment === filters.equipment;
    const costCodeMatch = !filters.costCode || row.costCode === filters.costCode;
    const workTypeMatch = !filters.workType || row.workType === filters.workType;
    const statusMatch = !filters.status || getEntryStatus(row) === filters.status;
    return dateMatch && employeeMatch && projectMatch && equipmentMatch && costCodeMatch && workTypeMatch && statusMatch;
  };

  // Determine if all filters are 'All' (empty string)
  const allFiltersEmpty = Object.values(filters).every(v => v === "");

  // Dates to show: if all filters are empty, use visibleDates; otherwise, use all dates from matching entries
  let datesToShow = [];
  if (allFiltersEmpty) {
    datesToShow = visibleDates;
  } else {
    // Show all dates that have at least one entry matching the filters
    datesToShow = Array.from(new Set(entries.filter(filterRow).map(e => e.date))).sort();
  }

  // Get filtered entries for PDF export
  const getFilteredEntries = () => {
    return entries.filter(entry => {
      // First filter by date range (visibleDates)
      const dateInRange = visibleDates.length === 0 || visibleDates.includes(entry.date);
      // Then apply column filters
      const passesFilters = filterRow(entry);
      return dateInRange && passesFilters;
    });
  };

  // Generate date range string for PDF
  const getDateRangeString = () => {
    if (dateMode === "payperiod") {
      return selectedPayPeriod.label;
    } else if (dateMode === "month") {
      const [year, month] = selectedMonth.split("-");
      const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
      return monthName;
    } else if (dateMode === "range") {
      return `${customRange.start} to ${customRange.end}`;
    }
    return "All Dates";
  };

  // Export filtered entries to PDF
  const handleExportPDF = async () => {
    try {
      const filteredEntries = getFilteredEntries();
      
      if (filteredEntries.length === 0) {
        alert("No entries to export. Please check your filters.");
        return;
      }

      // Show PDF preview modal instead of direct download
      setShowPDFPreview(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Export filtered entries to Excel
  const handleExportExcel = () => {
    try {
      const filteredEntries = getFilteredEntries();
      
      if (filteredEntries.length === 0) {
        alert("No entries to export. Please check your filters.");
        return;
      }

      // Calculate totals
      const totalHours = filteredEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
      const approvedEntries = filteredEntries.filter(entry => entry.approved).length;
      const pendingEntries = filteredEntries.length - approvedEntries;

      // Prepare data for Excel export
      const excelData = filteredEntries.map(entry => ({
        'Date': formatDateString(entry.date),
        'Employee': entry.employee || '',
        'Project': entry.project || '',
        'Equipment': entry.equipment || '',
        'Cost Code': entry.costCode || '',
        'Work Type': entry.workType || '',
        'Hours': parseFloat(entry.hours) || 0,
        'Notes': entry.notes || '',
        'Status': getEntryStatus(entry)
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Add metadata rows at the top
      const metaData = [
        ['Time Tracking Report'],
        ['Generated:', new Date().toLocaleDateString()],
        ['Date Range:', getDateRangeString()],
        ['Total Entries:', filteredEntries.length],
        ['Total Hours:', totalHours.toFixed(2)],
        ['Approved Entries:', approvedEntries],
        ['Pending Entries:', pendingEntries],
        []
      ];

      // Add applied filters if any
      const activeFilters = Object.entries(filters).filter(([key, value]) => value);
      if (activeFilters.length > 0) {
        metaData.push(['Applied Filters:']);
        activeFilters.forEach(([key, value]) => {
          metaData.push([`${key.charAt(0).toUpperCase() + key.slice(1)}:`, value]);
        });
        metaData.push([]);
      }

      // Create worksheet with metadata
      const ws = XLSX.utils.aoa_to_sheet(metaData);
      
      // Add the data table starting after metadata
      const startRow = metaData.length;
      XLSX.utils.sheet_add_json(ws, excelData, { origin: `A${startRow + 1}` });

      // Set column widths for better readability
      const colWidths = [
        { wch: 18 }, // Date
        { wch: 15 }, // Employee
        { wch: 20 }, // Project
        { wch: 15 }, // Equipment
        { wch: 20 }, // Cost Code
        { wch: 12 }, // Work Type
        { wch: 8 },  // Hours
        { wch: 30 }, // Notes
        { wch: 12 }  // Status
      ];
      ws['!cols'] = colWidths;

      // Style the header row (make it bold)
      const headerRow = startRow + 1;
      const headerCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      headerCells.forEach(col => {
        const cellRef = `${col}${headerRow}`;
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } }
        };
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Time Tracking");

      // Generate filename with current date and filters
      const today = new Date().toISOString().slice(0, 10);
      const filterString = Object.values(filters).filter(Boolean).length > 0 ? '_filtered' : '';
      const fileName = `time_tracking_${today}${filterString}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  // Helper function to group equipment by type/category
  const getGroupedEquipment = () => {
    const grouped = {};
    equipment.forEach(eq => {
      const type = eq.type || 'Other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(eq);
    });
    
    // Sort categories alphabetically and sort equipment within each category
    const sortedCategories = Object.keys(grouped).sort();
    const result = {};
    sortedCategories.forEach(category => {
      result[category] = grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return result;
  };

  // Helper functions for date styling
  function isWeekend(dateString) {
    // Parse date string as local date to avoid timezone issues
    const parts = dateString.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  function isHoliday(dateString) {
    // Canadian/BC holidays (statutory holidays observed in British Columbia)
    const holidays = [
      // 2025 holidays
      '2025-01-01', // New Year's Day
      '2025-02-17', // Family Day (3rd Monday in February)
      '2025-03-29', // Good Friday
      '2025-05-19', // Victoria Day (Monday before May 25)
      '2025-07-01', // Canada Day
      '2025-08-04', // BC Day (1st Monday in August)
      '2025-09-01', // Labour Day (1st Monday in September)
      '2025-09-30', // National Day for Truth and Reconciliation
      '2025-10-13', // Thanksgiving Day (2nd Monday in October)
      '2025-11-11', // Remembrance Day
      '2025-12-25', // Christmas Day
      '2025-12-26', // Boxing Day
      
      // 2024 holidays
      '2024-01-01', // New Year's Day
      '2024-02-19', // Family Day
      '2024-03-29', // Good Friday
      '2024-05-20', // Victoria Day
      '2024-07-01', // Canada Day
      '2024-08-05', // BC Day
      '2024-09-02', // Labour Day
      '2024-09-30', // National Day for Truth and Reconciliation
      '2024-10-14', // Thanksgiving Day
      '2024-11-11', // Remembrance Day
      '2024-12-25', // Christmas Day
      '2024-12-26', // Boxing Day
      
      // 2026 holidays (add as needed)
      '2026-01-01', // New Year's Day
      '2026-02-16', // Family Day
      '2026-04-03', // Good Friday
      '2026-05-18', // Victoria Day
      '2026-07-01', // Canada Day
      '2026-08-03', // BC Day
      '2026-09-07', // Labour Day
      '2026-09-30', // National Day for Truth and Reconciliation
      '2026-10-12', // Thanksgiving Day
      '2026-11-11', // Remembrance Day
      '2026-12-25', // Christmas Day
      '2026-12-28', // Boxing Day (observed on Monday when falls on Saturday)
    ];
    return holidays.includes(dateString);
  }

  function getDateHeaderClass(dateString) {
    if (isHoliday(dateString)) {
      return 'date-title-row date-holiday';
    } else if (isWeekend(dateString)) {
      return 'date-title-row date-weekend';
    }
    return 'date-title-row';
  }

  return (
    <>
    <Layout title="Time Tracking">
      {loading && (
        <div className="loading-container">
          Loading projects...
        </div>
      )}
      {error && (
        <div className="error-container">
          {error}
          <div className="error-actions">
            <button 
              onClick={reloadData} 
              className="error-button reload"
            >
              Reload Data
            </button>
            <button 
              onClick={() => setError(null)} 
              className="error-button dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="time-tracking-container">
        {/* Date selection controls */}
        <div className="date-controls">
          <div className="date-controls-left">
            <label>Show dates by:</label>
            <select value={dateMode} onChange={e => setDateMode(e.target.value)}>
              <option value="payperiod">Pay Period</option>
              <option value="month">Month</option>
              <option value="range">Custom Range</option>
            </select>
            {dateMode === "payperiod" && (
              <select value={selectedPayPeriod.label} onChange={e => setSelectedPayPeriod(PAY_PERIODS.find(p => p.label === e.target.value))}>
                {PAY_PERIODS.map(p => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
              </select>
            )}
            {dateMode === "month" && (
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              />
            )}
            {dateMode === "range" && (
              <>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                />
                <span className="date-range-separator">to</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                />
              </>
            )}
          </div>
          <div className="action-buttons">
            <button 
              className="action-button pdf" 
              onClick={handleExportPDF}
              title="Preview PDF report of filtered entries"
            >
              📄 Preview PDF
            </button>
            
            <button 
              className="action-button excel" 
              onClick={handleExportExcel}
              title="Export filtered entries to Excel"
            >
              📊 Export Excel
            </button>

            <button 
              className="action-button refresh" 
              onClick={reloadData}
              title="Refresh data from server"
            >
              🔄 Refresh
            </button>
            
            {/* Temporary sample data button for testing */}
            {entries.length === 0 && (
              <button 
                className="action-button sample" 
                onClick={addSampleData}
                title="Add sample data for testing"
              >
                + Add Sample Data
              </button>
            )}
          </div>
        </div>
        <div className="time-tracking-table-section">
        <table className="norskk-table">
          <thead>
            <tr>
              <th className="table-header-filterable">
                Date
                <span className="filter-icon" onClick={() => setFilterDropdown(d => ({ ...d, date: !d.date }))} title="Filter Date">▼</span>
                {filterDropdown.date && (
                  <div className="filter-dropdown" ref={filterRefs.date}>
                    <div className={`filter-dropdown-option${filters.date === "" ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("date", "")}>All</div>
                    {uniqueValues.date.map(val => (
                      <div key={val} className={`filter-dropdown-option${filters.date === val ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("date", val)}>
                        {formatDateString(val)}
                      </div>
                    ))}
                  </div>
                )}
              </th>
              <th className="table-header-filterable">
                Employee
                <span className="filter-icon" onClick={() => setFilterDropdown(d => ({ ...d, employee: !d.employee }))} title="Filter Employee">▼</span>
                {filterDropdown.employee && (
                  <div className="filter-dropdown" ref={filterRefs.employee}>
                    <div className={`filter-dropdown-option${filters.employee === "" ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("employee", "")}>All</div>
                    {uniqueValues.employee.map(val => (
                      <div key={val} className={`filter-dropdown-option${filters.employee === val ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("employee", val)}>{val}</div>
                    ))}
                  </div>
                )}
              </th>
              <th className="table-header-filterable">
                Project
                <span className="filter-icon" onClick={() => setFilterDropdown(d => ({ ...d, project: !d.project }))} title="Filter Project">▼</span>
                {filterDropdown.project && (
                  <div className="filter-dropdown" ref={filterRefs.project}>
                    <div className={`filter-dropdown-option${filters.project === "" ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("project", "")}>All</div>
                    {uniqueValues.project.map(val => (
                      <div key={val} className={`filter-dropdown-option${filters.project === val ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("project", val)}>{val}</div>
                    ))}
                  </div>
                )}
              </th>
              <th className="table-header-filterable">
                Equipment
                <span className="filter-icon" onClick={() => setFilterDropdown(d => ({ ...d, equipment: !d.equipment }))} title="Filter Equipment">▼</span>
                {filterDropdown.equipment && (
                  <div className="filter-dropdown" ref={filterRefs.equipment}>
                    <div className={`filter-dropdown-option${filters.equipment === "" ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("equipment", "")}>All</div>
                    {uniqueValues.equipment.map(val => (
                      <div key={val} className={`filter-dropdown-option${filters.equipment === val ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("equipment", val)}>{val}</div>
                    ))}
                  </div>
                )}
              </th>
              <th className="table-header-filterable">
                Cost Code
                <span className="filter-icon" onClick={() => setFilterDropdown(d => ({ ...d, costCode: !d.costCode }))} title="Filter Cost Code">▼</span>
                {filterDropdown.costCode && (
                  <div className="filter-dropdown" ref={filterRefs.costCode}>
                    <div className={`filter-dropdown-option${filters.costCode === "" ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("costCode", "")}>All</div>
                    {uniqueValues.costCode.map(val => (
                      <div key={val} className={`filter-dropdown-option${filters.costCode === val ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("costCode", val)}>{val}</div>
                    ))}
                  </div>
                )}
              </th>
              <th className="table-header-filterable">
                Work Type
                <span className="filter-icon" onClick={() => setFilterDropdown(d => ({ ...d, workType: !d.workType }))} title="Filter Work Type">▼</span>
                {filterDropdown.workType && (
                  <div className="filter-dropdown" ref={filterRefs.workType}>
                    <div className={`filter-dropdown-option${filters.workType === "" ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("workType", "")}>All</div>
                    {uniqueValues.workType.map(val => (
                      <div key={val} className={`filter-dropdown-option${filters.workType === val ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("workType", val)}>{val}</div>
                    ))}
                  </div>
                )}
              </th>
              <th>Hours</th>
              <th>Notes</th>
              <th className="table-header-filterable">
                Status
                <span className="filter-icon" onClick={() => setFilterDropdown(d => ({ ...d, status: !d.status }))} title="Filter Status">▼</span>
                {filterDropdown.status && (
                  <div className="filter-dropdown" ref={filterRefs.status}>
                    <div className={`filter-dropdown-option${filters.status === "" ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("status", "")}>All</div>
                    {uniqueValues.status.map(val => (
                      <div key={val} className={`filter-dropdown-option${filters.status === val ? " selected" : ""}`} onClick={() => handleFilterDropdownSelect("status", val)}>{val}</div>
                    ))}
                  </div>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {datesToShow.map(date => {
              const dayEntries = entries.filter(e => e.date === date && filterRow(e));
              // Always show the date row, even if no entries match
              return (
                <React.Fragment key={date}>
                  <tr className={getDateHeaderClass(date)}>
                    <td className="date-title-cell">
                      {formatDateString(date)}
                    </td>
                    <td className="add-button-cell">
                      <button className="classic-button add-item-button" onClick={() => handleAddEntry(date)}>
                        + Add Entry
                      </button>
                    </td>
                    <td colSpan={8}></td>
                  </tr>
                  {dayEntries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="no-entries-cell">
                        No entries for this day
                      </td>
                    </tr>
                  ) : (
                    dayEntries.map(row => (
                      <tr key={row.id}>
                        <td>{formatDateString(row.date)}</td>
                        <td>
                          <EmployeeAutocomplete
                            value={row.employee}
                            onChange={value => handleChange(row.id, "employee", value)}
                            crew={crew}
                            disabled={!canAssignEmployees()}
                          />
                        </td>
                        <td>
                          <select
                            value={row.project}
                            onChange={e => handleChange(row.id, "project", e.target.value)}
                            className="table-input"
                          >
                            <option value="">Select project</option>
                            {projects.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={row.equipment}
                            onChange={e => handleChange(row.id, "equipment", e.target.value)}
                            className="table-input"
                          >
                            <option value="">Select equipment</option>
                            {Object.entries(getGroupedEquipment()).map(([category, equipmentList]) => (
                              <optgroup key={category} label={category}>
                                {equipmentList.map(eq => (
                                  <option key={eq.id} value={eq.name}>{eq.name}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={row.costCode}
                            onChange={e => handleChange(row.id, "costCode", e.target.value)}
                            className="table-input"
                          >
                            <option value="">Select cost code</option>
                            {getCostCodesForProject(row.project).map(code => (
                              <option key={code} value={code}>{code}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={row.workType}
                            onChange={e => handleChange(row.id, "workType", e.target.value)}
                            className="table-input"
                          >
                            <option value="">Select work type</option>
                            {WORK_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </td>
                        <td><input type="number" value={row.hours} onChange={e => handleChange(row.id, "hours", e.target.value)} placeholder="Enter hours" className="table-input" /></td>
                        <td><input value={row.notes} onChange={e => handleChange(row.id, "notes", e.target.value)} placeholder="Enter notes" className="table-input" /></td>
                        <td>
                          {(() => {
                            const status = getEntryStatus(row);
                            if (status === "Approved") {
                              return (
                                <div className="status-approved">
                                  <span className="status-dot approved"></span>
                                  Approved
                                </div>
                              );
                            } else if (status === "Needs Review") {
                              return (
                                <div className="status-needs-review">
                                  <span className="status-dot needs-review"></span>
                                  Needs Review
                                </div>
                              );
                            } else {
                              return (
                                <div className="status-pending">
                                  <span className="status-dot pending"></span>
                                  Pending
                                </div>
                              );
                            }
                          })()}
                        </td>
                        <td>
                          <div className="table-action-buttons">
                            {(() => {
                              const status = getEntryStatus(row);
                              const actions = [];
                              
                              // Admin/Manager approval actions
                              if (canApproveEntries()) {
                                if (status === "Approved") {
                                  actions.push(
                                    <button 
                                      key="unapprove"
                                      className="unapprove-button"
                                      onClick={() => handleUnApprove(row.id)}
                                      title="Un-approve this entry"
                                    >
                                      ✕
                                    </button>
                                  );
                                } else {
                                  actions.push(
                                    <button 
                                      key="approve"
                                      className="approve-button"
                                      onClick={() => handleApprove(row.id)}
                                      title="Approve this entry"
                                    >
                                      ✓
                                    </button>
                                  );
                                }
                              }
                              
                              // Review action (available to users with approval permissions when not already "Needs Review")
                              if (canApproveEntries() && status !== "Needs Review") {
                                actions.push(
                                  <button 
                                    key="review"
                                    className="review-button"
                                    onClick={() => handleNeedsReview(row.id)}
                                    title="Mark this entry for review"
                                  >
                                    ⚠
                                  </button>
                                );
                              }
                              
                              // Delete action
                              actions.push(
                                <button 
                                  key="delete"
                                  className="delete-item-button" 
                                  onClick={() => handleDelete(row.id)}
                                  title="Delete this entry"
                                >
                                  🗑
                                </button>
                              );
                              
                              return actions;
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        </div>
        </div>
      )}
    </Layout>

    {/* PDF Preview Modal - Rendered outside Layout to ensure proper positioning */}
    {showPDFPreview && (
      <TimeTrackingPDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        entries={getFilteredEntries()}
        dateRange={getDateRangeString()}
        filters={filters}
        formatDateString={formatDateString}
      />
    )}
    </>
  );
}
