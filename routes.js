const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { getAllTasks, viewTask, updateTask, addTask, deleteTask } = require('./tasks');
const http = require('http');
const { getAllDevices } = require('./devices');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/tasks': ['GET', 'POST'],
  '/api/devices': ['GET'],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response of the server
 * @returns {*} the response's end or notfound
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }
  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/tasks/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix the prefix of the path
 * @returns {boolean} true if the url has an ID component at it's last part, false if doesn't
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/tasks/{taskId}
 *
 * @param {string} url filePath
 * @returns {boolean} true if URL matches, false if doesn't
 */
const matchTaskId = url => {
  return matchIdRoute(url, 'tasks');
};

/**
 * Does the URL match /api/devices/{deviceId}
 *
 * @param {string} url filePath
 * @returns {boolean} true if URL matches, false if doesn't
 */
const matchDeviceId = url => {
  return matchIdRoute(url, 'devices');
};

/**
 * Handles the request
 * 
 * @param {http.incomingMessage} request http request
 * @param {http.ServerResponse} response http response
 * @returns {*} the method to be executed
 */
const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // Single device
  if (matchDeviceId(filePath)) {
    
    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) return responseUtils.contentTypeNotAcceptable(response);

    const deviceId = filePath.replace(/^.*[///]/, '');

    if (method.toUpperCase() === 'GET') {
      return viewDevice(response, deviceId);
    }
  }

  // All devices
  if (filePath === '/api/devices' && method.toUpperCase() === 'GET') {
    return getAllDevices(response);
  }

  // Single task
  if (matchTaskId(filePath)) {
    
    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) return responseUtils.contentTypeNotAcceptable(response);

    const taskId = filePath.replace(/^.*[///]/, '');

    // View task
    if (method.toUpperCase() === 'GET') {
      return viewTask(response, taskId);
    }

    // Update task
    if (method.toUpperCase() === 'PUT') {
      const taskData = await parseBodyJson(request);
      return updateTask(response, taskId, taskData);
    }
  
    // Delete task
    if (method.toUpperCase() === 'DELETE') {
      return deleteTask(response, taskId);
    }
  }

  // All tasks
  if (filePath === '/api/tasks' && method.toUpperCase() === 'GET') {
      return getAllTasks(response);
  }

  // Add new task
  if (filePath === '/api/tasks' && method.toUpperCase() === 'POST') {
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    const taskData = await parseBodyJson(request);
    return addTask(response, taskData);
  }
  
};

module.exports = { handleRequest };