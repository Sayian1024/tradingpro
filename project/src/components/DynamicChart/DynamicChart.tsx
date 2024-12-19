import { useState, useCallback, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Toaster } from 'sonner';
import { useWebSocket } from './hooks/useWebSocket';
import { useNotifications } from './hooks/useNotifications';
import { SearchBar } from './components/SearchBar';
import { ChartHeader } from './components/ChartHeader';
import { DataTable } from './components/DataTable';
import { generateChartOptions } from './utils/chartOptions';
import { prepareChartData } from './utils/chartUtils';
import type { DataPoint, Column, WebSocketMessage } from './types';

const IP = '34.231.217.211';
const PORT = '8080';
const MAX_RENDER_POINTS = 500;

export const DynamicChart = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedColumns, setSelectedColumns] = useState(['']);
  const [xAxisColumn, setXAxisColumn] = useState('timestamp');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [columns, setColumns] = useState<Column[]>([
    { value: 'timestamp', label: 'Timestamp' },
  ]);
  const [highlightedRows, setHighlightedRows] = useState<Set<string>>(new Set());
  const [isPageVisible, setIsPageVisible] = useState(true);

  const {
    notificationEnabled,
    showNotification,
    bellAnimating,
    triggerNotification,
    requestNotificationPermission,
  } = useNotifications();

  const handleWebSocketData = useCallback(
    (message: WebSocketMessage) => {
      if (message?.params?.data) {
        const { added = [], changed = [], removed = [] } = message.params.data;

        // Process and normalize timestamps
        const processData = (items: any[]) =>
          items.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            timestamp: item.timestamp
              ? typeof item.timestamp === 'number'
                ? new Date(
                    item.timestamp < 1e12 ? item.timestamp * 1000 : item.timestamp
                  ).toISOString()
                : item.timestamp
              : new Date().toISOString(),
          }));

        const processedAdded = processData(added);
        const processedChanged = processData(changed);

        // Update columns if needed

        if (
          notificationEnabled && // Check if notifications are enabled
          (
            !isPageVisible || // Trigger when page is not visible
            (added.length > 0 || changed.length > 0) // Or when there are significant changes
          )
        ) {
          triggerNotification(processedAdded, processedChanged);
        }
        
        if (
          columns.length === 1 &&
          (processedAdded.length > 0 || processedChanged.length > 0)
        ) {
          const allKeys = new Set<string>();
          Object.keys(processedAdded[0] || processedChanged[0] || {}).forEach(
            (key) => allKeys.add(key)
          );

          setColumns(
            Array.from(allKeys).map((key) => ({
              value: key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
            }))
          );
        }

        // Update data
        setData((prev) => {
          const existingMap = new Map(prev.map((item) => [item.id, item]));
          [...processedAdded, ...processedChanged].forEach((item) => {
            existingMap.set(item.id, item);
          });
          removed.forEach((item) => {
            existingMap.delete(item.id);
          });
          return Array.from(existingMap.values());
        });

        // Handle notifications
        if (!isPageVisible && (processedAdded.length > 0 || processedChanged.length > 0)) {
          triggerNotification(processedAdded, processedChanged);
        }

        // Highlight new/changed rows
        setHighlightedRows(
          new Set([
            ...processedAdded.map((item) => String(item.id)),
            ...processedChanged.map((item) => String(item.id)),
          ])
        );

        // Clear highlights after delay
        setTimeout(() => {
          setHighlightedRows(new Set());
        }, 2000);
      }
    },
    [columns, triggerNotification, isPageVisible]
  );

  const { sendMessage } = useWebSocket(IP, PORT, handleWebSocketData);

  const handleSearch = async (query: string): Promise<void> => {
    try {
      const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'subscribe',
        params: {
          type: 'data_stream',
          subscription_id: 1,
          query,
        },
      };
      sendMessage(payload);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

  const handleColumnToggle = (column: string) => {
    if (column === xAxisColumn) return;
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const chartOptions = generateChartOptions(isDarkMode, xAxisColumn, columns, selectedColumns);
  const chartData = prepareChartData(data, selectedColumns, xAxisColumn, columns, MAX_RENDER_POINTS);

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <ChartHeader
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            toggleNotifications={requestNotificationPermission}
            bellAnimating={bellAnimating}
            showNotification={showNotification}
          />
          <Toaster />
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="mb-4 w-full">
            <select
              value={xAxisColumn}
              onChange={(e) => setXAxisColumn(e.target.value)}
              className={`w-full sm:w-64 p-2 text-sm sm:text-base rounded-md border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            >
              {columns.map((column) => (
                <option key={column.value} value={column.value}>
                  {column.label} (X-Axis)
                </option>
              ))}
            </select>
          </div>

          <div className="h-64 sm:h-96 mb-4 sm:mb-6">
            <ReactApexChart
              options={chartOptions}
              series={chartData}
              type="line"
              height="100%"
            />
          </div>

          <DataTable
            data={data}
            columns={columns}
            isDarkMode={isDarkMode}
            xAxisColumn={xAxisColumn}
            selectedColumns={selectedColumns}
            highlightedRows={highlightedRows}
            onColumnToggle={handleColumnToggle}
          />

          <div className="flex w-full flex-col space-y-4 p-6 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 sm:space-x-6">
            <SearchBar onSearch={handleSearch} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
