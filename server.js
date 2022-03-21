const mongoose = require('mongoose');
const dotenv = require('dotenv');

// we put this code in the beginning to be able to catch all uncaught exceptions even those in app.js
// example: when we try to console.log a variable that does not exist
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 shuting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Read variables from config.env file and save them to node js enviroment variables(should be read before requiring app.js)
dotenv.config({ path: './config.env' });
const app = require('./app');

// store the connection string in DB With the password replaced by the database password
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// connect our application to the database

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));
// Define the port by the value of the enviroment variable(PORT) or 3000
const port = process.env.PORT || 3000;
// Listen to the incoming requests
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Central place for handling unhandledRejection. example: if database is down for some reason
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 shuting down...');
  // console.log(err);
  console.log(err.name, err.message);
  // Shutdown the application
  // we used server.close instead of using process.exit alone to give the server time to finish all the request that are still bending or
  //  being handled at the time and only after that the sever is then killed
  server.close(() => {
    process.exit(1); // in real apps we will usually have tools to restarts the application right after it crashes
  });
});
