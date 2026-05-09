import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, CheckCircle, Circle, Clock, Loader, AlertCircle, Edit2, Trash2, X } from 'lucide-react';
import api from '../services/api';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    description: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      setUpdating(taskId);
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (response.data.success) {
        setTasks(tasks.map(t => 
          t._id === taskId ? { ...t, status: newStatus } : t
        ));
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to update task');
    } finally {
      setUpdating(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (editingTask) {
        const response = await api.put(`/tasks/${editingTask._id}`, formData);
        if (response.data.success) {
          setTasks(prev => prev.map(t => 
            t._id === editingTask._id ? response.data.data : t
          ));
          closeModal();
        }
      } else {
        const response = await api.post('/tasks', formData);
        if (response.data.success) {
          setTasks(prev => [response.data.data, ...prev]);
          closeModal();
        }
      }
    } catch (err) {
      alert(err.friendlyMessage || `Failed to ${editingTask ? 'update' : 'create'} task`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    const dueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    setFormData({
      title: task.title || '',
      customer: task.customer || '',
      dueDate: dueDate,
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      description: task.description || ''
    });
    setShowModal(true);
  };

   const handleDeleteClick = (task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  };

    const handleDelete = async () => {
    try {
      setSubmitting(true);
      const response = await api.delete(`/tasks/${deletingTask._id}`);
      if (response.data.success) {
        setTasks(prev => prev.filter(t => t._id !== deletingTask._id));
        setShowDeleteModal(false);
        setDeletingTask(null);
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to delete task');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: '', customer: '', dueDate: '', priority: 'medium', status: 'pending', description: '' });
  };

  const openAddModal = () => {
    setEditingTask(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({ 
      title: '', 
      customer: '', 
      dueDate: tomorrow.toISOString().split('T')[0], 
      priority: 'medium', 
      status: 'pending',
      description: ''
    });
    setShowModal(true);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const isOverdue = (dateString, status) => {
    if (status === 'completed') return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
  };

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="loading-state">
          <Loader size={32} className="spinner" />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-page">
        <div className="error-state">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchTasks}>Try Again</button>
        </div>
      </div>
    );
  }

   return (
    <div className="tasks-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Tasks & Follow-ups</h1>
          <p>Manage your daily tasks and customer follow-ups</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Task
        </button>
      </div>

      <div className="tasks-summary">
        <div className="summary-card">
          <div className="summary-icon total">
            <CheckCircle size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{taskStats.total}</span>
            <span className="summary-label">Total Tasks</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon pending">
            <Circle size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{taskStats.pending}</span>
            <span className="summary-label">Pending</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon completed">
            <CheckCircle size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{taskStats.completed}</span>
            <span className="summary-label">Completed</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon overdue">
            <Clock size={20} />
          </div>
          <div className="summary-info">
            <span className="summary-value">{taskStats.overdue}</span>
            <span className="summary-label">Overdue</span>
          </div>
        </div>
      </div>

      <div className="tasks-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="tasks-list-container">
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <div 
              className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''} ${updating === task._id ? 'updating' : ''}`}
              key={task._id}
            >
              <button 
                className="task-checkbox"
                onClick={() => toggleTaskStatus(task._id)}
                disabled={updating === task._id}
              >
                {updating === task._id ? (
                  <Loader size={22} className="check-icon spinner" />
                ) : task.status === 'completed' ? (
                  <CheckCircle size={22} className="check-icon checked" />
                ) : (
                  <Circle size={22} className="check-icon" />
                )}
              </button>

              <div className="task-content">
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="task-meta">
                  <span className="task-customer">
                    <User size={14} />
                    {task.customer}
                  </span>
                  <span className={`task-due ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
                    <Calendar size={14} />
                    {formatDate(task.dueDate)}
                    {isOverdue(task.dueDate, task.status) && <span className="overdue-badge">Overdue</span>}
                  </span>
                </div>
              </div>

              <div className="task-actions-right">
                <button className="task-action-btn" onClick={() => handleEdit(task)} title="Edit">
                  <Edit2 size={16} />
                </button>
                <button className="task-action-btn delete" onClick={() => handleDeleteClick(task)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="task-status">
                <span className={`status-badge ${task.status}`}>
                  {task.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="empty-tasks">
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="What needs to be done?"
                />
              </div>
              <div className="form-group">
                <label>Related Customer *</label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                  placeholder="Customer name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Task details..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (editingTask ? 'Updating...' : 'Creating...') : (editingTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Task</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deletingTask?.title}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
