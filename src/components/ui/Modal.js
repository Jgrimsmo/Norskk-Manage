import React from 'react';
import './Modal.css';

export default function Modal({ 
  show, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  actions
}) {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-container modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          {showCloseButton && (
            <button className="modal-close" onClick={onClose} aria-label="Close modal">
              ×
            </button>
          )}
        </div>
        
        <div className="modal-content">
          {children}
        </div>
        
        {actions && (
          <div className="modal-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
