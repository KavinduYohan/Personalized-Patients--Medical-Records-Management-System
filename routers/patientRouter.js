const router = require("express").Router();
let patient = require("../model/patient.js");
let empmodel = require('../model/model')
let Doctors = require('../model/Doctors.js');
const AdminTest = require('../model/AdminTest.js');
let reservation = require("../model/reservation.js");

router.get('/addfiles', async(req, res) => {
  const tests = await AdminTest.find()


  res.render('addfiles',{tests})
})



//register
router.get('/register', (req, res) => {
  res.render('register', { error: req.flash('error') }); // Pass the 'error' to the view
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, cpassword } = req.body;
    const newPatient = new patient({
      name,
      email,
      password,
      cpassword,
      
      
    });

    if (password.length < 6) {

      
      req.flash('error', 'Password should be at least 6 character');
      res.render('register', { error: req.flash('error') }); // Render register with error

    }else {
      if (password === cpassword) {
        const userExist = await patient.findOne({ email: email });
  
        if (userExist) {
          req.flash('error', 'Email already exists');
          res.render('register', { error: req.flash('error') }); // Render register with error
        }  else {
          await newPatient.save();
          req.flash('error', 'Registered successfully');
          res.redirect('/login'); // Redirect to a different page or the same page
      }
  
      } else {
        req.flash('error', 'Passwords do not match');
        res.render('register', { error: req.flash('error') }); // Render register with error
      }
    } 
    }

    catch (err) {
      req.flash('error', 'Internal server error');
      res.render('register', { error: req.flash('error') }); // Render register with error
    }
  });



// Login route
router.get('/login', (req, res) => {
  if (req.session.userId) {
    if (req.session.userRole === 'admin') return res.redirect('/adminPanel');
    if (req.session.userRole === 'doctor') return res.redirect('/doctor');
    return res.redirect('/');
  }
  res.render('login', { error: req.flash('error') });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await patient.findOne({ email: email });

    if (user && user.password === password) {
      req.session.userId = user._id;
      req.session.userRole = user.role;
      req.session.userName = user.name;

      if (user.role === 'doctor') {
        return res.redirect('/doctor');
      } else if (user.role === 'admin') {
        return res.redirect('/adminPanel');
      } else {
        return res.redirect('/');
      }
    } else {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
  } catch (err) {
    console.error("Login error:", err);
    req.flash('error', 'Internal server error occurred');
    return res.redirect('/login');
  }
});

// Admin Panel route
router.get('/adminPanel', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      req.flash('error', 'Please log in as an administrator');
      return res.redirect('/login');
    }

    const currentAdmin = await patient.findById(userId);
    if (!currentAdmin || currentAdmin.role !== 'admin') {
      req.flash('error', 'Unauthorized access');
      return res.redirect('/');
    }

    const empData = await patient.find({});
    const roleCounts = empData.reduce((acc, curr) => {
      if (curr.role === 'patient') acc.patient++;
      else if (curr.role === 'doctor') acc.doctor++;
      else if (curr.role === 'admin') acc.admin++;
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
      if (_id) countsByMonth[_id] = count;
    });

    const docdModel = require('../model/docd');
    const doctorRequests = await docdModel.find({});

    const clinicsCount = await require('../model/Clinicadd').countDocuments();
    const reservationsCount = await require('../model/reservation').countDocuments();

    res.render('adminPanel', {
      empData,
      roleCounts,
      countsByMonth,
      doctorRequests,
      clinicsCount,
      reservationsCount,
      user: currentAdmin
    });
  } catch (error) {
    console.error("Admin panel error:", error);
    res.status(500).send('Internal Server Error');
  }
});

// User profile route
router.get('/profile', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      req.flash('error', 'Please log in to view your profile');
      return res.redirect('/login');
    }

    const user = await patient.findById(userId);
    let profile = await require('../model/userprofile').findOne({ patientId: userId });

    res.render('profileEdit', { user, profile, userId });
  } catch (error) {
    console.error("Profile route error:", error);
    res.redirect('/');
  }
});

router.post('/profileEdit', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const profileData = {
      fullName: req.body.name || req.body.fullName,
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
      patientId: userId
    };

    await require('../model/userprofile').findOneAndUpdate(
      { patientId: userId },
      profileData,
      { upsert: true, new: true }
    );

    req.flash('success', 'Profile updated successfully!');
    res.redirect('/profile');
  } catch (error) {
    console.error("Profile update error:", error);
    req.flash('error', 'Failed to update profile');
    res.redirect('/profile');
  }
});

// PMS route
router.get('/pms/:id', async (req, res) => {
  try {
    const userId = req.session.userId; // Retrieve user ID from the session

    if (!userId) {
      // Handle case if user is not logged in
      req.flash('error', 'Please log in');
      res.redirect('/login');
      return;
    }

    const patients = await patient.find({});
    res.render('index', { x: patients, userId }); // Pass both patients and userId to the view
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




// fetch or get 
router.route("/").get((req, res) => {
  patient.find().then((patient) => {
    res.json(patient)
  }).catch((err) => {
    console.log(err);
  })
})

// Update individual patient record
router.put("/edit/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;
    const updatePatient = { name, email, password };

    await patient.findByIdAndUpdate(userId, updatePatient);
    res.status(200).send({ status: "user updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).send({ status: "error with updating data", error: err.message });
  }
});

// Delete patient record
router.delete("/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await patient.findByIdAndDelete(userId);
    res.status(200).send({ status: "user deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send({ status: "error with delete patient", error: err.message });
  }
});

module.exports = router;