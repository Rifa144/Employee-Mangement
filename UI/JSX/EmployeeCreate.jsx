import React, { useState } from "react";
import { Link } from "react-router-dom";
import { validateAlphabets, validateAge } from "./FormValidation";
import { Form, Button, Alert } from "react-bootstrap";
import "./style.css";

const EmployeeCreate = ({ fetchEmployees }) => { // Use destructuring to receive props
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    dateOfJoining: "",
    title: "Employee",
    department: "IT",
    employeeType: "",
    currentStatus: true,
    error: null,
    employees: [],
    formErrors: {}, // to track errors for each field
    successMessage: "", // to track success message
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "firstName" || name === "lastName") {
      if (value === "" || validateAlphabets(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === "age") {
      if (value === "" || validateAge(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === "currentStatus") {
      setFormData({ ...formData, [name]: value === "true" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { firstName, lastName, age, dateOfJoining } = formData;
    const errors = {};

    // Validate required fields
    if (!firstName.trim()) {
      errors.firstName = "First Name is required";
    }
    if (!lastName.trim()) {
      errors.lastName = "Last Name is required";
    }
    if (!age.trim()) {
      errors.age = "Age is required";
    }
    if (!dateOfJoining.trim()) {
      errors.dateOfJoining = "Date of Joining is required";
    }

    // If there are errors, set formErrors and return
    if (Object.keys(errors).length > 0) {
      setFormData({ ...formData, formErrors: errors });
      return;
    }

    try {
      const { age } = formData;
      if (!validateAge(age)) {
        throw new Error("Age must be between 20 and 70.");
      }

      // Create a new employee object
      const newEmployee = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        dateOfJoining: formData.dateOfJoining,
        title: formData.title,
        department: formData.department,
        employeeType: formData.employeeType,
        currentStatus: formData.currentStatus,
      };
      // Call the function to create the new employee
      await createEmployee(newEmployee);
      // Reset form field after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        dateOfJoining: "",
        title: "Employee",
        department: "IT",
        employeeType: "",
        currentStatus: true,
        error: null,
        employees: [],
        formErrors: {}, // Reset form errors
        successMessage: "Employee successfully added!", // Set success message
      });
      fetchEmployees();

    } catch (error) {
      console.error("Error creating employee:", error);
      setFormData({ ...formData, error: "Error creating employee" });
    }
  };

  const createEmployee = async (newEmployee) => {
    try {
      // Send request to GraphQL server to create employee
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation CreateEmployee($firstName: String!, $lastName: String!, $age: Int!, $dateOfJoining: String!, $title: String!, $department: String!, $employeeType: String!, $currentStatus: Boolean!) {
              createEmployee(firstName: $firstName, lastName: $lastName, age: $age, dateOfJoining: $dateOfJoining, title: $title, department: $department, employeeType: $employeeType, currentStatus: $currentStatus) {
                employeeId
                firstName
                lastName
                age
                dateOfJoining
                title
                department
                employeeType
                currentStatus
              }
            }
          `,
          variables: {
            firstName: newEmployee.firstName,
            lastName: newEmployee.lastName,
            age: newEmployee.age,
            dateOfJoining: newEmployee.dateOfJoining,
            title: newEmployee.title,
            department: newEmployee.department,
            employeeType: newEmployee.employeeType,
            currentStatus: newEmployee.currentStatus,
          },
        }),
      });
      // Parse the response data
      const responseData = await response.json();
      // Handle error if the response is not ok
      if (!response.ok) {
        console.error("Failed to create employee:", responseData);
        throw new Error(
          responseData.errors[0].message || "Failed to create employee"
        );
      }

      // Update state with newly created employee
      setFormData((prevFormData) => ({
        ...prevFormData,
        employees: [...prevFormData.employees, responseData.data.createEmployee],
      }));
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const {
    firstName,
    lastName,
    age,
    dateOfJoining,
    title,
    department,
    employeeType,
    currentStatus,
    formErrors,
    successMessage,
  } = formData;

  return (
    <div className="form-container">
      <h2 className="text-center">CREATE EMPLOYEE</h2>

      {/* Success message */}
      {successMessage && (
        <div style={{ color: "green", marginBottom: "20px" }}>
          {successMessage}
        </div>
      )}

      <Form className="form" onSubmit={handleSubmit}>
        <Form.Group controlId="firstName">
          <Form.Label>First Name:</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={firstName}
            className={formErrors.firstName ? "form-control is-invalid" : "form-control"}
            onChange={handleInputChange}
            id="form-control-custom"
          />
          {formErrors.firstName && (
            <Alert variant="danger">{formErrors.firstName}</Alert>
          )}
        </Form.Group>

        <Form.Group controlId="lastName">
          <Form.Label>Last Name:</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={lastName}
            className={formErrors.lastName ? "form-control is-invalid" : "form-control"}
            onChange={handleInputChange}
            id="form-control-custom"
          />
          {formErrors.lastName && (
            <Alert variant="danger">{formErrors.lastName}</Alert>
          )}
        </Form.Group>

        <Form.Group controlId="age">
          <Form.Label>Age:</Form.Label>
          <Form.Control
            type="number"
            name="age"
            value={age}
            min="20"
            max="70"
            className={formErrors.age ? "form-control is-invalid" : "form-control"}
            onChange={handleInputChange}
            id="form-control-custom"
          />
          {formErrors.age && (
            <Alert variant="danger">{formErrors.age}</Alert>
          )}
        </Form.Group>

        <Form.Group controlId="dateOfJoining">
          <Form.Label>Date of Joining:</Form.Label>
          <Form.Control
            type="date"
            name="dateOfJoining"
            value={dateOfJoining}
            className={formErrors.dateOfJoining ? "form-control is-invalid" : "form-control"}
            onChange={handleInputChange}
            id="form-control-custom"
          />
          {formErrors.dateOfJoining && (
            <Alert variant="danger">{formErrors.dateOfJoining}</Alert>
          )}
        </Form.Group>

        <Form.Group controlId="title">
          <Form.Label>Title:</Form.Label>
          <Form.Control
            as="select"
            name="title"
            value={title}
            onChange={handleInputChange}
      id="form-control-custom"
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Director">Director</option>
            <option value="VP">VP</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="department">
          <Form.Label>Department:</Form.Label>
          <Form.Control
            as="select"
            name="department"
            value={department}
            onChange={handleInputChange}
            id="form-control-custom"
          >
            <option value="IT">IT</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Engineering">Engineering</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="employeeType">
          <Form.Label>Employee Type:</Form.Label>
          <Form.Control
            as="select"
            name="employeeType"
            value={employeeType}
            onChange={handleInputChange}
            id="form-control-custom"
          >
            <option value="">Select</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="currentStatus">
          <Form.Label>Current Status:</Form.Label>
          <Form.Control
            as="select"
            name="currentStatus"
            value={currentStatus}
            onChange={handleInputChange}
            id="form-control-custom"
          >
            <option value="true">Working</option>
            <option value="false">Retired</option>
          </Form.Control>
        </Form.Group>

        <Button className="btn btn-info" type="submit">
          Add Employee
        </Button>
      </Form>
    </div>
  );
};

export default EmployeeCreate;
