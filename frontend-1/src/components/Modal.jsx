import React, { useEffect } from 'react';
import './Modal.css';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="nimbus-modal-overlay fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`nimbus-modal nimbus-modal-${size} slide-up`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="nimbus-modal-header">
          <h3>{title}</h3>
          <button className="nimbus-modal-close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="nimbus-modal-body">{children}</div>
        {footer && <div className="nimbus-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
