//Load environment varaibles from a .env file into process.env
require("dotenv").config();

//Import required libraries and modules
const express = require("express");
const mongoose = require("mongoose");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphqlSchema");
const Employee = require("./employeeSchema");
const connectDB = require("./db.config");
const cors = require("cors");

//Create an Express Application
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static("public"));

// Define resolvers for graphql queries and mutations
async function generateEmployeeId() {
  //Function to generate a unique employeeId
  let randomId = Math.floor(1 + Math.random() * 100);
  const existingEmployee = await Employee.findOne({ employeeId: randomId });
  //If a employee with generated employeeID already exists ,recursively call the function to generate a new one 
  if (existingEmployee) {
    return generateEmployeeId();
  }
  return randomId.toString();
}



//Define resolvers for Graphql queries and mutation
const resolvers = {
  Query: {
    //Resolver to fetch all employees
    getEmployees: async () => await Employee.find(),
    //Resolver to fetch an employee by employeeId
    getEmployee: async (_, { employeeId }) => await Employee.findOne({ employeeId }),
    //Resolver to fetch employee by employeeType
    getEmployeesByType: async (_, { employeeType }) => {
      if (employeeType === "All") {
        return await Employee.find();
      } else {
        return await Employee.find({ employeeType });
      }
    }, 

    //Resolver to search employee by name
    searchEmployeesByName: async (_, { name }) => {
      
      const employees = await Employee.find({
        $or: [
          { firstName: { $regex: new RegExp(name, "i") } }, // Case-insensitive search for first name
          { lastName: { $regex: new RegExp(name, "i") } } // Case-insensitive search for last name
        ]
      });
      return employees;
    },

    
    //Resolver to search employee by id
    searchEmployeesById: async (_, { employeeId }) => {
      const employee = await Employee.findOne({ employeeId });
      
      return employee ? [employee] : [];
    }
    

  },
  Mutation: {
    //Resolver to create new employee
    createEmployee: async (_, { firstName, lastName, age, dateOfJoining, title, department, employeeType, currentStatus }) => {
      try {
        const generatedId = await generateEmployeeId();
        const employee = new Employee({ employeeId: generatedId, firstName, lastName, age, dateOfJoining, title, department, employeeType, currentStatus });
        await employee.save();
        return { ...employee.toObject(), id: employee._id };
      } catch (error) {
        console.error('Error creating employee:', error);
        throw new Error('Error creating employee');
      }
    },
    //Resolver to delete employee by employeeId
    deleteEmployee: async (_, { employeeId }) => {
      try {
        const deletedEmployee = await Employee.findOneAndDelete({ employeeId });
        if (deletedEmployee) {
          return true; 
        }
        return false; 
      } catch (error) {
        console.error('Error deleting employee:', error);
        throw new Error('Error deleting employee');
      }
    },

    //Resolver to edit employee details by employeeId
    editEmployee: async (_, { employeeId, title, department, currentStatus }) => {
      try {
        const updatedFields = {};
        if (title) updatedFields.title = title;
        if (department) updatedFields.department = department;
        if (currentStatus !== undefined) updatedFields.currentStatus = currentStatus;
    
        //Find and update the employee with the specified employeeId
        const updatedEmployee = await Employee.findOneAndUpdate(
          { employeeId },
          { $set: updatedFields }, 
          { new: true }
        );
    
        return updatedEmployee;
      } catch (error) {
        console.error('Error editing employee:', error);
        throw new Error('Error editing employee');
      }
    },
  },
};


connectDB()
  .then(() => {
    // Create Apollo Server
    const server = new ApolloServer({ typeDefs, resolvers });

    // Start the Apollo Server
    return server.start().then(() => {
      server.applyMiddleware({ app, path: "/graphql" });

      // Start the server
      app.listen(PORT, () => {
        console.log(`Server ready at http://localhost:${PORT}/graphql`);
      });
    });
  })
  .catch((error) => {
    console.error("Error starting server:", error);
  });