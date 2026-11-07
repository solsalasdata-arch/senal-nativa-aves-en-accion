import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Señal Nativa Service Worker registrado:', reg.scope);
      })
      .catch((err) => {
        console.warn('Error al registrar Service Worker:', err);
      });
  });
}

