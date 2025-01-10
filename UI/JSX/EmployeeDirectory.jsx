import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeeSearch from "./EmployeeSearch";
import EmployeeCreate from "./EmployeeCreate";
import EmployeeTable from "./EmployeeTable";
import EmployeeDetails from "./EmployeeDetails";
import Navigation from "./Nav";
import UpcomingRetirements from "./UpcomingRetirements";

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsByType, setSearchResultsByType] = useState([]);

  // Define fetchEmployees as a regular function
  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              getEmployees {
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
        }),
      });

      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employees");
      }

      setEmployees(data.getEmployees);
      setSearchResults(data.getEmployees)
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchEmployees();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchResults = (results) => {
    console.log("results",results)
    setSearchResults(results);
  };

  const handleEmployeeTypeFilterChange = (selectedType) => {
    // Filter the employees based on the selected type
    console.log("selectedType",selectedType)
    const filteredEmployees =
      selectedType === "All"
        ? employees
        : employees.filter(
            (employee) => employee.employeeType === selectedType
          );

    // Update the state with the filtered results
    setSearchResultsByType(selectedType);
    setSearchResults(selectedType)
  };

  const handleSearchButtonClick = () => {
    console.log("Search button clicked");
  };

  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <EmployeeSearch
                  onSearchResults={handleSearchResults}
                  onEmployeeTypeFilterChange={handleEmployeeTypeFilterChange} // Corrected prop name
                  onSearchButtonClick={handleSearchButtonClick}
                  onSearchResultsByType={handleEmployeeTypeFilterChange} // Pass the same handler for both cases

                />
                <EmployeeTable
                  employeesData={employees}
                  searchResults={
                    searchResults.length > 0
                      ? searchResults
                      : searchResultsByType
                  }
                  
                />
              </>
            }
          />
          <Route
            path="/create"
            element={<EmployeeCreate fetchEmployees={fetchEmployees} />}
          />
          <Route path="/employee/:id" element={<EmployeeDetails />} />
          <Route
            path="/upcomingRetirement"
            element={<UpcomingRetirements employees={employees} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default EmployeeDirectory;
ReactDOM.render(
  <React.StrictMode>
    <EmployeeDirectory />
  </React.StrictMode>,
  document.getElementById("root")
);
