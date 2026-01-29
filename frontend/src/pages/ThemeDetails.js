import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getThemeWithTeam } from '../services/api';

const ThemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemeDetails();
  }, [id]);

  const fetchThemeDetails = async () => {
    try {
      setLoading(true);
      const response = await getThemeWithTeam(id);
      setTheme(response.data.data.theme);
      setTeamMembers(response.data.data.teamMembers);
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
            onClick={() => navigate(`/projects/${theme.project._id}`)}
          >
            ← Back to Project
          </button>
          <Card>
            {theme.image && (
              <Card.Img variant="top" src={`http://localhost:5000${theme.image}`} alt={theme.name} style={{ height: '300px', objectFit: 'cover' }} />
            )}
            <Card.Body>
              <h1>{theme.name}</h1>
              <p className="text-muted">{theme.description}</p>
              <div className="mt-3">
                <div className="mb-3">
                  <span
                    style={{
                      display: 'inline-block',
                      width: '30px',
                      height: '30px',
                      backgroundColor: theme.primaryColor,
                      marginRight: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    title={`Primary: ${theme.primaryColor}`}
                  ></span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '30px',
                      height: '30px',
                      backgroundColor: theme.secondaryColor,
                      marginRight: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    title={`Secondary: ${theme.secondaryColor}`}
                  ></span>
                </div>
                <strong>Project: </strong>
                <Badge bg="info" className="ms-2">
                  {theme.project.name}
                </Badge>
                <Badge 
                  bg={theme.project.status === 'completed' ? 'success' : 'warning'}
                  className="ms-2"
                >
                  {theme.project.status}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="mb-4">Team Members ({teamMembers.length})</h2>
          {teamMembers.length === 0 ? (
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No team members assigned to this theme yet.</p>
              </Card.Body>
            </Card>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Work Details</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member._id}>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.role}</td>
                    <td>{member.workDetail}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ThemeDetails;

