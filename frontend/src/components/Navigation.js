import React from 'react';
import { Navbar, Nav, Container, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_URL = process.env.REACT_APP_ADMIN_URL || 'http://localhost:3001';

const Navigation = () => {
  const { user, loading, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Project Management
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/projects">
              Projects
            </Nav.Link>
            <Nav.Link as={Link} to="/team">
              Team Members
            </Nav.Link>
            {loading ? (
              <Nav.Link disabled>
                <Spinner animation="border" size="sm" />
              </Nav.Link>
            ) : !user ? (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Sign Up
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
                {user.role === 'admin' && (
                  <Nav.Link href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
                    Admin Panel
                  </Nav.Link>
                )}
                <Nav.Link onClick={logout} style={{ cursor: 'pointer' }}>
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
