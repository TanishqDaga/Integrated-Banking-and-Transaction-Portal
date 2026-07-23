import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

function buildBasicAuth(username, password) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

// Attach HTTP Basic credentials (if present) to every request
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('nimbus_auth');
    if (raw) {
      try {
        const { username, password } = JSON.parse(raw);
        if (username && password) {
          config.headers.Authorization = buildBasicAuth(username, password);
        }
      } catch {
        // ignore malformed storage
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize errors + handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.friendlyMessage = 'Network error — please check your connection or that the server is running.';
    } else {
      const status = error.response.status;
      if (status === 401) {
        error.friendlyMessage = 'Your session has expired. Please log in again.';
        localStorage.removeItem('nimbus_auth');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        error.friendlyMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        error.friendlyMessage = 'The requested resource was not found.';
      } else if (status >= 500) {
        error.friendlyMessage = 'Something went wrong on our end. Please try again shortly.';
      } else {
        error.friendlyMessage =
          error.response.data?.message || error.response.data?.error || 'Something went wrong. Please try again.';
      }
    }
    return Promise.reject(error);
  }
);

export { buildBasicAuth };
export default api;
