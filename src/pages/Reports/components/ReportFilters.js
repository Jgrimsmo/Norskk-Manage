import React from 'react';

export default function ReportFilters({ 
  projectFilter, 
  onProjectFilterChange, 
  dateFilter, 
  onDateFilterChange, 
  uniqueProjects,
  onAddReport,
  canCreateReports 
}) {
  return (
    <div className="reports-header">
      <div className="reports-filters">
        <select value={projectFilter} onChange={e => onProjectFilterChange(e.target.value)}>
          <option value="all">All Projects</option>
          {uniqueProjects.map(project => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>
        
        <div className="date-filter">
          <label className="date-filter-toggle">
            <input
              type="checkbox"
              checked={dateFilter.enabled}
              onChange={e => onDateFilterChange({ 
                ...dateFilter, 
                enabled: e.target.checked,
                startDate: e.target.checked ? dateFilter.startDate : '',
                endDate: e.target.checked ? dateFilter.endDate : ''
              })}
            />
            Filter by Date
          </label>
          
          {dateFilter.enabled && (
            <div className="date-inputs">
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={e => onDateFilterChange({ ...dateFilter, startDate: e.target.value })}
                placeholder="Start date"
                title="Start date"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={e => onDateFilterChange({ ...dateFilter, endDate: e.target.value })}
                placeholder="End date"
                title="End date"
              />
              {(dateFilter.startDate || dateFilter.endDate) && (
                <button
                  type="button"
                  className="clear-dates"
                  onClick={() => onDateFilterChange({ ...dateFilter, startDate: '', endDate: '' })}
                  title="Clear dates"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {canCreateReports && (
        <button className="classic-button" onClick={onAddReport}>
          + New Daily Report
        </button>
      )}
    </div>
  );
}
