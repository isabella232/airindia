import { getMetadata, fetchPlaceholders } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getPlaceholderDataFor } from '../../scripts/utils.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1024px)');

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections?.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function wrapNavDrops(navSections, parentSelector, linkTextClass) {
  const navDrops = Array.from(navSections.querySelectorAll(parentSelector));
  navDrops.forEach((navDrop) => {
    if (Array.from(navDrop.querySelectorAll('ul')).length === 0) {
      navDrop.classList.add('sub-link-text');
      navDrop.setAttribute('tabindex', 0);
      return;
    }
    const textContent = navDrop.firstChild?.nodeValue?.trim();

    const wrapperElement = document.createElement('a');
    wrapperElement.classList.add(linkTextClass);
    wrapperElement.textContent = textContent;
    if (navDrop.firstChild) {
      navDrop.removeChild(navDrop.firstChild);
    }
    navDrop.insertBefore(wrapperElement, navDrop.firstElementChild);
    wrapNavDrops(navDrop, 'li', 'sub-link-title');
  });
}

function performHeaderSearch(e) {
  const searchTxt = e.target.closest('div')?.querySelector('input')?.value?.trim();
  const headerSearchUrl = getPlaceholderDataFor('headerSearchResultsUrl');
  if (searchTxt && headerSearchUrl) {
    window.location.href = headerSearchUrl + searchTxt;
  }
}

function removeHeaderSearchBox() {
  const navTools = document.querySelector('.nav-tools');
  const search = navTools?.querySelector('.icon-search')?.parentNode;
  const navSections = document.querySelector('header #nav .nav-sections');
  search?.classList?.remove('header-nav-search-box-highlight');
  navSections?.classList?.remove('search-show');
  document.querySelector('.header-nav-search-box')?.remove();
}

function createSearchBox(label = 'Search') {
  const searchBoxHtml = `
  <div class="header-nav-search-box" id="header-nav-search-box">
    <span class="header-nav-search-box-close">&times;</span>
    <label for="search-box" class="header-nav-search-box-label" role="heading" aria-level="2">${label}</label>
    <input type="text" id="search-box">
    <a class="search-icon">
    <img data-icon-name="search" src="/icons/search-red.svg" class="search-icon">
    </a> 
  </div>`;

  const searchBoxWrapper = document.createElement('div');
  searchBoxWrapper.innerHTML = searchBoxHtml;
  const searchClose = searchBoxWrapper.querySelector('.header-nav-search-box-close');
  searchClose?.addEventListener('click', removeHeaderSearchBox);
  const searchIcon = searchBoxWrapper.querySelector('.search-icon');
  searchIcon.addEventListener('click', performHeaderSearch);
  const searchInput = searchBoxWrapper.querySelector('input#search-box');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performHeaderSearch(e);
    }
  });
  return searchBoxWrapper.firstElementChild;
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openSubNavMobile(menu) {
  menu.setAttribute('aria-expanded', 'true');
  const menuTitle = menu.querySelector('.link-title')?.textContent || '';
  const menuWrapper = menu.closest('.default-content-wrapper');
  const subNavWrapper = document.createElement('div');
  subNavWrapper.classList.add('sub-nav-drop');

  const stickyWrapper = document.createElement('div');
  stickyWrapper.classList = 'sticky-wrapper';
  const goBack = document.createElement('a');
  goBack.textContent = getPlaceholderDataFor('mainMenuLabel') || 'Main Menu';
  goBack.classList.add('go-back');
  goBack.addEventListener('click', () => {
    subNavWrapper.classList.remove('transition');
    setTimeout(() => {
      subNavWrapper.remove();
    }, 500);
  });
  stickyWrapper.appendChild(goBack);

  const currentTitle = document.createElement('div');
  currentTitle.classList.add('current-menu-title');
  currentTitle.textContent = menuTitle;
  stickyWrapper.appendChild(currentTitle);
  subNavWrapper.appendChild(stickyWrapper);

  subNavWrapper.appendChild(menu.querySelector('ul')?.cloneNode(true));
  menuWrapper.insertBefore(subNavWrapper, menuWrapper.firstElementChild);
  setTimeout(() => {
    subNavWrapper.classList.add('transition');
  }, 0);
}

