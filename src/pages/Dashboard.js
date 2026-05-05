import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Target, Sparkles, Clock, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStageDisplayName = (stage) => {
    const stageMap = {
      'lead': 'Lead',
      'proposal': 'Proposal',
      'negotiation': 'Negotiation',
      'won': 'Closed Won',
      'lost': 'Closed Lost'
    };
    return stageMap[stage] || stage;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const { stats: statsData, recentDeals, topCustomers, pipelineSummary, prediction, upcomingTasks, revenueByMonth } = dashboardData || {};

  const stats = [
    {
      icon: Users,
      title: 'Total Customers',
      value: formatNumber(statsData?.totalCustomers || 0),
      change: `${statsData?.customerGrowth || 0}%`,
      changeType: (statsData?.customerGrowth || 0) >= 0 ? 'positive' : 'negative',
      color: 'blue'
    },
    {
      icon: Target,
      title: 'Active Deals',
      value: formatNumber(statsData?.activeDeals || 0),
      change: `${statsData?.dealGrowth || 0}%`,
      changeType: (statsData?.dealGrowth || 0) >= 0 ? 'positive' : 'negative',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: 'Win Rate',
      value: `${statsData?.winRate || 0}%`,
      change: `${statsData?.winRateChange || 0}%`,
      changeType: (statsData?.winRateChange || 0) >= 0 ? 'positive' : 'negative',
      color: 'green'
    },
    {
      icon: DollarSign,
      title: 'Total Revenue',
      value: formatCurrency(statsData?.totalRevenue || 0),
      change: `${statsData?.revenueGrowth || 0}%`,
      changeType: (statsData?.revenueGrowth || 0) >= 0 ? 'positive' : 'negative',
      color: 'orange'
    }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Executive Overview</h1>
        <p>Welcome back! Here's what's happening with your business today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="prediction-card">
        <div className="prediction-icon">
          <Sparkles size={24} />
        </div>
        <div className="prediction-content">
          <span className="prediction-label">Expected Revenue (Next 30 Days)</span>
          <span className="prediction-value">
            {prediction ? formatCurrency(prediction.predictedRevenue) : 'N/A'}
          </span>
        </div>
        <div className="prediction-confidence">
          <span className="confidence-label">Confidence</span>
          <span className="confidence-value">{prediction ? `${Math.round(prediction.confidence * 100)}%` : '-'}</span>
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      {upcomingTasks && upcomingTasks.length > 0 && (
        <div className="card tasks-preview-card">
          <div className="card-header">
            <h2>Upcoming Tasks</h2>
            <a href="/tasks" className="view-all">View All</a>
          </div>
          <div className="tasks-preview">
            {upcomingTasks.slice(0, 4).map((task, index) => (
              <div className="task-preview-item" key={index}>
                <div className={`task-priority-indicator ${task.priority}`}></div>
                <div className="task-preview-content">
                  <span className="task-preview-title">{task.title}</span>
                  <span className="task-preview-customer">{task.customer}</span>
                </div>
                <div className="task-preview-due">
                  <Clock size={14} />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h2>Revenue Overview</h2>
            <span className="chart-subtitle">Last 6 months</span>
          </div>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {revenueByMonth && revenueByMonth.map((item, index) => {
                const maxRevenue = Math.max(...revenueByMonth.map(r => r.revenue));
                const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div className="chart-bar-wrapper" key={index}>
                    <div className="chart-bar" style={{ height: `${heightPercent}%` }}>
                      <span className="bar-value">{formatCurrency(item.revenue)}</span>
                    </div>
                    <span className="bar-label">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card pipeline-card">
          <div className="card-header">
            <h2>Pipeline Summary</h2>
          </div>
          <div className="pipeline-summary">
            {pipelineSummary && pipelineSummary.map((stage, index) => {
              const maxValue = Math.max(...pipelineSummary.map(s => s.value));
              const widthPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
              return (
                <div className="pipeline-item" key={index}>
                  <div className="pipeline-info">
                    <span className="pipeline-stage">{getStageDisplayName(stage.stage)}</span>
                    <span className="pipeline-count">{stage.count} deals</span>
                  </div>
                  <div className="pipeline-bar-container">
                    <div className={`pipeline-bar ${stage.stage}`} style={{ width: `${widthPercent}%` }}></div>
                  </div>
                  <span className="pipeline-value">{formatCurrency(stage.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Recent Deals</h2>
            <a href="/pipeline" className="view-all">View All</a>
          </div>
          <div className="deals-table">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Value</th>
                  <th>Stage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals && recentDeals.map((deal, index) => (
                  <tr key={index}>
                    <td className="customer-name">{deal.customer}</td>
                    <td className="deal-value">{formatCurrency(deal.value)}</td>
                    <td>
                      <span className={`stage-badge ${deal.stage}`}>
                        {getStageDisplayName(deal.stage)}
                      </span>
                    </td>
                    <td className="deal-date">{formatDate(deal.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Top Customers</h2>
            <a href="/customers" className="view-all">View All</a>
          </div>
          <div className="top-customers">
            {topCustomers && topCustomers.map((customer, index) => (
              <div className="customer-row" key={index}>
                <div className="customer-rank">{index + 1}</div>
                <div className="customer-info">
                  <span className="customer-name">{customer.name}</span>
                  <span className="customer-deals">{customer.deals} deals</span>
                </div>
                <div className="customer-revenue">{formatCurrency(customer.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;