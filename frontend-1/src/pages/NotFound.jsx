import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found fade-in">
      <p className="not-found-code mono">404</p>
      <h1>This page took a wrong turn.</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link to="/dashboard" className="btn btn-primary btn-lg">
        Back to Dashboard
      </Link>
    </div>
  );
}
