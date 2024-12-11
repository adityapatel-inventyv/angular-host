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
  previousIP: string | null = null;
  currentIP: string | null = null;
  ipChangeMessage: string | null = null;

  private connectionSubscription!: Subscription;

  constructor(private networkService: TestingService) { }

  ngOnInit() {
    // Fetch initial IP
    this.fetchPublicIP().then(ip => {
      this.previousIP = ip;
    });

    // Subscribe to network type changes
    this.networkService.getNetworkTypeObservable().subscribe(type => {
      this.networkType = type;
    });

    // Subscribe to online status changes
    this.networkService.onlineStatus$.subscribe(status => {
      this.isOnline = status.isOnline;
      this.currentIP = status.ip;

      if (!this.isOnline) {
        this.ipChangeMessage = 'You are offline.';
      } else if (this.previousIP && this.currentIP && this.previousIP !== this.currentIP) {
        this.ipChangeMessage = `IP changed! Previous: ${this.previousIP}, Current: ${this.currentIP}`;
        this.previousIP = this.currentIP; // Update for next comparison
      } else {
        this.ipChangeMessage = `IP remains the same: ${this.currentIP}`;
      }
    });

    // Subscribe to WebSocket connection status
    this.connectionSubscription = this.networkService.getConnectionStatus().subscribe(status => {
      this.isConnected = status;
    });
  }

  private async fetchPublicIP(): Promise<string> {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  }

  ngOnDestroy() {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    this.networkService.closeConnection();
  }
}
