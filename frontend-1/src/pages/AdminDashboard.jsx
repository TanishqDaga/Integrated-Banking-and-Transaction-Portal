import React from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getAllUsers, getAdminAccounts, getAdminTransactions, getPendingAccountRequests, getBanks } from '../services/adminService';
import DashboardCard from '../components/DashboardCard';
import Loader from '../components/Loader';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const users = useFetch(getAllUsers, []);
  const accounts = useFetch(getAdminAccounts, []);
  const transactions = useFetch(getAdminTransactions, []);
  const pending = useFetch(getPendingAccountRequests, []);
  const banks = useFetch(getBanks, []);

  const anyLoading = users.loading || accounts.loading || transactions.loading || pending.loading || banks.loading;

  const cards = [
    { label: 'Total Users', value: users.data?.length ?? 0, icon: '👤', tone: 'primary', to: '/admin/users' },
    { label: 'Total Accounts', value: accounts.data?.length ?? 0, icon: '▤', tone: 'success', to: '/admin/accounts' },
    { label: 'Total Transactions', value: transactions.data?.length ?? 0, icon: '≡', tone: 'warning', to: '/admin/transactions' },
    { label: 'Pending Requests', value: pending.data?.length ?? 0, icon: '⏳', tone: 'error', to: '/admin/pending-requests' },
    { label: 'Registered Banks', value: banks.data?.length ?? 0, icon: '🏦', tone: 'primary', to: '/admin/banks' }
  ];

  const maxTxByType = React.useMemo(() => {
    const counts = {};
    (transactions.data || []).forEach((tx) => {
      const type = (tx.type || tx.transactionType || 'OTHER').toUpperCase();
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [transactions.data]);

  const maxCount = Math.max(1, ...Object.values(maxTxByType));

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Admin Overview</h1>
          <p>A bird&apos;s-eye view of the entire banking platform.</p>
        </div>
      </div>

      {anyLoading ? (
        <Loader fullPage label="Loading admin data…" />
      ) : (
        <>
          <div className="grid grid-4">
            {cards.map((c, i) => (
              <Link key={c.label} to={c.to} className="admin-stat-link">
                <DashboardCard label={c.label} value={c.value} icon={c.icon} tone={c.tone} delay={i * 60} />
              </Link>
            ))}
          </div>

          {Object.keys(maxTxByType).length > 0 && (
            <div className="card card-pad admin-chart-card">
              <p className="section-title">Transactions by type</p>
              <div className="bar-chart">
                {Object.entries(maxTxByType).map(([type, count]) => (
                  <div key={type} className="bar-row">
                    <span className="bar-label">{type}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                    <span className="bar-count mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
