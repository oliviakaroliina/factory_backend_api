const Task = require('../models/task');
const responseUtils = require ('../utils/responseUtils');
const http = require('http');

/**
 * Checks if task has not enough information
 * 
 * @param {object} task task to be validated
 * @returns {Array<string>} Array of error messages or empty array if task is valid
 */
 const validateTask = task => {
    const errors = [];
  
    if (!task.criticality || task.criticality === '') errors.push('Missing criticality');
    if (!task.target) errors.push('Missing target');
    if (!task.recordTime) errors.push('Missing recordTime');
    if (!task.description || task.description === '') errors.push('Missing description');
    if (!task.state || task.state === '') errors.push('Missing state');
  
    return errors;
  };

/**
 * Send all tasks as JSON
 *
 * @param {http.ServerResponse} response http response
 */
const getAllTasks = async response => {
  const tasks = await Task.find({});
  responseUtils.sendJson(response, tasks, 200);
};

/**
 * Update task and send updated task as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} taskId id of the task to be updated
 * @param {object} taskData (mongoose document object)
 */
 const updateTask = async(response, taskId, taskData) => {
  const getTask = await Task.findById(taskId).exec();

  if (!getTask || getTask === null) responseUtils.notFound(response);

  else {
    const errors = validateTask(taskData);
    if (errors.length < 1) {
      try {
        await Task.findOneAndUpdate(taskId, { $set: taskData }, {new: true}, function(err, task) {
          if (err) responseUtils.badRequest(response, err);
          responseUtils.sendJson(response, task);
        });
        
      } catch (error) {
        responseUtils.badRequest(response, error);
      }
    }
    else {
      responseUtils.badRequest(response, errors);
    }
  }
};

/**
 * Send task data as JSON
 *
 * @param {http.ServerResponse} response http response
 * @param {string} taskId id of the task to be viewed
 */
const viewTask = async(response, taskId) => {
  const getTask = await Task.findById(taskId).exec();

  if (getTask === null) {
    responseUtils.notFound(response);
  }
  else { 
    responseUtils.sendJson(response, getTask);
  }
};

/**
 * Adds a new task as JSON
 * 
 * @param {http.ServerResponse} response http response
 * @param {*} taskData the data of the task
 */
const addTask = async(response, taskData) => {
  const errorMsg = validateTask(taskData);

  if (errorMsg.length < 1) {
    try {
      const newTask = new Task({
        criticality: taskData.criticality,
        target: taskData.target,
        recordTime: taskData.recordTime,
        description: taskData.description,
        state: taskData.state,
      });
    
      const savedTask = await newTask.save();
      responseUtils.createdResource(response, savedTask);
    } catch (error) {
      responseUtils.badRequest(response, error);
    }
  }

  else if (errorMsg.length > 0) responseUtils.badRequest(response, errorMsg);
      
  else responseUtils.badRequest(response, 'Task is already in database');
};

/**
 * Deletes the given task
 * 
 * @param {http.ServerResponse} response http response
 * @param {string} taskId id of the task to be deleted
 * @returns {*} JSON response
 */
const deleteTask = async(response, taskId) => {
  const getTask = await Task.findById(taskId).exec();

  if (getTask === null) {
    responseUtils.notFound(response);
  }
  else {
    await Task.deleteOne({ _id: taskId });
    return responseUtils.sendJson(response, getTask);
  }
};

module.exports = { 
  getAllTasks,
  updateTask,
  viewTask,
  addTask,
  deleteTask,
 };