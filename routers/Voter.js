const express = require('express');
const Vrouter = express.Router();
const Voter = require('../model/Voter');
const  Reservation = require('../model/reservation'); // Assuming Voter model is defined in models/Voter.js
//let Doctor = require("../model/Doctors.js");
const Doctor = require('../model/Doctors');
const Patient = require("../model/patient");
const reservation = require("../model/reservation");
//const Doctors = require('../model/Doctors');
//const Doctors = require('../model/Doctors');



// Route: GET /voters
// Description: Get all voters
Vrouter.get('/AddVoter', async (req, res) => {
  try {
    const patientId = req.session.userId;
    

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    // Render the 'AddVoter' view if the user is logged in as a patient
    res.render('AddVoter');
  } catch (err) {
    // Handle any errors that occur during rendering
    res.status(500).json({ message: err.message });
  }
});


// Route: POST /voters
// Description: Create a new voter
Vrouter.post('/AddVoter', async (req, res) => {
  const voter = new Voter({
    fullName: req.body.fullName,
    nameWithInitial: req.body.nameWithInitial,
    nic: req.body.nic,
    address: req.body.address,
    district: req.body.district,
    gender: req.body.gender,
    zonal: req.body.zonal
  });

  try {
    const newVoter = await voter.save();
    res.status(201).json(newVoter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route: DELETE /voters/:id
// Description: Delete a specific voter by ID
Vrouter.delete('/AddVoter/:id', async (req, res) => {
  try {
    const deletedVoter = await Voter.findByIdAndRemove(req.params.id);
    if (!deletedVoter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    res.json({ message: 'Voter deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Vrouter.get('/showVoter', async (req, res) => {
//   try {
//     res.render('showVoter'); // Renders views/AddVoter.ejs
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

Vrouter.get('/showVoter', async (req, res) => {
  try {
    const voters = await Voter.find(); // Retrieve all voters from the database
    res.render('showVoter', { voters }); // Render the EJS template with the fetched data
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).send('Internal Server Error');
  }
});




Vrouter.post('/reservationForm', async (req, res) => {
  try {
    const { docID, patientId, date, timeSlot, message } = req.body;
    const effectivePatientId = patientId || req.session.userId;

    if (!effectivePatientId) {
      req.flash('error', 'Please log in to make a reservation');
      return res.redirect('/login');
    }

    const doctor = await Doctor.findById(docID);
    const patientRecord = await Patient.findById(effectivePatientId);

    if (!doctor) {
      req.flash('error', 'Selected Doctor was not found');
      return res.redirect('/Alldoctors');
    }

    const doctorID = doctor.docID || doctor._id;

    const newReservation = new Reservation({
      doctorId: doctorID,
      patientId: effectivePatientId,
      date,
      timeSlot,
      message: message || ''
    });

    await newReservation.save();
    req.flash('success', `Appointment booked successfully with ${doctor.name}!`);
    res.redirect('/patientres');
  } catch (error) {
    console.error('Error creating reservation:', error);
    req.flash('error', 'Could not create reservation: ' + error.message);
    res.redirect('/patientres');
  }
});














// Vrouter.post('/reservationForm', async (req, res) => {
//   try {
//     const { doctorId, patientId, date, timeSlot, message } = req.body;

//     // Check if both doctorId and patientId are provided and valid
//     const doctor = await Doctor.find({docID:doctorId});
//     const patient = await Patient.findById(patientId);

//     if (!doctor) {
//       return res.status(404).json({ message: 'Doctor not found.' });
//      }

//     if (!patient) {
//       return res.status(404).json({ message: 'Patient not found.' });
//     }

//     // Create a new reservation instance
//     const newReservation = new Reservation({
//       doctorId:doctorId,
//       patientId: patientId,
//       date,
//       timeSlot,
//       message
//     });

//     // Save the reservation to the database
//     const savedReservation = await newReservation.save();

//     res.status(201).json(savedReservation);
//   } catch (error) {
//     console.error('Error creating reservation:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


Vrouter.post('/status/:reservationId/accept', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'accepted' },
      { new: true }
    );

    if (!reservation) {
      req.flash('error', 'Reservation not found.');
    } else {
      req.flash('success', 'Appointment accepted successfully!');
    }

    const backUrl = req.header('Referer') || '/status';
    res.redirect(backUrl);
  } catch (err) {
    console.error('Error accepting reservation:', err);
    req.flash('error', 'Internal Server Error accepting appointment.');
    res.redirect('/status');
  }
});

// Route to reject a reservation
Vrouter.post('/status/:reservationId/reject', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'rejected' },
      { new: true }
    );

    if (!reservation) {
      req.flash('error', 'Reservation not found.');
    } else {
      req.flash('error', 'Appointment has been rejected.');
    }

    const backUrl = req.header('Referer') || '/status';
    res.redirect(backUrl);
  } catch (err) {
    console.error('Error rejecting reservation:', err);
    req.flash('error', 'Internal Server Error rejecting appointment.');
    res.redirect('/status');
  }
});

// Vrouter.get('/status', async (req, res) => {
//   try {
//     // // Check if the user is logged in and is a doctor
//     // const doctorId = req.session.userId;
//     // const isDoctor = req.session.role === 'doctor';

//     // if (!isDoctor || !doctorId) {
//     //   req.flash('error', 'Unauthorized access'); // Unauthorized access
//     //   return res.redirect('/login');
//     // }

//     // Fetch reservations belonging to the logged-in doctor
//     const reservations = await Reservation.find({ doctor: doctorId });

//     // Render the 'status' EJS template with reservations data
//     res.render('status', { reservations });
//   } catch (err) {
//     console.error('Error fetching reservations:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });
// Vrouter.get('/status', async (req, res) => {
//   try {
//     // Fetch all reservations (assuming you have a method to do this)
//     const reservations = await Reservation.find();

//     // Render the 'status' view with reservations data
//     res.render('status', { reservations });
//   } catch (err) {
//     // Handle any errors that occur during fetching or rendering
//     console.error('Error fetching reservations:', err);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });



Vrouter.get('/BecomeDoctor', async (req, res) => {
  try {
    
      const patientId = req.session.userId;
      
  
      if (!patientId) {
        req.flash('error', 'Please log in as a patient');
        return res.redirect('/login');
      }

    // Render the 'AddVoter' view if the user is logged in as a patient
    res.render('BecomeDoctor');
  } catch (err) {
    // Handle any errors that occur during rendering
    res.status(500).json({ message: err.message });
  }
});



Vrouter.get('/fetch', async (req, res) => {
  try {
    // Fetch all doctors from the database where clinic is 'A'
    const doctors = await Doctor.find({ clinic: 'A' });

    const patientId = req.session.userId;
    

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    res.render('fetch', { doctors, patientId }); // Pass the 'doctors' array and 'patientId' to the template
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Internal Server Error');
  }
});

Vrouter.get('/clinicB', async (req, res) => {
  try {
    // Fetch all doctors from the database where clinic is 'A'
    const doctors = await Doctor.find({ clinic: 'B' });

    const patientId = req.session.userId;
    

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    res.render('fetch', { doctors, patientId }); // Pass the 'doctors' array and 'patientId' to the template
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Internal Server Error');
  }
});


Vrouter.get('/Alldoctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const patientId = req.session.userId;

    res.render('Alldoctors', { doctors, patientId });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).send('Internal Server Error');
  }
});

