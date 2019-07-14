const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); // getting value from default.json via npm package

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true, // option to avoid error
      useCreateIndex: true, // option to avoid error
      useFindAndModify: false // option to avoid error
    });
    console.log('MongoDB connected!');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failuer
  }
};

module.exports = connectDB;
