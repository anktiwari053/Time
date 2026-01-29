import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import api from '../services/api';

function Themes() {
  const [themes, setThemes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [project, setProject] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [themesRes, projectsRes] = await Promise.all([
          api.get('/themes'),
          api.get('/projects')
        ]);
        setThemes(themesRes.data.data || themesRes.data);
        const projectsData = projectsRes.data.data || projectsRes.data;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        if (projectsData && projectsData.length > 0) {
          setProject(projectsData[0]._id);
        }
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
      const formData = new FormData();
      formData.append('name', name);
        formData.append('description', description);
      formData.append('primaryColor', primaryColor);
      formData.append('secondaryColor', secondaryColor);
      formData.append('project', project);
      if (image) {
        formData.append('image', image);
      }

      const res = await api.post('/themes', formData);
      const created = res.data.data || res.data;
      setThemes(prev => [created, ...prev]);
      setShow(false);
      setName('');
      setDescription('');
      setPrimaryColor('#000000');
      setSecondaryColor('#FFFFFF');
      setImage(null);
      if (projects.length > 0) setProject(projects[0]._id);
    } catch (err) {
      console.error('Error creating theme:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Themes</h1>
        <Button variant="primary" onClick={() => setShow(true)}>Add Theme</Button>
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
                {theme.image && (
                  <Card.Img variant="top" src={`http://localhost:5000${theme.image}`} alt={theme.name} style={{ height: '200px', objectFit: 'cover' }} />
                )}
                <Card.Body>
                  <Card.Title>{theme.name}</Card.Title>
                  <Card.Text>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: theme.primaryColor,
                      marginRight: '10px'
                    }}></span>
                    Primary: {theme.primaryColor}
                  </Card.Text>
                  <Button variant="outline-primary">View Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
      {/* Create Modal */}
      {show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Theme</h5>
                <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Project</label>
                  <select className="form-select" value={project} onChange={e => setProject(e.target.value)}>
                    <option value="">Select a project</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Primary Color</label>
                  <input type="color" className="form-control form-control-color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Secondary Color</label>
                  <input type="color" className="form-control form-control-color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Image</label>
                  <input type="file" className="form-control" accept="image/*" onChange={e => setImage(e.target.files[0])} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Themes;
