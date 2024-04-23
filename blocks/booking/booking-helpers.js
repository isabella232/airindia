import { fetchPlaceholders } from '../../scripts/aem.js';

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(async (registration) => {
        await fetchPlaceholders();
        // console.log('Service Worker registered with scope:', registration.scope);
        if (registration.active) {
          registration.active
            .postMessage(window.placeholders);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error('Service Worker registration failed:', error);
      });
  }
}

function isLocalhostWithPort(port) {
  return window.location.hostname === 'localhost'
         && window.location.port === port;
}

export {
  initServiceWorker,
  isLocalhostWithPort,
};
