// src/components/Table/SortableTable.js
import React, { useState, useMemo } from 'react';

const SortableTable = ({ 
  data, 
  columns, 
  initialSort = { key: null, direction: 'asc' },
  pageSize = 10,
  searchable = true,
  className = "norskk-table"
}) => {
  const [sort, setSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search) return data;
    
    return data.filter(row => 
      columns.some(col => {
        const value = col.accessor ? row[col.accessor] : '';
        return String(value).toLowerCase().includes(search.toLowerCase());
      })
    );
  }, [data, search, columns]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sort.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sort]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIndicator = (key) => {
    if (sort.key !== key) return 'none';
    return sort.direction;
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        className="pagination-button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        className="pagination-button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    );

    return buttons;
  };

  return (
    <div>
      {searchable && (
        <div className="table-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
            {search && (
              <button
                className="clear-search-button"
                onClick={() => setSearch('')}
              >
                Clear
              </button>
            )}
          </div>
          <div className="pagination-info">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
            {search && ` (filtered from ${data.length} total)`}
          </div>
        </div>
      )}

      <table className={className}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? 'sortable-header' : ''}
                onClick={column.sortable ? () => handleSort(column.accessor || column.key) : undefined}
                style={column.width ? { width: column.width } : {}}
              >
                {column.header}
                {column.sortable && (
                  <span className={`sort-indicator ${getSortIndicator(column.accessor || column.key)}`} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#666' }}>
                {search ? `No results found for "${search}"` : 'No data available'}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="page-size-selector">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                // This would need to be lifted up to parent component
                console.log('Page size changed to:', e.target.value);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>
          
          <div className="pagination-controls">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableTable;
