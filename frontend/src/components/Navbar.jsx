import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Don't show navbar if user is not logged in

  return (
    <header className="app-header">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/dashboard" className="logo">
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Avidus</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '400', color: 'var(--text-secondary)' }}>Task & Role Portal</span>
          </Link>
          
          <nav className="nav-links">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              My Tasks
            </NavLink>
            
            {/* Show admin menu only for admins */}
            {user.role === 'Admin' && (
              <NavLink 
                to="/admin-dashboard" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Admin Control Panel
              </NavLink>
            )}
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.75rem' }}>
              <span className="log-user" style={{ fontSize: '0.875rem' }}>{user.email}</span>
              <span className={`badge ${user.role === 'Admin' ? 'badge-admin' : 'badge-user'}`} style={{ marginTop: '2px' }}>
                {user.role}
              </span>
            </div>
            
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
