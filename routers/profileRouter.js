const userprofileRouter = require("express").Router();
let patientProfile = require('../model/userprofile');
let patient = require("../model/patient.js");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// image upload

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/'); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
     cb(null, file.fieldname + '-' + Date.now()) // Set the filename to be unique
  },
});

const upload = multer({ storage: storage });



userprofileRouter.get('/profileEdit', (req, res) => {
  res.render('profileEdit')
})



userprofileRouter.post('/profileEdit', upload.single('profilePic'), async (req, res) => {
  try {
    const patientId = req.session.userId;

    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    let profilePic = '';
    if (req.file) {
      profilePic = req.file.filename;
    }

    const profileData = {
      fullName: req.body.name,
      dob: req.body.dob,
      nic: req.body.nic,
      civilStatus: req.body.civilStatus,
      gender: req.body.gender,
      religion: req.body.religion,
      occupation: req.body.occupation,
      address: req.body.address,
      mobileNo: req.body.mobileNo,
      birthPlace: req.body.birthPlace,
      bloodGroup: req.body.bloodGroup,
      profilePic: profilePic,
      patientId: patientId
    };

    await patientProfile.updateOne({ patientId }, profileData, { upsert: true });

    req.flash('success', 'Data has been updated in the Database');
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error updating data in the Database');
    res.redirect('/');
  }
});




userprofileRouter.get('/profile', async (req, res) => {
  try {
    const patientId = req.session.userId; // Retrieve patient ID from the session

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

    // Find empmodel data related to the patientId
    const empData = await patientProfile.find({ patientId }).populate('patientId');

    // Render your view or send the retrieved data to the client
    res.render('profiledisplay', { empData });
  } catch (error) {
    req.flash('error', 'Error fetching data');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});



userprofileRouter.get('/jobhome', async (req, res) => {
  try {
    const patientId = req.session.userId; // Retrieve patient ID from the session

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

    // Find empmodel data related to the patientId
   

    // Render your view or send the retrieved data to the client
    res.render('jobhome');
  } catch (error) {
    req.flash('error', 'Error fetching data');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});



module.exports = userprofileRouter;