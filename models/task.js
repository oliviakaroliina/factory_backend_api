const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Device = require('./device');

const taskSchema = new Schema({

    criticality: {
      type: String,
      required: true,
      trim: true,
    },

    target: {
      set: async () => {
          return await Device.findById(_id).exec();
      },
      required: true,
    },
    
    recordTime: {
      type: Date,
      trim: true,
      required: true,
    },
    
    description: {
      type: String,
      trim: true,
      required: true,
    },

    state: {
      type: String,
      trim: true,
      required: true,
    },
});

taskSchema.set('toJSON', { virtuals: false, versionKey: false });

const Task = new mongoose.model('Task', taskSchema);
module.exports = Task;