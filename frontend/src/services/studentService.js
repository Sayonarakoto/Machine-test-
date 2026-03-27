import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'https://localhost:7236/api/students';

const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const studentService = {
  getAll: async (query = '') => {
    const response = await axios.get(`${API_BASE_URL}?query=${query}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  create: async (studentData) => {
    const response = await axios.post(API_BASE_URL, studentData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id, studentData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, studentData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export default studentService;
