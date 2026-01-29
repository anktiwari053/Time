import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getTeamMembers } from '../services/api';

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await getTeamMembers();
      setTeamMembers(response.data.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
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
          <h1>Team Members</h1>
          <p className="text-muted">View all team members and their work details</p>
        </Col>
      </Row>

      <Row>
        <Col>
          {teamMembers.length === 0 ? (
            <Card>
              <Card.Body className="text-center">
                <p className="text-muted">No team members available yet.</p>
              </Card.Body>
            </Card>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Theme</th>
                  <th>Project</th>
                  <th>Work Details</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      {member.image ? (
                        <img src={`http://localhost:5000${member.image}`} alt={member.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.role}</td>
                    <td>
                      {member.theme ? (
                        <span
                          style={{ cursor: 'pointer', color: '#0d6efd' }}
                          onClick={() => navigate(`/themes/${member.theme._id}`)}
                        >
                          {member.theme.name}
                        </span>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      {member.theme ? (
                        <>
                          <Badge bg="info">
                            {member.theme.project?.name || 'N/A'}
                          </Badge>
                          {member.theme.project?.status && (
                            <Badge 
                              bg={member.theme.project.status === 'completed' ? 'success' : 'warning'}
                              className="ms-2"
                            >
                              {member.theme.project.status}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
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

export default TeamMembers;

