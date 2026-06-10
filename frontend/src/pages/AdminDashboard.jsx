import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Tab control
  const [activeTab, setActiveTab] = useState('analytics');

  // Page States
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
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

  // Load appropriate data based on active tab
  const loadData = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  // Handle User Status toggle
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
        fetchMetrics(); // User count status could impact metrics eventually
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
    if (!window.confirm(`Are you sure you want to delete user ${email} and all of their tasks?`)) return;

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
    if (!window.confirm('Are you sure you want to delete this task?')) return;

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
        
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>System administration, access control, and task activity feeds</p>
        </div>

        {/* Analytics Section - Always Visible at Top */}
        <div className="stats-grid">
          <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total System Users</span>
            <span className="stat-value text-gradient">{metrics.totalUsers}</span>
          </div>
          <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Tasks Created</span>
            <span className="stat-value">{metrics.totalTasks}</span>
          </div>
          <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--success-color)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Completed Tasks</span>
            <span className="stat-value" style={{ color: 'var(--success-color)' }}>{metrics.completedTasks}</span>
          </div>
          <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Pending Tasks</span>
            <span className="stat-value" style={{ color: 'var(--warning-color)' }}>{metrics.pendingTasks}</span>
          </div>
        </div>

        {/* Error Block */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Navigation Tabs */}
        <div className="tabs-header">
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            System Summary
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('tasks')} 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          >
            Task Monitoring
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          >
            Activity Logs
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="tab-content">
            
            {/* Analytics Summary Tab */}
            {activeTab === 'analytics' && (
              <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Administrative Controls Overview</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Use this console to oversee user access permissions, monitor active tasks across all departments, and trace actions in the Activity Log audit trail.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>User Management</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Deactivate user logins, delete stale user accounts, and track status.</p>
                    <button onClick={() => setActiveTab('users')} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Manage Users</button>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Task Oversight</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Review task descriptions and titles across users, delete obsolete tasks.</p>
                    <button onClick={() => setActiveTab('tasks')} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Monitor Tasks</button>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Activity Audits</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Review all actions: logins, task creation, updates, and deletions.</p>
                    <button onClick={() => setActiveTab('logs')} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Audit Logs</button>
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="glass-panel table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Email Address</th>
                      <th>Registered On</th>
                      <th>System Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: '500' }}>
                          {u.email} {u._id === user.id && <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem' }}>(You)</span>}
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
                            style={{ marginRight: '0.5rem' }}
                            disabled={u._id === user.id}
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            className="btn btn-danger btn-sm"
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
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No tasks found in the database.
                  </div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Task Title</th>
                        <th>Created By (Email)</th>
                        <th>Created Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map(t => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: '500' }}>{t.title}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {t.createdBy ? t.createdBy.email : 'Unknown User'}
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
                            >
                              Delete Task
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
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {logs.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No activity logs recorded.
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log._id} className="log-item">
                        <div className="log-info">
                          <span className="log-details">{log.details}</span>
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
                        }`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                          {log.action}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
