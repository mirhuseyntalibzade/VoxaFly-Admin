import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('jwt_token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 