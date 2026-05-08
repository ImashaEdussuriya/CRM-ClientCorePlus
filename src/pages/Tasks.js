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