import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear any legacy cache that might hold stale Vite pre-bundled React chunks
if ('caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== 'senal-nativa-pwa-v3') {
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

createRoot(document.getElementById('root')!).render(<App />);


