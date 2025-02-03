import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { TestingService } from './testing.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import html2canvas from 'html2canvas';
import { Network } from '@capacitor/network';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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
  pc: any

  networkState: string = 'Unknown'

  tempstatus: any;
  constructor(private networkService: TestingService, private http: HttpClient, private fb: FormBuilder) {

    this.form = this.fb.group({
      basePrice: [this.basePrice(), Validators.required],
    });
   }


  ngAfterViewInit() {


    setTimeout(() => {
      const element = document.getElementById('network');
      if (element) {

        html2canvas(element).then((canvas: any) => {
          document.body.appendChild(canvas);
        });
      } else {
        console.error('Element with id "network" not found.');
      }
    }, 5000);
    ``
  }
  ngOnInit() {


    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.tempstatus = status
    });

    fetch('https://websocket-testing-4ovk.onrender.com/health-check').then(response => {
      
      response.json().then(data => {
      }).catch(error => {

        console.log(error);

      })

    })

    https://websocket-testing-4ovk.onrender.com/health-check

    this.getPublicIP();

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


    // this.networkService.sendMessage();
    console.log(this.pc)

  }












  async getPublicIP() {
    const server = 'stun:stun.l.google.com:19302'; // Define the server variable
    this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], });
    this.pc.createDataChannel(""); // Create a dummy data channel
    this.pc.oniceconnectionstatechange = () => {
      console.log(`Connection state for ${server}: ${this.pc.iceConnectionState}`);
      if (this.pc.iceConnectionState === "failed" || this.pc.iceConnectionState === "disconnected") {
        console.log(`Potential issue with ${server}`);
      }
      this.pc.close();
    };
    this.pc.onicecandidate = (event: any) => {
      if (event.candidate) {

        const candidate = event.candidate.candidate;
        const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (match) {
          console.log("Public IP Address:", match[1]);
          // pc.close();
        }
      }
    };


    this.pc.addEventListener("icecandidateerror", (event: any) => {
      console.error("ICE Candidate Error Event:", event);
    });


    await this.pc.createOffer().then((offer: any) => this.pc.setLocalDescription(offer));
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


  form: FormGroup;

  // Signals
  basePrice = signal(100); // Default base price
  isMember = this.networkService.getIsMember

  // First-level computed signal: Discount percentage
  discountPercentage = computed(() => {
    
    return this.isMember() ? 10 : 5; // Members get a higher discount
  });

  // Second-level computed signals:
  discountAmount = computed(() => {
    return (this.basePrice() * this.discountPercentage()) / 100;
  });

  showHide = computed(() => {
    
    if(this.isMember()){
      this.form.get('basePrice')?.setValidators([Validators.required, Validators.min(100)]);
    }else{
      this.form.get('basePrice')?.setValidators([Validators.required, Validators.min(50)]);
    }

    return this.isMember() ? 'Show' : 'Hide';
  });

  finalPrice = computed(() => {
    return this.basePrice() - this.discountAmount();
  });

  onSubmit() {
    console.log(this.form.value);
  }

  // Update base price when form control changes
  updateBasePrice() {
    const newPrice = this.form.get('basePrice')?.value;
    this.basePrice.set(Number(newPrice || 0));
  }

  // Toggle membership status
  toggleMembership() {
    this.networkService.toggleMembership();
  }
}
