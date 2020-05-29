const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;

console.log(DB)
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    // autoIndex: false, // Don't build indexes
    // poolSize: 10, // Maintain up to 10 socket connections
    // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    // family: 4 // Use IPv4, skip trying IPåv6
  };

mongoose.connect(DB,options).then(
    () => console.log("db connection")
)

const port = process.env.PORT || 3000;
const server = app.listen(port, () => { 
    console.log(`App running on port ${port} ...`);
});

// gracefull shutdown on internal errors.
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);   
    server.close(() => {
      process.exit(1);
    });
  });

// gracefull shutdown on heroku sleep cmds.
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});