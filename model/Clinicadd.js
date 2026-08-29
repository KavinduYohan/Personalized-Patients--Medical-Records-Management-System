const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  licenceNumber: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  services: {
    type: String,
    required: true
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }]
});

const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;
