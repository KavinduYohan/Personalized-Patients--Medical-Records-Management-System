const express = require('express');
const app = express();

const methodoverride = require('method-override');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');  // Add path module for resolving paths


const myrouter = require('./routers/router');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo'); // For MongoDB session store

// Load environment variables
dotenv.config({ path: './config.env' });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error: ', err));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware setup
app.use(methodoverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


// Session middleware setup
app.use(session({
    secret: 'nodejs', 
    resave: false, 
    saveUninitialized: false, 
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,  // Use the MongoDB URL from .env
        ttl: 14 * 24 * 60 * 60 // Session expiration time (14 days)
    })
}));

// Flash middleware
app.use(flash());

// Global variables for success and error messages
app.use((req, res, next) => {
    res.locals.sucess = req.flash('sucess');
    res.locals.err = req.flash('err');
    next();
});

// Define routes for different modules
const patientRouter = require("./routers/patientRouter.js");
const profileRouter = require("./routers/profileRouter.js");
const Adrouter = require('./routers/AdminRouter.js');
const doctorRouter = require("./routers/doctorRouter.js");
let docd = require('./routers/docd.js');

// Static files setup for uploads
app.use('/upload', express.static('upload'));

// Use routers for different routes
app.use(doctorRouter);
app.use(Adrouter);
app.use(myrouter);
app.use(patientRouter);
app.use(profileRouter);
app.use(docd);

// Start the server
const port = process.env.PORT || 3000; // Ensure fallback for local development
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
