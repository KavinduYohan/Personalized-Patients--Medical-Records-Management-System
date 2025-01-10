const express = require('express');
const app = express();
const methodoverride = require('method-override');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const myrouter = require('./routers/router');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

// Load environment variables from .env file
dotenv.config({ path: './config.env' });

// MongoDB connection configuration for serverless
let isConnected = false;  // Variable to track if MongoDB is connected

// Connect to MongoDB once and reuse the connection in serverless functions
const connectMongoDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(process.env.mongodburl, { useNewUrlParser: true, useUnifiedTopology: true });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed: ', error);
    throw error;
  }
};

// Ensure MongoDB connection
connectMongoDB();

// Set up the view engine
app.set('view engine', 'ejs');

// Middleware setup
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

// Set up the routes
const patientRouter = require("./routers/patientRouter.js");
const profileRouter = require("./routers/profileRouter.js");
const Adrouter = require('./routers/AdminRouter.js');
const doctorRouter = require("./routers/doctorRouter.js");
let docd = require('./routers/docd.js');

app.use('/upload', express.static('upload'));

// Register the routes with the app
app.use(doctorRouter);
app.use(Adrouter);
app.use(myrouter);
app.use(patientRouter);
app.use(profileRouter);
app.use(docd);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
