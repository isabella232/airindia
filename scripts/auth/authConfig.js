function isEdsTestSubdomain(urlStr) {
  const url = new URL(urlStr);
  return url?.origin === HOST.edsSubDomain;
}

const HOST = {
  edsSubDomain: 'https://ai-eds-test.airindia.com',
  edsTestPage: 'https://ai-eds-test.airindia.com/in/en/book/special-offers/global-connectivity',
};

const envWiseLoginConfig = {
  prod: {
    tenant: 'login',
    clientId: 'ac5c8be3-c829-4db6-8eb7-aa4a37c61cbc',
  },
  nonProd: {
    tenant: 'loginstage',
    clientId: '35463fb8-025d-4996-ade0-9bcd290cf5e2',
  },
};

const config = {
  tenant: '',
  clientId: '',
  redirectUri: '',
};

let b2cPolicies = {};
let msalConfig = {};
let loginRequest = {
  scopes: [],
};

const configEnvParam = {};
if (window.location.toString().split('/')[2].indexOf('www.airindia.com') != -1 || window.location.toString().split('/')[2].indexOf('publish-p133657-e1305647.adobeaemcloud.com') != -1) configEnvParam.environment = 'prod';
else configEnvParam.environment = 'non-prod';

const stateUrl = window.location.pathname + window.location.search;
if (configEnvParam.environment === 'non-prod') {
  loginRequest = {
    scopes: [envWiseLoginConfig.nonProd.clientId],
    state: stateUrl,
  };
  config.tenant = envWiseLoginConfig.nonProd.tenant;
  config.clientId = envWiseLoginConfig.nonProd.clientId;
} else {
  loginRequest = {
    scopes: [envWiseLoginConfig.prod.clientId],
    state: stateUrl,
  };
  config.tenant = envWiseLoginConfig.prod.tenant;
  config.clientId = envWiseLoginConfig.prod.clientId;
}

config.redirectUri = `${window.location.origin}/in/en/redirect.html`;
// config.redirectUri = "http://localhost:4502/content/air-india/language-masters/en/redirect.html";

if(isEdsTestSubdomain(location.href)) {
  config.redirectUri = HOST.edsTestPage;
}

b2cPolicies = {
  names: {
    signUpSignIn: 'B2C_1A_SIGNUP_SIGNIN',
  },
  authorities: {
    signUpSignIn: {
      authority: `https://${config.tenant}.airindia.com/${config.tenant}.airindia.com/B2C_1A_SIGNUP_SIGNIN`,
    },
  },
  authorityDomain: `${config.tenant}.airindia.com`,
};

msalConfig = {
  auth: {
    clientId: config.clientId, // Replace with your AppID/ClientID obtained from Azure Portal.
    authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose sign-up/sign-in user-flow as your default.
    authWellknownEndpointUrl: `${b2cPolicies.authorities.signUpSignIn.authority}/.well-known/openid-configuration`,
    knownAuthorities: [b2cPolicies.authorityDomain], // You must identify your tenant's domain as a known authority.
    redirectUri: config.redirectUri, // You must register this URI on Azure Portal/App Registration. Defaults to "window.location.href".
    postLogoutRedirectUri: window.location.origin, // Simply remove this line if you would like navigate to index page after logout.
    navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: 'localStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO.
    storeAuthStateInCookie: false, // If you wish to store cache items in cookies as well as browser cache, set this to "true".
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case msal.LogLevel.Error:
            // console.error(message);

          case msal.LogLevel.Info:
            // console.info(message);

          case msal.LogLevel.Verbose:
            // console.debug(message);

          case msal.LogLevel.Warning:
                        // console.warn(message);
        }
      },
    },
  },
};

// exporting config object for jest
if (typeof exports !== 'undefined') {
  module.exports = {
    msalConfig,
    b2cPolicies,
    config,
  };
}
