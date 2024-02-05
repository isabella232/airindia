// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';
// eslint-disable-next-line import/no-cycle
import { getEnvType } from './scripts.js';
import loadExternalComponent from './utils/initializer.js';
import { initBooking } from '../blocks/booking/booking.js';

// Initialize the booking block if present on the page
if (document.querySelector('.booking')) {
  initBooking();
}

// Core Web Vitals RUM collection
sampleRUM('cwv');
/**
 * Google Tag Manager
* */
async function loadGTM() {
  loadScript('https://www.googletagmanager.com/gtag/js?id=UA-222518279-1');
  const scriptTag = document.createElement('script');
  scriptTag.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'UA-222518279-1');
    `;
  document.head.prepend(scriptTag);
}

async function loadAdobeLaunch() {
  const adobeotmSrc = {
    dev: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-43a3ffd400eb-development.min.js',
    preview: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-ce0d5a5ddfb7-staging.min.js',
    live: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-4f07f2129862.min.js',
  };
  await loadScript(adobeotmSrc[getEnvType()]);
}

await loadAdobeLaunch();
await loadGTM();

// Load chatbot script
loadExternalComponent('chatbot');
