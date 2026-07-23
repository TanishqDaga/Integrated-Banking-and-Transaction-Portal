import React from 'react';
import './SearchBox.css';

export default function SearchBox({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-box">
      <span className="search-icon">⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}
