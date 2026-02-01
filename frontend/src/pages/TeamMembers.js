import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { getTeamMembers } from '../services/api';

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await getTeamMembers();
      setTeamMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
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

      {teamMembers.length === 0 ? (
        <Row>
          <Col>
            <div style={{
              background: '#fff',
              padding: '30px',
              textAlign: 'center',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
            }}>
              <p className="text-muted">No team members available yet.</p>
            </div>
          </Col>
        </Row>
      ) : (
        <Row style={{ gap: '20px' }}>
          {teamMembers.map(member => (
            <Col key={member._id} xs={12} sm={6} md={4} lg={3}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
              }}
              >
                {member.image ? (
                  <img
                    src={`https://tema-k7af.onrender.com${member.image}`}
                    alt={member.name}
                    style={{
                      width: '100px',
                      height: '150px',
                     
                      objectFit: 'cover',
                      marginBottom: '15px',
                      border: '3px solid #007bff',
                      transition: 'transform 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: '#ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: '#666',
                    margin: '0 auto 15px'
                  }}>No Image</div>
                )}
                <h3 style={{ margin: '12px 0 8px', color: '#222', fontSize: '1.2rem' }}>{member.name}</h3>
                <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '15px', marginBottom: '5px' }}>{member.role}</div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{member.workDetail}</div>
                {/* Optional Actions */}
                {/* <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button size="sm" variant="outline-primary">Edit</Button>
                  <Button size="sm" variant="outline-danger">Delete</Button>
                </div> */}
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TeamMembers;
