import React from 'react';
import './StatCard.css';

const StatCard = ({ icon: Icon, title, value, change, changeType, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-icon ${color}`}>
          <Icon size={22} />
        </div>
        {change && (
          <span className={`stat-change ${changeType}`}>
            {changeType === 'positive' ? '+' : ''}{change}
          </span>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
