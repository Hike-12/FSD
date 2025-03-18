import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { csrfToken } = useAuth();

  const handleButtonClick = () => { navigate('/'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'Registration failed';
  
        // Check for UNIQUE constraint on email and customize message
        if (errorMsg.includes('home_customuser.email')) {
          alert('Email needs to be unique');
          throw new Error('Email needs to be unique');
        } else if (errorMsg.includes('home_customuser.username')) {
          alert('Username already taken');
          throw new Error('Username already taken');
        }
  
        alert(errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      alert(data.message);
      // Either store tokens and navigate to dashboard
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('role', data.role);
    //   navigate(data.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
      
      // Or simply navigate to login page without storing tokens
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
          <option value="MENTOR">Mentor</option>
        </select>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <button onClick={handleButtonClick}>Login here</button></p>
    </div>
  );
};

export default Register;