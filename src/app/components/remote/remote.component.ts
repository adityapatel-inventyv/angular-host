import { Component } from '@angular/core';

@Component({
  selector: 'app-remote',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.css']
})
export class RemoteComponent {
  peerConnection: RTCPeerConnection | null = null;
  localStream: MediaStream | null = null;
  offer: string = '';
  answer: string = '';

  async startConnection() {
    this.peerConnection = new RTCPeerConnection();

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE Candidate:', event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.srcObject = remoteStream;
      }
    };
  }

  async setOffer() {
    if (this.offer && this.peerConnection) {
      
      const description = new RTCSessionDescription(JSON.parse(this.offer));
      await this.peerConnection.setRemoteDescription(description);

      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream.getTracks().forEach(track => this.peerConnection?.addTrack(track, this.localStream!));

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.answer = JSON.stringify(answer);
    }
  }

  ngOnInit(){

    this.startConnection()
  }
}
