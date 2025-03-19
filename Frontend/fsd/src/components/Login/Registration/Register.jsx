import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';  // Ensure this provides csrfToken

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { csrfToken } = useAuth();  // Custom context that must provide CSRF token

  const handleButtonClick = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // let token = csrfToken;
    // console.log('CSRF Token:', token);
    // if (!token) {
    //     token = await fetchCsrfToken();
    // }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          // 'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Important for CSRF + cookie authentication
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'Registration failed';

        // Detect UNIQUE constraint errors from backend response
        if (errorMsg.includes('home_customuser.email')) {
          alert('Email already exists. Please use a different email.');
          throw new Error('Email needs to be unique');
        } else if (errorMsg.includes('home_customuser.username')) {
          alert('Username already taken. Please choose another one.');
          throw new Error('Username already taken');
        }

        alert(errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      alert(data.message || 'Registration successful!');

      // Redirect user to login page (no token storage)
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="register-form">
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
        {error && <p className="error-message">{error}</p>}
      </form>
      <p>
        Already have an account?{' '}
        <button onClick={handleButtonClick}>Login here</button>
      </p>
    </div>
  );
};

export default Register;
