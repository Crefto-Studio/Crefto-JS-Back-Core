const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression'); 

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

var bodyParser = require('body-parser')


// Express is a function which add a bunch of methods to our app variable
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Serve static files in public folder(ex: home.html)
app.use(express.static(path.join(__dirname, 'public')));

// ================================================================================================
//                                 1) Middlewares
// ================================================================================================

// Log the information about the request that we did only if we are in development. dev is an argument that specify how the logging will look like
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limit funcation
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'To manny request from this ip, please try again later'
});
app.use('/api/', limiter);
//set security http requist
app.use(helmet());

// data sanatization against no sql quiress
app.use(mongoSanitize());
// data sanatization against xss
app.use(xss());
// polution sanatization
app.use(hpp());
// In this middleware the data from the body is added to the request (req.body becomes available)
app.use(express.json());

//compression 
app.use(compression())

// Add the current time to the request by defining a property requestTime on the request, toISOString is a date function that converts it to a readable string
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});



// ================================================================================================
//                                 2) Routes
// ================================================================================================

app.get('/', (req, res) => {
  res.redirect(301,'http://crefto.studio/');
});



// Mount postRouter to that route
app.use('/api/v1/posts', postRouter);
// Mount userRouter to that route
app.use('/api/v1/users', userRouter);


//404 
app.use((req, res)=>{
  res.redirect(301,'http://crefto.studio/');
})




// =========================================================================================
//                                 4) Error handling middlewares
// =========================================================================================

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
