const router1 = require("express").Router();
const Reservation = require("../model/reservation");
const Patient = require("../model/patient");
const Doctor = require("../model/Doctors");

router1.get("/doctor", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      req.flash('error', 'Please log in as a doctor');
      return res.redirect('/login');
    }

    const currentDoc = await Patient.findById(userId);
    if (!currentDoc || currentDoc.role !== 'doctor') {
      req.flash('error', 'Unauthorized access');
      return res.redirect('/');
    }

    // Retrieve doctor profile
    const doctorProfile = await Doctor.findOne({ docID: userId });
    const doctorProfileId = doctorProfile ? doctorProfile._id : null;

    // Retrieve reservations
    const reservations = await Reservation.find({
      $or: [
        { doctorId: userId },
        ...(doctorProfileId ? [{ doctorId: doctorProfileId }] : [])
      ]
    }).sort({ date: -1 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = reservations.filter(r => {
      const rDate = new Date(r.date);
      return rDate >= todayStart && rDate <= todayEnd;
    }).length;

    // Count unique patients
    const patientIds = new Set(reservations.map(r => r.patientId ? r.patientId.toString() : ''));
    patientIds.delete('');
    const totalPatients = patientIds.size;

    res.render('doctor', {
      user: currentDoc,
      doctorProfile,
      reservations,
      stats: {
        todayAppointments,
        totalPatients,
        totalReservations: reservations.length
      }
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    res.redirect('/');
  }
});

module.exports = router1;