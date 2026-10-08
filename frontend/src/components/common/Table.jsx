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
    <div className={`overflow-x-auto w-full rounded-xl border border-[#edf0f5] ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#f8f9fc] border-b border-[#edf0f5]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-[#68738a] ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf0f5] bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-sm text-[#68738a]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-[#f8f9fc]' : 'hover:bg-[#fafbfe]'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3.5 px-4 text-sm text-[#172033] ${col.cellClassName || ''}`}
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
