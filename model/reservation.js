const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'patientRegister' ,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

// Custom validator to prevent overlapping reservations
reservationSchema.path('timeSlot').validate(async function(value) {
  const reservationCount = await mongoose.models.Reservation.countDocuments({
    doctor: this.doctor,
    date: this.date,
    timeSlot: value,
    status: { $ne: 'rejected' }
  });

  return reservationCount === 0;
}, 'Time slot is already reserved for this doctor on the specified date.');

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
