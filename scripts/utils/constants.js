const CMP_CONFIG = {
  chatbotPlaceholder: '<div class="airindiaChatBot"></div>',
  chatbotScript: {
    stage: 'https://code.jquery.com/jquery-3.7.1.min.js, https://cbot-scripts-staging.airindia.com/ai-chatbot.js',
    prod: 'https://code.jquery.com/jquery-3.7.1.min.js, https://cbot-scripts.airindia.com/ai-chatbot.js',
  },
  chatbotStyle: {
    stage: 'https://cbot-scripts-staging.airindia.com/ai-chatbot.css',
    prod: 'https://cbot-scripts.airindia.com/ai-chatbot.css',
  },
  searchFlightPlaceholder: '<search-flight id="searchflightangularselecter" language="" contentlist=""></search-flight> <div class="flightsearch-link" style="display: none;">/content/air-india/in/en/multicity-booking, ,,,/content/dam/air-india/redesign-loyalty/cards/cashPointSignUp.png,&lt;p class=&#34;signupCashPointPopupText&#34;&gt;Sign in to your Flying Returns account&lt;/p&gt;&lt;p class=&#34;signupCashPointPopupDescription&#34;&gt;Use a combination of cash and points on your next booking and continue exploring the world. Sign in to your Flying Returns account to discover exciting benefits.&lt;/p&gt;,/content/dam/air-india/redesign-loyalty/cards/pointSignUp.png,&lt;p class=&#34;signupCashPointPopupText&#34;&gt;Sign in to your Flying Returns account&lt;/p&gt;&lt;p class=&#34;signupCashPointPopupDescription&#34;&gt;Spend points on your next booking and continue exploring the world. Sign in to your Flying Returns account and make the most of your journey.&lt;/p&gt; </div>',
  searchFlightScript: {
    prod: 'https://www.airindia.com/etc.clientlibs/air-india/clientlibs/clientlib-booking.lc-7300c1a101c391adae9520d097de59ec-lc.min.js',
    stage: 'https://newai-staging.airindia.com/etc.clientlibs/air-india/clientlibs/clientlib-booking.lc-7300c1a101c391adae9520d097de59ec-lc.min.js',
  },
  searchFlightStyle: {
    prod: 'https://www.airindia.com/etc.clientlibs/air-india/components/AIComponents/flightSearch/clientlibs.lc-0a0f7442c40226c04d15438672316227-lc.min.css',
    stage: 'https://newai-staging.airindia.com/etc.clientlibs/air-india/components/AIComponents/BookingFrom/clientlibs.lc-8c7e61d764627a838f7bc3511d3519cc-lc.min.css, /blocks/booking/booking-stage.css',
  },
};

export const SCRIPTS = {
  wcmDataLayer: 'https://www.airindia.com/etc.clientlibs/core/wcm/components/commons/datalayer/v2/clientlibs/core.wcm.components.commons.datalayer.v2.lc-1e0136bad0acfb78be509234578e44f9-lc.min.js, https://www.airindia.com/etc.clientlibs/core/wcm/components/commons/datalayer/acdl/core.wcm.components.commons.datalayer.acdl.lc-bf921af342fd2c40139671dbf0920a1f-lc.min.js',
  adobeotmSrc: {
    dev: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-43a3ffd400eb-development.min.js',
    preview: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-ce0d5a5ddfb7-staging.min.js',
    live: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-4f07f2129862.min.js',
  },
  gtmSrc: 'https://www.googletagmanager.com/gtag/js?id=UA-222518279-1',
};

export const HOST = {
  origin: 'https://www.airindia.com',
  domain: '.airindia.com',
  edsSubDomain: 'https://ai-eds-test.airindia.com',
  edsTestPage: 'https://ai-eds-test.airindia.com/in/en/book/special-offers/global-connectivity',
};

export const EVENTS = {
  ADOBE_LAUNCH_LOADED: 'ADOBE_LAUNCH_LOADED',
};

export const STORAGE = {
  LTY_MD: 'lty-md',
  LTY_MEM_TIER: 'lty-memTier',
  LTY_UD: 'lyt-ud',
};

export default CMP_CONFIG;
