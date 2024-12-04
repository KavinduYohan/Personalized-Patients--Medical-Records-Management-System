const DocRouter = require("express").Router();
let docd = require("../model/docd");

DocRouter.post('/BecomeDoctor', async (req, res) => {
  try {
    const patientId = req.session.userId; 
  

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }
    
    const data = {
      dname: req.body.dname,
      slmc: req.body.slmc,
      email: req.body.email,
      specialization: req.body.specialization,
      ex: req.body.ex,
      description: req.body.description,
      patientId: patientId // Include the patientId when creating empmodel data
      
    };
    
    await docd.create(data);
    req.flash('success', 'Data has been created in the Database');
    res.redirect('/');
   
  } catch (error) {
    req.flash('error', 'Data has not been created in the Database');
    res.redirect('/');
  }
});


DocRouter.get('/AdminDoc', async (req, res) => {
  try {
    const patientId = req.session.userId; // Retrieve patient ID from the session

    if (!patientId) {
      // Handle case if patient is not logged in
      req.flash('error', 'Please log in as a patient');
      res.redirect('/login');
      return;
    }

    // Find empmodel data related to the patientId
    const docdata = await docd.find({});

    // Render your view or send the retrieved data to the client
    res.render('AdminDoc', { docdata });
    
  } catch (error) {
    req.flash('error', 'Error fetching data');
    res.redirect('/'); // Redirect to the desired route or handle the error accordingly
  }
});


module.exports = DocRouter;