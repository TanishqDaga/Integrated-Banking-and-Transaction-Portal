import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingWidgets.css';

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { label: 'Deposit', icon: '↓', to: '/deposit' },
    { label: 'Withdraw', icon: '↑', to: '/withdraw' },
    { label: 'Transfer', icon: '⇄', to: '/transfer' }
  ];

  return (
    <div className={`fab-wrap ${open ? 'open' : ''}`}>
      {open && (
        <div className="fab-menu slide-up">
          {actions.map((a) => (
            <button key={a.to} className="fab-menu-item" onClick={() => { navigate(a.to); setOpen(false); }}>
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>
      )}
      <button className="fab-main" onClick={() => setOpen((v) => !v)} aria-label="Quick actions">
        {open ? '×' : '+'}
      </button>
    </div>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button className="back-to-top fade-in" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
      ↑
    </button>
  );
}
