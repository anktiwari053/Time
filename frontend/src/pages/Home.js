import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/api';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, ongoing: 0, completed: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      const allProjects = response.data.data;
      setProjects(allProjects.slice(0, 6)); // Show latest 6 projects
      
      setStats({
        total: allProjects.length,
        ongoing: allProjects.filter(p => p.status === 'ongoing').length,
        completed: allProjects.filter(p => p.status === 'completed').length
      });
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
      <Row className="mb-5">
        <Col>
          <h1 className="text-center mb-4">Welcome to Project Management System</h1>
          <p className="text-center text-muted">
            Explore our projects, themes, and team members
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Projects</Card.Title>
              <h2>{stats.total}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Ongoing Projects</Card.Title>
              <h2 className="text-warning">{stats.ongoing}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Completed Projects</Card.Title>
              <h2 className="text-success">{stats.completed}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="mb-4">Latest Projects</h2>
        </Col>
      </Row>

      <Row>
        {projects.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No projects available yet.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          projects.map((project) => (
            <Col md={6} lg={4} key={project._id} className="mb-4">
              <Card 
                className="project-card h-100"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
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
                    {project.description.length > 100 
                      ? `${project.description.substring(0, 100)}...` 
                      : project.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {projects.length > 0 && (
        <Row className="mt-4">
          <Col className="text-center">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/projects')}
            >
              View All Projects
            </button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;

