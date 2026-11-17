import React from 'react';

const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records available',
  onRowClick = null,
  className = ''
}) => {
  return (
    <div className={`overflow-x-auto w-full rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3 px-4 text-xs text-slate-800 dark:text-slate-200 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
