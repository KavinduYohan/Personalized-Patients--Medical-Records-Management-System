let express = require('express');
let app = express();


let methodoverwride = require('method-override')
let dotenv= require('dotenv')

let mongoose  = require('mongoose');
let myrouter= require('./routers/router')

let bodyParser = require('body-parser')





let session = require('express-session');
let flash = require('connect-flash')

dotenv.config({path: './config.env'})
mongoose.connect(process.env.mongodburl);
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

const profileRouter = require("./routers/profileRouter.js");
const Adrouter = require('./routers/AdminRouter.js');
// app.use("/patientrecord",patientRecordRouter);
const doctorRouter = require("./routers/doctorRouter.js")
let docd=require('./routers/docd.js')

//globaly variable set for operation (like sucess , error) message
app.use((req, res, next)=>{
 res.locals.sucess = req.flash('sucess'),
 res.locals.err = req.flash('err')
 next()
})


app.use('/upload', express.static('upload'));

app.use(doctorRouter)
app.use(Adrouter)
app.use(myrouter)
app.use(patientRouter)
app.use(profileRouter)
app.use(docd)

app.listen(process.env.PORT, ()=>{
    console.log(process.env.PORT, "Port Working");
} )