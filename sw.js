/* eslint-disable no-restricted-globals */
// sw.js (Service Worker)

const tokens = [
  'get-loy-token-key',
  'get-token-key',
  'token-key',
];

let placeholders = {};

/**
 * Sanitizes a string for use as class name.
 * @param {string} name The unsanitized string
 * @returns {string} The class name
 */
function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

/**
 * Sanitizes a string for use as a js property name.
 * @param {string} name The unsanitized string
 * @returns {string} The camelCased name
 */
function toCamelCase(name) {
  return toClassName(name).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

async function fetchMockTokens(key) {
  try {
    // Parse and return the JSON data
    const mockData = placeholders[key];

    return new Response(mockData, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Return an error response if fetching fails
    return new Response(null, { status: 500, statusText: 'Internal Server Error' });
  }
}

async function fetchMockData(key) {
  try {
    // Fetch the external JSON file
    const response = await fetch(`mock/${key}.json`);

    if (!response.ok) {
      throw new Error(`Failed to fetch mock data: ${response.status} ${response.statusText}`);
    }

    // Parse and return the JSON data
    const mockData = await response.json();

    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Return an error response if fetching fails
    return new Response(null, { status: 500, statusText: 'Internal Server Error' });
  }
}

// Install and activate the service worker
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
  placeholders = event.data?.default;
});

self.addEventListener('activate', (event) => {
  // Perform activation tasks if needed
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', async (event) => {
  const hostURL = new URL(self.location);
  const { request } = event;
  // Check if the request is an API request with a different port
  if (request.url.includes('api') && hostURL.port !== '4502') {
    const paths = request.url.split('/');
    // const mockData = await fetchMockData(paths[paths.length - 1]);
    if (tokens.includes(paths[paths.length - 1])) {
      event.respondWith(fetchMockTokens(toCamelCase(paths[paths.length - 1])));
      return;
    }
    event.respondWith(fetchMockData(paths[paths.length - 1]));
  } else {
    // Continue with the regular fetch
    event.respondWith(fetch(event.request));
  }
});
