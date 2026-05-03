import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, render children or Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;