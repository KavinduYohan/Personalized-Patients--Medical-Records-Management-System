let express = require('express');
let empmodel = require('../model/model')
let emprouter = express();
let patient = require("../model/patient.js");
let Doctor = require("../model/Doctors.js");
const Clinic = require('../model/Clinicadd');



// page eken back unama redirect wena thana 
// Home page route
emprouter.get('/', async (req, res) => {
  try {
    const patientId = req.session.userId;
    const clinics = await Clinic.find({}).populate('doctors');

    if (patientId) {
      const user = await patient.findById(patientId);
      if (user && user.role === 'admin') {
        return res.redirect('/adminPanel');
      }
    }

    res.render('home', { clinics, userId: patientId });
  } catch (error) {
    console.error("Home route error:", error);
    res.render('home', { clinics: [], userId: req.session.userId });
  }
});

// Logout for all roles (Patient, Doctor, Admin)
emprouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

emprouter.get('/Clinic1', (req, res) => {
  res.render('Clinic1');
});

emprouter.get('/doctor11', (req, res) => {
  res.render('doctor11'); // 


// emprouter.post('/doctor11', async (req, res) => {
//     try {
//         const { name, specialization, about, slmcNumber, image } = req.body;

//         const newDoctor = new Doctor({
//             name,
//             specialization,
//             about,
//             slmcNumber,
//             image
//         });

//         await newDoctor.save();
//         res.status(201).json(newDoctor);
//     } catch (error) {
//         console.error('Error adding doctor:', error);
//         res.status(500).json({ error: 'Failed to add doctor' });
//     }
// });
});




emprouter.post('/BecomeDoctor', async (req, res) => {
  try {
    const patientId = req.session.userId;

    if (!patientId) {
      req.flash('error', 'Please log in as a patient first');
      return res.redirect('/login');
    }

    const currentPatient = await patient.findById(patientId);
    const docData = {
      dname: req.body.name,
      specialization: req.body.specialization,
      description: req.body.about,
      slmc: req.body.slmcNumber,
      email: currentPatient ? currentPatient.email : (req.body.email || ''),
      ex: req.body.clinic || 'A',
      patientId: patientId
    };

    const docdModel = require('../model/docd');
    await docdModel.create(docData);

    req.flash('success', 'Your application to become a doctor has been submitted for Admin approval!');
    res.redirect('/');
  } catch (error) {
    console.error("Error submitting doctor application:", error);
    req.flash('error', 'Failed to submit application: ' + error.message);
    res.redirect('/');
  }
});


emprouter.get('/addclinic', (req, res) => {
  res.render('addclinic'); // 

});



// emprouter.post('/addclinic', async (req, res) => {
//   try {
//     const { clinicName, location, licenceNumber, description, services, doctorDetails } = req.body;

//     const clinic = new Clinic({
//       clinicName,
//       location,
//       licenceNumber,
//       description,
//       services,
//       doctors: doctorDetails
//     });

//     await clinic.save();
//     res.status(201).send("Clinic registered successfully");
//   } catch (error) {
//     console.error("Error registering clinic:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// emprouter.post('/addclinic', async (req, res) => {
//   try {
//     const { clinicName, location, licenceNumber, description, services, doctorDetails } = req.body;

//     if (!clinicName || !location || !licenceNumber || !doctorDetails) {
//       return res.status(400).send("Missing required clinic fields");
//     }

//     const doctorIds = [];

//     // Loop through each doctor in the details
//     for (const doctor of doctorDetails) {
//       const { name, clinic, specialization, about, slmcNumber, image } = doctor;

//       if (!name || !specialization || !slmcNumber) {
//         return res.status(400).send("Missing required doctor fields");
//       }

//       const newDoctor = new Doctor({
//         name,
//         clinic,
//         specialization,
//         about,
//         slmcNumber,
//         image
//       });

//       const savedDoctor = await newDoctor.save();
//       doctorIds.push(savedDoctor._id);
//     }

//     // Create the clinic with references to the doctors
//     const clinic = new Clinic({
//       clinicName,
//       location,
//       licenceNumber,
//       description,
//       services,
//       doctors: doctorIds
//     });

//     await clinic.save();
//     res.status(201).send("Clinic and doctors registered successfully");
//   } catch (error) {
//     console.error("Error registering clinic and doctors:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });



emprouter.post('/addclinic', async (req, res) => {
  try {
    const { clinicName, location, licenceNumber, description, services, doctorDetails } = req.body;

    // Validate clinic fields
    if (!clinicName || !location || !licenceNumber || !description || !services || !Array.isArray(doctorDetails)) {
      return res.status(400).send("Missing required clinic fields or doctor details");
    }

    const doctorIds = [];
    const validClinics = ['A', 'B', 'C']; // Replace with your actual enum values

    for (const doctor of doctorDetails) {
      const { name, clinic, specialization, about, slmcNumber, image, email } = doctor;

      // Validate doctor fields
      if (!name || !specialization || !slmcNumber || !clinic || !validClinics.includes(clinic) || !email ) {
        console.error("Invalid or missing doctor fields in doctor object:", doctor);
        return res.status(400).send("Invalid or missing doctor fields");
      }

      // Create corresponding user in Register schema with default password
      const defaultPassword = '123456';

      const newUser = new patient({
        name,
        email,
        password: defaultPassword,
        cpassword: defaultPassword, // Ensure cpassword is also set
        role: 'doctor'
      });

      const savedUser = await newUser.save();

      // Create new Doctor
      const newDoctor = new Doctor({
        name,
        clinic,
        specialization,
        about,
        slmcNumber,
        image,
        email,
        docID: savedUser._id // Assign the Register ID to docID
      });

      const savedDoctor = await newDoctor.save();
      doctorIds.push(savedDoctor._id);
    }

    // Create the clinic with references to the doctors
    const clinic = new Clinic({
      clinicName,
      location,
      licenceNumber,
      description,
      services,
      doctors: doctorIds
    });

    await clinic.save();
    res.status(201).send("Clinic and doctors registered successfully");
  } catch (error) {
    console.error("Error registering clinic and doctors:", error);
    res.status(500).send("Internal Server Error");
  }
});














// emprouter.get('/clinic', async (req, res) => {
//   try {
//     const clinic = await Clinic.find().exec();
//     res.render('clinic', { clinic }); // Render a template with all clinics
//   } catch (error) {
//     console.error('Error fetching clinics:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// All clinics overview
emprouter.get('/clinic', async (req, res) => {
  try {
    const clinics = await Clinic.find({}).populate('doctors').exec();
    res.render('clinic', { clinics, userId: req.session.userId });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).send('Internal Server Error');
  }
});


  
module.exports = emprouter;