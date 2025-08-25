import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../utils/constants';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  public options: WebSocketOptions;

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      ...options
    };
    this.maxReconnectAttempts = this.options.reconnectAttempts!;
    this.reconnectInterval = this.options.reconnectInterval!;
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws';
        const url = token ? `${wsUrl}?token=${token}` : wsUrl;
        
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          console.log('WebSocket connected');
          
          if (this.options.onOpen) {
            this.options.onOpen();
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            
            if (this.options.onMessage) {
              this.options.onMessage(message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          console.log('WebSocket disconnected:', event.code, event.reason);
          
          if (this.options.onClose) {
            this.options.onClose();
          }

          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          console.error('WebSocket error:', error);
          
          if (this.options.onError) {
            this.options.onError(error);
          }
          
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('WebSocket reconnection failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          toast.error('WebSocket connection failed. Please refresh the page.');
        }
      });
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
  }

  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }

  subscribe(channel: string): boolean {
    return this.send({
      type: 'subscribe',
      channel,
      timestamp: new Date().toISOString()
    });
  }

  unsubscribe(channel: string): boolean {
    return this.send({
      type: 'unsubscribe',
      channel,
      timestamp: new Date().toISOString()
    });
  }

  ping(): boolean {
    return this.send({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }

  getConnectionStatus(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Default message handlers
webSocketService.options.onMessage = (message: WebSocketMessage) => {
  switch (message.type) {
    case 'metrics_update':
      // Handle metrics update
      console.log('Metrics update received:', message.data);
      break;
    case 'alert_triggered':
      // Handle new alert
      console.log('Alert triggered:', message.data);
      toast.error(`🚨 ${message.data.name}: ${message.data.description}`);
      break;
    case 'deployment_status':
      // Handle deployment status update
      console.log('Deployment status update:', message.data);
      break;
    case 'pong':
      // Handle pong response
      console.log('Pong received');
      break;
    default:
      console.log('Unknown message type:', message.type, message.data);
  }
};

webSocketService.options.onOpen = () => {
  console.log('WebSocket connection established');
  toast.success('Real-time monitoring connected');
};

webSocketService.options.onClose = () => {
  console.log('WebSocket connection closed');
  toast.error('Real-time monitoring disconnected');
};

webSocketService.options.onError = (error) => {
  console.error('WebSocket error:', error);
  toast.error('Real-time monitoring error');
};
