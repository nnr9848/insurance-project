import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Enterprise Standard CRM Pagination Bar
 * Adheres to centralized design tokens, high visual contrast, and accessible interactive buttons.
 */
export function CrmTablePaginationBar({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  unitName = 'records'
}) {
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);

  return (
    <div className="crm-table-pagination-bar" style={{ flexShrink: 0 }}>
      {/* Left: Rows Per Page Selector & Record Range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-secondary, #64748b)' }}>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '0.8rem' }}>
          Showing <strong>{totalRecords === 0 ? 0 : startIndex + 1}</strong> – <strong>{endIndex}</strong> of <strong>{totalRecords}</strong> {unitName}
        </span>
      </div>

      {/* Right: Page Indicator & Direction Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#64748b', marginRight: '4px', fontSize: '0.8rem' }}>
          Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages || 1}</strong>
        </span>

        <button
          type="button"
          className="crm-pagination-btn"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange && onPageChange(Math.max(safeCurrentPage - 1, 1))}
          title="Previous Page"
        >
          <ChevronLeft size={14} /> Previous
        </button>

        <button
          type="button"
          className="crm-pagination-btn"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(Math.min(safeCurrentPage + 1, totalPages))}
          title="Next Page"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Compact Top Mini-Pager for Toolbar integration (Industry Standard Zero-Scroll Navigation)
 */
export function CrmTopMiniPager({
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) {
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      paddingLeft: '6px',
      borderLeft: '1px solid #e2e8f0',
      marginLeft: 'auto'
    }}>
      <span style={{
        fontSize: '0.78rem',
        color: '#64748b',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}>
        {safeCurrentPage} / {totalPages || 1}
      </span>

      <button
        type="button"
        title="Previous Page"
        disabled={safeCurrentPage <= 1}
        onClick={() => onPageChange && onPageChange(Math.max(safeCurrentPage - 1, 1))}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          background: safeCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
          color: safeCurrentPage <= 1 ? '#94a3b8' : '#0f2b48',
          cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <ChevronLeft size={14} />
      </button>

      <button
        type="button"
        title="Next Page"
        disabled={safeCurrentPage >= totalPages}
        onClick={() => onPageChange && onPageChange(Math.min(safeCurrentPage + 1, totalPages))}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          background: safeCurrentPage >= totalPages ? '#f8fafc' : '#ffffff',
          color: safeCurrentPage >= totalPages ? '#94a3b8' : '#0f2b48',
          cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default CrmTablePaginationBar;
