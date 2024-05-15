import { fetchPlaceholders } from '../../scripts/aem.js';
import { HOST } from '../../scripts/utils/constants.js';

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

function isRelativePath(link) {
  // Get the href attribute of the link
  const href = link.getAttribute('href');
  // Check if the href starts with '/' or does not start with 'http://' or 'https://'
  return href.startsWith('/') || (!href.startsWith('#')) || href.startsWith('http://') || href.startsWith('https://');
}

function addDomainToLinks(element) {
  const links = element.querySelectorAll('a');
  links.forEach((link) => {
    // replace the origin with the HOST origin if the link is a relative path
    if (isRelativePath(link)) {
      link.setAttribute('href', `${HOST.origin}${link.getAttribute('href')}`);
    }
  });
}

export {
  initServiceWorker,
  isLocalhostWithPort,
  addDomainToLinks,
};
