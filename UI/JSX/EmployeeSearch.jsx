import React, { useState } from "react";
import { Button } from "react-bootstrap";

const EmployeeSearch = ({ onSearchResults, onEmployeeTypeFilterChange, onSearchButtonClick,onSearchResultsByType }) => {
  const [searchQueryByName, setSearchQueryByName] = useState("");
  const [searchQueryByEmployeeType, setSearchQueryByEmployeeType] = useState("");

  const handleInputChangeByName = (event) => {
    setSearchQueryByName(event.target.value);
  };

  const handleSearchByName = async () => {
    console.log("Searching by name:", searchQueryByName);
    try {
      const employees = await performSearchByName(searchQueryByName);
      console.log("Search results by name:", employees);
      onSearchResults(employees);
      setSearchQueryByName("");
    } catch (error) {
      console.error("Error searching employees by name:", error);
    }
  };

  const performSearchByName = async (searchQuery) => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query SearchEmployeesByName($name: String!) {
              searchEmployeesByName(name: $name) {
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
            name: searchQuery,
          },
        }),
      });

      const { data } = await response.json();
      if (!response.ok) {
        console.error("Failed to search employees:", data);
        throw new Error(
          data.errors[0].message || "Failed to search employees"
        );
      }

      return data.searchEmployeesByName;
    } catch (error) {
      console.error("Error searching employees:", error);
      throw error;
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


  const handleEmployeeTypeChange = (event) => {
    const selectedType = event.target.value;
    console.log("Selected employee type:", selectedType);
    setSearchQueryByEmployeeType(selectedType);
  };

  const handleSearchButtonClick = async (event) => {
    console.log("Search button clicked");
    console.log("Search Query By Employee Type:", searchQueryByEmployeeType);
    try {
      if (searchQueryByEmployeeType !== '') {
        console.log("Fetching employees by type:", searchQueryByEmployeeType);
        const filteredEmployees = await fetchEmployeesByType(searchQueryByEmployeeType);
        console.log("Filtered Employees:", filteredEmployees);
        onSearchResultsByType(filteredEmployees);
      } else {
        console.log("Fetching all employees.");
        const allEmployees = await fetchEmployeesByType('All');
        console.log("All Employees:", allEmployees);
        onSearchResultsByType(allEmployees);
      }
    } catch (error) {
      console.error("Error filtering employees by type:", error);
    }
  };
  
  return (
    <>
      <div style={{ display: "flex", marginBottom: "10px", padding: "8px 16px" }}>
        {/* Search by name input */}
        <div style={{ marginRight: "10px" }}>
          <input
            type="text"
            placeholder="Search by name"
            value={searchQueryByName}
            onChange={handleInputChangeByName}
          />
          <Button
            variant="outline-info"
            style={{ cursor: "pointer", marginLeft: "10px", padding: "8px 16px" }}
            onClick={handleSearchByName}
          >
            Search
          </Button>
        </div>

        {/* Filter by employee type select */}
        <div className="filter-container">
          <label>
            Filter by Employee Type:
            <select onChange={handleEmployeeTypeChange}>
              <option value="All">All</option>
              <option value="FullTime">Full Time</option>
              <option value="PartTime">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Seasonal">Seasonal</option>
            </select>
          </label>
          
          <Button variant="outline-info" 
          style={{ cursor: "pointer", marginLeft: "10px", padding: "8px 16px" }}
          onClick={handleSearchButtonClick}>
            Search
          </Button>
        </div>
      </div>
    </>
  );
};

export default EmployeeSearch;
