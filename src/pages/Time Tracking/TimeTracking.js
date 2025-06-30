import React, { useState, useRef, useEffect } from "react";
import "../../styles/tables.css";
import "../../styles/page.css";
import "./TimeTrackingPDFPreview.css";
import "./TimeTracking.css";
import Layout from "../../components/Layout";
import EquipmentPage from "../equipment/equipment";
import { fetchCollection } from "../../Utils/firebaseHelpers";
import { useAuth } from "../../contexts/AuthContext";
import { Document, Page, Text, View, StyleSheet, pdf, PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { addToCollection, updateDocById, deleteDocById } from "../../Utils/firebaseHelpers";

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

// List of pay periods (add more as needed)
const PAY_PERIODS = [
  { label: "June 15 - June 28, 2025", start: "2025-06-15", end: "2025-06-28" },
  { label: "June 1 - June 14, 2025", start: "2025-06-01", end: "2025-06-14" },
  { label: "May 18 - May 31, 2025", start: "2025-05-18", end: "2025-05-31" }
];

const PAY_PERIOD_START = "2025-06-15";
const PAY_PERIOD_END = "2025-06-28";
const payPeriodDates = getPayPeriodDates(PAY_PERIOD_START, PAY_PERIOD_END);

// Get equipment names from the equipment page's initialEquipment
const equipmentList = [
  "Excavator",
  "Bulldozer",
  "Pickup Truck",
  "Concrete Mixer"
];

// Sample crew data (fallback if no crew collection exists)
const SAMPLE_CREW = [
  { id: "1", name: "John Smith", role: "foreman" },
  { id: "2", name: "Mike Johnson", role: "worker" },
  { id: "3", name: "Sarah Wilson", role: "worker" },
  { id: "4", name: "Tom Brown", role: "operator" },
  { id: "5", name: "Lisa Davis", role: "worker" }
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
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  tableContainer: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1pt solid #ddd',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '0.5pt solid #eee',
  },
  dateRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
    borderBottom: '1pt solid #ddd',
  },
  col1: { width: '10%' }, // Date
  col2: { width: '12%' }, // Employee
  col3: { width: '15%' }, // Project
  col4: { width: '12%' }, // Equipment
  col5: { width: '12%' }, // Cost Code
  col6: { width: '10%' }, // Work Type
  col7: { width: '8%' },  // Hours
  col8: { width: '21%' }, // Notes
  text: {
    fontSize: 9,
  },
  dateText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
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
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Applied Filters:</Text>
            {Object.entries(filters).map(([key, value]) => value && (
              <Text key={key} style={{ fontSize: 9, marginLeft: 10 }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
              </Text>
            ))}
          </View>
        )}

        <View style={pdfStyles.tableContainer}>
          {/* Table Header */}
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.text, pdfStyles.col1]}>Date</Text>
            <Text style={[pdfStyles.text, pdfStyles.col2]}>Employee</Text>
            <Text style={[pdfStyles.text, pdfStyles.col3]}>Project</Text>
            <Text style={[pdfStyles.text, pdfStyles.col4]}>Equipment</Text>
            <Text style={[pdfStyles.text, pdfStyles.col5]}>Cost Code</Text>
            <Text style={[pdfStyles.text, pdfStyles.col6]}>Work Type</Text>
            <Text style={[pdfStyles.text, pdfStyles.col7]}>Hours</Text>
            <Text style={[pdfStyles.text, pdfStyles.col8]}>Notes</Text>
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
                  <Text style={[pdfStyles.text, pdfStyles.col8]}>{entry.notes || '-'}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={pdfStyles.summary}>
          <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
            Summary: {entries.length} entries • {totalHours.toFixed(2)} total hours
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

  return (
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
          </div>
        </div>
        <div className="pdf-preview-viewer">
          <PDFViewer width="100%" height="600px">
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default function TimeTracking() {
  const { user } = useAuth();
  
  // Store all entries as an array of objects, each with a date
  const [entries, setEntries] = useState([]);
  const [filters, setFilters] = useState({ date: "", employee: "", project: "", equipment: "", costCode: "", workType: "", status: "" });
  const [filterDropdown, setFilterDropdown] = useState({ date: false, employee: false, project: false, equipment: false, costCode: false, workType: false, status: false });  const [dateMode, setDateMode] = useState("payperiod"); // payperiod, month, range
  const [customRange, setCustomRange] = useState({ start: PAY_PERIOD_START, end: PAY_PERIOD_END });
  const [selectedMonth, setSelectedMonth] = useState(PAY_PERIOD_START.slice(0, 7)); // YYYY-MM
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(PAY_PERIODS[0]);
  const [projects, setProjects] = useState([]);
  const [crew, setCrew] = useState([]);
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
        
        // Fetch projects, crew, and time entries in parallel
        const [projectData, crewData, timeEntriesData] = await Promise.all([
          fetchCollection("managementProjects"),
          fetchCollection("crew").catch(() => []), // Use empty array if crew collection doesn't exist
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
          ? crewData.map(doc => ({ id: doc.id, name: doc.name, role: doc.role }))
          : SAMPLE_CREW;
        setCrew(crewList);
        
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
          approved: doc.approved || false,
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
        approved: false,
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
        approved: true,
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
        approved: false,
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

  // Helper function to check if user can approve entries
  const canApproveEntries = () => {
    return user?.role === 'admin' || user?.role === 'manager';
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
          approved: false,
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
          approved: true,
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
    status: ["Approved", "Pending"]
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
    const statusMatch = !filters.status || (filters.status === "Approved" ? row.approved : !row.approved);
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
    return entries.filter(filterRow);
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
        'Status': entry.approved ? 'Approved' : 'Pending'
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
  return (
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
                  <tr className="date-title-row">
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
                          {canAssignEmployees() ? (
                            <select
                              value={row.employee}
                              onChange={e => handleChange(row.id, "employee", e.target.value)}
                              className="table-input"
                            >
                              <option value="">Select employee</option>
                              {crew.map(member => (
                                <option key={member.id} value={member.name}>{member.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              value={row.employee} 
                              onChange={e => handleChange(row.id, "employee", e.target.value)} 
                              placeholder="Employee name" 
                              className={`table-input ${canAssignEmployees() ? 'employee-select-enabled' : 'employee-select-disabled'}`}
                              readOnly={!canAssignEmployees()}
                            />
                          )}
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
                            {equipmentList.map(eq => (
                              <option key={eq} value={eq}>{eq}</option>
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
                          {row.approved ? (
                            <div className="status-approved">
                              <span className="status-dot approved"></span>
                              Approved
                            </div>
                          ) : (
                            <div className="status-pending">
                              <span className="status-dot pending"></span>
                              Pending
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="table-action-buttons">
                            {canApproveEntries() && (
                              !row.approved ? (
                                <button 
                                  className="approve-button"
                                  onClick={() => handleApprove(row.id)}
                                  title="Approve this entry"
                                >
                                  ✓ Approve
                                </button>
                              ) : (
                                <button 
                                  className="unapprove-button"
                                  onClick={() => handleUnApprove(row.id)}
                                  title="Un-approve this entry"
                                >
                                  ✕ Un-approve
                                </button>
                              )
                            )}
                            <button className="delete-item-button" onClick={() => handleDelete(row.id)}>
                              Delete
                            </button>
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

      {/* PDF Preview Modal */}
      <TimeTrackingPDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        entries={getFilteredEntries()}
        dateRange={getDateRangeString()}
        filters={filters}
        formatDateString={formatDateString}
      />
    </Layout>
  );
}
