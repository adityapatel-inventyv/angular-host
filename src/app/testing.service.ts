import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestingService {
  private connection = (navigator as any).connection || null;
  private networkTypeSubject = new BehaviorSubject<string>(this.getCurrentNetworkType());
  private onlineStatusSubject = new BehaviorSubject<any>({
    isOnline: navigator.onLine,
    ip: ''
  });
  private socket$!: WebSocketSubject<any>;
  private connectionStatus = new Subject<boolean>();
  private heartbeatInterval: any;
  private maxRetries = 10;
  private retryDelay = 2000; // Initial retry delay in ms
  private retryAttempts = 0;
  private isRetrying = false; // Tracks if a retry is in progress

  constructor() {
    this.connectWebSocket();
    this.updateOnlineStatus();

    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    if (this.connection) {
      this.connection.addEventListener('change', () => this.updateNetworkType());
    }
  }

  private connectWebSocket(): void {
    const url = 'https://websocket-testing-4ovk.onrender.com';

    this.socket$ = webSocket({
      url: url,
      openObserver: {
        next: () => {
          this.connectionStatus.next(true);
          this.retryAttempts = 0; // Reset retries on successful connection
          this.isRetrying = false; // Clear retrying flag
          clearInterval(this.heartbeatInterval);
        },
      },
      closeObserver: {
        next: () => {
          this.connectionStatus.next(false);
          this.retryWebSocket();
        },
      }
    });

    this.socket$.subscribe({
      error: () => {
        this.retryWebSocket(); // Retry on error
      }
    });
  }

  private retryWebSocket(): void {
    if (this.isRetrying) {
      return; // Prevent multiple retry attempts simultaneously
    }

    if (this.retryAttempts >= this.maxRetries) {
      console.error('Max retry attempts reached. WebSocket connection failed.');
      return;
    }

    this.isRetrying = true; // Set retrying flag
    const delay = this.calculateRetryDelay();
    console.log(`Retrying WebSocket connection in ${delay}ms (Attempt ${this.retryAttempts + 1}/${this.maxRetries})`);

    timer(delay).subscribe(() => {
      this.retryAttempts++;
      this.connectWebSocket();
    });
  }

  private calculateRetryDelay(): number {
    return this.retryDelay * Math.pow(2, this.retryAttempts); // Exponential backoff
  }

  // Emit network type updates
  private updateNetworkType(): void {
    const networkType = this.getCurrentNetworkType();
    this.networkTypeSubject.next(networkType);
  }

  getCurrentNetworkType(): string {
    return this.connection?.effectiveType || 'unknown';
  }

  getNetworkTypeObservable() {
    return this.networkTypeSubject.asObservable();
  }

  // Emit online/offline status with public IP
  private async updateOnlineStatus(): Promise<void> {
    const isOnline = navigator.onLine;
    // const ip = isOnline ? await this.fetchPublicIP() : '';
    this.onlineStatusSubject.next(isOnline );
  }

  private async fetchPublicIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  }

  get onlineStatus$() {
    return this.onlineStatusSubject.asObservable();
  }

  getConnectionStatus() {
    return this.connectionStatus.asObservable();
  }

  sendMessage() {
    // // for web socket testing 
    // this.connectionStatus.next(false);
    // this.retryWebSocket();

    this.onlineStatusSubject.next(false);
    this.onlineStatusSubject.next(true);
    
  }

  closeConnection() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
