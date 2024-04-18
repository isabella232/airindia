import { fetchPlaceholders } from '../aem.js';

export function capitalize(str) {
  return `${str?.[0].toUpperCase()}${str?.slice(1)}`;
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(async (registration) => {
        await fetchPlaceholders();
        if (registration.active) {
          registration.active
            .postMessage(window.placeholders);
        }
      })
      .catch(() => {
        // TODO: Handle error
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
