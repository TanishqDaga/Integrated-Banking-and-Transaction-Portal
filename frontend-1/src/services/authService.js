import api, { buildBasicAuth } from '../api/axiosInstance';

export async function loginRequest(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  if (data !== 'Login Successful') {
    const err = new Error(data || 'Login failed');
    if (data === 'Invalid Password' || data === 'User not found') {
      err.friendlyMessage = 'Invalid username or password.';
    } else {
      err.friendlyMessage = typeof data === 'string' ? data : 'Login failed. Please try again.';
    }
    throw err;
  }
  return { username, password };
}

export async function probeRole(username, password) {
  try {
    await api.get('/admin/users', {
      headers: { Authorization: buildBasicAuth(username, password) }
    });
    return 'ADMIN';
  } catch (e) {
    if (e.response?.status === 403) return 'CUSTOMER';
    throw e;
  }
}

export async function registerRequest({ username, password }) {
  const { data } = await api.post('/auth/register', { username, password });
  return data;
}
