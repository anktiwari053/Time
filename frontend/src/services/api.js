import axios from 'axios';

const API_URL =  "https://tema-k7af.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT from localStorage to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Projects
export const getProjects = (status) => api.get(`/projects${status ? `?status=${status}` : ''}`);
export const getProject = (id) => api.get(`/projects/${id}`);
export const getProjectWithThemes = (id) => api.get(`/projects/${id}/themes`);

// Themes
export const getThemes = (projectId) => api.get(`/themes${projectId ? `?project=${projectId}` : ''}`);
export const getTheme = (id) => api.get(`/themes/${id}`);
export const getThemeWithTeam = (id) => api.get(`/themes/${id}/team`);

// Team Members
export const getTeamMembers = (themeId) => api.get(`/team${themeId ? `?theme=${themeId}` : ''}`);
export const getTeamMember = (id) => api.get(`/team/${id}`);

// Auth
export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');

export default api;
