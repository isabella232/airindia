const AIEnvBaseUrl = {
  DEV: 'https://ai-shrd-sandbx-apgw-001.azure-api.net/',
  QA: 'https://ai-shrd-sandbx-apgw-001.azure-api.net/',
  STAGE: 'https://api-loyalty-staging.airindia.com/',
  PROD: 'https://api-loyalty.airindia.com/',
};

if (window.sessionStorage.getItem('lyt-ud') !== null) {
  const authUserData = JSON.parse(decode(window.sessionStorage.getItem('lyt-ud')));
  if (authUserData.FIRSTNAME !== undefined) {
    if (authUserData.FIRSTNAME.length > 16) {
      const tempFNM = authUserData.FIRSTNAME.substring(0, 16);
      document.querySelector('#signOut>.userDetails>.lty_userName').innerHTML = `${tempFNM}...`;
    } else document.querySelector('#signOut>.userDetails>.lty_userName').innerHTML = authUserData.FIRSTNAME; // TASK - 14996,
  }
  document.getElementById('signIn').classList.add('d-none');
  document.getElementById('signOut').classList.remove('d-none');
}

if (window.sessionStorage.getItem('lty-md') !== null) { // Added for Loyalty Rebranding
  const ltyUserData = JSON.parse(decode(JSON.stringify(window.sessionStorage.getItem('lty-md'))));
  // populateLoyaltyMemberDetails(ltyUserData);
  loyaltyThemeSelection(ltyUserData);
}

function redirectToAccount() {
  window.location.href = '/in/en/flying-returns/account-summary.html';
}

// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

let accountId = '';
let username = '';
let accessToken = null;
let responseState = null;
let idleTime = 0;
const signInDrop = document.querySelector('.signin-drop');
const signInDropMob = document.querySelector('.signin-drop-mob');
const signTimeout = setTimeout(hideSignIn, 10000);

const withoutLoginMenu = document.querySelectorAll('.withoutLogin');
const loginMenu = document.querySelectorAll('.withLogin');

if (loginMenu.length !== 0) {
  loginMenu.forEach((ele) => {
    if (ele.classList.contains('withLogin')) {
      ele.classList.add('d-none');
    }
  });
}

window.addEventListener('load', () => {
  const params = urlQueryString(window.location.href);
  if (params.state != null && params.client_info != null && params.code != null) {
    signIn();
  }
});

myMSALObj.addEventCallback((event) => {
  if (
    (event.eventType === msal.EventType.LOGIN_SUCCESS
            || event.eventType === msal.EventType.ACQUIRE_TOKEN_SUCCESS)
        && event.payload.account
  ) {
    window.sessionStorage.setItem(
      'tokenExpiry',
      encode(JSON.stringify(Math.floor(((event.payload.expiresOn).getTime() - (new Date()).getTime()) / 60000))),
    );
  }
});

myMSALObj
  .handleRedirectPromise()
  .then(handleResponse)
  .catch((error) => {
    // if (error.errorMessage?.indexOf("AADB2C90118") > -1) {
    //     try {
    //         myMSALObj.loginRedirect(b2cPolicies.authorities.forgotPassword);
    //     } catch (err) {
    //     }
    // }
    signIn();
  });

