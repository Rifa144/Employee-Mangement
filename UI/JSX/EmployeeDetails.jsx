import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import { Button } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

function calculateRetirementDate(dateOfJoining, age) {
  const joiningDate = new Date(dateOfJoining);
  const retirementYear = joiningDate.getFullYear() + (65 - age); // Assuming retirement age is 65
  const retirementDate = new Date(retirementYear, joiningDate.getMonth(), joiningDate.getDate());
  return retirementDate;
}

function calculateTimeUntilRetirement(retirementDate) {
  const currentDate = new Date();
  const remainingTime = retirementDate - currentDate;
  
  const remainingYears = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 365));
  const remainingMonths = Math.floor((remainingTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  const remainingDays = Math.floor((remainingTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
  
  return { remainingYears, remainingMonths, remainingDays };
}

function EmployeeDetails() {
  const [employee, setEmployee] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails(id);
    }
  }, [id]);

  const fetchEmployeeDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GetEmployee($id: String!) {
              getEmployee(employeeId: $id) {
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
            id: id,
          },
        }),
      });

      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employee details");
      }

      // Convert boolean currentStatus to string
      const employeeWithStatusString = {
        ...data.getEmployee,
        currentStatus: data.getEmployee.currentStatus ? "Working" : "Retired"
      };

      setEmployee(employeeWithStatusString);
      console.log("Employee details:", employeeWithStatusString);

    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };
  
  if (!employee) {
    return <div>Loading...</div>;
  }

  const retirementDate = calculateRetirementDate(employee.dateOfJoining, employee.age);
  const remainingTime = calculateTimeUntilRetirement(retirementDate);

  return (
    <div className="container">
      <h3 className="my-4 text-center">Employee Details</h3>
      <Table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Date of Joining</th>
            <th>Title</th>
            <th>Department</th>
            <th>Employee Type</th>
            <th>Current Status</th>
            <th>Years Until Retirement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{employee.employeeId}</td>
            <td>{employee.firstName}</td>
            <td>{employee.lastName}</td>
            <td>{employee.age}</td>
            <td>{employee.dateOfJoining}</td>
            <td>{employee.title}</td>
            <td>{employee.department}</td>
            <td>{employee.employeeType}</td>
            <td>{employee.currentStatus}</td>
            <td>{`${remainingTime.remainingYears} years, ${remainingTime.remainingMonths} months, ${remainingTime.remainingDays} days`}</td>
          </tr>
        </tbody>
      </Table>
      <div className="back-button-container">

        <Button onClick={() => window.location.href = '/'}  className="back-button custom-color" >
          Back
        </Button>
        </div>
    </div>
  );
}

export default EmployeeDetails;
export { calculateRetirementDate, calculateTimeUntilRetirement };
