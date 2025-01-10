//Importing the mongoose library for mongodb interaction
const mongoose = require("mongoose");

//Defining mongodb URI
const MONGODB_URI = process.env.MONGODB_URI || "YOUR CONNECTION STRING";

//Function to create connection to the mongodb database using mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

//Exporting the connecDB function so we can used elsewhere in the application
module.exports = connectDB;

