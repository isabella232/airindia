// This is a test comment
import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  fetchPlaceholders,
} from './aem.js';

import { HOST } from './utils/constants.js';

import { initServiceWorker } from '../blocks/booking/booking-helpers.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/*
  * Returns the environment type based on the hostname.
*/
export function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'www.airindia.com': 'live',
    'airindia.com': 'live',
    'main--airindia--hlxsites.hlx.page': 'preview',
    'main--airindia--hlxsites.hlx.live': 'live',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

export function linkPicture($picture) {
  const $picParent = $picture.parentNode;
  const $nextSib = $picParent.nextElementSibling;
  if ($nextSib && $nextSib.tagName === 'P') {
    const $a = $nextSib.querySelector('a') || $picture.parentNode.querySelector('a');
    if ($a && $a.textContent.startsWith('https://')) {
      $a.innerHTML = '';
      $a.className = '';
      $a.appendChild($picture);
      $picParent.remove();
    }
  }
}

export function decorateLinkedPictures($main) {
  /* thanks to word online */
  $main.querySelectorAll('picture').forEach(($picture) => {
    if (!$picture.closest('div.block')) {
      linkPicture($picture);
    }
  });
}

// Add _blank to anchor links if the href is external
function decorateExternalLinks($main) {
  $main.querySelectorAll('a').forEach(($a) => {
    const thisUrl = new URL($a.href);
    if ($a.href
      && $a.href.startsWith('http')
      && !$a.href.startsWith(window.location.origin)
      && !thisUrl?.origin?.endsWith(HOST.domain)
      && (thisUrl.hash === '#signin' || thisUrl.hash === '#signup')) {
      $a.rel = 'noopener noreferrer';
      $a.target = '_blank';
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateLinkedPictures(main);

  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateExternalLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

function isEDSBranch(url) {
  return (((url.includes('.hlx.page') || url.includes('.hlx.live')) && !url.includes('main--airindia')) || url.includes('localhost'));
}

async function loadPage() {
  // Initialize service worker
  // TODO: remove once the API is ready
  if (isEDSBranch(window.location.hostname)) {
    initServiceWorker();
  }

  await loadEager(document);
  // Loading placeholders before all blocks are loaded
  await fetchPlaceholders();
  await loadLazy(document);
  loadDelayed();
}

loadPage();
