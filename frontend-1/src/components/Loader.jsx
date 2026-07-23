import React from 'react';
import './Loader.css';

export default function Loader({ size = 'md', label = 'Loading…', fullPage = false }) {
  const spinner = (
    <div className={`nimbus-loader nimbus-loader-${size}`} role="status" aria-label={label}>
      <span className="nimbus-loader-ring" />
    </div>
  );

  if (fullPage) {
    return (
      <div className="nimbus-loader-fullpage fade-in">
        {spinner}
        <p className="nimbus-loader-label">{label}</p>
      </div>
    );
  }

  return spinner;
}

export function SkeletonRow({ width = '100%', height = 16 }) {
  return <div className="skeleton" style={{ width, height, marginBottom: 8 }} />;
}
