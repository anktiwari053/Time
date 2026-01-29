import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api';

const Profile = () => {
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
      return;
    }
    if (!user) return;
    getMe()
      .then(({ data }) => setProfile(data.data))
      .catch(() => setErr('Failed to load profile'));
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) return null;

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: 480 }}>
        <Card>
          <Card.Body>
            <Card.Title className="mb-4">Profile</Card.Title>
            {err && <Alert variant="danger">{err}</Alert>}
            {profile ? (
              <>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> {profile.role}</p>
              </>
            ) : (
              !err && <Spinner animation="border" />
            )}
            <div className="d-flex gap-2 mt-3">
              <Button
                variant="outline-danger"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Profile;
