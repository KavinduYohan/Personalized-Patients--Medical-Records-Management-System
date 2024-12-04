const router1 = require("express").Router();
let patient = require("../model/patient.js");
let empmodel = require('../model/model')
let patientProfile = require('../model/userprofile');


// Route to render the search form

router1.get("/search", (req, res) => {
  res.render('Doctorsearch-file', { empData: '' ,empprofile : ''});
});

// Route to handle search requests based on user-entered email
router1.get('/searchByEmail', async (req, res) => {
  const email = req.query.email; // Retrieve email from the query parameters
  
  try {
    
      const foundPatient = await patient.findOne({ email: email }); // Search for patient by email
      if(!foundPatient){
        console.log("errorr email")
        res.redirect("/search")
      }else {
        const patientId = foundPatient._id;
      const empprofile = await empmodel.find({ patientId }).populate('patientId');
      const empData = await patientProfile.find({ patientId }).populate('patientId');

      //console.log(empprofile)
      // console.log(patientId)
      // console.log(empData)
      // if (foundPatient) {
      //   const patientId = foundPatient._id; // Obtain the ObjectId of the patient
      //   console.log(patientId);
      //  const empData = await empmodel.find({ patientId }).populate('patientId');
  
      // } else {
      //   console.log('Patient not found');
      //   // Handle the case where no patient with the given email is found
      // }
      res.render('Doctorsearch-file', { empData: empData , empprofile : empprofile }); // Render the EJS file with search results
      }
      
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router1.get("/doctor", (req, res) => {
  res.render('doctor');
});


  

module.exports = router1;