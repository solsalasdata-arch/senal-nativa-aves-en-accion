import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LandingPage from './LandingPage.tsx';
import './index.css';

// Existing station QR codes point to /?sn=... . Keep them opening the app
// directly while moving the public introduction to /.
const entryUrl = new URL(window.location.href);
const hasStationQr = entryUrl.searchParams.has('sn');
if (hasStationQr && entryUrl.pathname !== '/app') {
  entryUrl.pathname = '/app';
  window.history.replaceState(window.history.state, '', entryUrl);
}
const isAppRoute = entryUrl.pathname === '/app' || hasStationQr;
document.body.classList.toggle('overflow-hidden', isAppRoute);
document.body.classList.toggle('select-none', isAppRoute);

// Clear any legacy cache that might hold stale Vite pre-bundled React chunks
if ('caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== 'senal-nativa-pwa-v8') {
        caches.delete(key);
      }
    });
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update();
      })
      .catch(() => {
        // Ignore service worker registration errors in restricted preview frames
      });
  });
}

createRoot(document.getElementById('root')!).render(
  isAppRoute ? <App /> : <LandingPage />
);


