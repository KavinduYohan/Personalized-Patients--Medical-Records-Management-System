const router = require("express").Router();
let patient = require("../model/patient.js");
let AdminTest = require("../model/AdminTest.js");
let empmodel = require('../model/model')


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
  res.render('login', { error: req.flash('error') });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password ,role } = req.body;
    const result = await patient.findOne({ email: email });

    const count = await empmodel.countDocuments();
   

    if (result && result.password === password) {
      req.session.userId = result._id; // Store user ID in session upon successful login
      
      if(result.role == 'doctor'){
        res.render('doctor', { userId: result._id }); // Pass the user ID to the home page
      }if(result.role == 'admin'){
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
      res.render('adminPanel', { result,empData , roleCounts , count,countsByMonth});
        //res.render('adminPanel', { userId: result._id }); // Pass the user ID to the home page
      }else {
        res.render('home', { userId: result._id }); // Pass the user ID to the home page
      }
     
    } else {
      req.flash('error', 'Invalid credentials');
      res.render('login', { error: req.flash('error') }); // Render login with error
    }
  } catch (err) {
    req.flash('error', 'Internal server error');
    res.render('login', { error: req.flash('error') }); // Render login with error
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

//update individual record

router.route("/edit/:id").put(async (req, res) => {

  let userId = req.params.id;
  //const name = req.body.name; mehemt puluwm req eken ena data store krgnna or else 
  const { name, email, password } = req.body; // destructuring method

  const updatePatient = {  // kalin wge object hdlth puluwnn
    name,
    email,
    password

  }
  //userID as 1st parameter and updatePatient as 2nd paramter
  const update = await patient.findByIdAndUpdate(userId, updatePatient) //updatePatient hdnn nathuwwa kelinm dnnth puluwnn //findone ekei wge hoynw nn email eken wge hoynw nn //
    .then(() => {
      res.status(200).send({ status: "user updated" })  // succuss nn 200 dnne
    }).catch((err) => {
      console.log(err);
      res.status(500).send({ status: "error with updating data", error: err.massage }); // UI ekat send krnw  // 500 kiynne server error 
    })

  // delete patient

  // router.route("/delete/:id").delete(async (req, res) => {
  //   let userId = req.params.id;

  //   await patient.findByIdAndDelete(userId).then(() => {
  //     res.status(200).send({ status: "user deleted" });
  //   }).catch((err) => {
  //     console.log(err.massage);
  //     res.status(500).send({ status: "error with delete patient ", error: err.massage }); // UI ekat send krnw  // 500 kiynne internal server error 
  //   })
  // })

})

//get one user data

router.route("/get/:id").get(async (req, res) => {
  let userId = req.params.id;

  const user = await patient.findById(userId)
    .then((patient) => {
      res.status(200).send({ status: "user fetached", patient })
    }).catch((err) => {
      console.log(err.massage);
      res.status(500).send({ status: "error with Fetch patient ", error: err.massage }); // UI ekat send krnw  // 500 kiynne internal server error 
    })
})

//vital healt matrics
router.get('/vitalHealthMatrics/BMI/bmigraph', (req, res) => {
  res.render('vitalHealthMatrics/BMI/bmigraph'); // Render the 'bmigraph' view
});

router.get('/vitalHealthMatrics/Cholesterol/colo', (req, res) => {
  res.render('vitalHealthMatrics/Cholesterol/colo'); // Render the 'bmigraph' view
});


//add test

router.get('/addTest', (req, res) => {
  
  res.render('addTest'); 
});

 
router.post("/addTest", async (req, res) => {
  try {
    const patientId = req.session.userId; 

    if (!patientId) {
      
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

   
    const testName = req.body.pname;

 
    const newTestRecord = new TestRecord({ pname: testName });
    await newTestRecord.save();

    req.flash('success', 'Test record added successfully');
    res.redirect('/TestRecord'); 
  } catch (error) {
    req.flash('error', 'Error adding test record');
    res.redirect('/addTest'); 
  }
});



router.get('/TestRecord', async (req, res) => {
  try {
    const patientId = req.session.userId; 

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

   
    const empData = await AdminTest.find({});

    // Render your view or send the retrieved data to the client
    res.render('TestRecord', { empData });
    
  } catch (error) {
    req.flash('error', 'Error fetching data');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});



router.delete("/del/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await patient.findByIdAndDelete(userId);

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

router.get('//', (req, res)=>{
  patient.find({})
  .then((x)=>{
      res.render('adminpanel', {x})
  })
  .catch((y)=>{
      console.log(y)
  })
  
})

router.get('///', (req, res)=>{
  patient.find({})
  .then((x)=>{
      res.render('doctor', {x})
  })
  .catch((y)=>{
      console.log(y)
  })
  
})

module.exports = router;