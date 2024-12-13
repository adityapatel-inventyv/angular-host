import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestingService {
  private connection = (navigator as any).connection || null; // Browser Network Information API
  private networkTypeSubject = new BehaviorSubject<string>(this.getCurrentNetworkType());
  private onlineStatusSubject = new BehaviorSubject<any>({
    isOnline: navigator.onLine,
    ip: ''
  });
  private socket$!: WebSocketSubject<any>;
  private connectionStatus = new Subject<boolean>();
  private heartbeatInterval: any;
  private readonly maxRetries = 10;
  private readonly retryDelay = 2000; // Base retry delay in ms
  private retryAttempts = 0;
  private isRetrying = false;

  constructor() {
    this.initializeWebSocket();
    this.updateOnlineStatus();

    // Monitor online/offline events
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    // Monitor network type changes
    if (this.connection) {
      this.connection.addEventListener('change', () => this.updateNetworkType());
    }
  }

  // Initialize WebSocket
  private initializeWebSocket(): void {
    const url = 'wss://websocket-testing-4ovk.onrender.com';

    this.socket$ = webSocket({
      url: url,
      openObserver: {
        next: () => {
          this.connectionStatus.next(true);
          this.retryAttempts = 0;
          this.isRetrying = false;
          clearInterval(this.heartbeatInterval);
          console.log('WebSocket connection established.');
        },
      },
      closeObserver: {
        next: () => {
          this.connectionStatus.next(false);
          this.scheduleWebSocketRetry();
          console.log('WebSocket connection closed.');
        },
      }
    });

    this.socket$.subscribe({
      error: () => {
        console.error('WebSocket encountered an error.');
        this.scheduleWebSocketRetry();
      }
    });
  }

  // Retry WebSocket connection with exponential backoff
  private scheduleWebSocketRetry(): void {
    if (this.isRetrying || this.retryAttempts >= this.maxRetries) {
      if (this.retryAttempts >= this.maxRetries) {
        console.error('Max retry attempts reached. Unable to reconnect WebSocket.');
      }
      return;
    }

    this.isRetrying = true;
    const delay = this.calculateRetryDelay();
    console.log(`Retrying WebSocket in ${delay}ms (Attempt ${this.retryAttempts + 1}/${this.maxRetries}).`);

    timer(delay).subscribe(() => {
      this.retryAttempts++;
      this.initializeWebSocket();
    });
  }

  // Calculate retry delay (exponential backoff)
  private calculateRetryDelay(): number {
    return this.retryDelay * Math.pow(2, this.retryAttempts);
  }

  // Update the current network type
  private updateNetworkType(): void {
    const networkType = this.getCurrentNetworkType();
    console.log(`Network type changed to: ${networkType}`);
    this.networkTypeSubject.next(networkType);
  }

  getCurrentNetworkType(): string {
    return this.connection?.effectiveType || 'unknown';
  }

  getNetworkTypeObservable() {
    return this.networkTypeSubject.asObservable();
  }

  // Update online/offline status with public IP
  private async updateOnlineStatus(): Promise<void> {
    const isOnline = navigator.onLine;
    const ip = isOnline ? await this.fetchPublicIP() : 'Unavailable';
    console.log(`Network status: ${isOnline ? 'Online' : 'Offline'}, IP: ${ip}`);
    this.onlineStatusSubject.next({ isOnline, ip });
  }

  private async fetchPublicIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to fetch public IP:', error);
      return 'Unknown';
    }
  }

  get onlineStatus$() {
    return this.onlineStatusSubject.asObservable();
  }

  getConnectionStatus() {
    return this.connectionStatus.asObservable();
  }

  // WebSocket Testing Method
  sendMessage(message: any): void {
    if (this.socket$) {
      console.log('Sending message via WebSocket:', message);
      this.socket$.next(message);
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  // Close WebSocket connection
  closeWebSocketConnection(): void {
    if (this.socket$) {
      console.log('Closing WebSocket connection.');
      this.socket$.complete();
    }
  }
}
