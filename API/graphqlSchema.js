const { gql } = require("apollo-server-express");

// Define GraphQL schema
const typeDefs = gql`
  type Employee {
    employeeId: String!
    firstName: String!
    lastName: String!
    age: Int!
    dateOfJoining: String!
    title: String!
    department: String!
    employeeType: String!
    currentStatus: Boolean!
  }

  type Query {
    getEmployees: [Employee!]!
    getEmployee(employeeId: String!): Employee
    searchEmployeesByName(name: String!): [Employee!]!
    searchEmployeesById(employeeId: String!): [Employee!]!
    getEmployeesByType(employeeType: String!): [Employee]!

  }

  type Mutation {
    createEmployee(
      firstName: String!,
      lastName: String!,
      age: Int!,
      dateOfJoining: String!,
      title: String!,
      department: String!,
      employeeType: String!,
      currentStatus: Boolean!
    ): Employee

    deleteEmployee(employeeId: String!): Boolean
    editEmployee(
      employeeId: String!,
      firstName: String,
      lastName: String,
      age: Int,
      dateOfJoining: String,
      title: String,
      department: String,
      employeeType: String,
      currentStatus: Boolean
    ): Employee

  }
`;
//Exporting the Graphql Schema defination to be used by apollo server
module.exports = typeDefs;
