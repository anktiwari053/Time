import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ThemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemeDetails();
  }, [id]);

  const fetchThemeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/themes/${id}`);
      setTheme(response.data.data);
    } catch (error) {
      console.error('Error fetching theme details:', error);
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

  if (!theme) {
    return (
      <Container className="my-5">
        <Card>
          <Card.Body className="text-center">
            <p>Theme not found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/projects')}>
              Back to Projects
            </button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <button 
            className="btn btn-outline-secondary mb-3" 
            onClick={() => navigate('/themes')}
          >
            ← Back to Themes
          </button>
          <Card>
            <Card.Body>
              <h1>{theme.name}</h1>
              <p className="text-muted">{theme.description}</p>
              <div className="mt-3">
                <div className="mb-3">
                  <strong>Theme Head:</strong>
                  {theme.themeHead ? (
                    <Badge bg="success" className="ms-2 fs-6">
                      👑 {theme.themeHead.name} ({theme.themeHead.role})
                    </Badge>
                  ) : (
                    <Badge bg="secondary" className="ms-2">Not assigned</Badge>
                  )}
                </div>
                <div className="mb-3">
                  <strong>Total Members:</strong> {theme.members?.length || 0}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="mb-4">Theme Members</h2>
          {!theme.members || theme.members.length === 0 ? (
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No members assigned to this theme yet.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {theme.members.map((member) => (
                <Col md={6} lg={4} key={member._id} className="mb-3">
                  <Card className={theme.themeHead && theme.themeHead._id === member._id ? 'border-warning' : ''}>
                    <Card.Body>
                      <Card.Title className="d-flex align-items-center">
                        {member.name}
                        {theme.themeHead && theme.themeHead._id === member._id && (
                          <Badge bg="warning" className="ms-2">Theme Head</Badge>
                        )}
                      </Card.Title>
                      <Card.Text>
                        <strong>Role:</strong> {member.role}<br />
                        <strong>Work Detail:</strong> {member.workDetail}
                      </Card.Text>
                      {member.image && (
                        <img 
                          src={`http://localhost:5000${member.image}`} 
                          alt={member.name} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ThemeDetails;

