import { Column, DataPoint } from '../types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface DataTableProps {
  data: DataPoint[];
  columns: Column[];
  isDarkMode: boolean;
  xAxisColumn: string;
  selectedColumns: string[];
  highlightedRows: Set<string>;
  onColumnToggle: (column: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  isDarkMode,
  xAxisColumn,
  selectedColumns,
  highlightedRows,
  onColumnToggle,
}) => {
  return (
    <ScrollArea
      className={`overflow-x-auto h-[410px] border-collapse border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <table className="min-w-full">
        <thead className="sticky top-0 z-10">
          <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            {columns.map((column) => (
              <th key={column.value} className="px-6 py-3">
                <div className="flex items-center space-x-2">
                  {column.value !== xAxisColumn && (
                    <Checkbox
                      id={`header-${column.value}`}
                      checked={selectedColumns.includes(column.value)}
                      onCheckedChange={() => onColumnToggle(column.value)}
                      className={isDarkMode ? 'border-gray-500' : 'border-gray-300'}
                    />
                  )}
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {column.label}
                    {column.value === xAxisColumn && ' (X-Axis)'}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {data.map((row) => (
            <tr
              key={row.id}
              className={`
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                ${
                  highlightedRows.has(String(row.id))
                    ? isDarkMode
                      ? 'bg-red-900'
                      : 'bg-red-100'
                    : ''
                }
                transition-colors duration-500 ease-in-out
              `}
            >
              {columns.map((column) => (
                <td
                  key={`${row.id}-${column.value}`}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {column.value === 'timestamp'
                    ? new Date(row[column.value]).toLocaleString()
                    : row[column.value]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};