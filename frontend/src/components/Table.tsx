import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto bg-white border border-gray-100 rounded-lg shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-gray-100 text-left text-sm text-gray-700">
        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 divide-solid">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
