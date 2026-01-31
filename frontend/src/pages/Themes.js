import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Themes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/themes');
      setThemes(response.data.data);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <h1>Themes ({themes.length})</h1>
          <p className="text-muted">Browse through all our themes</p>
        </Col>
      </Row>

      <Row>
        {themes.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No themes found.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          themes.map((theme) => (
            <Col md={6} lg={4} key={theme._id} className="mb-4">
              <Card 
                className="theme-card h-100"
                onClick={() => navigate(`/themes/${theme._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <Card.Title>{theme.name}</Card.Title>
                  <Card.Text className="text-muted">{theme.description}</Card.Text>
                  <div className="mb-2">
                    <strong>Members:</strong>{' '}
                    {theme.members && theme.members.length > 0 ? (
                      theme.members.map(member => member.name).join(', ')
                    ) : (
                      'No members assigned'
                    )}
                  </div>
                  <div className="mb-2">
                    <strong>Theme Head:</strong>{' '}
                    {theme.themeHead ? (
                      <Badge bg="success">👑 {theme.themeHead.name}</Badge>
                    ) : (
                      <Badge bg="secondary">Not assigned</Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <strong>Assigned Projects:</strong> {theme.project ? theme.project.name : 'None'}
                  </div>
                  <small className="text-muted">
                    Created: {new Date(theme.createdAt).toLocaleDateString()}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Themes;