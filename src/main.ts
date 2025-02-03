import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule).then(() => {
  if (navigator.serviceWorker) {
    if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/service-worker.js', {
    //     scope: "/",
    //  } ) // Updated path to local file
    }
  }
});
