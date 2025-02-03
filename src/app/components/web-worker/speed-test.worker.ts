/// <reference lib="webworker" />
const serverUrl = "https://websocket-testing-4ovk.onrender.com";
const iterations = 10;

self.onmessage = async ({ data }) => {
  // const { serverUrl } = data;
  if (data.action === 'start') {
    const { threshold, interval } = data;

    while (true) {
      const startTime = performance.now();
      const response = await fetch('https://websocket-testing-4ovk.onrender.com/data') // Replace with a URL to a large file
      const responseData = await response.json();
      const endTime = performance.now();


      const dataSizeMB = responseData.data.length / (1024 * 1024); // Convert bytes to MB
      const timeSeconds = (endTime - startTime) / 1000; // Convert ms to seconds

      const speedMBps = dataSizeMB / timeSeconds;
      const speedMbps = speedMBps * 8; // Convert MBps to Mbps

      console.log(`Download Speed: ${speedMbps.toFixed(2)} Mbps`);
      const status = speedMbps < threshold ? 'slow' : 'normal';

      self.postMessage({
        from:"auto",
        status,
        downloadSpeed: speedMbps,
        latency: timeSeconds * 1000
      });

      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  else if (data.action === 'speed-test') {

    try {
      const latencyPromises: any[] = [];
      const downloadPromises: any[] = [];
      const uploadPromises: any[] = [];

      for (let i = 0; i < iterations; i++) {
        latencyPromises.push(await measureLatency(serverUrl));
      }
      const latencyResults = await Promise.all(latencyPromises);
      const avgLatency = (latencyResults.reduce((a, b) => a + b, 0) / iterations).toFixed(2) + " ms";

      for (let i = 0; i < iterations; i++) {
        downloadPromises.push(await measureDownloadSpeed(serverUrl));
      }
      const downloadResults = await Promise.all(downloadPromises);
      const avgDownload = (downloadResults.reduce((a, b) => a + b, 0) / iterations).toFixed(2) + " Mbps";

      for (let i = 0; i < iterations; i++) {
        uploadPromises.push(await measureUploadSpeed(serverUrl));
      }
      const uploadResults = await Promise.all(uploadPromises);
      const avgUpload = (uploadResults.reduce((a, b) => a + b, 0) / iterations).toFixed(2) + " Mbps";

      console.log({ avgLatency, avgDownload, avgUpload });

      self.postMessage({ from: "test", latency: avgLatency, downloadSpeed: avgDownload, uploadSpeed: avgUpload });
    } catch (error: any) {
      self.postMessage({ error: error.message });
    }

  }


  // Measure Latency (Ping)
  async function measureLatency(serverUrl: any) {
    try {
      const startTime = performance.now();
      await fetch(`${serverUrl}/health-check`, { method: "GET", cache: "no-store" });
      return performance.now() - startTime; // Latency in milliseconds
    } catch (error) {
      return 0; // Return 0 on error
    }
  }

  // Measure Download Speed
  async function measureDownloadSpeed(serverUrl: any) {
    try {
      const startTime = performance.now();
      const response = await fetch(`${serverUrl}/api/down`);
      const blob = await response.blob();
      const durationInSeconds = (performance.now() - startTime) / 1000;
      const sizeInBits = blob.size * 8; // Convert bytes to bits      
      return sizeInBits / durationInSeconds / 1e6; // Mbps
    } catch (error) {
      console.log(error);

      return 0; // Return 0 on error
    }
  }

  // Measure Upload Speed
  async function measureUploadSpeed(serverUrl: any) {
    try {
      const dataSize = 4028 * 4028;// 5MB
      const data = "0".repeat(dataSize) // Dummy data
      // new Uint8Array(dataSize).fill(0);
      const startTime = performance.now();
      await fetch(`${serverUrl}/api/up`, {
        method: "POST",
        body: data,
        mode: "no-cors",
      });
      const durationInSeconds = (performance.now() - startTime) / 1000;
      const sizeInBits = dataSize * 8; // Convert bytes to bits
      return sizeInBits / durationInSeconds / 1e6; // Mbps
    } catch (error) {
      return 0; // Return 0 on error
    }
  }
}
// Delay function
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
