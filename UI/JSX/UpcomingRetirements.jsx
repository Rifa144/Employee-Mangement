import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import "./style.css";

function UpcomingRetirements({ employees }) {
  const [upcomingRetirees, setUpcomingRetirees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState("");

  useEffect(() => {
    console.log("Employees received for retirement check:", employees);
    calculateUpcomingRetirements();
  }, [employees, employeeTypeFilter]);

  const calculateRetirementDate = (dateOfJoining, age) => {
    const joiningDate = new Date(dateOfJoining);
    const retirementYear = joiningDate.getFullYear() + (65 - age); // Assuming retirement age is 65
    const retirementDate = new Date(
      retirementYear,
      joiningDate.getMonth(),
      joiningDate.getDate()
    );
    return retirementDate;
  };

  const calculateTimeUntilRetirement = (retirementDate) => {
    const currentDate = new Date();
    const remainingTime = retirementDate - currentDate;

    const remainingYears = Math.floor(
      remainingTime / (1000 * 60 * 60 * 24 * 365)
    );
    const remainingMonths = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
    );
    const remainingDays = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );

    return { remainingYears, remainingMonths, remainingDays };
  };

  const calculateUpcomingRetirements = async () => {
    try {
      setLoading(true);
      let employeesToFilter = employees;
      if (employeeTypeFilter) {
        employeesToFilter = await fetchEmployeesByType(employeeTypeFilter);
      }

      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

      const retirees = employeesToFilter.filter((employee) => {
        const retirementDate = calculateRetirementDate(
          employee.dateOfJoining,
          employee.age
        );

        const timeUntilRetirement =
          calculateTimeUntilRetirement(retirementDate);

        // Check if retirement is within the next 6 months
        const withinNextSixMonths =
          timeUntilRetirement.remainingYears === 0 &&
          timeUntilRetirement.remainingMonths <= 6;

        return withinNextSixMonths;
      });

      setUpcomingRetirees(retirees);
      setLoading(false);
    } catch (error) {
      console.error("Error calculating upcoming retirements:", error);
      setLoading(false);
    }
  };

  const fetchEmployeesByType = async (employeeType) => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GetEmployeesByType($employeeType: String!) {
              getEmployeesByType(employeeType: $employeeType) {
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
            employeeType: employeeType,
          },
        }),
      });

      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employees");
      }

      return data.getEmployeesByType;
    } catch (error) {
      console.error("Error fetching employees by type:", error);
      throw error;
    }
  };

  const handleEmployeeTypeFilterChange = (event) => {
    setEmployeeTypeFilter(event.target.value);
  };

  const handleBackButtonClick = () => {
    history.push("/"); // Navigate back to the main page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if there are any upcoming retirees to show
  const hasUpcomingRetirees = upcomingRetirees.length > 0;

  return (
    <div>
      <h2>Upcoming Retirement (Next 6 Months)</h2>
      <div>
        <label htmlFor="employeeTypeFilter">Filter by Employee Type:</label>
        <select
          id="employeeTypeFilter"
          value={employeeTypeFilter}
          onChange={handleEmployeeTypeFilterChange}
        >
          <option value="">All</option>
          <option value="FullTime">Full-time</option>
          <option value="PartTime">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>
      {!hasUpcomingRetirees && (
        <p>
          No upcoming retirements in the next 6 months for the selected employee
          type.
        </p>
      )}
      {hasUpcomingRetirees && (
        <>
          <Table striped bordered hover>
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
                <th>Retirement Date</th>
              </tr>
            </thead>
            <tbody>
              {upcomingRetirees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td>{employee.employeeId}</td>
                  <td>{employee.firstName}</td>
                  <td>{employee.lastName}</td>
                  <td>{employee.age}</td>
                  <td>{employee.dateOfJoining}</td>
                  <td>{employee.title}</td>
                  <td>{employee.department}</td>
                  <td>{employee.employeeType}</td>
                  <td>{employee.currentStatus ? "Active" : "Retired"}</td>
                  <td>
                    {calculateRetirementDate(
                      employee.dateOfJoining,
                      employee.age
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="back-button-container">
            <Button
              onClick={() => (window.location.href = "/")}
              className="back-button custom-color"
            >
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default UpcomingRetirements;
