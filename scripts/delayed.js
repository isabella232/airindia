// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';
// eslint-disable-next-line import/no-cycle
import { getEnvType } from './scripts.js';
import loadExternalComponent from './utils/initializer.js';
import { SCRIPTS, EVENTS } from './utils/constants.js';

// Initialize the booking block if url has `booking=lazy` query param
// and if booking element present on the page and
if (!window.location.search.includes('booking=lazy') && document.querySelector('.booking')) {
  import('../blocks/booking/booking.js').then(({ initBooking }) => {
    initBooking();
  });
}

// Core Web Vitals RUM collection
sampleRUM('cwv');
/**
 * Google Tag Manager
* */
async function loadGTM() {
  await loadScript(SCRIPTS.gtmSrc);
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

function triggerAdobeLaunchLoadedEvent() {
  const customEvent = new Event(EVENTS.ADOBE_LAUNCH_LOADED);
  window.dispatchEvent(customEvent);
}

async function loadAdobeLaunch() {
  const scripts = SCRIPTS.wcmDataLayer?.split(',');
  if (scripts?.length > 0) {
    [...scripts].forEach(async (script) => {
      await loadScript(script);
    });
  }
  window.adobeDataLayer = window.adobeDataLayer || [];
  await loadScript(SCRIPTS.adobeotmSrc[getEnvType()]);
  triggerAdobeLaunchLoadedEvent();
}

async function loadCookieConsentManager() {
  const ccm = {
    dev: '071fd164-e45b-4e9b-a106-021c14d33a7b-test',
    preview: '071fd164-e45b-4e9b-a106-021c14d33a7b-test',
    live: '071fd164-e45b-4e9b-a106-021c14d33a7b',
  };
  await loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', { 'data-domain-script': ccm[getEnvType()] });
}

await loadCookieConsentManager();
await loadAdobeLaunch();
await loadGTM();

// Load chatbot script
loadExternalComponent('chatbot');
