import { getPlaceholderDataFor } from './utils/headerUtils.js';

export function getQueryParameters(url) {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  let capturedParams = '';
  const marketingParms = getPlaceholderDataFor('marketingQueryParamsAnalytics') || '';
  const marketingParmsArr = marketingParms.split(',')?.map((item) => item?.trim?.() || '') || [];
  marketingParmsArr.forEach((param) => {
    if (urlParams.has(param)) {
      capturedParams += `${param}=${urlParams.get(param)}&`;
    }
  });
  capturedParams = capturedParams.slice(0, -1);

  return capturedParams;
}

export function pushToAdobeDataLayer(dataLayerObj) {
  window?.adobeDataLayer.push({
    ...dataLayerObj,
  });
}

export function pushPageLoadedAnalytics() {
  const dataLayerObj = {
    event: 'pageLoaded',
    _airindia: {
      pageName: document.title || '',
      pageURL: window.location.href,
      siteSection: 'AEM Site Section',
      siteSubSection: document.title || '',
      pageType: 'AEM Page',
      siteName: 'AirIndia Website',
      language: document.documentElement.lang || 'en',
      market: '',
    },
    web: {
      webPageDetails: {
        URL: window.location.href,
        name: document.title || '',
        server: window.location.host,
        siteSection: 'AEM Site Section',
        pageViews: {
          value: 1,
        },
      },
    },
    marketing: {
      trackingCode: getQueryParameters(window.location.href),
    },
  };
  pushToAdobeDataLayer(dataLayerObj);
}
