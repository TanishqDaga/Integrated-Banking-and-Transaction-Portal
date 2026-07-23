import api from '../api/axiosInstance';

export async function getAllUsers() {
  const { data } = await api.get('/admin/users');
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/user/${id}`);
  return data;
}

export async function getAdminAccounts() {
  const { data } = await api.get('/admin/accounts');
  return data;
}

export async function getPendingAccountRequests() {
  const { data } = await api.get('/admin/account-requests');
  return data;
}

export async function approveAccount(id) {
  const { data } = await api.put(`/admin/approve-account/${id}`);
  return data;
}

export async function getAdminTransactions() {
  const { data } = await api.get('/admin/transactions');
  return data;
}

export async function getBanks() {
  const { data } = await api.get('/admin/banks');
  return data;
}

export async function createBank(payload) {
  const { data } = await api.post('/admin/banks', payload);
  return data;
}
