import { Component, OnInit, OnDestroy } from '@angular/core';
import { TestingService } from './testing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  networkType!: string;
  isOnline = true;
  isConnected = false;

  // For General IP
  previousIP: string | null = null;
  currentIP: string | null = null;
  ipChangeMessage: string | null = null;

  // For WebSocket IP
  previousWebSocketIP: string | null = null;
  currentWebSocketIP: string | null = null;
  webSocketIPChangeMessage: string | null = null;

  temparray: any = [];

  private connectionSubscription!: Subscription;
  private onlineStatusSubscription!: Subscription;
  private networkTypeSubscription!: Subscription;
  navigatorIsOnlineLogs: any = []
  webSocketLogs: any = []

  constructor(private networkService: TestingService) { }

  ngOnInit() {
    // Fetch initial IP
    this.fetchPublicIP().then(ip => {
      this.previousIP = ip;
      this.previousWebSocketIP = ip;
    });

    // Subscribe to network type changes
    this.networkTypeSubscription = this.networkService.getNetworkTypeObservable().subscribe(type => {
      this.networkType = type;
    });

    // Subscribe to online status changes
    this.onlineStatusSubscription = this.networkService.onlineStatus$.subscribe(status => {
      this.isOnline = status.isOnline;
      this.navigatorIsOnlineLogs.push(status);


      // if (!this.isOnline) {
      //   this.ipChangeMessage = 'You are offline.';
      // } else if (this.previousIP && this.currentIP && this.previousIP !== this.currentIP) {
      //   this.ipChangeMessage = `IP changed! Previous: ${this.previousIP}, Current: ${this.currentIP}`;
      //   this.previousIP = this.currentIP; // Update for next comparison
      // } else {
      //   this.ipChangeMessage = `IP remains the same: ${this.currentIP}`;
      // }


      if (this.isOnline) {
        this.fetchPublicIP().then(ip => {
          this.currentIP = ip;

        if (this.previousIP && this.currentIP && this.previousIP !== this.currentIP) {
          this.ipChangeMessage = `IP changed! Previous: ${this.previousIP}, Current: ${this.currentIP}`;
          this.previousIP = this.currentIP; // Update for next comparison
        }
        else {
          this.ipChangeMessage = `IP remains the same: ${this.currentIP}`;

        }
        });

      }
      else {
        this.ipChangeMessage = 'You are offline.';

      }
    });

    // Subscribe to WebSocket connection status
    this.connectionSubscription = this.networkService.getConnectionStatus().subscribe(status => {
      this.isConnected = status;
      this.webSocketLogs.push(status);


      if (this.isConnected) {
        // Fetch new WebSocket IP when connected
        this.fetchPublicIP().then(ip => {
          this.currentWebSocketIP = ip;

          if (this.previousWebSocketIP && this.currentWebSocketIP && this.previousWebSocketIP !== this.currentWebSocketIP) {
            this.webSocketIPChangeMessage = `WebSocket IP changed! Previous: ${this.previousWebSocketIP}, Current: ${this.currentWebSocketIP}`;
            this.previousWebSocketIP = this.currentWebSocketIP; // Update for next comparison
          } else {
            this.webSocketIPChangeMessage = `WebSocket IP remains the same: ${this.currentWebSocketIP}`;
          }
        });
      } else {
        this.webSocketIPChangeMessage = 'WebSocket is disconnected. IP comparison is not available.';
      }
    });
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


  click() {


    this.networkService.sendMessage();

  }
  ngOnDestroy() {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.onlineStatusSubscription) {
      this.onlineStatusSubscription.unsubscribe();
    }
    if (this.networkTypeSubscription) {
      this.networkTypeSubscription.unsubscribe();
    }
    this.networkService.closeConnection();
  }
}
