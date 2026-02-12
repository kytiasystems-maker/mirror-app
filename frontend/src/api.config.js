// API Configuration - works for both web and mobile
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const API_ENDPOINTS = {
  MOOD: `${API_BASE_URL}/mood`,
  EMAIL: `${API_BASE_URL}/email`,
  INSIGHTS: `${API_BASE_URL}/insights`,
  HEALTH: `${API_BASE_URL}/health`
};

export default API_BASE_URL;
