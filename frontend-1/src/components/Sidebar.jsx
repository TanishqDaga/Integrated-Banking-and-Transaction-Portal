import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const icons = {
  dashboard: '⌂',
  accounts: '▤',
  create: '+',
  deposit: '↓',
  withdraw: '↑',
  transfer: '⇄',
  transactions: '≡',
  admin: '⚙',
  banks: '🏦'
};

export default function Sidebar({ collapsed, open, onClose }) {
  const { isAdmin } = useAuth();

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { to: '/accounts', label: 'Accounts', icon: icons.accounts },
    { to: '/accounts/new', label: 'Create Account', icon: icons.create },
    { to: '/deposit', label: 'Deposit', icon: icons.deposit },
    { to: '/withdraw', label: 'Withdraw', icon: icons.withdraw },
    { to: '/transfer', label: 'Transfer', icon: icons.transfer },
    { to: '/transactions', label: 'Transactions', icon: icons.transactions }
  ];

  const adminItems = [
    { to: '/admin', label: 'Admin Overview', icon: icons.admin },
    { to: '/admin/users', label: 'Users', icon: '👤' },
    { to: '/admin/accounts', label: 'All Accounts', icon: icons.accounts },
    { to: '/admin/transactions', label: 'All Transactions', icon: icons.transactions },
    { to: '/admin/pending-requests', label: 'Pending Requests', icon: '⏳' },
    { to: '/admin/banks', label: 'Banks', icon: icons.banks }
  ];

  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
        <div className="sidebar-section-label">{!collapsed && 'Menu'}</div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/accounts'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <>
            <div className="sidebar-section-label">{!collapsed && 'Administration'}</div>
            <nav className="sidebar-nav">
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  title={item.label}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {!collapsed && <span className="sidebar-label">{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </>
        )}
      </aside>
    </>
  );
}
