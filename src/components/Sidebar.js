import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  CheckSquare, 
  LogOut,
  Building2
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/pipeline', icon: TrendingUp, label: 'Sales Pipeline' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Building2 size={24} />
          </div>
          <div className="logo-text">
            <span className="logo-name">ClientCore</span>
            <span className="logo-plus">Plus</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname === '/');
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;