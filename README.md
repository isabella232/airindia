# Your Project's Title...

Your project's description...

## Environments

- Preview: https://main--{repo}--{owner}.hlx.page/
- Live: https://main--{repo}--{owner}.hlx.live/

## Installation

```sh
npm i
```

###### Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
2. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
3. Install the [AEM CLI](https://github.com/adobe/aem-cli): `npm install -g @adobe/aem-cli`
4. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
5. Open the `{repo}` directory in your favorite IDE and start coding :)

## Booking widget integration

The Booking block is responsible for including the booking widget on the page.

Below are the steps to include the latest version of the booking widget:

1. Open the configuration file located at `scripts/utils/constants.js`.
2. ```
   const CMP_CONFIG = {
     ...,
     searchFlightPlaceholder: '<search-flight id="searchflightangularselecter" language="" contentlist=""></search-flight> <div class="flightsearch-link" style="display: none;">/content/air-india/in/en/multicity-booking, ,,,/content/dam/air-india/redesign-loyalty/cards/cashPointSignUp.png,<p class="signupCashPointPopupText">Sign in to your Flying Returns account</p><p class="signupCashPointPopupDescription">Use a combination of cash and points on your next booking and continue exploring the world. Sign in to your Flying Returns account to discover exciting benefits.</p>,/content/dam/air-india/redesign-loyalty/cards/pointSignUp.png,<p class="signupCashPointPopupText">Sign in to your Flying Returns account</p><p class="signupCashPointPopupDescription">Spend points on your next booking and continue exploring the world. Sign in to your Flying Returns account and make the most of your journey.</p> </div>',
     searchFlightScript: {
       prod: 'https://www.airindia.com/etc.clientlibs/air-india/clientlibs/clientlib-booking.lc-7300c1a101c391adae9520d097de59ec-lc.min.js',
       stage: 'https://newai-staging.airindia.com/etc.clientlibs/air-india/clientlibs/clientlib-booking.lc-7300c1a101c391adae9520d097de59ec-lc.min.js',
     },
     searchFlightStyle: {
       prod: 'https://www.airindia.com/etc.clientlibs/air-india/components/AIComponents/flightSearch/clientlibs.lc-0a0f7442c40226c04d15438672316227-lc.min.css, /blocks/booking/booking-prod.css',
       stage: 'https://newai-staging.airindia.com/etc.clientlibs/air-india/components/AIComponents/BookingFrom/clientlibs.lc-8c7e61d764627a838f7bc3511d3519cc-lc.min.css, /blocks/booking/booking-stage.css',
     },
   };
   ```
3. Replace the placeholders, script, and style configurations for prod and stage to keep the modules in sync with the latest versions.
4. Add custom CSS to override the styles for the booking widget in the files `booking-{env}.css` (where `env` is `prod` or `stage`) in order to fix any cosmetic issues on EDS pages.

## Chatbot integration

The chatbot integrated at the global level at it will be displayed on all the pages/

Below are the steps to include the latest version of the chatbot widget:

1. Open the configuration file located at `scripts/utils/constants.js`.
2. ```
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
     ...,
   };
   ```
3. Replace the placeholders, script, and style configurations for prod and stage to keep the modules in sync with the latest versions.