function selectAccount(firstResponse = false, checkLoginResponse = false) {
  const currentAccounts = myMSALObj.getAllAccounts();
  if (currentAccounts.length === 0) {
    if (!(window.localStorage.getItem('lty-wv') && window.sessionStorage.getItem('accessToken'))) {
      window.sessionStorage.removeItem('accessToken');
      // window.sessionStorage.removeItem("refreshToken");
      window.sessionStorage.removeItem('isLoggedIn');
      window.sessionStorage.removeItem('lyt-ud');
      window.sessionStorage.removeItem('lty-md');
      document.getElementById('signIn')?.classList.remove('d-none');
      document.getElementById('signIn-mob')?.classList.remove('d-none');
      document.getElementById('signOut')?.classList.add('d-none');
      document.getElementById('signOut-mob')?.classList.add('d-none');
      document.getElementById('isloggedIn')?.classList.add('d-none'); // To show/hide paragraph in loyalty FAQ page
      document.getElementById('isNotloggedIn')?.classList.remove('d-none');
      if (document.getElementById('homepagerebrand') != null) {
        signInDrop?.classList.remove('d-none');
        signInDropMob?.classList.remove('d-none');
        displaySignIn();
      }
    }
    this.recheckPageLoading();
  } else if (currentAccounts.length > 1) {
    // Add your account choosing logic here
    const originalSignInAccount = myMSALObj
      .getAllAccounts()
      .find(
        (account) => account.idTokenClaims.tfp === b2cPolicies.names.signUpSignIn,
      );
    if (originalSignInAccount !== undefined) {
      accountId = originalSignInAccount.homeAccountId;

      username = originalSignInAccount.username
        ? originalSignInAccount.username
        : originalSignInAccount.name;
      welcomeUser(username);
      myMSALObj
        .acquireTokenSilent({
          account: myMSALObj.getAccountByHomeId(accountId),
          scopes: ['openid'],
        })
        .then((response) => {
          // updateTable(response.idTokenClaims);
        });
    }
  } else if (currentAccounts.length === 1) {
    accountId = currentAccounts[0].homeAccountId;
    const accessToken = (JSON.parse(window.localStorage.getItem(`${currentAccounts[0].homeAccountId}-${currentAccounts[0].environment}-accesstoken-${currentAccounts[0].idTokenClaims.aud}-${currentAccounts[0].tenantId}-${currentAccounts[0].idTokenClaims.aud}--`))).secret;
    // let refreshToken = (JSON.parse(window.localStorage.getItem(currentAccounts[0].homeAccountId + '-' + currentAccounts[0].environment + '-refreshtoken-' + currentAccounts[0].idTokenClaims.aud + '----'))).secret;

    window.sessionStorage.setItem(
      'accessToken',
      encode(accessToken),
    );

    // window.sessionStorage.setItem(
    //   "refreshToken",
    //   encode(refreshToken)
    // );

    window.sessionStorage.setItem(
      'isLoggedIn',
      encode('true'),
    );

    // == ADDED FOR CAROUSEL BANNER : START ===
    $('.bannerMain-slide').addClass('d-none');
    if (document.querySelectorAll('.bannerMain')) {
      document.querySelectorAll('.bannerMain')[0]?.remove();
    }
    // == ADDED FOR CAROUSEL BANNER: END ===

    welcomeUser(username);
    if (!checkLoginResponse) {
      if (firstResponse) {
        getEnvironment(responseState);
      } else {
        getEnvironment('');
      }
    }
    document.getElementById('isloggedIn')?.classList.remove('d-none'); // To show/hide paragraph in loyalty FAQ page
    document.getElementById('isNotloggedIn')?.classList.add('d-none');

    $(document).ready(function () {
      // Increment the idle time counter every minute.
      const idleInterval = setInterval(timerIncrement, 60000); // 1 minute
      // Zero the idle timer on mouse movement.
      $(this).mousemove((e) => {
        idleTime = 0;
      });
      $(this).keypress((e) => {
        idleTime = 0;
      });
    });

    if (withoutLoginMenu.length != 0) {
      withoutLoginMenu.forEach((ele) => {
        if (ele.classList.contains('withoutLogin')) {
          ele.classList.add('d-none');
        }
      });
    }
    if (loginMenu.length != 0) {
      loginMenu.forEach((ele) => {
        if (ele.classList.contains('withLogin')) {
          ele.classList.remove('d-none');
        }
      });
    }

    /**
         * In order to obtain the ID Token in the cached obtained previously, you can initiate a
         * silent token request by passing the current user's account and the scope "openid".
         */
    myMSALObj
      .acquireTokenSilent({
        account: myMSALObj.getAccountByHomeId(accountId),
        scopes: loginRequest.scopes,
      })
      .then((response) => {
        window.sessionStorage.setItem(
          'accessToken',
          encode(response.accessToken),
        );
      });
  }
}

// in case of page refresh

