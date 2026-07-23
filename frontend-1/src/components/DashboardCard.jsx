import React from 'react';
import './DashboardCard.css';

export default function DashboardCard({ label, value, icon, tone = 'primary', delay = 0, sub }) {
  return (
    <div className={`stat-card stat-${tone} slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value mono">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
}
