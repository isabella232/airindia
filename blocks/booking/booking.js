import loadExternalComponent from '../../scripts/utils/initializer.js';

const urlParams = 'https://www.airindia.in';

const configModelUrl = `${urlParams}/content/.EnvironmentVariableServlet.json`;

let envParam = {};
let vaultServiceUrl = '';
let loyaltyVaultService = '';
const dataValuesForVault = {};
let headerValueDXP = '';
let headerValueLOY = '';
const envDetails = {};

let container;

/**
 * updates the additional content for flight search
 * Copied form Live site 'https://www.airindia.com/etc.clientlibs/air-india/components/AIComponents/flightSearch/clientlibs.lc-3d41f7d1323459209150a2d7287c7da7-lc.min.js'
*/
function updateFlightContent() {
  const t = document.documentElement.lang;
  document.querySelector('#searchflightangularselecter').setAttribute('language', t);
  const e = document.querySelectorAll('.flightsearch-link');
  const l = {
    multicity: [...e][0].textContent.split(',')[0],
    eligibility: [...e][0].textContent.split(',')[1],
  };
  document.querySelector('#searchflightangularselecter').setAttribute('contentlist', JSON.stringify(l));
}

/**
 * initBooking
 * @returns {void}
 * @description - This function is used to initialize the booking block
 * It loads the external component and updates the flight content
 *
 * It also fetches the environment variables and dispatches the event
 * to set the environment variables in the window object for the external components to use it
 * for API calls and other purposes
 */
export async function initBooking() {
  await loadExternalComponent('search-flight', container);
  updateFlightContent();
  await fetch(configModelUrl)
    .then((res) => res.json())
    .then(async (response) => {
      envParam = response;
      envParam.environment = envParam?.ENV_CONFIG;

      if (envParam?.environment === 'prod') {
        vaultServiceUrl = 'https://api.airindia.com/kvtoken/token-key';
        headerValueDXP = 'DXP';
        loyaltyVaultService = 'https://api-loyalty.airindia.com/kv-token/get-loy-token-key';
        headerValueLOY = 'LOY';
      }
      if (envParam?.environment === 'stage') {
        vaultServiceUrl = 'https://api-staging.airindia.com/kvtoken/get-token-key';
        headerValueDXP = 'DXP';
        loyaltyVaultService = 'https://api-loyalty-staging.airindia.com/kv-token/get-loy-token-key';
        headerValueLOY = 'LOY';
      }
      if (envParam?.environment === 'qa') {
        vaultServiceUrl = 'https://ai-shrd-sandbx-apgw-001.azure-api.net/kvtoken/qa/get-token-key';
        headerValueDXP = 'DXP';
        loyaltyVaultService = 'https://ai-shrd-sandbx-apgw-001.azure-api.net/kvtoken/qa/get-token-key';
        headerValueLOY = 'DXP';
      }
      if (envParam?.environment === 'dev') {
        vaultServiceUrl = 'https://ai-shrd-sandbx-apgw-001.azure-api.net/kvtoken/dev/get-token-key';
        headerValueDXP = 'DXP';
        loyaltyVaultService = 'https://ai-shrd-sandbx-apgw-001.azure-api.net/kvtoken/dev/get-token-key';
        headerValueLOY = 'DXP';
      }
      try {
        await fetch(vaultServiceUrl, {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            appName: headerValueDXP,
          },
          body: JSON.stringify(dataValuesForVault),
          // body data type must match "Content-Type" header
        })
          .then((res) => res.json())
          .then(async (vaultResponse) => {
            envDetails.env = envParam?.environment;
            envDetails.dxpVaultDetails = vaultResponse;

            const configset = new CustomEvent('configset', {
              detail: envDetails,
            });

            window.dispatchEvent(configset);

            console.log('[booking.js] [initBooking] event dispatched for configset');
          })
          .catch((err) => {
            console.error('[booking.js] [initBooking]', err);
          });
      } catch (e) {
        console.error(e);
      }

      try {
        await fetch(loyaltyVaultService, {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            appName: headerValueLOY,
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(dataValuesForVault),
          // body data type must match "Content-Type" header
        })
          .then((res) => res.json())
          .then((loyaltyVaultResponse) => {
            envDetails.loyaltyVaultDetails = loyaltyVaultResponse;

            const configset = new CustomEvent('loyaltyconfigset', {
              detail: envDetails,
            });
            window.dispatchEvent(configset);
          })
          .catch((err) => {
            console.error('[booking.js] [initBooking]', err);
          });
      } catch (e) {
        console.error('[booking.js] [initBooking]', e);
      }
      return true;
    });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  container = block;
}

/** dummy function to handle dependency */
window.checkSignInForRefx = () => {
  console.log('[booking.js] [checkSignInForRefx]');
};
