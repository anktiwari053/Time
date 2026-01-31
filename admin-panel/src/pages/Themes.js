import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, ListGroup } from 'react-bootstrap';
import api from '../services/api';

function Themes() {
  const [themes, setThemes] = useState([]);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [themeHead, setThemeHead] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [themesRes, membersRes, projectsRes] = await Promise.all([
          api.get('/themes'),
          api.get('/team'),
          api.get('/projects')
        ]);
        setThemes(themesRes.data.data || themesRes.data);
        const membersData = membersRes.data.data || membersRes.data;
        setMembers(Array.isArray(membersData) ? membersData : []);
        const projectsData = projectsRes.data.data || projectsRes.data;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      const data = { name, description, project: selectedProject || null };
      const res = await api.post('/themes', data);
      const created = res.data.data || res.data;
      setThemes(prev => [created, ...prev]);
      setShowCreate(false);
      resetCreateForm();
    } catch (err) {
      console.error('Error creating theme:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  const resetCreateForm = () => {
    setName('');
    setDescription('');
    setSelectedProject('');
  };

  const handleAddMembers = async () => {
    try {
      const data = { memberIds: selectedMembers };
      const res = await api.put(`/themes/${selectedTheme._id}/members`, data);
      const updated = res.data.data || res.data;
      setThemes(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelectedMembers([]);
      setShowManage(false);
    } catch (err) {
      console.error('Error adding members:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Add members failed');
    }
  };

  const handleAssignThemeHead = async () => {
    try {
      const data = { memberId: themeHead || null };
      const res = await api.put(`/themes/${selectedTheme._id}/theme-head`, data);
      const updated = res.data.data || res.data;
      setThemes(prev => prev.map(t => t._id === updated._id ? updated : t));
      setThemeHead('');
      setShowManage(false);
    } catch (err) {
      console.error('Error assigning theme head:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Assign theme head failed');
    }
  };

  const openManageModal = (theme) => {
    setSelectedTheme(theme);
    setSelectedMembers([]);
    setThemeHead(theme.themeHead?._id || '');
    setShowManage(true);
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Themes</h1>
        <Button variant="primary" onClick={() => setShowCreate(true)}>Create Theme</Button>
      </div>
      
      <Row>
        {themes.length === 0 ? (
          <Col>
            <p className="text-center text-muted">No themes found</p>
          </Col>
        ) : (
          themes.map(theme => (
            <Col md={6} lg={4} key={theme._id} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{theme.name}</Card.Title>
                  <Card.Text>{theme.description}</Card.Text>
                  <div className="mb-2">
                    <strong>Members:</strong> {theme.members?.length || 0}
                  </div>
                  <div className="mb-3">
                    <strong>Theme Head:</strong>{' '}
                    {theme.themeHead ? (
                      <Badge bg="success">{theme.themeHead.name}</Badge>
                    ) : (
                      <Badge bg="secondary">Not assigned</Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline-primary" onClick={() => openManageModal(theme)}>
                    Manage
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Create Theme Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Theme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Theme Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter theme name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter theme description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Assign to Project (Optional)</Form.Label>
              <Form.Select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate}>Create</Button>
        </Modal.Footer>
      </Modal>

      {/* Manage Theme Modal */}
      <Modal show={showManage} onHide={() => setShowManage(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Theme: {selectedTheme?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h5>Add Members</h5>
              <ListGroup className="mb-3">
                {members.map(member => {
                  const isAlreadyMember = selectedTheme?.members?.some(m => m._id === member._id);
                  return (
                    <ListGroup.Item key={member._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{member.name}</strong> <small className="text-muted">({member.role})</small>
                      </div>
                      {!isAlreadyMember && (
                        <Form.Check
                          type="checkbox"
                          checked={selectedMembers.includes(member._id)}
                          onChange={() => handleMemberToggle(member._id)}
                        />
                      )}
                      {isAlreadyMember && <Badge bg="info">Already Member</Badge>}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              <Button variant="success" onClick={handleAddMembers} disabled={selectedMembers.length === 0}>
                Add Selected Members
              </Button>
            </Col>
            <Col md={6}>
              <h5>Assign Theme Head</h5>
              <Form.Group className="mb-3">
                <Form.Label>Select Theme Head</Form.Label>
                <Form.Select value={themeHead} onChange={e => setThemeHead(e.target.value)}>
                  <option value="">No Theme Head</option>
                  {selectedTheme?.members?.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button variant="warning" onClick={handleAssignThemeHead}>
                Update Theme Head
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowManage(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Themes;
