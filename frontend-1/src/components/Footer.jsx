import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} Made by Tanishq Daga. All rights reserved.</p>
      <div className="app-footer-links">
        <a href="#!">Privacy</a>
        <a href="#!">Terms</a>
        <a href="#!">Support</a>
      </div>
    </footer>
  );
}