function handleResponse(response) {
  if (response != null) {
    // if response contains an access token, store it
    if (response.accessToken && response.accessToken !== '') {
      accessToken = response.accessToken;
    }
    window.sessionStorage.setItem('isSigninRequested', true);
    responseState = response;
    // for handling B2C user-flows and policies
    selectAccount(true);
  }
}

function signIn() {
  myMSALObj.loginRedirect(loginRequest);
}

function signOut() {
  if (document.querySelector('app-search-flight') || document.querySelector('flight-booking')) {
    const confirmResetSearchFlightData = new CustomEvent('confirmResetSearchFlightData', {
      detail: {},
    });
    window.dispatchEvent(confirmResetSearchFlightData);
  } else {
    const signOutEventCall = new CustomEvent('signOutEventCall', {
      detail: {},
    });
    window.dispatchEvent(signOutEventCall);
  }
}

window.addEventListener('signOutEventCall', ((e) => {
  window.sessionStorage.clear();
  myMSALObj.logoutRedirect();
}));

function getTokenRedirect(request) {
  /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

  request.account = myMSALObj.getAccountByHomeId(accountId);

  return myMSALObj
    .acquireTokenSilent(request)
    .then((response) => {
      // In case the response from B2C server has an empty accessToken field
      // throw an error to initiate token acquisition
      if (!response.accessToken || response.accessToken === '') {
        throw new msal.InteractionRequiredAuthError();
      }
      return handleResponse(response);
    })
    .catch((error) => {
      if (error instanceof msal.InteractionRequiredAuthError) {
        // fallback to interaction when silent call fails
        return myMSALObj.acquireTokenRedirect(request);
      }
    });
}

function timerIncrement() {
  idleTime += 1;
  const expiryTime = JSON.parse(decode(window.sessionStorage.getItem('tokenExpiry')));
  if (idleTime > expiryTime) { // logout after expiry time
    signOut();
  }
}

selectAccount();

function generateCodeVerifier() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const codeVerifierLength = 64;
  let codeVerifier = '';
  for (let i = 0; i < codeVerifierLength; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    codeVerifier += charset.charAt(randomIndex);
  }
  return codeVerifier;
}

function base64UrlEncode(str) {
  let base64 = btoa(str);
  base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return base64;
}

function generateCodeChallenge(codeVerifier) {
  const sha256Digest = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  };

  return sha256Digest(codeVerifier).then(base64UrlEncode);
}

function checkSignInForPoints() {
  const allAccounts = myMSALObj.getAllAccounts();
  if (allAccounts.length === 0) {
    signIn();
  }
}

function checkLogin() {
  const allAccounts = myMSALObj.getAllAccounts();
  if (allAccounts.length !== 0) {
    selectAccount(false, true);
    return true;
  }
  return false;
}

function checkSignInForRefx() {
  const allAccounts = myMSALObj.getAllAccounts();
  if (allAccounts.length === 0) {
    window.sessionStorage.clear();
  }
}

// To change password
function changePassword() {
  const allAccounts = myMSALObj.getAllAccounts();
  if (allAccounts.length === 0) {
    signIn();
  } else {
    const userData = JSON.parse(decode(window.sessionStorage.getItem('lty-md')));
    const flyingReturnsPointBalance = userData.loyaltyAward[0].amount;
    const tier_status = `${decode(window.sessionStorage.getItem('lty-memTier'))} | ${userData.membershipId}`;
    const email = JSON.parse(decode(window.sessionStorage.getItem('lyt-ud')));
    const codeVerifier = generateCodeVerifier();
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      const PRUrl = `https://${
        config.tenant
      }.airindia.com/${
        config.tenant
      }.airindia.com/oauth2/v2.0/authorize?p=B2C_1A_CHANGEPASSWORD&client_id=${
        config.clientId
      }&code_challenge=${
        codeChallenge
      }&code_challenge_method=S256&nonce=${
        codeVerifier
      }&redirect_uri=${
        msalConfig.auth.redirectUri
      }&scope=openid%20offline_access%20profile%20phone%20email&response_type=id_token&points=${
        flyingReturnsPointBalance
      }&tier_status=${
        tier_status
      }&emailId=${
        email.EMAIL}`;

      const changePwdUrl = document.createElement('a');
      changePwdUrl.href = PRUrl;
      document.body.appendChild(changePwdUrl);
      changePwdUrl.click();
      document.body.removeChild(changePwdUrl);
    });
  }
}

