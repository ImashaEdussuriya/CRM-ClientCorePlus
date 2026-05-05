import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Mail, Phone, Edit2, Trash2, Loader, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import './Customers.css';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: 'Lead'
  });

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/customers');
        if (response.data.success) {
          setCustomers(response.data.data);
        }
      } catch (err) {
        setError(err.friendlyMessage || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCustomer) {
        // Update existing customer
        const response = await api.put(`/customers/${editingCustomer._id}`, formData);
        if (response.data.success) {
          setCustomers(prev => prev.map(c => 
            c._id === editingCustomer._id ? response.data.data : c
          ));
          closeModal();
        }
      } else {
        // Create new customer
        const response = await api.post('/customers', formData);
        if (response.data.success) {
          setCustomers(prev => [response.data.data, ...prev]);
          closeModal();
        }
      }
    } catch (err) {
      alert(err.friendlyMessage || `Failed to ${editingCustomer ? 'update' : 'add'} customer`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      category: customer.category || 'Lead'
    });
    setShowModal(true);
  };

  const handleDeleteClick = (customer) => {
    setDeletingCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const response = await api.delete(`/customers/${deletingCustomer._id}`);
      if (response.data.success) {
        setCustomers(prev => prev.filter(c => c._id !== deletingCustomer._id));
        setShowDeleteModal(false);
        setDeletingCustomer(null);
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to delete customer');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', company: '', category: 'Lead' });
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', company: '', category: 'Lead' });
    setShowModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || customer.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryClass = (category) => {
    switch (category) {
      case 'VIP': return 'badge-vip';
      case 'Customer': return 'badge-customer';
      case 'Lead': return 'badge-lead';
      default: return '';
    }
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Customer Intelligence Hub</h1>
          <p>Manage and track all your customer relationships</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="customers-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Lead">Leads</option>
            <option value="Customer">Customers</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      <div className="customers-card">
        {loading ? (
          <div className="loading-state">
            <Loader size={32} className="spinner" />
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">{customer.name?.charAt(0)?.toUpperCase() || '?'}</div>
                          <span className="customer-name">{customer.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <Mail size={14} />
                          <span>{customer.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <Phone size={14} />
                          <span>{customer.phone || '-'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getCategoryClass(customer.category)}`}>
                          {customer.category}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={() => handleEdit(customer)} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button className="action-btn delete" onClick={() => handleDeleteClick(customer)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="empty-state">
                <p>No customers found matching your criteria.</p>
              </div>
            )}

            <div className="table-footer">
              <span className="results-count">Showing {filteredCustomers.length} of {customers.length} customers</span>
              <div className="pagination">
                <button className="pagination-btn" disabled>Previous</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Customer name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="customer@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Lead">Lead</option>
                  <option value="Customer">Customer</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (editingCustomer ? 'Updating...' : 'Adding...') : (editingCustomer ? 'Update Customer' : 'Add Customer')}
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
              <h2>Delete Customer</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deletingCustomer?.name}</strong>?</p>
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

export default Customers;
