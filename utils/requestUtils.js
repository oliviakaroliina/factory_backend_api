const http = require('http');

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true if client accepts JSON response, false if doesn't
 */
const acceptsJson = request => {
  // Check if the client accepts JSON as a response based on "Accept" request header
  const acceptHeader = request.headers.accept || '';
  return acceptHeader.includes('application/json') || acceptHeader.includes('*/*');
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true if request is JSON, false if isn't
 */
const isJson = request => {
  // Check whether request "Content-Type" is JSON or not
  const contentType = request.headers['content-type'] || '';
  return contentType.toLowerCase() === 'application/json';
};

/**
 * Asynchronously parse request body to JSON
 *
 * @param {http.IncomingMessage} request http request
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('error', err => reject(err));

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, isJson, parseBodyJson };