let viewSignIn = false;

setTimeout(() => {
  viewSignIn = true;
}, '3000');

function displaySignIn() {
  if (signInDrop || signInDropMob) {
    if (signInDrop.classList.contains('hide-signin') || signInDropMob.classList.contains('hide-signin')) {
      signInDrop.classList.remove('hide-signin');
      signInDrop.classList.add('display-signin');
      signInDropMob.classList.remove('hide-signin');
      signInDropMob.classList.add('display-signin');
    } else hideSignIn();
  }
}

function hideSignIn() {
  if (viewSignIn) {
    $('.loginDrop').hide();
    if (signInDrop || signInDropMob) {
      signInDrop.classList.remove('display-signin');
      signInDrop.classList.add('hide-signin');
      signInDropMob.classList.remove('display-signin');
      signInDropMob.classList.add('hide-signin');
    }

    setTimeout(() => {
      if (signInDrop || signInDropMob) {
        signInDrop.classList.add('d-none');
        signInDropMob.classList.add('d-none');
      }
    }, '800');
  }
}

function removeSignIn(x) {
  if (viewSignIn) clearTimeout(signTimeout);
}

async function getEnvironment(tokenResponse) {
  if (window.sessionStorage.getItem('env')) {
    const aiEnv = decode(window.sessionStorage.getItem('env'));
    getLoyOcpSubsKey(aiEnv, tokenResponse);
  } else {
    const originUrl = '/content/.EnvironmentVariable.json';
    await fetch(originUrl)
      .then((response) => response.json())
      .then((data) => getLoyOcpSubsKey(data.ENV_CONFIG, tokenResponse));
  }
}

async function getLoyOcpSubsKey(aiEnv, tokenResponse) {
  if (window.sessionStorage.getItem('ltyOcp')) {
    const ltyOcpKey = decode(window.sessionStorage.getItem('ltyOcp'));
    getMemberDetailsData(aiEnv, ltyOcpKey, tokenResponse);
  } else {
    let keyVaultUrl = '';
    let appName = '';
    aiEnv === 'dev' ? (keyVaultUrl = `${AIEnvBaseUrl.DEV}kvtoken/dev/get-token-key`, appName = 'DXP') : aiEnv === 'qa' ? (keyVaultUrl = `${AIEnvBaseUrl.QA}kvtoken/qa/get-token-key`, appName = 'DXP') : aiEnv === 'stage' ? (keyVaultUrl = `${AIEnvBaseUrl.STAGE}kv-token/get-loy-token-key`, appName = 'LOY') : aiEnv === 'prod' && (keyVaultUrl = `${AIEnvBaseUrl.PROD}kv-token/get-loy-token-key`, appName = 'LOY');

    const response = await fetch(keyVaultUrl, {
      method: 'POST',
      headers: {
        Appname: appName,
      },
    });
    if (response.ok && response.status == 200) {
      const OCPKey = (await response.json()).value;
      window.sessionStorage.setItem('ltyOcp', encode(OCPKey));
      getMemberDetailsData(aiEnv, OCPKey, tokenResponse);
    } else signOut();
  }
}

