let express = require('express');
let empmodel = require('../model/model')
let emprouter = express();
let patient = require("../model/patient.js");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
let AdminTest = require("../model/AdminTest");




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/'); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()) // Set the filename to be unique
  },
});

const upload = multer({ storage: storage });





emprouter.get('/', async (req, res) => {
  try {
    const patientId = req.session.userId;
    const role = await patient.findById(patientId);
    const result = patientId

    if (role && role.role === 'doctor') {
      empmodel.find({})
        .then((x) => {
          res.render('doctor', { x });
        });

    }else if (role && role.role === 'admin') {

      const count = await empmodel.countDocuments();

      const empData = await patient.find({});
      const roleCounts = empData.reduce((acc, curr) => {
        if (curr.role === 'patient') {
          acc.patient++;
        } else if (curr.role === 'doctor') {
          acc.doctor++;
        } else if (curr.role === 'admin') {
          acc.admin++;
        }
        return acc;
      }, { patient: 0, doctor: 0, admin: 0 });

      const monthCounts = await patient.aggregate([
        {
            $group: {
                _id: "$month",
                count: { $sum: 1 }
            }
        }
    ]);
    
    const countsByMonth = {};
    monthCounts.forEach(({ _id, count }) => {
        countsByMonth[_id] = count;
    });
      
  // Render your view or send the retrieved data to the client
    res.render('adminPanel', { result,empData , roleCounts , count , countsByMonth});


    } else {
      empmodel.find({})
        .then((x) => {
          res.render('home', { x });
        })
        .catch((y) => {
          console.log(y);
          res.status(500).send('Error fetching data');
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


emprouter.post('/addfiles', upload.single('prescriptionPhoto'), async (req, res) => {
  try {
    const patientId = req.session.userId; // Retrieve patient ID from the session
    const role = await patient.findById(patientId)
   


    if (!patientId) {
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    const data = {
      pname: req.body.pname,
      doctor_name: req.body.dname,
      appointment_date: req.body.date,
      testname:req.body.testname,
      description: req.body.description,
      prescriptionPhoto: req.file.filename,// Store only the filename as a string
      patientId: patientId,
    };


    await empmodel.create(data);
    req.flash('success', 'Data has been created in the Database');
    if (role.role == 'doctor') {
      res.redirect('doctor');
    } else {
      res.redirect('/');
    }

  } catch (error) {
    console.error(error);
    req.flash('error', 'Data has not been created in the Database');
    res.redirect('/');
  }
});
// emprouter.post('/addfiles', upload.single('prescriptionPhoto'), async (req, res) => {
//   try {
//     const patientId = req.session.userId; // Retrieve patient ID from the session
//     const role = await patient.findById(patientId)


//     if (!patientId) {
//       req.flash('error', 'Please log in as a patient');
//       return res.redirect('/login');
//     }

//     const data = {
//       pname: req.body.pname,
//       doctor_name: req.body.dname,
//       appointment_date: req.body.date,
//       testname:req.body.testname,
//       description: req.body.description,
//       prescriptionPhoto: req.file.filename,// Store only the filename as a string
//       patientId: patientId,
//     };


//     await empmodel.create(data);
//     req.flash('success', 'Data has been created in the Database');
//     if (role.role == 'doctor') {
//       res.redirect('doctor');
//     } else {
//       res.redirect('/');
//     }

//   } catch (error) {
//     console.error(error);
//     req.flash('error', 'Data has not been created in the Database');
//     res.redirect('/');
//   }
// });












// emprouter.post('/addfiles', async (req, res) => {
//     try {
//       const patientId = req.session.userId; // Retrieve patient ID from the session
  
//       if (!patientId) {
//         // Handle case if patient is not logged in
//         req.flash('error', 'Please log in as a patient');
//         res.redirect('/login');
//         return;
//       }
      
//       const data = {
//         pname: req.body.pname,
//         doctor_name: req.body.dname,
//         appointment_date: req.body.date,
//         description: req.body.description,
//         patientId: patientId // Include the patientId when creating empmodel data
//       };
  
//       await empmodel.create(data);
//       req.flash('success', 'Data has been created in the Database');
//       res.redirect('/');
//     } catch (error) {
//       req.flash('error', 'Data has not been created in the Database');
//       res.redirect('/');
//     }
//   });
  
// Assuming you want to retrieve empmodel data related to a specific patient after they've logged in


emprouter.get('/show', async (req, res) => {
  try {
    const patientId = req.session.userId; // Retrieve patient ID from the session

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

    // Find empmodel data related to the patientId
    const empData = await empmodel.find({ patientId }).populate('patientId');

    
    // Render your view or send the retrieved data to the client
    res.render('patientRecordtable', { empData });
  } catch (error) {
    req.flash('error', 'Error fetching data');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});
  

// update a tuple
emprouter.get('/update/:id', async (req, res) => {
  try {
    const readquery = req.params.id;
    const record = await empmodel.findById(readquery);
    
    if (record) {
      res.render('update', { x: record });
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


//update // edit krna tuple eka newe update wenne database eke udam thiyn eka & eeka patientId ekatt wetenw
emprouter.patch('/update/:id', async (req, res) => {
  try {
    const patientId = req.session.userId;
    const role = await patient.findById(patientId) // Get the user ID from the session
    const entryId = req.params.id; // Get the ID from URL parameter

    
    // Find the specific entry to update using its ID and the logged-in user's ID
    const updatedEntry = await empmodel.findOneAndUpdate(
      { _id: entryId }, // Query condition
      {
        $set: {
          pname: req.body.pname,
          doctor_name: req.body.dname,
          appointment_date: req.body.date,
          description: req.body.Description,
          // Update other fields as needed
        }
      },
      { new: true } // To get the updated document after the update operation
    );
    if (role.role == 'doctor') {
      if (updatedEntry) {
        // Handle successful update
        req.flash('success', 'Entry updated successfully');
        res.render('doctor'); // Redirect to a success page or specific route
      } else {
        // Handle case where the entry to update wasn't found or the user isn't authorized
        req.flash('error', 'Failed to update entry');
        res.render('doctor');
      }
    } else {
      if (updatedEntry) {
        // Handle successful update
        req.flash('success', 'Entry updated successfully');
        res.redirect('/'); // Redirect to a success page or specific route
      } else {
        // Handle case where the entry to update wasn't found or the user isn't authorized
        req.flash('error', 'Failed to update entry');
        res.redirect('/');
      }

    }

  } catch (error) {
    console.error(error);
    // Handle error case
    req.flash('error', 'Internal server error');
    res.redirect('/');
  }
});

emprouter.get('/adminedit/:id', async (req, res) => {
  try {
    const readquery = req.params.id;
    const record = await patient.findById(readquery);
    
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



emprouter.patch('/admintest/:id', async (req, res) => {
  
  try {
     // Get the user ID from the session
    const entryId = req.params.id; // Get the ID from URL parameter

    // Find the specific entry to update using its ID and the logged-in user's ID

    
    const updatedEntry = await patient.findOneAndUpdate(
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
      res.redirect('/'); // Redirect to a success page or specific route
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


















  //one user fetching
  emprouter.route("/get/:id").get(async (req, res) => {
    let userId = req.params.id;
  
    const user = await empmodel.findById(userId)
      .then((patient) => {
        res.status(200).send({ status: "user fetached", patient })
      }).catch((err) => {
        console.log(err.massage);
        res.status(500).send({ status: "error with Fetch patient ", error: err.massage }); // UI ekat send krnw  // 500 kiynne internal server error 
      })
  })

//delete
emprouter.delete("/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const patientId = req.session.userId; // Retrieve patient ID from the session
    const role = await patient.findById(patientId)


    const deletedUser = await empmodel.findByIdAndDelete(userId);


    if (role.role == 'doctor') {
      if (deletedUser) {
        // res.status(200).send({ status: "User deleted", user: deletedUser });
        res.render('doctor');


      } else {
        res.status(404).send({ status: "User not found" });
      }

    } else {
      if (deletedUser) {
        // res.status(200).send({ status: "User deleted", user: deletedUser });
        res.redirect('/');


      } else {
        res.status(404).send({ status: "User not found" });
      }

    }

  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "Error deleting user", error: error.message });
  }
});




//logout
emprouter.get('/logout', async (req, res) => {
  try {
    // Retrieve patient ID from the session
    const patientId = req.session.userId;

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      return res.redirect('/login');
    }

    // Clear the session data (including userId)
    req.session.destroy(err => {
      if (err) {
        req.flash('error', 'Error logging out');
        return res.redirect('/');
      }

      // Redirect to the home page after successful logout
      res.clearCookie('session-id'); // Clearing any associated cookies (optional)
      res.locals.loggedOut = true;
      res.render('home'); // Redirect to the home page

      // This alert message will be shown using client-side JavaScript
      // Send a success flag to the client-side to trigger the alert
      //res.locals.loggedOut = true;
    });
  } catch (error) {
    req.flash('error', 'Error logging out');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});


emprouter.get('/BecomeDoctor', (req, res) => {
  res.render('BecomeDoctor'); // Render the 'bmigraph' view
});




  
module.exports = emprouter;