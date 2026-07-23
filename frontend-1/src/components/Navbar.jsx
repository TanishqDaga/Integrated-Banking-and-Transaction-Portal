import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { initials } from '../utils/formatters';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-burger" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <span />
          <span />
          <span />
        </button>
        <NavLink to="/dashboard" className="navbar-logo">
          <span className="navbar-logo-mark">N</span>
          <span className="navbar-logo-text">Integrated Banking</span>
        </NavLink>
      </div>

      <nav className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/accounts" className={({ isActive }) => (isActive ? 'active' : '')}>
          Accounts
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => (isActive ? 'active' : '')}>
          Transactions
        </NavLink>
        <NavLink to="/transfer" className={({ isActive }) => (isActive ? 'active' : '')}>
          Transfer
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            Admin
          </NavLink>
        )}
      </nav>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="navbar-profile" ref={menuRef}>
          <button className="navbar-avatar" onClick={() => setProfileOpen((v) => !v)}>
            {initials(user?.name || user?.username)}
          </button>
          {profileOpen && (
            <div className="navbar-profile-menu slide-up">
              <div className="navbar-profile-header">
                <p className="navbar-profile-name">{user?.name || user?.username}</p>
                <p className="navbar-profile-email">{user?.email || `@${user?.username}`}</p>
              </div>
              <hr className="divider" />
              <button className="navbar-profile-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