async function getMemberDetailsData(aiEnv, OCPKey, tokenResponse) {
  let getMembershipUrl = '';
  aiEnv === 'dev' ? getMembershipUrl = `${AIEnvBaseUrl.DEV}loyalty-dev/v3/membership/getAccountSummary` : aiEnv === 'qa' ? getMembershipUrl = `${AIEnvBaseUrl.QA}loyalty-qa/v3/membership/getAccountSummary` : aiEnv === 'stage' ? getMembershipUrl = `${AIEnvBaseUrl.STAGE}loyalty-pprd/v3/membership/getAccountSummary` : aiEnv === 'prod' && (getMembershipUrl = `${AIEnvBaseUrl.PROD}loyalty-prd/v3/membership/getAccountSummary`);

  const accessToken = decode(window.sessionStorage.getItem('accessToken'));
  const headerObj = {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    'Ocp-Apim-Subscription-Key': OCPKey,
    'X-Request-Source': 'website',
  };

  const response = await fetch(getMembershipUrl, {
    method: 'POST',
    headers: headerObj,
    body: JSON.stringify({}),
  });
  if (response.ok && response.status == 200) {
    const userData = (await response.json()).responsePayload.data[0];
    if (userData && userData !== undefined && userData !== null) {
      populateMemberDetails(userData, tokenResponse);
      window.sessionStorage.setItem('lty-md', encode(JSON.stringify(userData)));

      const userFirstName = userData?.individual?.identity?.name?.romanized.firstName;
      if (window.sessionStorage.getItem('lyt-ud') == null && userFirstName !== undefined) {
        const ltyAuthUserData = {
          FIRSTNAME: userData?.individual?.identity?.name?.romanized.firstName,
          LASTNAME: userData?.individual?.identity?.name?.romanized.lastName,
          PHONENO: userData?.contact?.phones[0].number,
          DOB: userData?.individual?.identity?.birthDate,
          EMAIL: userData?.contact?.emails[0].address,
        };

        window.sessionStorage.setItem(
          'lyt-ud',
          encode(JSON.stringify(ltyAuthUserData)),
        );

        if (userFirstName.length > 16) {
          const e = userFirstName.substring(0, 16);
          document.querySelector('#signOut>.userDetails>.lty_userName').innerHTML = `${e}...`;
        } else document.querySelector('#signOut>.userDetails>.lty_userName').innerHTML = userFirstName;
      }
    }
  } else signOut();
}

