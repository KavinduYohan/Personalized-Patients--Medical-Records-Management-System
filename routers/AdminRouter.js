const Adrouter = require("express").Router();
let AdminTest = require("../model/AdminTest");
let patient = require("../model/patient.js");
let docd = require("../model/docd");
let Doctor = require("../model/Doctors.js");

Adrouter.get('/addTest', (req, res) => { 
  if (!req.session.userId) {
    req.flash('error', 'Please log in as an administrator');
    return res.redirect('/login');
  }
  res.render('addTest'); 
});

Adrouter.post('/addTest', async (req, res) => {
  try {
    const patientId = req.session.userId; 

    if (!patientId) {
      req.flash('error', 'Please log in as an administrator');
      return res.redirect('/login');
    }
   
    const data = {
      testname: req.body.pname,
    };
   
    await AdminTest.create(data);
    req.flash('success', `Diagnostic test '${req.body.pname}' created successfully!`);
    res.redirect('/addtesttable');
  } catch (error) {
    req.flash('error', 'Failed to create diagnostic test');
    res.redirect('/addtesttable');
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
    req.flash('error', 'Doctor registration request was declined and removed.');
    res.redirect('/adminPanel');
  } catch (error) {
    console.error("Delete request error:", error);
    req.flash('error', 'Error declining doctor request');
    res.redirect('/adminPanel');
  }
});



Adrouter.get('/addtesttable', async (req, res) => {
  try {
    const patientId = req.session.userId;

    if (!patientId) {
      req.flash('error', 'Please log in as an administrator');
      return res.redirect('/login');
    }

    const empData = await AdminTest.find({});
    res.render('addTestTable', { empData });
  } catch (error) {
    console.error("Error fetching lab tests:", error);
    req.flash('error', 'Error fetching lab tests data');
    res.redirect('/adminPanel');
  }
});
  
Adrouter.delete("/deletetest/:id", async (req, res) => {
  try {
    const testId = req.params.id;
    const deletedUser = await AdminTest.findByIdAndDelete(testId);

    if (deletedUser) {
      req.flash('error', `Deleted diagnostic test '${deletedUser.testname}'`);
    } else {
      req.flash('error', 'Test record not found');
    }
    res.redirect('/addtesttable');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting diagnostic test: ' + error.message);
    res.redirect('/addtesttable');
  }
});


module.exports = Adrouter;