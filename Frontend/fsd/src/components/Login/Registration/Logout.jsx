import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get logout function from context

  const handleLogout = async () => {
    try {
      await logout(); // Use the logout function from context
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;