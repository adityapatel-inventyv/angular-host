import { Injectable, NgZone } from '@angular/core';
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
  private connectionStatus = new Subject<boolean>();
  private websocket!: WebSocket;
  private maxRetries = 10;
  private retryDelay = 2000; // Initial retry delay in ms
  private retryAttempts = 0;
  private isRetrying = false; // Tracks if a retry is in progress
  private peerConnection!: RTCPeerConnection;
  private networkChangeSubject = new BehaviorSubject<string>('Unknown');
  networkChange$ = this.networkChangeSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.initWebRTC();
    this.connectWebSocket();
    this.updateOnlineStatus();
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());

    if (this.connection) {
      this.connection.addEventListener('change', () => this.updateNetworkType());
    }
  }

  private initWebRTC() {
    try {
      this.peerConnection = new RTCPeerConnection();

      // Monitor ICE connection state changes
      this.peerConnection.addEventListener('iceconnectionstatechange', () => {
        
          const state = this.peerConnection.iceConnectionState;
          console.log('ICE Connection State Changed:', state);
          this.networkChangeSubject.next(state);
      });

      // Create a dummy data channel to keep the connection alive
      const dataChannel = this.peerConnection.createDataChannel('dummy');
      dataChannel.close();

      // Create an offer to initialize the WebRTC connection
      this.peerConnection.createOffer()
        .then((offer) => this.peerConnection.setLocalDescription(offer))
        .catch((error) => console.error('Error creating offer:', error));
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
    }
  }

  get currentNetworkState(): string {
    return this.networkChangeSubject.value;
  }

  private connectWebSocket(): void {
    const url = 'wss://websocket-testing-4ovk.onrender.com';

    this.websocket = new WebSocket(url);

    this.websocket.onopen = () => {
      console.log('WebSocket connection established.');
      this.connectionStatus.next(true);
      this.retryAttempts = 0; // Reset retries on successful connection
      this.isRetrying = false; // Clear retrying flag
    };

    this.websocket.onclose = () => {
      console.warn('WebSocket connection closed.');
      this.connectionStatus.next(false);
      this.retryWebSocket();
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket encountered an error:', error);
      this.retryWebSocket();
    };

    this.websocket.onmessage = (message) => {
      console.log('Received message:', message.data);
    };
  }

  private retryWebSocket(): void {
    if (this.isRetrying || this.retryAttempts >= this.maxRetries) {
      if (this.retryAttempts >= this.maxRetries) {
        console.error('Max retry attempts reached. WebSocket connection failed.');
      }
      return;
    }

    this.isRetrying = true; // Set retrying flag
    const delay = this.calculateRetryDelay();
    console.log(`Retrying WebSocket connection in ${delay}ms (Attempt ${this.retryAttempts + 1}/${this.maxRetries})`);

    timer(delay).subscribe(() => {
      this.retryAttempts++;
      this.connectWebSocket();
      this.isRetrying = false; // Allow subsequent retry attempts if needed
    });
  }

  private calculateRetryDelay(): number {
    return this.retryDelay * this.retryAttempts; // Exponential backoff 
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
    this.onlineStatusSubject.next(isOnline);
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

  sendMessage(): void {
    // // for web socket testing 
    this.connectionStatus.next(false);
    this.retryWebSocket();

    // this.onlineStatusSubject.next(false);
    // this.onlineStatusSubject.next(true);
  }

  closeConnection(): void {
    if (this.websocket) {
      this.websocket.close();
      console.log('WebSocket connection closed.');
    }
  }
}
