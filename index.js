let express = require('express');
let app = express();

let methodoverride = require('method-override');
let dotenv = require('dotenv');

let mongoose = require('mongoose');
let myrouter = require('./routers/router');

let bodyParser = require('body-parser');

let session = require('express-session');
let flash = require('connect-flash');

dotenv.config({ path: './config.env' });
mongoose.connect(process.env.mongodburl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error: ', err));

app.set('view engine', 'ejs');

app.use(methodoverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session middleware
app.use(session({
    secret: 'nodejs',
    resave: true,
    saveUninitialized: true
}));

// Flash middleware
app.use(flash());

// Global variables for success and error messages
app.use((req, res, next) => {
    res.locals.sucess = req.flash('sucess');
    res.locals.err = req.flash('err');
    next();
});

// Route for the landing page (home)
app.get('/', (req, res) => {
    res.render('home'); // Assuming 'home.ejs' is the landing page you want to load
});

// Use routers for different routes
const patientRouter = require("./routers/patientRouter.js");
const profileRouter = require("./routers/profileRouter.js");
const Adrouter = require('./routers/AdminRouter.js');
const doctorRouter = require("./routers/doctorRouter.js");
let docd = require('./routers/docd.js');

app.use('/upload', express.static('upload'));

app.use(doctorRouter);
app.use(Adrouter);
app.use(myrouter);
app.use(patientRouter);
app.use(profileRouter);
app.use(docd);

// Start the server
app.listen(process.env.PORT, () => {
    console.log(process.env.PORT, "Port Working");
});
