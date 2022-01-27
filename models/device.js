const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({

    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    year: {
      type: Number,
      trim: true,
    },
    
    type: {
      type: String,
      trim: true,
    },
});

deviceSchema.set('toJSON', { virtuals: false, versionKey: false });

const Device = new mongoose.model('Task', deviceSchema);
module.exports = Device;