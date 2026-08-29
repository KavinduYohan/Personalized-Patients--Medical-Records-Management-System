const Adrouter = require("express").Router();
let AdminTest = require("../model/AdminTest");
let patient = require("../model/patient.js");
let docd = require("../model/docd");
let Doctor = require("../model/Doctors.js");

Adrouter.get('/addTest', (req, res) => { 

  res.render('addTest'); 
});


Adrouter.post('/addTest', async (req, res) => {
  try {
    const patientId = req.session.userId; 


    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }
   
    const data = {
      testname: req.body.pname,
      
    };
   
    await AdminTest.create(data);
    req.flash('success', 'Data has been created in the Database');
    res.redirect('/');
  } catch (error) {
    req.flash('error', 'Data has not been created in the Database');
    res.redirect('/');
  }
});



Adrouter.get('/Accept/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const doctorRequest = await docd.findById(requestId);

    if (!doctorRequest) {
      req.flash('error', 'Doctor application not found');
      return res.redirect('/adminPanel');
    }

    const patientUser = await patient.findOne({ email: doctorRequest.email });

    if (patientUser) {
      await patient.findByIdAndUpdate(patientUser._id, { role: 'doctor' });

      // Create or update doctor record
      await Doctor.findOneAndUpdate(
        { docID: patientUser._id },
        {
          name: doctorRequest.dname || patientUser.name,
          specialization: doctorRequest.specialization,
          about: doctorRequest.description,
          slmcNumber: doctorRequest.slmc,
          clinic: doctorRequest.ex || 'A',
          email: doctorRequest.email,
          docID: patientUser._id
        },
        { upsert: true, new: true }
      );

      await docd.findByIdAndDelete(requestId);
      req.flash('success', `Approved doctor application for ${doctorRequest.dname}!`);
    } else {
      await docd.findByIdAndDelete(requestId);
      req.flash('error', 'Associated patient account was not found');
    }

    res.redirect('/adminPanel');
  } catch (error) {
    console.error("Doctor accept error:", error);
    req.flash('error', 'Error approving doctor request');
    res.redirect('/adminPanel');
  }
});

Adrouter.delete("/deleteRequest/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    await docd.findByIdAndDelete(requestId);
    req.flash('success', 'Doctor registration request declined and removed');
    res.redirect('/adminPanel');
  } catch (error) {
    console.error("Delete request error:", error);
    req.flash('error', 'Error declining doctor request');
    res.redirect('/adminPanel');
  }
});



Adrouter.get('/addtesttable', async (req, res) => {
  try {
    const patientId = req.session.userId; // Retrieve patient ID from the session

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

    // Find empmodel data related to the patientId
    const empData = await AdminTest.find({});

    
    // Render your view or send the retrieved data to the client
    res.render('addTestTable', { empData });
  } catch (error) {
    req.flash('error', 'Error fetching data');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});
  
Adrouter.delete("/deletetest/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await AdminTest.findByIdAndDelete(userId);

      if (deletedUser) {   
        res.redirect('/');

      } else {
        res.status(404).send({ status: "User not found" });
      }


  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error deleting user", error: error.message });
  }
});


module.exports = Adrouter;