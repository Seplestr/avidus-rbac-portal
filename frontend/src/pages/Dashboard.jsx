import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add task state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');

  // Fetch user's tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      } else {
        setError(data.message || 'Failed to load tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Handle create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDescription('');
        setShowAddModal(false);
        fetchTasks(); // Reload tasks
      } else {
        alert(data.message || 'Failed to create task');
      }
    } catch (err) {
      console.error(err);
      alert('Server error creating task');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle toggle task status (Completed/Pending)
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map(t => t._id === task._id ? data.task : t));
      } else {
        alert(data.message || 'Failed to update task status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating task');
    }
  };

  // Open edit modal
  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
  };

  // Handle update task details
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title: editTitle, description: editDescription, status: editStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map(t => t._id === editingTask._id ? data.task : t));
        setEditingTask(null);
      } else {
        alert(data.message || 'Failed to update task');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating task');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.filter(t => t._id !== id));
      } else {
        alert(data.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting task');
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>My Task Board</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Create, manage, and complete your individual tasks</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            + New Task
          </button>
        </div>

        {/* Errors */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>No tasks found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Create your very first task to get started on your dashboard!
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              Create a Task
            </button>
          </div>
        ) : (
          <div className="dashboard-grid">
            {tasks.map((task) => (
              <div key={task._id} className="glass-panel card">
                <div className="card-header">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '75%' }}>
                    <span 
                      className="card-title" 
                      style={{ 
                        textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                        opacity: task.status === 'Completed' ? 0.6 : 1 
                      }}
                    >
                      {task.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                    {task.status}
                  </span>
                </div>
                
                <div className="card-body">
                  <p style={{ 
                    whiteSpace: 'pre-wrap',
                    textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                    opacity: task.status === 'Completed' ? 0.5 : 0.8 
                  }}>
                    {task.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="card-footer">
                  <button 
                    onClick={() => handleToggleStatus(task)} 
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)' }}
                  >
                    {task.status === 'Completed' ? 'Reopen' : 'Complete'}
                  </button>
                  <button onClick={() => openEditModal(task)} className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Create New Task</h3>
              
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter short title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows="4"
                    className="form-input"
                    style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    placeholder="Provide details about this task"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Edit Task</h3>
              
              <form onSubmit={handleUpdateTask}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="4"
                    className="form-input"
                    style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Task Status</label>
                  <select
                    className="form-input"
                    style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setEditingTask(null)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
