import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password, adminKey);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '450px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <h2>Admin Sign Up</h2>
          </Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Admin Secret Key</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter admin secret key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Admin signup requires a valid secret key or existing admin approval.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
            <div className="text-center">
              <Link to="/login">Already have an account? Login</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SignUp;
