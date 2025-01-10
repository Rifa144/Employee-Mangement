//Importing the Mongoose library for mongoDB interaction
const mongoose = require("mongoose");

//Defining the schema for the Employee collection in mongodb
const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  firstName: String,
  lastName: String,
  age: Number,
  dateOfJoining: String,
  title: String,
  department: String,
  employeeType: String,
  currentStatus: Boolean
});

const Employee = mongoose.model("Employee", EmployeeSchema);

// Exporting the Employee model to be used elsewhere in the application.
module.exports = Employee;
