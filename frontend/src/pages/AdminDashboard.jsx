import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Tab control - defaults directly to User Management for rapid utility
  const [activeTab, setActiveTab] = useState('users');

  // Page States
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true); // Prevent spinner flash on tab switches
  const [error, setError] = useState('');

  // Fetch Metrics
  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) setMetrics(data.metrics);
    } catch (err) {
      console.error('Metrics fetch error:', err);
    }
  };

  // Fetch All Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error('Users fetch error:', err);
    }
  };

  // Fetch All Tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (err) {
      console.error('Tasks fetch error:', err);
    }
  };

  // Fetch Activity Logs
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (err) {
      console.error('Logs fetch error:', err);
    }
  };

  // Load data based on active tab
  const loadData = async () => {
    if (firstLoad) {
      setLoading(true);
    }
    setError('');
    try {
      await fetchMetrics();
      if (activeTab === 'users') {
        await fetchUsers();
      } else if (activeTab === 'tasks') {
        await fetchTasks();
      } else if (activeTab === 'logs') {
        await fetchLogs();
      }
    } catch (err) {
      setError('Failed to fetch data from the server.');
    } finally {
      setLoading(false);
      setFirstLoad(false); // Disable loading spinner after initial load
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  // Handle User Status toggle (Active/Inactive)
  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${API_URL}/users/${targetUser._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === targetUser._id ? { ...u, status: data.user.status } : u));
        fetchMetrics();
      } else {
        alert(data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('Server error updating status');
    }
  };

  // Handle User Delete
  const handleDeleteUser = async (id, email) => {
    if (id === user.id) {
      alert('You cannot delete your own admin account.');
      return;
    }
    if (!window.confirm(`Delete user ${email} and all of their tasks?`)) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== id));
        fetchMetrics();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Server error deleting user');
    }
  };

  // Handle Admin Deleting any Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.filter(t => t._id !== id));
        fetchMetrics();
      } else {
        alert(data.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Delete task error:', err);
      alert('Server error deleting task');
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        
        {/* Simple Dashboard Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Console</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>System statistics, user logs, and permissions management</p>
        </div>

        {/* Compact Analytics Metrics */}
        <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
          <div className="glass-panel stat-card" style={{ padding: '0.85rem 1rem', borderLeftColor: 'var(--accent-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Users</span>
            <span className="stat-value" style={{ fontSize: '1.35rem', marginTop: '1px' }}>{metrics.totalUsers}</span>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '0.85rem 1rem', borderLeftColor: '#3b82f6' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Tasks</span>
            <span className="stat-value" style={{ fontSize: '1.35rem', marginTop: '1px' }}>{metrics.totalTasks}</span>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '0.85rem 1rem', borderLeftColor: 'var(--success-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Completed</span>
            <span className="stat-value" style={{ fontSize: '1.35rem', marginTop: '1px', color: 'var(--success-color)' }}>{metrics.completedTasks}</span>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '0.85rem 1rem', borderLeftColor: 'var(--warning-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Pending</span>
            <span className="stat-value" style={{ fontSize: '1.35rem', marginTop: '1px', color: 'var(--warning-color)' }}>{metrics.pendingTasks}</span>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Cleaner Tabs */}
        <div className="tabs-header" style={{ marginBottom: '1.25rem' }}>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('tasks')} 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
          >
            Task Monitoring
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
          >
            System Logs
          </button>
        </div>

        {/* Dynamic Panels */}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="tab-content">
            
            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="glass-panel table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Registered</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: '500' }}>
                          {u.email} {u._id === user.id && <span style={{ color: 'var(--accent-color)', fontSize: '0.7rem' }}>(You)</span>}
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ marginRight: '0.4rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                            disabled={u._id === user.id}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                            disabled={u._id === user.id}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Task Monitoring Tab */}
            {activeTab === 'tasks' && (
              <div className="glass-panel table-container">
                {tasks.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    No system tasks recorded.
                  </div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(t => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: '500' }}>{t.title}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {t.createdBy ? t.createdBy.email : 'Deleted User'}
                          </td>
                          <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${t.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteTask(t._id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && (
              <div className="glass-panel" style={{ background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                {logs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    No activity logs recorded.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {logs.map(log => (
                      <div key={log._id} className="log-item" style={{ padding: '0.65rem 1rem' }}>
                        <div className="log-info">
                          <span className="log-details" style={{ fontSize: '0.775rem' }}>{log.details}</span>
                          <div className="log-meta">
                            <span className="log-user">{log.email}</span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <span className={`badge ${
                          log.action === 'Login' ? 'badge-user' : 
                          log.action === 'Task Creation' ? 'badge-active' :
                          log.action === 'Task Update' ? 'badge-pending' : 'badge-inactive'
                        }`} style={{ textTransform: 'uppercase', fontSize: '0.6rem', padding: '0.15rem 0.35rem' }}>
                          {log.action.replace('Task ', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
