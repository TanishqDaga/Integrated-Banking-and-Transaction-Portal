import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/common.css';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import CreateAccount from './pages/CreateAccount';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transfer from './pages/Transfer';
import Transactions from './pages/Transactions';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAccounts from './pages/AdminAccounts';
import AdminTransactions from './pages/AdminTransactions';
import PendingRequests from './pages/PendingRequests';
import Banks from './pages/Banks';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/new" element={<CreateAccount />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/transactions" element={<Transactions />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute adminOnly>
              <AdminAccounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute adminOnly>
              <AdminTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending-requests"
          element={
            <ProtectedRoute adminOnly>
              <PendingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banks"
          element={
            <ProtectedRoute adminOnly>
              <Banks />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
