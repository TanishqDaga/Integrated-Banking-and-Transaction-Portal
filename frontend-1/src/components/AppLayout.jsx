import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { FloatingActionButton, BackToTop } from './FloatingWidgets';
import './AppLayout.css';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar
        onToggleSidebar={() => {
          if (window.innerWidth <= 900) {
            setMobileOpen((v) => !v);
          } else {
            setCollapsed((v) => !v);
          }
        }}
      />
      <div className="app-body">
        <Sidebar collapsed={collapsed} open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="app-main">
          <Outlet />
          <Footer />
        </main>
      </div>
      <FloatingActionButton />
      <BackToTop />
    </div>
  );
}
