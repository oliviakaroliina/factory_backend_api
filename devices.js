const Device = require('../models/device');
const responseUtils = require ('../utils/responseUtils');
const http = require('http');

/**
 * Send all devices as JSON
 *
 * @param {http.ServerResponse} response http response
 */
const getAllDevices = async response => {
  const devices = await Device.find({});
  responseUtils.sendJson(response, devices, 200);
};

/**
 * Send device data as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} deviceId id of the device to be viewed
 */
const viewDevice = async(response, deviceId) => {
  const getDevice = await Device.findById(deviceId).exec();

  if (getDevice === null) {
    responseUtils.notFound(response);
  }
  else { 
    responseUtils.sendJson(response, getDevice);
  }
};


module.exports = { 
  getAllDevices,
  viewDevice,
 };