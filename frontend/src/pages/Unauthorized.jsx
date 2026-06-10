import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '2px dashed var(--danger-color)', 
          color: 'var(--danger-color)',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem'
        }}>
          !
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#000000' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          You do not have the required permissions to view this dashboard page. Only Admin users can access this resource.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="btn btn-primary">
            Go to My Tasks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
