import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          Admin Panel
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/projects">
              Projects
            </Nav.Link>
            <Nav.Link as={Link} to="/themes">
              Themes
            </Nav.Link>
            <Nav.Link as={Link} to="/team">
              Team Members
            </Nav.Link>
          </Nav>
          <Nav>
            <BootstrapNavbar.Text className="me-3 text-light">
              Welcome, {user?.name}
            </BootstrapNavbar.Text>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

