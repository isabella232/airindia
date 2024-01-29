import {
  fetchPlaceholders, loadCSS, loadScript, toCamelCase,
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
  await fetchPlaceholders();

  if (CMP_CONFIG[`${toCamelCase(componentName)}Placeholder`]) {
    // Create a new DOMParser
    const parser = new DOMParser();
    // Parse the HTML string
    const contentDocument = parser.parseFromString(`${CMP_CONFIG[`${toCamelCase(componentName)}Placeholder`]}`, 'text/html');
    element.appendChild(contentDocument.body.firstChild);
  }

  const scripts = CMP_CONFIG[`${toCamelCase(componentName)}Script`]?.split(',');
  if (scripts?.length > 0) {
    [...scripts].forEach((script) => {
      loadScript(script, { defer: true }, element);
    });
  }

  const styles = CMP_CONFIG[`${toCamelCase(componentName)}Style`]?.split(',');
  if (styles?.length > 0) {
    [...styles].forEach((style) => {
      loadCSS(style, element);
    });
  }
}