Vrouter.get('/status', async (req, res) => {
  const loggedInDoctorId = req.session.userId;
  if (!loggedInDoctorId) {
    req.flash('error', 'Please log in as a doctor');
    return res.redirect('/login');
  }

  try {
    const reservations = await reservation.find({ doctorId: loggedInDoctorId })
      .populate('patientId')
      .sort({ date: -1 });

    res.render('status', { reservations: reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).send('Internal Server Error');
  }
});

Vrouter.get('/patientres', async (req, res) => {
  const loggedInUserId = req.session.userId;
  if (!loggedInUserId) {
    req.flash('error', 'Please log in to view reservations');
    return res.redirect('/login');
  }

  try {
    const reservations = await reservation.find({ patientId: loggedInUserId })
      .populate('doctorId')
      .sort({ date: -1 });

    res.render('patientres', { reservations: reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).send('Internal Server Error');
  }
});




Vrouter.get('/adminedit/:id', async (req, res) => {
  try {
    const readquery = req.params.id;
    const record = await Patient.findById(readquery);
    
    if (record) {
      res.render('EditRole', { data: record });
    } else {
      // Handle case where the record with the given ID is not found
      res.status(404).send('Record not found');
    }
  } catch (error) {
    // Handle error if any occurs during the database operation
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

Vrouter.patch('/admintest/:id', async (req, res) => {
  
  try {
     // Get the user ID from the session
    const entryId = req.params.id; // Get the ID from URL parameter

    // Find the specific entry to update using its ID and the logged-in user's ID

    
    const updatedEntry = await Patient.findOneAndUpdate(
      { _id: entryId}, // Query condition
      {
        $set: {

          role: req.body.role,
         
          // Update other fields as needed
        }
  
      },
      { new: true } // To get the updated document after the update operation
    );
  0

    if (updatedEntry) {
      // Handle successful update
      req.flash('success', 'Entry updated successfully');
      res.redirect('/adminPanel'); // Redirect to a success page or specific route
    } else {
      // Handle case where the entry to update wasn't found or the user isn't authorized
      req.flash('error', 'Failed to update entry');
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    // Handle error case
    req.flash('error', 'Internal server error');
    res.redirect('/');
  }
});


Vrouter.delete("/del/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await Patient.findByIdAndDelete(userId);

    if (deletedUser) {
      // res.status(200).send({ status: "User deleted", user: deletedUser });
      res.redirect('/');
      
    } else {
      
      res.status(404).send({ status: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error deleting user", error: error.message });
  }
});




module.exports = Vrouter;
