import {
  loadCSS, loadScript, toCamelCase,
} from '../aem.js';
import CMP_CONFIG from './constants.js';

/**
 * Loads external components
 * Components are defined in the text content of the page [componentName:type]
 * Script and Style paths are defined in the placeholders.json file
 * @param {*} node
 * @param {*} componentName
 */
export default async function loadExternalComponent(componentName, element = document.body) {
  if (CMP_CONFIG[`${toCamelCase(componentName)}Placeholder`]) {
    // Create a new DOMParser
    const parser = new DOMParser();
    // Parse the HTML string
    const contentDocument = parser.parseFromString(`${CMP_CONFIG[`${toCamelCase(componentName)}Placeholder`]}`, 'text/html');
    // Get all child elements of the contentDocument
    const children = Array.from(contentDocument.body.children);

    // Append each child to the destination element
    children.forEach((child) => {
      element.appendChild(child);
    });
  }

  const promises = [];

  const scripts = CMP_CONFIG[`${toCamelCase(componentName)}Script`]?.split(',');
  if (scripts?.length > 0) {
    [...scripts].forEach(async (script) => {
      promises.push(loadScript(script, {}, element));
    });
  }

  const styles = CMP_CONFIG[`${toCamelCase(componentName)}Style`]?.split(',');
  if (styles?.length > 0) {
    [...styles].forEach(async (style) => {
      promises.push(loadCSS(style, element));
    });
  }

  return Promise.all(promises);
}
