import React from 'react';
import './EmptyState.css';

export default function EmptyState({ icon = '□', title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
