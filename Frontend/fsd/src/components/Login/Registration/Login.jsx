import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const success = await login({ username, password });
      
      if (success) {
        // Get role from localStorage since it was set in the login function
        const role = localStorage.getItem('role');
        switch (role) {
          case 'STUDENT':
            navigate('/student-dashboard');
            break;
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          case 'MENTOR':
            navigate('/mentor-dashboard');
            break;
          case 'MANAGER':
            navigate('/manager-dashboard');
            break;
          default:
            navigate('/student-dashboard');
        }
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default Login;