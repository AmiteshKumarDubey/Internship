const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, uppercase: true },
  designation: { type: String },
  department: { type: String },
  office: { type: String },
  residence: { type: String },
  cugNumber: { type: String },
  mobile1: { type: String },
  mobile2: { type: String },

  additionalDetails: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  collection: 'DCH DIRECTORY',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Employee', employeeSchema);
