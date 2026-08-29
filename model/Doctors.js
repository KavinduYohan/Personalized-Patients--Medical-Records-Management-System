const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  clinic: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E'],
    default: 'A'
  },
  specialization: {
    type: String,
    required: true
  },
  about: {
    type: String
  },
  slmcNumber: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String
  },
  docID: { type: mongoose.Schema.Types.ObjectId, ref: 'patientRegister' },
  email: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Doctor', doctorSchema);
