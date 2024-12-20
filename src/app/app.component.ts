import { Component, OnInit, OnDestroy } from '@angular/core';
import { TestingService } from './testing.service';
import { Subscription } from 'rxjs';
import axios from 'axios';

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



  target: string = '';
  results: any[] = [];
  errorMessage: string = '';
ips:any

  constructor(private networkService: TestingService) { }

  ngOnInit() {
    // Fetch initial IP
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {  
        this.previousIP = data.ip;
        this.previousWebSocketIP = data.ip;
    });

    // Subscribe to network type changes
    this.networkTypeSubscription = this.networkService.getNetworkTypeObservable().subscribe(type => {
      this.networkType = type;
    });

    // Subscribe to online status changes
    this.onlineStatusSubscription = this.networkService.onlineStatus$.subscribe(status => {
      this.isOnline = status;
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
        const fetchIP = async () => {
          try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            this.currentIP = data.ip;

            if (this.previousIP && this.currentIP !== this.previousIP) {
              this.ipChangeMessage = `IP changed! Previous: ${this.previousIP}, Current: ${this.currentIP}`;
              this.previousIP = this.currentIP;
            } else {
              this.ipChangeMessage = `IP remains the same: ${this.currentIP}`;
            }
          } catch (err) {
            console.error('Error fetching IP:', err);
          }
        };

        fetchIP();
      } else {
        this.ipChangeMessage = 'You are offline.';
      }

    });

    // Subscribe to WebSocket connection status
    this.connectionSubscription = this.networkService.getConnectionStatus().subscribe(status => {
      this.isConnected = status;
      this.webSocketLogs.push(status);


      if (this.isConnected) {
        // Fetch new WebSocket IP when connected
        fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => {  
            this.currentWebSocketIP = data.ip;

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



  click() {


    this.networkService.sendMessage();

  }




  performTraceroute() {

    fetch("https://api.ipify.org?format=json").then(response => {
      return response.json();
    }).then(data => {
      this.target = data.ip

if(this.ips){
  this.target = this.ips
}

      fetch('http://54.91.188.85:3000/traceroute?target=' + this.target, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        response.text().then(async(text) => {
          console.log(text);
          
          const ipList = this.parseTraceroute(text);
          this.results = await this.temp(ipList)
          console.log(this.results);
          
          
          

          
        }).catch(error => {
          this.errorMessage = 'An error occurred while parsing the results.';
        });

      }).catch(error => {
        this.errorMessage = 'An error occurred while fetching the results.';
      });
      // fetch('http://54.91.188.85:3000/traceroute?target=' + this.target, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // }).then(response => {
      //   return response.json();
      // }).then(data => {
      //   this.results = data;

      //   console.log(this.results);
        
      // }).catch(error => {
      //   this.errorMessage = 'An error occurred while fetching the results.';
      // });
    } ).catch(error => {
      this.errorMessage = 'An error occurred while fetching the target IP.';
    })

   

  }

  async temp(ipList:any){
const data:any =[]
    const locationPromises =ipList.map(async (hop: any) => {
      try {
        const response = await axios.get(`https://freeipapi.com/api/json/${hop}`);

        data.push( {
          ip: response.data.ipAddress || "Unknown",
          city: response.data.cityName || "Unknown",
          region: response.data.regionName || "Unknown",
          country: response.data.countryName || "Unknown",
        })
      } catch (error) {
        data.push({
          ip: "unknown",
          city: "Unknown",
          region: "Unknown",
          country: "Unknown",
        })
      }
    });
    await Promise.all(locationPromises);
    return data

  }

parseTraceroute(tracerouteOutput: string) {
  // Regular expression to match IP addresses
  // This will match IPv4 addresses that are not in parentheses
  const ipPattern = /(?<![\(\d])(?:\d{1,3}\.){3}\d{1,3}(?![\)\d])/g;

  // Split the output into lines and process each line
  const ipAddresses = tracerouteOutput
    .split('\n')
    .filter((line: string) => line.trim())  // Remove empty lines
    .flatMap((line: string) => {
      // Find all IP addresses in the current line
      return line.match(ipPattern) || [];
    });

  // Remove duplicates while preserving order
  const uniqueIps = [...new Set(ipAddresses)];

  return uniqueIps;
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
