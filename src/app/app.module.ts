import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { TracerouteComponent } from './components/traceroute/traceroute.component';

@NgModule({
  declarations: [
    AppComponent,
    TracerouteComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
