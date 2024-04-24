const CMP_CONFIG = {
  chatbotPlaceholder: '<div class="airindiaChatBot"></div>',
  chatbotScript: 'https://code.jquery.com/jquery-3.7.1.min.js, https://cbot-scripts-staging.airindia.com/ai-chatbot.js',
  chatbotStyle: 'https://cbot-scripts-staging.airindia.com/ai-chatbot.css',
  searchFlightPlaceholder: '<search-flight id="searchflightangularselecter" language="" contentlist=""></search-flight> <div class="flightsearch-link" style="display: none;">/content/air-india/in/en/multicity-booking, ,,,/content/dam/air-india/redesign-loyalty/cards/cashPointSignUp.png,&lt;p class=&#34;signupCashPointPopupText&#34;&gt;Sign in to your Flying Returns account&lt;/p&gt;&lt;p class=&#34;signupCashPointPopupDescription&#34;&gt;Use a combination of cash and points on your next booking and continue exploring the world. Sign in to your Flying Returns account to discover exciting benefits.&lt;/p&gt;,/content/dam/air-india/redesign-loyalty/cards/pointSignUp.png,&lt;p class=&#34;signupCashPointPopupText&#34;&gt;Sign in to your Flying Returns account&lt;/p&gt;&lt;p class=&#34;signupCashPointPopupDescription&#34;&gt;Spend points on your next booking and continue exploring the world. Sign in to your Flying Returns account and make the most of your journey.&lt;/p&gt; </div>',
  searchFlightScript: '/etc.clientlibs/airindia/clientlibs/clientlib-booking.lc-94222fc7d1c0fa2b361c184876ba4790-lc.min.js',
  searchFlightStyle: '/etc.clientlibs/airindia/components/AIComponents/flightsearch/clientlibs.lc-0a0f7442c40226c04d15438672316227-lc.min.css',
};

export const SCRIPTS = {
  wcmDataLayer: '/etc.clientlibs/core/wcm/components/commons/datalayer/v1/clientlibs/core.wcm.components.commons.datalayer.v1.lc-904d3c2f1e821ab45124d66de422b409-lc.min.js',
  adobeotmSrc: {
    dev: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-43a3ffd400eb-development.min.js',
    preview: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-ce0d5a5ddfb7-staging.min.js',
    live: 'https://assets.adobedtm.com/d8581f94b285/4e9e4938e0dc/launch-4f07f2129862.min.js',
  },
  gtmSrc: 'https://www.googletagmanager.com/gtag/js?id=UA-222518279-1',
};

export const HOST = {
  origin: 'https://www.airindia.com',
};

export const EVENTS = {
  ADOBE_LAUNCH_LOADED: 'ADOBE_LAUNCH_LOADED',
};

export default CMP_CONFIG;
