import { Component } from '@angular/core';

@Component({
  selector: 'app-web-rtc',
  templateUrl: './web-rtc.component.html',
  styleUrls: ['./web-rtc.component.css']
})
export class WebRTCComponent {
  peerConnection: RTCPeerConnection | null = null;
  localStream: MediaStream | null = null;
  remoteDescription: string = '';

  async startConnection() {
    this.peerConnection = new RTCPeerConnection();
    // this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // this.localStream.getTracks().forEach(track => this.peerConnection?.addTrack(track, this.localStream!));

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE Candidate:', event.candidate);
      }
    };

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('Offer:', JSON.stringify(offer));
  }

  async setRemoteDescription() {
    if (this.remoteDescription && this.peerConnection) {
      const description = new RTCSessionDescription(JSON.parse(this.remoteDescription));
      await this.peerConnection.setRemoteDescription(description);
    }
  }
}
