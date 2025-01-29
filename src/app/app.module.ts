import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { TracerouteComponent } from './components/traceroute/traceroute.component';
import { WebRTCComponent } from './components/web-rtc/web-rtc.component';
import { RemoteComponent } from './components/remote/remote.component';
import { WebWorkerComponent } from './components/web-worker/web-worker.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    TracerouteComponent,
    WebRTCComponent,
    RemoteComponent,
    WebWorkerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
