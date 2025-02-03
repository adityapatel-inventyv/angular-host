import { Component } from '@angular/core';

@Component({
  selector: 'app-web-worker',
  templateUrl: './web-worker.component.html',
  styleUrls: ['./web-worker.component.css']
})
export class WebWorkerComponent {
  private worker?: Worker;
  status: string = 'Waiting...';
  downloadSpeed: string = '-';
  latency: string = '-';
  speedTestResults: any = {}

  ngOnInit(): void {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'FETCH_LATENCY') {

        console.log(`Fetch latency for ${event.data.url}: ${event.data.latency} ms`);
        this.latency = event.data.latency;
        // You can add additional logic here to handle the latency data
      }
    });

    if (typeof Worker !== 'undefined') {
      // Initialize the worker
      this.worker = new Worker(new URL('./speed-test.worker.ts', import.meta.url));

      this.worker.onmessage = ({ data }) => {
        const { from, status, downloadSpeed, latency } = data;

        if (from === 'auto') {
          this.status = status === 'slow' ? 'Slow Internet' : 'Normal Speed';
          this.downloadSpeed = downloadSpeed
          this.latency = latency;

          if (status === 'slow') {
            console.warn('Slow internet detected!');
          }
        }
        else if (from === 'test') {

          this.speedTestResults = data;
          console.log("data", this.speedTestResults);
        }
      }

      // Start the speed test with a threshold of 5 Mbps
      this.worker.postMessage({
        action: 'start',
        threshold: 40,
        interval: 5000, // Check every 5 seconds
      });
    } else {
      console.error('Web Workers are not supported in this browser.');
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
    }
  }

  start() {
    this.worker?.postMessage({
      action: 'speed-test',
      threshold: 40,
      interval: 5000, // Check every 5 seconds
    });
  }
  ngOnDestroy(): void {
    // Terminate the worker when the component is destroyed
    this.terminate()
  }
}
