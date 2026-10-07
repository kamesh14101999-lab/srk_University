import Loader from './Loader';
import EmptyState from './EmptyState';

// columns: [{ key, header, render? }]
export default function Table({ columns, rows, loading, emptyMessage = 'No records found', onRowClick, rowKey = '_id' }) {
  if (loading) return <Loader />;
  if (!rows || rows.length === 0) return <EmptyState title={emptyMessage} />;

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-primary-50/50' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
