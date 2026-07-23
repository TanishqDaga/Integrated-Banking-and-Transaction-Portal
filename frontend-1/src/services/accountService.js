import api from '../api/axiosInstance';

export async function getAllAccounts() {
  const { data } = await api.get('/accounts/getAllAccounts');
  return data;
}

export async function getMyAccounts() {
  const { data } = await api.get('/accounts/my-accounts');
  return data;
}

export async function addAccount(payload) {
  const { data } = await api.post('/accounts/addAccount', payload);
  return data;
}

export async function deleteAccount(id) {
  const { data } = await api.delete(`/accounts/deleteAccount/${id}`);
  return data;
}

export async function depositToAccount(id, amount) {
  const { data } = await api.post(`/accounts/deposit/${id}`, { amount });
  return data;
}

export async function withdrawFromAccount(id, amount) {
  const { data } = await api.post(`/accounts/withdraw/${id}`, { amount });
  return data;
}

export async function getBanks() {
  const { data } = await api.get('/accounts/banks');
  return data;
}

// Primary transfer endpoint
export async function transferFunds({ sourceAccountId, targetAccountId, amount }) {
  const { data } = await api.post('/accounts/transfer', { sourceAccountId, targetAccountId, amount });
  return data;
}

// Alternate path-param transfer endpoint (used as fallback)
export async function transferFundsByIds(fromId, toId, amount) {
  const { data } = await api.post(`/accounts/transferFund/${fromId}/${toId}`, { amount });
  return data;
}
