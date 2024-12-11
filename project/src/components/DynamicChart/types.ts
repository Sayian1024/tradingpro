export interface DataPoint {
  [key: string]: string | number;
  timestamp: string;
  id: string | number;
}

export interface WebSocketMessage {
  params: {
    data: {
      added?: DataPoint[];
      changed?: DataPoint[];
      removed?: DataPoint[];
    };
  };
}

export interface Column {
  value: string;
  label: string;
}

export interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
}