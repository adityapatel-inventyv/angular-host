import { Component } from '@angular/core';
import axios from 'axios';
import * as L from 'leaflet';
import { TestingService } from '../../testing.service';

@Component({
  selector: 'app-traceroute',
  templateUrl: './traceroute.component.html',
  styleUrls: ['./traceroute.component.css']
})
export class TracerouteComponent {
  results: any[] = [];
  errorMessage: string = '';
  ips: any
  target: string = '';
  public ipAddresses: any[] = [];
  private map!: L.Map;
  private markers: L.Marker[] = [];
  isMember = this.networkService.getIsMember


constructor(private networkService:TestingService) { }

  performTraceroute() {

    fetch("https://api.ipify.org?format=json").then(response => {
      return response.json();
    }).then(data => {
      this.target = data.ip

      if (this.ips) {
        this.target = this.ips
      }
      // http://54.91.188.85:3000/traceroute?target=
      fetch('http://localhost:3000/traceroute?target=' + this.target, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        response.text().then(async (text) => {
          console.log(text);

          const ipList = this.parseTraceroute(text);
          this.results = await this.temp(ipList)
          this.plotIPAddresses();
          console.log(this.results);
        }).catch(error => {
          this.errorMessage = 'An error occurred while parsing the results.';
        });

      }).catch(error => {
        this.errorMessage = 'An error occurred while fetching the results.';
      });
    }).catch(error => {
      this.errorMessage = 'An error occurred while fetching the target IP.';
    })
  }

  parseTraceroute(tracerouteOutput: string) {

   const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b|\((?:\d{1,3}\.){3}\d{1,3}\)/g;


    // Split the output into lines and process each line
    const ipAddressestemp = tracerouteOutput
      .split('\n')
      .filter((line: string) => line.trim())  // Remove empty lines
      .flatMap((line: string) => {
        // Find all IP addresses in the current line

        const matches = line.match(ipPattern) || [];
        // Remove brackets from each IP
        return matches.map(ip => ip.replace(/[()]/g, ''));
      });

    // Remove duplicates while preserving order
    const uniqueIps = [...new Set(ipAddressestemp)];
    return uniqueIps;
  }

  async temp(ipList: any) {
    const data: any = []
    const locationPromises = ipList.map(async (hop: any) => {
      try {
        const response = await axios.get(`https://freeipapi.com/api/json/${hop}`);
        this.ipAddresses.push(response.data);
        data.push({
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

  private async plotIPAddresses() {
    console.log(this.ipAddresses);
    for (const ip of this.ipAddresses) {
      if (ip.latitude && ip.longitude) {
        const marker = L.marker([ip.latitude, ip.longitude])
          .bindPopup(`IP: ${ip}<br>Location: ${ip.city}, ${ip.country_name}`)
          .addTo(this.map);
        this.markers.push(marker);
      }
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }


  ngOnInit() {
    this.initMap();
  }

  // Toggle membership status
  toggleMembership() {
    this.networkService.toggleMembership();
  }
}
