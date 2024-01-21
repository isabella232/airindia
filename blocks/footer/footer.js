import { getMetadata, createOptimizedPicture } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function createAccordion() {
  const acc = document.querySelectorAll('.footer-top-item h6');
  let i;

  for (i = 0; i < acc.length - 1; i += 1) {
    acc[i].addEventListener('click', ({ currentTarget }) => {
      currentTarget.classList.toggle('active');
      const panel = currentTarget.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  }
}

function decorateFooter(block, selectorClass) {
  const footerTop = block.querySelector(`.${selectorClass}`);
  const tempDiv = footerTop.querySelector('.default-content-wrapper');
  const children = [...footerTop.querySelector('.default-content-wrapper').children];
  let index = 0;
  tempDiv.innerHTML = '';

  while (index < children.length) {
    const topItem = document.createElement('div');
    topItem.classList.add(`${selectorClass}-item`);
    // Skip h6 if title not available
    if (children[index].innerText !== '_blank') { topItem.appendChild(children[index]); }
    index += 1;

    while (index < children.length) {
      if (children[index].tagName === 'H6') {
        if (!children[index + 1] || (children[index - 1].tagName === 'H6' && children[index + 1].tagName !== 'UL')) {
          topItem.appendChild(children[index]);
        } else {
          break;
        }
      } else {
        topItem.appendChild(children[index]);
      }
      index += 1;
    }

    tempDiv.appendChild(topItem);
  }
  tempDiv.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
  decorateFooter(block, 'footer-top');
  decorateFooter(block, 'footer-middle');
  createAccordion();
}