function populateMemberDetails(memberDetails, tokenResponse) { // NED TO REMOVE THIS FUNCTION======
  if (memberDetails && memberDetails !== undefined && memberDetails !== null) {
    // populateLoyaltyMemberDetails(memberDetails);
    let slider_userIconBG = '';
    const userInitials = document.querySelectorAll('.userInitials');
    const userName = document.querySelectorAll('.userName');
    const userMemDetails = document.querySelectorAll('.userMemDetails');
    const userMemPrmEmail = document.querySelectorAll('.userMemPrmEmail');
    const userClubDetails = document.querySelectorAll('.userClubDetails');
    const userPointsDetails = document.querySelectorAll('.userPointsDetails');
    const tempUserFistName = memberDetails?.individual?.identity?.name?.romanized.firstName;
    const userLastName = memberDetails?.individual?.identity?.name?.romanized.lastName;
    const tierStatus = memberDetails?.mainTier?.level?.toLowerCase();
    loyaltyThemeSelection(memberDetails);

    let userFistName = '';
    userFistName = tempUserFistName.length > 16 ? `${tempUserFistName.substring(0, 16)}...` : tempUserFistName;

    let userClub; let header_userIcon; let slider_userIcon; let
      tierCard;
    // let imgBaseURL = "/content/dam/air-india/air-india-rebrand/home/";
    const imgBaseURL = '/content/dam/air-india/redesign-loyalty/icons/';
    switch (tierStatus) {
      case 'bas':
        // userClub = 'Base tier';
        userClub = 'Red';
        slider_userIconBG = `${imgBaseURL}slide-userIconBG-red.svg`;
        slider_userIcon = `${imgBaseURL}slide-userIconXl-base.svg`;
        header_userIcon = `${imgBaseURL}header-ltyUserIcon-base.svg`;
        if (document.querySelector('.mega-item.baseTier')) {
          document.querySelector('.mega-item.baseTier').style.display = 'block';
          tierCard = document.querySelector('.mega-item.baseTier .tier');
        }
        break;
      case 'sec':
        // userClub = 'Silver Edge Club';
        userClub = 'Silver';
        slider_userIconBG = `${imgBaseURL}slide-userIconBG-silver.svg`;
        slider_userIcon = `${imgBaseURL}slide-userIconXl-silver.svg`;
        header_userIcon = `${imgBaseURL}header-ltyUserIcon-silver.svg`;
        if (document.querySelector('.mega-item.silverTier')) {
          document.querySelector('.mega-item.silverTier').style.display = 'block';
          tierCard = document.querySelector('.mega-item.silverTier .tier');
        }
        break;
      case 'gec':
        // userClub = 'Golden Edge Club';
        userClub = 'Gold';
        slider_userIconBG = `${imgBaseURL}slide-userIconBG-gold.svg`;
        slider_userIcon = `${imgBaseURL}slide-userIconXl-gold.svg`;
        header_userIcon = `${imgBaseURL}header-ltyUserIcon-gold.svg`;
        if (document.querySelector('.mega-item.goldTier')) {
          document.querySelector('.mega-item.goldTier').style.display = 'block';
          tierCard = document.querySelector('.mega-item.goldTier .tier');
        }
        break;
      case 'tmc':
        // userClub = 'The Maharaja Club';
        userClub = 'Platinum';
        slider_userIconBG = `${imgBaseURL}slide-userIconBG-platinum.svg`;
        slider_userIcon = `${imgBaseURL}slide-userIconXl-maharaja.svg`;
        header_userIcon = `${imgBaseURL}header-ltyUserIcon-maharaja.svg`;
        if (document.querySelector('.mega-item.maharajaTier')) {
          document.querySelector('.mega-item.maharajaTier').style.display = 'block';
          tierCard = document.querySelector('.mega-item.maharajaTier .tier');
        }
        break;
    }
    $('.nameicon').css('background-image', `url(${slider_userIconBG})`);
    const ltyHeaderUserIcon = `<img src='${header_userIcon}' alt='User Icon'>`;
    $('#signOut .userPriviledgeIcon').empty().append(ltyHeaderUserIcon);
    window.sessionStorage.setItem('lty-memTier', encode(userClub));

    const userFName = document.createElement('p');
    const ffn = document.createElement('p');
    const club = document.createElement('p');
    const tierPts = document.createElement('p');
    const accBtnLbl = document.createElement('p');
    const svg = document.createElement('img');
    userFName.setAttribute('id', 'fullname');
    ffn.setAttribute('id', 'ffn');
    club.setAttribute('id', 'club');
    tierPts.setAttribute('id', 'tier-points');
    accBtnLbl.setAttribute('id', 'account');
    if (userClub.toLowerCase() === 'silver') {
      svg.setAttribute('src', '/content/dam/air-india/redesign-loyalty/icons/arrow-forward-black.svg');
    } else svg.setAttribute('src', '/content/dam/air-india/redesign-loyalty/icons/arrow-forward.svg');
    svg.setAttribute('id', 'goto');
    const fname = tempUserFistName.length > 16 ? tempUserFistName.substring(0, 16) : tempUserFistName;
    userFName.innerHTML = `${fname} ${userLastName[0].toUpperCase()}`;
    ffn.innerHTML = `ID - ${memberDetails?.membershipId}`;
    club.innerHTML = userClub;
    tierPts.innerHTML = `${Number(memberDetails?.loyaltyAward[0].amount)?.toLocaleString()} POINTS`;
    accBtnLbl.innerHTML = 'View My Account';

    tierCard?.appendChild(userFName);
    tierCard?.appendChild(ffn);
    tierCard?.appendChild(club);
    tierCard?.appendChild(tierPts);
    tierCard?.appendChild(accBtnLbl);
    accBtnLbl?.appendChild(svg);

    if (tokenResponse != '') {
      const redirectPageName = 'redirect.html';
      if ((tokenResponse?.state || '').includes(redirectPageName)) {
        window.location.href = '/';
      } else {
        window.location.href = tokenResponse.state;
      }
    } else {
      recheckPageLoading();
    }

    if ($('#loyaltyBannerFigure')) {
      document.getElementById('bnr-dsktop')?.setAttribute('data-srcset', document.getElementById('login-dsktop-img')?.innerHTML);
      document.getElementById('bnr-mob')?.setAttribute('data-srcset', document.getElementById('login-mob-img')?.innerHTML);
      if (document.getElementById('bnr-dflt')) {
        document.getElementById('bnr-dflt').src = document.getElementById('login-dsktop-img')?.innerHTML || '';
      }
    }

    const signInUserDataSlide = document.querySelectorAll('.signedId_Section');
    signInUserDataSlide.forEach((el) => {
      el.classList.remove('d-none');
      document.querySelector('.root').classList.add('loggedIn');
      const ltySliderUserIcon = `<img src='${slider_userIcon}' alt='User Icon'>`;
      $('.signedIn-userIconDiv').empty().append(ltySliderUserIcon);
      el.getElementsByClassName('userName')[0].innerHTML = userFistName;
      el.querySelectorAll('.userPriviledge')[0].innerHTML = userClub;
      el.querySelectorAll('.userPoints')[0].innerHTML = `${Number(memberDetails?.loyaltyAward[0].amount)?.toLocaleString()} POINTS`;
    });

    if (userClubDetails !== null && userPointsDetails !== null) {
      userInitials[0].innerHTML = userFistName[0].toUpperCase() + userLastName[0].toUpperCase();
      userName[0].innerHTML = userFistName;
      userMemDetails[0].innerHTML = memberDetails?.membershipId;
      userMemPrmEmail[0].innerHTML = memberDetails?.contact?.emails[0].address;
      userClubDetails[0].innerHTML = userClub;
      userPointsDetails[0].innerHTML = `${Number(memberDetails?.loyaltyAward[0].amount)?.toLocaleString()} POINTS`;
      userInitials[1].innerHTML = userFistName[0].toUpperCase() + userLastName[0].toUpperCase();
      userName[1].innerHTML = userFistName;
      userMemDetails[1].innerHTML = memberDetails?.membershipId;
      userMemPrmEmail[1].innerHTML = memberDetails?.contact.emails[0].address;
      userClubDetails[1].innerHTML = userClub;
      userPointsDetails[1].innerHTML = `${Number(memberDetails?.loyaltyAward[0].amount)?.toLocaleString()} POINTS`;
    }
  } else if (window.sessionStorage.getItem('lyt-ud') !== null) {
    const temp_ud = decode(window.sessionStorage.getItem('lyt-ud'));
    const ltyUserData = JSON.parse(JSON.stringify(temp_ud));
    const ltyUserFname = ltyUserData.FIRSTNAME;
    const ltyUserLname = ltyUserData.LASTNAME;

    const userInis = document.querySelectorAll('.userInitials');
    const ltyUserName = document.querySelectorAll('.userName');
    const ltyUserPrmEmail = document.querySelectorAll('.userMemPrmEmail');

    userInis[0].innerHTML = ltyUserFname[0].toUpperCase() + ltyUserLname[0].toUpperCase();
    ltyUserName[0].innerHTML = ltyUserFname;
    ltyUserPrmEmail[0].innerHTML = ltyUserData.EMAIL;
    userInis[1].innerHTML = ltyUserFname[0].toUpperCase() + ltyUserLname[0].toUpperCase();
    ltyUserName[1].innerHTML = ltyUserFname;
    ltyUserPrmEmail[1].innerHTML = ltyUserData.EMAIL;

    document.querySelectorAll('.loginDrop .myAccbtn')[0].style.display = 'none';
    document.querySelectorAll('.loginDrop .myAccbtn')[1].style.display = 'none';
    document.querySelectorAll('.loginDrop .userClubDetails')[0].style.display = 'none';
    document.querySelectorAll('.loginDrop .userClubDetails')[1].style.display = 'none';
    document.querySelectorAll('.loginDrop .userPts')[0].style.display = 'none';
    document.querySelectorAll('.loginDrop .userPts')[1].style.display = 'none';
  }
}

