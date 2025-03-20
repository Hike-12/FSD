import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import * as Components from './Components';
import './styles.css';

const LoginRegister = () => {
  // State for form toggle
  const [signIn, setSignIn] = useState(true);

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register states
  const [registerUsername, setRegisterUsername] = useState('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [role, setRole] = useState('');
  const [registerError, setRegisterError] = useState('');

  const navigate = useNavigate();
  const { login, csrfToken } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const success = await login({ username, password });
      
      if (success) {
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
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          username: registerUsername, 
          email, 
          password: registerPassword, 
          role 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'Registration failed';

        if (errorMsg.includes('home_customuser.email')) {
          setRegisterError('Email already exists. Please use a different email.');
        } else if (errorMsg.includes('home_customuser.username')) {
          setRegisterError('Username already taken. Please choose another one.');
        } else {
          setRegisterError(errorMsg);
        }
        return;
      }

      const data = await response.json();
      alert(data.message || 'Registration successful!');
      
      // Switch to login view after successful registration
      setSignIn(true);
    } catch (err) {
      setRegisterError(err.message);
    }
  };

  return (
    <>
      <Components.GlobalStyle />
      <Components.Container>
    <Components.Container>
      <Components.SignUpContainer signingIn={signIn}>
        <Components.Form onSubmit={handleRegister}>
          <Components.Title>Create Account</Components.Title>
          <Components.Input 
            type="text" 
            placeholder="Username" 
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
          />
          <Components.Input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Components.Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
            <option value="MENTOR">Mentor</option>
          </Components.Select>
          <Components.Input 
            type="password" 
            placeholder="Password" 
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
          />
          {registerError && <Components.ErrorMessage>{registerError}</Components.ErrorMessage>}
          <Components.Button type="submit">Sign Up</Components.Button>
        </Components.Form>
      </Components.SignUpContainer>
      
      <Components.SignInContainer signingIn={signIn}>
        <Components.Form onSubmit={handleLogin}>
          <Components.Title>Sign In</Components.Title>
          <Components.Input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Components.Input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Components.Anchor>Forgot your password?</Components.Anchor>
          {loginError && <Components.ErrorMessage>{loginError}</Components.ErrorMessage>}
          <Components.Button type="submit">Sign In</Components.Button>
        </Components.Form>
      </Components.SignInContainer>
      
      <Components.OverlayContainer signingIn={signIn}>
        <Components.Overlay signingIn={signIn}>
          <Components.LeftOverlayPanel signingIn={signIn}>
            <Components.Title>Welcome Back!</Components.Title>
            <Components.Paragraph>
              To keep connected with us please login with your personal info
            </Components.Paragraph>
            <Components.GhostButton onClick={() => setSignIn(true)}>
              Sign In
            </Components.GhostButton>
          </Components.LeftOverlayPanel>
          
          <Components.RightOverlayPanel signingIn={signIn}>
            <Components.Title>Hello, Friend!</Components.Title>
            <Components.Paragraph>
              Enter your personal details and start journey with us
            </Components.Paragraph>
            <Components.GhostButton onClick={() => setSignIn(false)}>
              Sign Up
            </Components.GhostButton>
          </Components.RightOverlayPanel>
        </Components.Overlay>
      </Components.OverlayContainer>
    </Components.Container>
    </Components.Container>
    <Components.Container style={{margin: '50px auto'}}></Components.Container>
  </>
);
  
};

export default LoginRegister;