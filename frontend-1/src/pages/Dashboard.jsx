import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getMyAccounts } from '../services/accountService';
import { getMyTransactions } from '../services/transactionService';
import DashboardCard from '../components/DashboardCard';
import TransactionTable from '../components/TransactionTable';
import Loader, { SkeletonRow } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: accounts, loading: accountsLoading, error: accountsError } = useFetch(getMyAccounts, []);
  const { data: transactions, loading: txLoading } = useFetch(getMyTransactions, []);

  const accountsList = accounts || [];
  const totalBalance = accountsList.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const recentTx = (transactions || []).slice(0, 5);
  const fundedAccounts = accountsList.filter((a) => Number(a.balance) > 0).length;

  const quickActions = [
    { to: '/deposit', label: 'Deposit', icon: '↓', tone: 'success' },
    { to: '/withdraw', label: 'Withdraw', icon: '↑', tone: 'warning' },
    { to: '/transfer', label: 'Transfer', icon: '⇄', tone: 'primary' },
    { to: '/accounts/new', label: 'Create Account', icon: '+', tone: 'error' }
  ];

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.username} 👋</h1>
          <p>Here&apos;s what&apos;s happening with your money today.</p>
        </div>
      </div>

      {accountsLoading ? (
        <div className="grid grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card card-pad">
              <SkeletonRow width="60%" height={12} />
              <SkeletonRow width="80%" height={24} />
            </div>
          ))}
        </div>
      ) : accountsError ? (
        <EmptyState icon="!" title="Couldn't load your accounts" message={accountsError} />
      ) : (
        <div className="grid grid-4">
          <DashboardCard label="Total Balance" value={formatCurrency(totalBalance)} icon="$" tone="primary" delay={0} />
          <DashboardCard label="Total Accounts" value={accountsList.length} icon="▤" tone="success" delay={60} />
          <DashboardCard label="Funded Accounts" value={fundedAccounts} icon="✓" tone="success" delay={120} />
          <DashboardCard
            label="Total Transactions"
            value={(transactions || []).length}
            icon="≡"
            tone="warning"
            delay={180}
          />
        </div>
      )}

      <div className="dashboard-quick-actions">
        <p className="section-title">Quick actions</p>
        <div className="grid grid-4">
          {quickActions.map((a, i) => (
            <Link key={a.to} to={a.to} className={`quick-action quick-${a.tone} slide-up`} style={{ animationDelay: `${i * 60}ms` }}>
              <span className="quick-action-icon">{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="dashboard-recent card">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="toolbar" style={{ justifyContent: 'space-between' }}>
            <p className="section-title" style={{ marginBottom: 0 }}>
              Recent activity
            </p>
            <Link to="/transactions" className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
        </div>
        <div className="card-pad" style={{ paddingTop: 12 }}>
          {txLoading ? <Loader label="Loading transactions…" /> : <TransactionTable transactions={recentTx} />}
        </div>
      </div>
    </div>
  );
}
