import axios from 'axios';

// Resolve backend API URL from Vite environment variables or default fallback dynamically
const getApiBaseUrl = () => {
  if ((import.meta as any).env.VITE_API_BASE_URL) {
    return (import.meta as any).env.VITE_API_BASE_URL;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:5001/api`;
};

const BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial to send/receive HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional simple interceptor for structured error logging/handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize backend error responses if present
    const backendMessage = error.response?.data?.message || 'An unexpected error occurred.';
    const status = error.response?.status;

    const parsedError = {
      message: backendMessage,
      status,
      originalError: error,
    };

    return Promise.reject(parsedError);
  }
);
