import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Completed

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

  // Fetch tasks
  const fetchTasks = async () => {
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

  // Apply filters and search
  useEffect(() => {
    let result = tasks;

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) || 
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    setFilteredTasks(result);
  }, [tasks, statusFilter, searchQuery]);

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
        fetchTasks();
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

  // Toggle status via check button
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
        alert(data.message || 'Failed to update task');
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
    if (!window.confirm('Delete this task?')) return;

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
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Simple Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Tasks <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>({tasks.length})</span>
            </h1>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            + Add Task
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Simplistic Filters and Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {['All', 'Pending', 'Completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                style={{
                  background: statusFilter === filter ? '#e2e8f0' : 'transparent',
                  border: 'none',
                  color: statusFilter === filter ? 'var(--accent-color)' : 'var(--text-secondary)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          <input
            type="text"
            className="form-input"
            style={{ width: '220px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', height: '32px' }}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Task List container */}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', borderStyle: 'dashed', background: 'rgba(255,255,255,0.01)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {searchQuery || statusFilter !== 'All' ? 'No tasks match your filters.' : 'No tasks listed. Add one to start tracking!'}
            </p>
          </div>
        ) : (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {filteredTasks.map((task) => (
              <div 
                key={task._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0.85rem 1rem', 
                  borderBottom: '1px solid var(--border-color)',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  background: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.01)' : 'transparent',
                }}
              >
                {/* Checkbox + Title section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => handleToggleStatus(task)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: `2px solid ${task.status === 'Completed' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      background: task.status === 'Completed' ? 'var(--accent-color)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      outline: 'none',
                    }}
                    title={task.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {task.status === 'Completed' && (
                      <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}>✓</span>
                    )}
                  </button>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span 
                      style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        color: task.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          marginTop: '2px'
                        }}
                      >
                        {task.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <button 
                    onClick={() => openEditModal(task)} 
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task._id)} 
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-color)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Create Task</h3>
              
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Task name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    placeholder="Task description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingTask && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-color)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Edit Task</h3>
              
              <form onSubmit={handleUpdateTask}>
                <div className="form-group">
                  <label className="form-label">Title</label>
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
                    rows="3"
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    style={{ background: 'var(--bg-primary)', cursor: 'pointer' }}
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
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save'}
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
