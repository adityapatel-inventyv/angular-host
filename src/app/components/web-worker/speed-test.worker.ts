/// <reference lib="webworker" />

self.onmessage = async ({ data }) => {
  if (data.action === 'start') {
    const { threshold, interval } = data;

    while (true) {
      const startTime = performance.now();
      const response = await fetch('https://websocket-testing-4ovk.onrender.com/data') // Replace with a URL to a large file
      const responseData  = await response.json();      
      const endTime = performance.now();
   


      const dataSizeMB = responseData.data.length / (1024 * 1024); // Convert bytes to MB
      const timeSeconds = (endTime - startTime) / 1000; // Convert ms to seconds
      console.log(`Data Size: ${timeSeconds} MB`);
      
      const speedMBps = dataSizeMB / timeSeconds;
      const speedMbps = speedMBps * 8; // Convert MBps to Mbps

      console.log(`Download Speed: ${speedMbps.toFixed(2)} Mbps`);
      const status = speedMbps < threshold ? 'slow' : 'normal';

      self.postMessage({
        status,
        downloadSpeed: speedMbps,
        latency: timeSeconds*1000
      });

      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
};

// Delay function
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
