import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectWithThemes } from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await getProjectWithThemes(id);
      setProject(response.data.data.project);
      setThemes(response.data.data.themes);
    } catch (error) {
      console.error('Error fetching project details:', error);
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

  if (!project) {
    return (
      <Container className="my-5">
        <Card>
          <Card.Body className="text-center">
            <p>Project not found.</p>
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
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/projects')}>
            ← Back to Projects
          </button>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1>{project.name}</h1>
                  <Badge 
                    bg={project.status === 'completed' ? 'success' : 'warning'}
                    className="status-badge"
                  >
                    {project.status}
                  </Badge>
                </div>
              </div>
              <p className="text-muted">{project.description}</p>
              <small className="text-muted">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="mb-4">Themes ({themes.length})</h2>
          {themes.length === 0 ? (
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No themes available for this project.</p>
              </Card.Body>
            </Card>
          ) : (
            <ListGroup>
              {themes.map((theme) => (
                <ListGroup.Item
                  key={theme._id}
                  action
                  onClick={() => navigate(`/themes/${theme._id}`)}
                  className="d-flex justify-content-between align-items-start"
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">{theme.name}</div>
                    <small className="text-muted">{theme.description}</small>
                  </div>
                  <Badge bg="primary" pill>
                    View Details →
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetails;

