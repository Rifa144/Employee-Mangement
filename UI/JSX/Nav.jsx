import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

class Navigation extends React.Component {
  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
        <Container>
          <Navbar.Brand href="/">Employee Management</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              <Nav.Link as={Link} to="/" className="custom-nav-link">
                Employee Table
              </Nav.Link>
              <Nav.Link as={Link} to="/create" className="custom-nav-link">
                Create Employee
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/UpcomingRetirement"
                className="custom-nav-link"
              >
                Upcoming Retirement
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default Navigation;
