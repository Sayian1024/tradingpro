import { useState, useEffect, useCallback } from 'react';
import { WebSocketMessage } from '../types';

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_TIMEOUT = 3000;

export const useWebSocket = (
  ip: string,
  port: string,
  onMessage: (message: WebSocketMessage) => void
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const createWebSocket = useCallback(() => {
    let reconnectAttempts = 0;
    let isUnloading = false;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const fullURI = `${wsProtocol}//${ip}:${port}`;
    
    const ws = new WebSocket(fullURI);

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      if (!isUnloading && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const timeout = Math.min(
          BASE_RECONNECT_TIMEOUT * Math.pow(2, reconnectAttempts),
          30000
        );

        setTimeout(() => {
          reconnectAttempts++;
          console.log(`Reconnecting... (Attempt ${reconnectAttempts})`);
          createWebSocket();
        }, timeout);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      ws.close();
    };

    setSocket(ws);

    return () => {
      isUnloading = true;
      ws.close();
    };
  }, [ip, port, onMessage]);

  useEffect(() => {
    const cleanup = createWebSocket();
    return cleanup;
  }, [createWebSocket]);

  const sendMessage = useCallback((payload: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    socket.send(JSON.stringify(payload));
  }, [socket]);

  return { socket, sendMessage };
};