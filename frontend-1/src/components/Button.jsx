import React, { useState, useRef } from 'react';
import '../styles/buttons.css';

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size,
  block,
  loading = false,
  children,
  className = '',
  onClick,
  disabled,
  ...rest
}) {
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);

  function handleClick(e) {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dim = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - dim / 2;
      const y = e.clientY - rect.top - dim / 2;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x, y, dim }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
    }
    onClick?.(e);
  }

  const classes = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', block ? 'btn-block' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component ref={btnRef} className={classes} onClick={handleClick} disabled={disabled || loading} {...rest}>
      {loading ? 'Please wait…' : children}
      {ripples.map((r) => (
        <span key={r.id} className="ripple" style={{ left: r.x, top: r.y, width: r.dim, height: r.dim }} />
      ))}
    </Component>
  );
}
