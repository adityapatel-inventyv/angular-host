import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestingService {
  private connection = (navigator as any).connection || null;
  private networkTypeSubject = new BehaviorSubject<string>(this.getCurrentNetworkType());
  private onlineStatusSubject = new BehaviorSubject<{ isOnline: boolean; ip: string }>({
    isOnline: navigator.onLine,
    ip: ''
  });

  private socket$!: WebSocketSubject<any>;
  private connectionStatus = new Subject<boolean>();

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
        next: () => this.connectionStatus.next(true),
      },
      closeObserver: {
        next: () => this.connectionStatus.next(false),
      }
    });

    this.socket$.subscribe();
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
    const ip = isOnline ? await this.fetchPublicIP() : '';
    this.onlineStatusSubject.next({ isOnline, ip });
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

  closeConnection() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
