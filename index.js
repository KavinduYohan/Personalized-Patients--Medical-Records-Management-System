let express = require('express');
let app = express();


let methodoverwride = require('method-override')
let dotenv= require('dotenv')

let mongoose  = require('mongoose');
let myrouter= require('./routers/router')

let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



let session = require('express-session');
let flash = require('connect-flash')

dotenv.config({path: './config.env'})
mongoose.connect(process.env.mongodburl)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err.message));
app.set('view engine', 'ejs')


app.use(methodoverwride('_method'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))


// session middleweare
app.use(session({
   secret: 'nodejs',
   resave:true,
   saveUninitialized:true
}))
//flash middleweare
app.use(flash())



const patientRouter = require("./routers/patientRouter.js")
// app.use("/patient",patientRouter);

// const profileRouter = require("./routers/#profileRouter.js");
const Adrouter = require('./routers/AdminRouter.js');
// app.use("/patientrecord",patientRecordRouter);
const doctorRouter = require("./routers/doctorRouter.js");
const Vrouter = require('./routers/Voter.js');
const emprouter = require('./routers/router');



// app.use('/reservations', reservationRouter);

// let docd=require('./routers/#docd.js')

// Global variables and auth state in all EJS templates
app.use(async (req, res, next) => {
  const successFlash = req.flash('success');
  const sucessFlash = req.flash('sucess');
  const errorFlash = req.flash('error');
  const errFlash = req.flash('err');

  const finalSuccess = (successFlash && successFlash.length > 0 ? successFlash[0] : null) ||
                       (sucessFlash && sucessFlash.length > 0 ? sucessFlash[0] : null);

  const finalError = (errorFlash && errorFlash.length > 0 ? errorFlash[0] : null) ||
                     (errFlash && errFlash.length > 0 ? errFlash[0] : null);

  res.locals.sucess = finalSuccess;
  res.locals.success = finalSuccess;
  res.locals.error = finalError;
  res.locals.err = finalError;
  res.locals.currentUserId = req.session.userId || null;
  res.locals.userRole = req.session.userRole || null;
  res.locals.userName = req.session.userName || null;

  if (req.session.userId && !req.session.userRole) {
    try {
      const user = await mongoose.model('patientRegister').findById(req.session.userId);
      if (user) {
        req.session.userRole = user.role;
        req.session.userName = user.name;
        res.locals.userRole = user.role;
        res.locals.userName = user.name;
      }
    } catch (e) {
      console.error("Session user lookup error:", e.message);
    }
  }
  next();
});

app.use('/upload', express.static('upload'));

// Mount modular routers cleanly
app.use('/', myrouter);
app.use('/', patientRouter);
app.use('/', doctorRouter);
app.use('/', Adrouter);
app.use('/', Vrouter);


// // app.use(profileRouter)
// app.use(docd)

app.listen(process.env.PORT, ()=>{
    console.log(process.env.PORT, "Port Working");
} )