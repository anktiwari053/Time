import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import api from '../services/api';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ongoing');
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('status', status);
      if (image) {
        formData.append('image', image);
      }

      const res = await api.post('/projects', formData);
      const created = res.data.data || res.data;
      setProjects(prev => [created, ...prev]);
      setShow(false);
      setName('');
      setDescription('');
      setStatus('ongoing');
      setImage(null);
    } catch (err) {
      console.error('Error creating project:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  const openEdit = (project) => {
    setEditingId(project._id);
    setName(project.name || '');
    setDescription(project.description || '');
    setStatus(project.status || 'ongoing');
    setImage(null);
    setShow(true);
  };

  const handleSave = async () => {
    if (!editingId) {
      return handleCreate();
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('status', status);
      if (image) formData.append('image', image);

      const res = await api.put(`/projects/${editingId}`, formData);
      const updated = res.data.data || res.data;
      setProjects(prev => prev.map(p => (p._id === editingId ? updated : p)));
      // reset
      setEditingId(null);
      setShow(false);
      setName('');
      setDescription('');
      setStatus('ongoing');
      setImage(null);
    } catch (err) {
      console.error('Error updating project:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This will remove related themes and cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting project:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Projects</h1>
        <Button variant="primary" onClick={() => setShow(true)}>Add Project</Button>
      </div>
      
      <Row>
        {projects.length === 0 ? (
          <Col>
            <p className="text-center text-muted">No projects found</p>
          </Col>
        ) : (
          projects.map(project => (
            <Col md={6} lg={4} key={project._id} className="mb-3">
              <Card>
                {project.image && (
                  <Card.Img variant="top" src={`http://localhost:5000${project.image}`} alt={project.name} style={{ height: '200px', objectFit: 'cover' }} />
                )}
                <Card.Body>
                  <Card.Title>{project.name}</Card.Title>
                  <Card.Text>{project.description}</Card.Text>
                  <div className="d-flex">
                    <Button variant="outline-primary" className="me-2">View Details</Button>
                    <Button variant="outline-secondary" className="me-2" onClick={() => openEdit(project)}>Edit</Button>
                    <Button variant="outline-danger" onClick={() => handleDelete(project._id)}>Delete</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
      {/* Create Modal (simple implementation) */}
      {show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Project</h5>
                <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Image</label>
                  <input type="file" className="form-control" accept="image/*" onChange={e => setImage(e.target.files[0])} />
                </div>
              </div>
                <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShow(false); setEditingId(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>{editingId ? 'Save' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Projects;
