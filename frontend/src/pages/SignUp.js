import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await register(name, email, password);
    setSubmitting(false);
    if (result.success) navigate('/profile');
    else setError(result.message);
  };

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: 400 }}>
        <Card>
          <Card.Body>
            <Card.Title className="text-center mb-4">Sign Up</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  minLength={6}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100 mb-3" disabled={submitting}>
                {submitting ? 'Signing up…' : 'Sign Up'}
              </Button>
              <p className="text-center text-muted mb-0">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default SignUp;
