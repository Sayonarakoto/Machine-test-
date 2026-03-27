import axios from 'axios';

const API_BASE_URL = 'https://localhost:7236/api';

const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { username, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  getToken: () => {
    const user = authService.getCurrentUser();
    return user?.token;
  }
};

export default authService;
