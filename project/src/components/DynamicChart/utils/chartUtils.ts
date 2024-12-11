import { Column, DataPoint } from '../types';

export const generateColor = (column: string) => {
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  };

  const h = Math.abs(hashCode(column)) % 360;
  return `hsl(${h}, 70%, 50%)`;
};

export const prepareChartData = (
  data: DataPoint[],
  selectedColumns: string[],
  xAxisColumn: string,
  columns: Column[],
  maxPoints: number
) => {
  const sortedData = [...data]
    .sort((a, b) => {
      const aValue = a[xAxisColumn];
      const bValue = b[xAxisColumn];
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    })
    .slice(-maxPoints);

  return selectedColumns.map((column) => ({
    name: columns.find((col) => col.value === column)?.label || column,
    data: sortedData
      .map((item) => {
        let xValue = item[xAxisColumn];
        let yValue = item[column];

        if (xAxisColumn === 'timestamp') {
          xValue =
            typeof xValue === 'string'
              ? new Date(xValue).getTime()
              : typeof xValue === 'number' && xValue < 1e12
              ? xValue * 1000
              : xValue;
        }

        yValue = Number(yValue);

        return {
          x: typeof xValue === 'number' && !isNaN(xValue) ? xValue : NaN,
          y: isNaN(yValue) ? 0 : yValue,
        };
      })
      .filter((point) => !isNaN(point.x) && !isNaN(point.y))
      .sort((a, b) => a.x - b.x),
  }));
};