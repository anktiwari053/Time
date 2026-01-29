import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    teams: 0,
    themes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, teamsRes, themesRes] = await Promise.all([
          api.get('/api/projects'),
          api.get('/api/team'),
          api.get('/api/themes')
        ]);
        
        setStats({
          projects: projectsRes.data.length || 0,
          teams: teamsRes.data.length || 0,
          themes: themesRes.data.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-5">
      <h1>Dashboard</h1>
      <Row className="mt-4">
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Projects</Card.Title>
              <Card.Text className="h3">{stats.projects}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Team Members</Card.Title>
              <Card.Text className="h3">{stats.teams}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Themes</Card.Title>
              <Card.Text className="h3">{stats.themes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
