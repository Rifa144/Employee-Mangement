import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./style.css";
import { Table, Modal, Button } from "react-bootstrap";

const EmployeeTable = ({ employeesData,searchResults,searchResultsByType }) => {
  const [employees, setEmployees] = useState([]);
  const [modificationFields, setModificationFields] = useState({
    title: "",
    department: "",
    currentStatus: false,
  });
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [modificationEmployeeId, setModificationEmployeeId] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showNonActiveDeleteModal, setShowNonActiveDeleteModal] = useState(false);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState(null);
  const [deletionMessage, setDeletionMessage] = useState("");

  useEffect(() => {
    console.log(searchResults,searchResultsByType)
    const intervalId = setInterval(fetchEmployees, 5000); // Fetch employees every 5 seconds
    fetchEmployees(); // Initial fetch when component mounts

    return () => clearInterval(intervalId);
  }, [searchResults,searchResultsByType]);


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
      })

      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employees");
      }

      setEmployees(data.getEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const openConfirmationModal = (employeeId, isActive) => {
    if (isActive) {
      setShowConfirmationModal(true);
      setEmployeeIdToDelete(employeeId);
    } else {
      setShowNonActiveDeleteModal(true);
      setEmployeeIdToDelete(employeeId);
    }
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setShowNonActiveDeleteModal(false);
    setEmployeeIdToDelete(null);
    setDeletionMessage("");
  };

  
  const handleEmployeeModification = (employeeId) => {
    setShowModifyForm(true);
    setModificationEmployeeId(employeeId);
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue =
      type === "checkbox"
        ? checked
        : type === "select-one" && name === "currentStatus"
        ? value === "true"
        : value;
    setModificationFields((prevState) => ({
      ...prevState,
      [name]: fieldValue,
    }));
  };

  const handleModifySubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting modification...");
    console.log("Modification fields:", modificationFields);
    console.log("Employee ID to modify:", modificationEmployeeId);

    try {
      const modifiedEmployee = await modifyEmployee(
        modificationEmployeeId,
        modificationFields
      );
      console.log("Modify response:", modifiedEmployee);

      // Update the state with the modified employee
      updateEmployeeInState(modifiedEmployee);

      setShowModifyForm(false);
      setModificationEmployeeId(null);
      window.location.reload();

    } catch (error) {
      console.error("Error modifying employee:", error);
    }
  };

  const modifyEmployee = async (employeeId, updatedFields) => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation EditEmployee($employeeId: String!, $title: String, $department: String, $currentStatus: Boolean) {
              editEmployee(employeeId: $employeeId, title: $title, department: $department, currentStatus: $currentStatus) {
                employeeId
                firstName
                lastName
                title
                department
                currentStatus
                age
                dateOfJoining
                employeeType
              }
            }
          `,
          variables: {
            employeeId,
            ...updatedFields,
          },
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.errors[0].message || "Failed to modify employee");
      }

      const modifiedEmployee = responseData.data.editEmployee;
      console.log(`Employee with ID ${employeeId} modified successfully.`);
      return modifiedEmployee;
    } catch (error) {
      console.error("Error modifying employee:", error);
      throw error;
    }
  };

  const updateEmployeeInState = (modifiedEmployee) => {
    setEmployees((prevEmployees) => {
      return prevEmployees.map((employee) => {
        if (employee.employeeId === modifiedEmployee.employeeId) {
          return modifiedEmployee; // Update the modified employee
        }
        return employee; // Keep other employees unchanged
      });
    });
  };
  
  const deleteEmployee = (employeeId) => {
    axios({
      url: "http://localhost:4000/graphql",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        query: `
          query {
            getEmployee(employeeId: "${employeeId}") {
              currentStatus
            }
          }
        `,
      },
    })
    .then((response) => {
      console.log("Delete employee response:", response.data);
  
      const { currentStatus } = response.data.data.getEmployee;
      if (currentStatus) {
        openConfirmationModal(employeeId, currentStatus);
      } else {
        axios({
          url: "http://localhost:4000/graphql",
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            query: `
              mutation {
                deleteEmployee(employeeId: "${employeeId}")
              }
            `,
          },
        })
        .then((response) => {
          const { data } = response.data;
          if (data && data.deleteEmployee) {
            console.log(`Employee with ID ${employeeId} deleted successfully.`);
            setDeletionMessage(`Employee with ID ${employeeId} deleted successfully.`);
            closeConfirmationModal();
            setEmployees(prevEmployees =>
              prevEmployees.filter(employee => employee.employeeId !== employeeId)
            );
            window.location.reload();
      
          } else {
            console.error(`Failed to delete employee with ID ${employeeId}.`);
          }
        })
        .catch((error) => {
          console.error("Error deleting employee:", error);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching employee details:", error);
    });
  };
  
  // Use useEffect to fetch updated employee data after deletion
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  
  return (
    <div>
      <Table striped bordered hover className="table">
        <thead>
          <tr className="table-header" style={{ background: "#ADD8E6" }}>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Date Of Joining</th>
            <th>Title</th>
            <th>Department</th>
            <th>Employee Type</th>
            <th>Current Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {/* {(searchResults.length > 0 ? searchResults : (searchResultsByType && searchResultsByType.length > 0) ? searchResultsByType : employeesData).map( */}
        {searchResults && searchResults.map(

            (data, index) => (
              <tr key={index}>
                <td>{data.employeeId}</td>
                <td>{data.firstName}</td>
                <td>{data.lastName}</td>
                <td>{data.age}</td>
                <td>{data.dateOfJoining}</td>
                <td>{data.title}</td>
                <td>{data.department}</td>
                <td>{data.employeeType}</td>
                <td>{data.currentStatus ? "Working" : "Retired"}</td>
                <td>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleEmployeeModification(data.employeeId)}
                  >
                    Modify
                  </Button>{" "}
                  <Button
                    variant="outline-danger"
                    onClick={() =>
                      openConfirmationModal(data.employeeId, data.currentStatus)
                    }
                  >
                    Delete
                  </Button>{" "}
                  <Link to={`/employee/${data.employeeId}`}>
                    <Button variant="outline-info">Details</Button>
                  </Link>
                </td>
              </tr>
            )
          )}
        </tbody>
      </Table>

      <Modal
        show={showConfirmationModal}
        onHide={closeConfirmationModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletionMessage ||
            `Can't delete employee with ID ${employeeIdToDelete} - Status Active`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmationModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showNonActiveDeleteModal}
        onHide={closeConfirmationModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete employee with ID {employeeIdToDelete}?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmationModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteEmployee(employeeIdToDelete)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {showModifyForm && (
        <div className="form-container">
          <h2>Modify Employee</h2>
          
          <form className="form" onSubmit={handleModifySubmit}>
            <label className="input-style">
              Title: 
              <select
                name="title"
                value={modificationFields.title}
                onChange={handleFieldChange}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
                <option value="VP">VP</option>
              </select>
            </label>
            <label className="input-style">
              Department:
              <select
                name="department"
                value={modificationFields.department}
                onChange={handleFieldChange}
              >
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Engineering">Engineering</option>
              </select>
            </label>
            <label className="input-style">
              Current Status:
              <select
                name="currentStatus"
                value={modificationFields.currentStatus ? "true" : "false"}
                onChange={handleFieldChange}
              >
                <option value="true">Working</option>
                <option value="false">Retired</option>
              </select>
            </label>
            <button type="submit" className="button-style">
              Submit
            </button>
            <Link to="/" className="back-link">
            Back
          </Link>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
