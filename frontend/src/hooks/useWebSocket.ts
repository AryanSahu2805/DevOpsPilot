import { useEffect, useRef, useState, useCallback } from 'react';
import { webSocketService, WebSocketMessage } from '../services/websocket';
import { useAuth } from './useAuth';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(async () => {
    if (!isAuthenticated || isConnected || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await webSocketService.connect();
      setIsConnected(true);
      setIsConnecting(false);
    } catch (err) {
      setIsConnecting(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
      
      // Schedule reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [isAuthenticated, isConnected, isConnecting]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    webSocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (!isConnected) {
      throw new Error('WebSocket is not connected');
    }
    return webSocketService.send(message);
  }, [isConnected]);

  const subscribe = useCallback((channel: string) => {
    if (!isConnected) {
      throw new Error('WebSocket is not connected');
    }
    return webSocketService.subscribe(channel);
  }, [isConnected]);

  const unsubscribe = useCallback((channel: string) => {
    if (!isConnected) {
      throw new Error('WebSocket is not connected');
    }
    return webSocketService.unsubscribe(channel);
  }, [isConnected]);

  const ping = useCallback(() => {
    if (!isConnected) {
      throw new Error('WebSocket is not connected');
    }
    return webSocketService.ping();
  }, [isConnected]);

  // Handle WebSocket events
  useEffect(() => {
    const handleOpen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      options.onOpen?.();
    };

    const handleClose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      options.onClose?.();
    };

    const handleError = (err: Event) => {
      setError('WebSocket error occurred');
      options.onError?.(err);
    };

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
      options.onMessage?.(message);
    };

    // Set up event handlers
    webSocketService.options.onOpen = handleOpen;
    webSocketService.options.onClose = handleClose;
    webSocketService.options.onError = handleError;
    webSocketService.options.onMessage = handleMessage;

    // Auto-connect if enabled and authenticated
    if (options.autoConnect !== false && isAuthenticated) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, options.autoConnect, connect, disconnect, options.onOpen, options.onClose, options.onError, options.onMessage]);

  // Auto-reconnect when authentication state changes
  useEffect(() => {
    if (isAuthenticated && options.autoConnect !== false) {
      connect();
    } else if (!isAuthenticated) {
      disconnect();
    }
  }, [isAuthenticated, options.autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    ping,
    connectionStatus: webSocketService.getConnectionStatus()
  };
};
