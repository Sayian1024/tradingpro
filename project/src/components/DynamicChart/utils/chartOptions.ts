import { ApexOptions } from 'apexcharts';
import { generateColor } from './chartUtils';
import { Column } from '../types';

export const generateChartOptions = (
  isDarkMode: boolean,
  xAxisColumn: string,
  columns: Column[],
  selectedColumns: string[]
): ApexOptions => {
  const colors = selectedColumns.map((col) => generateColor(col));

  return {
    chart: {
      type: 'line',
      stacked: false, // Explicitly set stacked to false
      animations: {
        enabled: true,
        dynamicAnimation: {
          enabled: true,
          speed: 1000,
        },
      },
      toolbar: {
        show: true,
        autoSelected: 'zoom',
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      background: isDarkMode ? '#1a1a1a' : '#ffffff',
      zoom: {
        enabled: true,
        type: 'xy',
        autoScaleYaxis: true,
        zoomedArea: {
          fill: {
            color: '#90CAF9',
            opacity: 0.4,
          },
          stroke: {
            color: '#0D47A1',
            opacity: 0.4,
            width: 1,
          },
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      type: xAxisColumn === 'timestamp' ? 'datetime' : 'numeric',
      title: {
        text: columns.find((col) => col.value === xAxisColumn)?.label,
        style: { color: isDarkMode ? '#fff' : '#000' },
      },
      labels: {
        style: { colors: isDarkMode ? '#fff' : '#000' },
        formatter: (value: number) =>
          xAxisColumn === 'timestamp'
            ? new Date(value).toLocaleTimeString()
            : String(value),
      },
      tickAmount: 10,
    },
    yaxis: {
      forceNiceScale: true, // Ensure y-axis scales appropriately
      title: {
        text: 'Values',
        style: { color: isDarkMode ? '#fff' : '#000' },
      },
      labels: {
        style: { colors: isDarkMode ? '#fff' : '#000' },
        formatter: (value) => value.toFixed(2),
      },
      tickAmount: 5,
    },
    grid: {
      borderColor: isDarkMode ? '#404040' : '#e0e0e0',
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      labels: {
        colors: isDarkMode ? '#fff' : '#000',
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      onItemClick: {
        toggleDataSeries: true,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      intersect: false,
      shared: true,
      x: {
        formatter: (value: number) =>
          xAxisColumn === 'timestamp'
            ? new Date(value).toLocaleString()
            : String(value),
      },
      style: {
        fontSize: '12px',
      },
    },
    colors,
    markers: {
      size: 4, // Increased marker size for better visibility
      hover: { size: 6 },
    },
    fill: {
      type: 'solid',
      opacity: 0.2, // Reduced opacity for better line visibility
    },
  };
};
