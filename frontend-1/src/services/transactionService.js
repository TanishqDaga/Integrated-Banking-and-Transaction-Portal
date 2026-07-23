import api from '../api/axiosInstance';

export async function getMyTransactions() {
  const { data } = await api.get('/transactions/my');
  return data;
}
