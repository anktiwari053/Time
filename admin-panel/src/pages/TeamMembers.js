import React, { useEffect, useState } from 'react';
import { Container, Button, Table } from 'react-bootstrap';
import api from '../services/api';

function TeamMembers() {
  const [members, setMembers] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [workDetail, setWorkDetail] = useState('');
  const [theme, setTheme] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, themesRes] = await Promise.all([
          api.get('/team'),
          api.get('/themes')
        ]);
        setMembers(membersRes.data.data || membersRes.data);
        const themesData = themesRes.data.data || themesRes.data;
        setThemes(Array.isArray(themesData) ? themesData : []);
        if (themesData && themesData.length > 0) {
          setTheme(themesData[0]._id);
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
      formData.append('role', role);
      formData.append('workDetail', workDetail);
      formData.append('theme', theme);
      if (image) {
        formData.append('image', image);
      }

      const res = await api.post('/team', formData);
      const created = res.data.data || res.data;
      setMembers(prev => [created, ...prev]);
      setShow(false);
      setName('');
      setRole('');
      setWorkDetail('');
      setImage(null);
      if (themes.length > 0) setTheme(themes[0]._id);
    } catch (err) {
      console.error('Error creating team member:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Team Members</h1>
        <Button variant="primary" onClick={() => setShow(true)}>Add Member</Button>
      </div>
      
      {members.length === 0 ? (
        <p className="text-center text-muted">No team members found</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Role</th>
              <th>Work Detail</th>
              <th>Theme</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member._id}>
                <td>
                  {member.image ? (
                    <img src={`http://localhost:5000${member.image}`} alt={member.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <span className="text-muted">No image</span>
                  )}
                </td>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{member.workDetail}</td>
                <td>{member.theme?.name || 'N/A'}</td>
                <td>
                  <Button size="sm" variant="outline-primary">Edit</Button>{' '}
                  <Button size="sm" variant="outline-danger">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {/* Create Modal */}
      {show && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Team Member</h5>
                <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <input className="form-control" value={role} onChange={e => setRole(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Work Detail</label>
                  <textarea className="form-control" value={workDetail} onChange={e => setWorkDetail(e.target.value)} rows="3"></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Theme</label>
                  <select className="form-select" value={theme} onChange={e => setTheme(e.target.value)}>
                    <option value="">Select a theme</option>
                    {themes.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Image (Photo)</label>
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

export default TeamMembers;
