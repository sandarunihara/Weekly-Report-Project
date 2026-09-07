import type { ReactNode } from 'react';
import EmptyState from './EmptyState';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  rowClassName?: (item: T, index: number) => string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyTitle = 'No data found',
  emptyMessage = 'There is nothing to display here yet.',
  rowClassName,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1f2937]/ border-b border-white/[0.08]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className={`
                  border-b border-white/[0.04] last:border-0
                  hover:bg-white/[0.03] transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                  group
                  ${rowClassName ? rowClassName(item, index) : ''}
                `}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`p-4 ${col.className || ''}`}>
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