function recheckPageLoading() {
  const redirectPageName = 'redirect.html';
  if ((window?.location?.href || '').includes(redirectPageName) && (document?.referrer || '') === '') {
    window.location.href = '/';
  }
}

function loyaltyThemeSelection(authUserData) {
  const bID = document.getElementsByTagName('body')[0].id;
  if (bID.indexOf('loyalty-account-summary') > -1
        || bID.indexOf('loyalty-tier-status') > -1
        || bID.indexOf('loyalty-points') > -1
        || bID.indexOf('loyalty-claim-points') > -1
        || bID.indexOf('loyalty-claim-requests') > -1
        || bID.indexOf('loyalty-upgrade-flight') > -1
        || bID.indexOf('loyalty-purchase-points') > -1
        || bID.indexOf('loyalty-vouchers') > -1
        || bID.indexOf('loyalty-recent-activity') > -1
        || bID.indexOf('loyalty-user-profile') > -1) {
    const tierStatus = authUserData?.mainTier?.level?.toLowerCase();
    document.body.classList.add(`bid-user-tier-class-${tierStatus}`);

    // setTimeout(() => {
    //     let ltyMenu = document.querySelectorAll('.loyalty-menu')[0];
    //     ltyMenu.classList.add("userclass-" + tierStatus);
    // }, 500);
  }
}