function closeSubNavMobile() {
  document.querySelector('.sub-nav-drop').remove();
}

function delegateNavSectionsClick(e) {
  if (e.target.closest('.nav-drop') && !isDesktop.matches) {
    toggleAllNavSections(e.target.closest('.nav-sections'));
    openSubNavMobile(e.target.closest('.nav-drop'));
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
    removeHeaderSearchBox();
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
    /** Add Search option only for mobile menu */
    if (!document.querySelector('.header-nav-search-box')) {
      const searchBox = createSearchBox();
      navSections.insertBefore(searchBox, navSections.firstElementChild);
    }
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function handleNavSectionExpand(navSection, navSections, action = 'toggle') {
  if (isDesktop.matches) {
    const expanded = navSection.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(navSections);
    if (action === 'expand') {
      navSection.setAttribute('aria-expanded', 'true');
    } else if (action === 'collapse') {
      navSection.setAttribute('aria-expanded', 'false');
    } else {
      navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    }
  }
}

function headerSearchClickHandler(search, navSections) {
  if (document.querySelector('.header-nav-search-box')) {
    removeHeaderSearchBox();
    return;
  }
  const searchLabel = getPlaceholderDataFor('headerSearchLabel') || 'What are you looking for?';
  const searchBox = createSearchBox(searchLabel);
  const nav = document.querySelector('header #nav');
  search.classList.add('header-nav-search-box-highlight');
  nav.insertAdjacentElement('beforebegin', searchBox);
  setTimeout(() => {
    searchBox?.classList?.add('show');
  }, 0);
  navSections.classList.add('search-show');
}

function decorateNavTools(navSections) {
  const navTools = document.querySelector('.nav-tools');
  navSections.insertBefore(navTools, navSections.firstChild);
  const navToolLists = Array.from(navTools.querySelectorAll('ul>li')) || [];
  navToolLists.forEach((list) => {
    if (list.querySelector('ul')) {
      list.addEventListener('mouseover', () => {
        list.setAttribute('aria-expanded', 'true');
      });
      list.addEventListener('mouseleave', () => {
        list.setAttribute('aria-expanded', 'false');
      });
    }
  });
  const search = navTools.querySelector('.icon-search')?.parentNode;
  if (search) {
    search.addEventListener('click', headerSearchClickHandler.bind(null, search, navSections));
  }
}

function addScrollHandler() {
  window.addEventListener('scroll', () => {
    const navWrapper = document.querySelector('header .nav-wrapper');
    if (window.scrollY >= 10) {
      navWrapper?.classList.add('short');
    } else {
      navWrapper?.classList.remove('short');
    }
  });
}

/**
 * Create a skip to main link
 */
async function addSkipToMain() {
  await fetchPlaceholders();
  const navWrapper = document.querySelector('.nav-wrapper');
  // create and insert skip link before header
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.className = 'skip-main';
  skipLink.innerText = getPlaceholderDataFor('lblSkip') || 'Skip to main content';
  navWrapper.prepend(skipLink);
  // add id to main element to support skip link
  const main = document.querySelector('main');
  main.id = 'main';
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll('.default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        handleNavSectionExpand(navSection, navSections);
      });
      navSection.addEventListener('focus', () => {
        handleNavSectionExpand(navSection, navSections, 'expand');
      });
      navSection.addEventListener('mouseover', () => {
        handleNavSectionExpand(navSection, navSections, 'expand');
      });
      navSection.addEventListener('mouseleave', () => {
        handleNavSectionExpand(navSection, navSections, 'collapse');
      });
    });
    navSections.addEventListener('click', delegateNavSectionsClick);
    wrapNavDrops(navSections, '.nav-drop', 'link-title');
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    closeSubNavMobile();
    toggleMenu(nav, navSections, isDesktop.matches);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  decorateNavTools(navSections);
  addScrollHandler();
  // add skip to main link
  addSkipToMain();
}
