// import memebershipJson from '../mock/getMembership.js';

export function getLang() {
  return document.documentElement.lang;
}

export function getPlaceholderDataFor(key) {
  const lang = getLang();
  const placeholdersData = window.placeholders?.[lang] || window.placeholders?.default || {};
  return placeholdersData[key];
}

// Temporary placeholder function to mimic the signin behaviour. Will be refactored
export function isLoggedIn() {
  // return !!window.sessionStorage.getItem('accessToken');
  // Temporarily to mimic the login experience
  return true;
}

// Temporary placeholder function to mimic the signin behaviour. Will be refactored
export async function getMembership() {
  const memebershipUrl = getPlaceholderDataFor('getmemberships');
  const memebershipResponse = await fetch(memebershipUrl);
  const membershipData = await memebershipResponse.json();
  return membershipData;
}

function getInititals(firstName, lastName) {
  return String(firstName?.[0]?.toUpperCase()) + String(lastName?.[0]?.toUpperCase());
}

// Temporary placeholder function to mimic the signin behaviour. Will be refactored
export async function getUserInfo() {
  const membershipData = await getMembership();
  const { responsePayload: { data: [userData] } } = membershipData;
  const {
    individual: {
      identity: {
        name: {
          romanized,
        },
      },
    },
    membershipId,
    contact: {
      emails: [email],
    },
    loyaltyAward: [loyalty],
    mainTier: {
      label: club,
    },
  } = userData;
  return {
    initials: getInititals(romanized?.firstName, romanized?.lastName),
    name: romanized?.firstName,
    ffn: membershipId,
    email: email?.address,
    points: loyalty?.amount,
    club,
  };
}
