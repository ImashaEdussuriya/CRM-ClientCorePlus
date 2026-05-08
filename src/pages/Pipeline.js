import React, { useState, useEffect } from 'react';
import { DollarSign, User, ChevronLeft, ChevronRight, Loader, AlertCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../services/api';
import './Pipeline.css';

const STAGES = [
  { id: 'lead', name: 'Lead', color: '#3b82f6' },
  { id: 'proposal', name: 'Proposal Sent', color: '#8b5cf6' },
  { id: 'negotiation', name: 'Negotiation', color: '#f59e0b' },
  { id: 'won', name: 'Closed Won', color: '#10b981' },
  { id: 'lost', name: 'Closed Lost', color: '#ef4444' }
];

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deletingDeal, setDeletingDeal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    value: '',
    stage: 'lead',
    description: ''
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/deals');
      if (response.data.success) {
        setDeals(response.data.data);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const updateDealStage = async (dealId, newStage) => {
    try {
      setUpdating(dealId);
      const response = await api.put(`/deals/${dealId}`, { stage: newStage });
      if (response.data.success) {
        setDeals(prev => prev.map(deal => 
          deal._id === dealId ? { ...deal, stage: newStage } : deal
        ));
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to update deal');
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
      const dealData = {
        ...formData,
        value: parseFloat(formData.value) || 0
      };
      
      if (editingDeal) {
        const response = await api.put(`/deals/${editingDeal._id}`, dealData);
        if (response.data.success) {
          setDeals(prev => prev.map(d => 
            d._id === editingDeal._id ? response.data.data : d
          ));
          closeModal();
        }
      } else {
        const response = await api.post('/deals', dealData);
        if (response.data.success) {
          setDeals(prev => [response.data.data, ...prev]);
          closeModal();
        }
      }
    } catch (err) {
      alert(err.friendlyMessage || `Failed to ${editingDeal ? 'update' : 'create'} deal`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      customer: deal.customer || '',
      value: deal.value?.toString() || '',
      stage: deal.stage || 'lead',
      description: deal.description || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (deal) => {
    setDeletingDeal(deal);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const response = await api.delete(`/deals/${deletingDeal._id}`);
      if (response.data.success) {
        setDeals(prev => prev.filter(d => d._id !== deletingDeal._id));
        setShowDeleteModal(false);
        setDeletingDeal(null);
      }
    } catch (err) {
      alert(err.friendlyMessage || 'Failed to delete deal');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDeal(null);
    setFormData({ customer: '', value: '', stage: 'lead', description: '' });
  };

  const openAddModal = (stage = 'lead') => {
    setEditingDeal(null);
    setFormData({ customer: '', value: '', stage, description: '' });
    setShowModal(true);
  };

  const getDealsForStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getStageIndex = (stageId) => STAGES.findIndex(s => s.id === stageId);

  const canMoveLeft = (stageId) => getStageIndex(stageId) > 0;
  const canMoveRight = (stageId) => getStageIndex(stageId) < STAGES.length - 1;

  const moveLeft = (deal) => {
    const currentIndex = getStageIndex(deal.stage);
    if (currentIndex > 0) {
      updateDealStage(deal._id, STAGES[currentIndex - 1].id);
    }
  };

  const moveRight = (deal) => {
    const currentIndex = getStageIndex(deal.stage);
    if (currentIndex < STAGES.length - 1) {
      updateDealStage(deal._id, STAGES[currentIndex + 1].id);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTotalValue = (deals) => {
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  };

  if (loading) {
    return (
      <div className="pipeline-page">
        <div className="loading-state">
          <Loader size={32} className="spinner" />
          <p>Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pipeline-page">
        <div className="error-state">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchDeals}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Sales Pipeline</h1>
          <p>Track and manage your deals through every stage of the sales process</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAddModal()}>
          <Plus size={18} />
          Add Deal
        </button>
      </div>

      <div className="pipeline-stats">
        <div className="pipeline-stat">
          <span className="stat-label">Total Deals</span>
          <span className="stat-value">{deals.length}</span>
        </div>
        <div className="pipeline-stat">
          <span className="stat-label">Total Value</span>
          <span className="stat-value">{formatCurrency(getTotalValue(deals))}</span>
        </div>
        <div className="pipeline-stat">
          <span className="stat-label">Won Deals Value</span>
          <span className="stat-value won">
            {formatCurrency(getTotalValue(getDealsForStage('won')))}
          </span>
        </div>
      </div>

      <div className="pipeline-board">
        {STAGES.map((stage) => {
          const stageDeals = getDealsForStage(stage.id);
          return (
            <div className="pipeline-column" key={stage.id}>
              <div className="column-header">
                <div className="column-title-wrapper">
                  <div 
                    className="column-indicator" 
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <h3 className="column-title">{stage.name}</h3>
                  <span className="column-count">{stageDeals.length}</span>
                </div>
                <span className="column-total">{formatCurrency(getTotalValue(stageDeals))}</span>
              </div>

              <div className="column-content">
                {stageDeals.map((deal) => (
                  <div className={`deal-card ${updating === deal._id ? 'updating' : ''}`} key={deal._id}>
                    <div className="deal-header">
                      <div className="deal-customer">
                        <User size={14} />
                        <span>{deal.customer}</span>
                      </div>
                      <div className="deal-card-actions">
                        <button className="deal-action-btn" onClick={() => handleEdit(deal)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="deal-action-btn delete" onClick={() => handleDeleteClick(deal)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="deal-value">
                      <DollarSign size={16} />
                      <span>{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="deal-actions">
                      <button 
                        className="move-btn" 
                        onClick={() => moveLeft(deal)}
                        disabled={!canMoveLeft(deal.stage) || updating === deal._id}
                        title="Move to previous stage"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        className="move-btn" 
                        onClick={() => moveRight(deal)}
                        disabled={!canMoveRight(deal.stage) || updating === deal._id}
                        title="Move to next stage"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="empty-column">
                    <p>No deals in this stage</p>
                  </div>
                )}

                <button className="add-deal-stage-btn" onClick={() => openAddModal(stage.id)}>
                  <Plus size={16} />
                  Add Deal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pipeline-hint">
        <p>💡 Tip: Use the arrow buttons to move deals between stages</p>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDeal ? 'Edit Deal' : 'Add New Deal'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                  placeholder="Customer or company name"
                />
              </div>
              <div className="form-group">
                <label>Deal Value ($) *</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="100"
                  placeholder="10000"
                />
              </div>
              <div className="form-group">
                <label>Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                >
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deal details..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (editingDeal ? 'Updating...' : 'Creating...') : (editingDeal ? 'Update Deal' : 'Create Deal')}
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
              <h2>Delete Deal</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the deal for <strong>{deletingDeal?.customer}</strong>?</p>
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

export default Pipeline;
