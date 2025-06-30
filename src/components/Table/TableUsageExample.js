// Example usage of SortableTable in ProjectEstimatePage
// You can replace the existing table with this implementation

/*
import SortableTable from "../../components/Table/SortableTable";

// In your component, define the columns:
const tableColumns = [
  {
    key: 'name',
    header: 'Project Name',
    accessor: 'name',
    sortable: true,
    render: (value, row) => value || "N/A"
  },
  {
    key: 'developer',
    header: 'Developer',
    accessor: 'developer',
    sortable: true,
    render: (value, row) => value || "N/A"
  },
  {
    key: 'address',
    header: 'Address',
    accessor: 'address',
    sortable: true,
    render: (value, row) => value || "N/A"
  },
  {
    key: 'estimator',
    header: 'Estimator',
    accessor: 'estimator',
    sortable: true,
    render: (value, row) => value || "N/A"
  },
  {
    key: 'estimateDate',
    header: 'Estimate Date',
    accessor: 'estimateDate',
    sortable: true,
    render: (value, row) => value || "N/A"
  },
  {
    key: 'createdDate',
    header: 'Created Date',
    accessor: 'createdDate',
    sortable: true,
    render: (value, row) => {
      return value?.seconds
        ? new Date(value.seconds * 1000).toLocaleString()
        : "N/A";
    }
  },
  {
    key: 'updatedDate',
    header: 'Last Updated',
    accessor: 'updatedDate',
    sortable: true,
    render: (value, row) => {
      return value?.seconds
        ? new Date(value.seconds * 1000).toLocaleString()
        : "N/A";
    }
  },
  {
    key: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    render: (value, row) => (
      <span className={`status-indicator ${value?.toLowerCase() || 'draft'}`}>
        {value || "Draft"}
      </span>
    )
  },
  {
    key: 'totalCost',
    header: 'Total Cost',
    accessor: 'id',
    sortable: true,
    render: (id, row) => `$${(totalCosts[id] || 0).toFixed(2)}`
  },
  {
    key: 'actions',
    header: 'Actions',
    accessor: 'id',
    sortable: false,
    render: (id, row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link to={`/project/${id}`}>
          <button className="classic-button">View</button>
        </Link>
        <button 
          className="classic-button delete-item-button"
          disabled={deletingProjects.has(id)}
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete this project?')) {
              // ... delete logic
            }
          }}
        >
          {deletingProjects.has(id) ? "Deleting..." : "Delete"}
        </button>
      </div>
    )
  }
];

// Replace the existing table with:
<SortableTable
  data={filteredProjects}
  columns={tableColumns}
  initialSort={{ key: 'updatedDate', direction: 'desc' }}
  pageSize={10}
  searchable={true}
/>
*/
