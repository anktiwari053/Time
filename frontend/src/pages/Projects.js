import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.status === filter));
    }
  }, [filter, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      setProjects(response.data.data);
      setFilteredProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
          <h1>All Projects</h1>
          <p className="text-muted">Browse through all our projects</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <ButtonGroup>
            <Button
              variant={filter === 'all' ? 'primary' : 'outline-primary'}
              onClick={() => setFilter('all')}
            >
              All ({projects.length})
            </Button>
            <Button
              variant={filter === 'ongoing' ? 'warning' : 'outline-warning'}
              onClick={() => setFilter('ongoing')}
            >
              Ongoing ({projects.filter(p => p.status === 'ongoing').length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'success' : 'outline-success'}
              onClick={() => setFilter('completed')}
            >
              Completed ({projects.filter(p => p.status === 'completed').length})
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      <Row>
        {filteredProjects.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No projects found.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredProjects.map((project) => (
            <Col md={6} lg={4} key={project._id} className="mb-4">
              <Card 
                className="project-card h-100"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                {project.image && (
                  <Card.Img variant="top" src={`https://tema-k7af.onrender.com${project.image}`} alt={project.name} style={{ height: '200px', objectFit: 'cover' }} />
                )}
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title>{project.name}</Card.Title>
                    <Badge 
                      bg={project.status === 'completed' ? 'success' : 'warning'}
                      className="status-badge"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <Card.Text className="text-muted">
                    {project.description}
                  </Card.Text>
                  <small className="text-muted">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
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

export default Projects;