function urlQueryString(url) {
  if (url.indexOf('#') > -1) {
    url = url.split('#')[1];
  }
  const pairs = url.split('&');
  const result = {};
  pairs.forEach((pair) => {
    pair = pair.split('=');
    result[pair[0]] = decodeURIComponent(pair[1] || '');
  });
  return result;
}

document.addEventListener('click', (event) => {
  if (viewSignIn) {
    const checkIfPopup = event.target;
    if (checkIfPopup.className === 'signin-drop display-signin'
            || checkIfPopup.className === 'diwali-gif'
            || checkIfPopup.className === 'show'
            || checkIfPopup.id === 'close-icon') return;

    if (signInDrop || signInDropMob) {
      signInDrop.classList.remove('display-signin');
      signInDrop.classList.add('hide-signin');
      signInDropMob.classList.remove('display-signin');
      signInDropMob.classList.add('hide-signin');
    }
  }
});

const obj = {};
const authRedirectLoad = new CustomEvent('authRedirectLoad', {
  detail: obj,
});
window.dispatchEvent(authRedirectLoad);

// new sign up flow

// document.onreadystatechange = () => {
//   if (document.readyState !== 'loading') {
//     onClickSignUp(1);
//   }
// };

onClickSignUp(1);

function nonloggedInComEnrollnowlink() {
  onClickSignUp(0);
}

function onClickSignUp(isLoading) {
  const script = document.createElement('script');
  script.type = 'text/javascript';

  const redirect_uri = `${window.location.origin}/in/en/flying-returns/account-summary.html`;

  const codeVerifier = generateCodeVerifier();
  generateCodeChallenge(codeVerifier).then((codeChallenge) => {
    const createAccountUrl = `https://${
      config.tenant
    }.airindia.com/${
      config.tenant
    }.airindia.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN&client_id=${
      config.clientId
    }&code_challenge=${
      codeChallenge
    }&code_challenge_method=S256&nonce=${
      codeVerifier
    }&redirect_uri=${
      redirect_uri
    }&scope=openid%20offline_access%20profile%20phone%20email&response_type=code&prompt=login&option=signupflow`;

    const signupbtn = document.querySelectorAll('.enrollnowlink');
    const signinbtn = document.querySelectorAll('#Sign-In');
    const newSignIn = document.querySelectorAll('.newSignIn');
    if (signupbtn.length > 0) {
      signupbtn.forEach((el) => {
        el.setAttribute('href', createAccountUrl);
        el.removeAttribute('target');
      });
    }

    if (document.getElementById('nonloggedInComEnrollnowlink')) {
      window.location = document.getElementById('nonloggedInComEnrollnowlink').href;
    }

    if (document.getElementById('toolTipSignup') && isLoading == 0) {
      window.location = document.getElementById('toolTipSignup').href;
    }

    if (signinbtn.length > 0) {
      signinbtn.forEach((el) => {
        el.removeAttribute('target');
      });
    }
    if (newSignIn.length > 0) {
      newSignIn.forEach((el) => {
        el.removeAttribute('target');
      });
    }
  });
}
