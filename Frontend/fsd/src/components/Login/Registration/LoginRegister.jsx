import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styled, { keyframes } from 'styled-components';

const move = keyframes`
  0% { opacity: 0; }
  95% { opacity: 1; }
`;

const LoginContainer = styled.div`
  position: relative;
  width: 900px;
  height: 600px;
  background: #121212;
  border-radius: 23px;
  overflow: hidden;
  border: 1px solid #00C4B8;
  box-shadow: 0 0 30px rgba(0, 196, 184, 0.2);
  margin: 0 auto;
`;

const FormPanel = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  transition: all 1s ease-in-out;
  z-index: ${props => props.active ? 2 : 1};
  opacity: ${props => props.active ? 1 : 0};
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: ${props => props.left ? '0' : 'auto'};
  right: ${props => props.right ? '0' : 'auto'};
`;

const OverlayContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const OverlayPanel = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, #006D66, #00C4B8);
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  padding: 2.5rem;
  transition: transform 1s ease-in-out;
  ${props => props.right ? `
    right: 0;
    transform: ${props.active ? 'translateX(0)' : 'translateX(100%)'};
    border-radius: 0 23px 23px 0;
  ` : `
    left: 0;
    transform: ${props.active ? 'translateX(0)' : 'translateX(-100%)'};
    border-radius: 23px 0 0 23px;
  `}
`;

const ToggleButton = styled.button`
  position: absolute;
  width: 70px;
  height: 70px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 4;
  top: 70%;
  left: 50%;
  transform: translateX(-50%) rotate(${props => props.active ? '180deg' : '0deg'});
  transition: all 0.6s ease-in-out;

  &::before {
    content: "👉";
    font-size: 3.5rem;
    filter: drop-shadow(0 0 3px rgba(0,0,0,0.3));
  }
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem;
  background: #1F2A2A;
  border: 1px solid #2A3A3A;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #00C4B8;
    box-shadow: 0 0 0 2px rgba(0, 196, 184, 0.3);
  }

  &::placeholder {
    color: #A0AEC0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1.1rem;
  background: #1F2A2A;
  border: 1px solid #2A3A3A;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #00C4B8;
    box-shadow: 0 0 0 2px rgba(0, 196, 184, 0.3);
  }
`;

const Button = styled.button`
  padding: 1.1rem;
  background: linear-gradient(to right, #00C4B8, #006D66);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 196, 184, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 196, 184, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin: -0.8rem 0 0.8rem 0;
`;

const Link = styled.a`
  color: #A0AEC0;
  text-decoration: none;
  font-size: 0.9rem;
  text-align: center;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #00C4B8;
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 2.2rem;
  margin-bottom: 1.8rem;
  text-align: center;
`;

const PanelTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.2rem;
  color: white;
`;

const PanelText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  max-width: 80%;
`;

const LoginPage = () => {
  const [isSignInActive, setIsSignInActive] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    registerUsername: '',
    email: '',
    registerPassword: '',
    role: ''
  });
  const [errors, setErrors] = useState({
    login: '',
    register: ''
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, login: '' });
    try {
      const success = await login({ 
        username: formData.username, 
        password: formData.password 
      });
      if (success) {
        const role = localStorage.getItem('role');
        switch (role) {
          case 'STUDENT': navigate('/student-landing'); break;
          case 'HOST': navigate('/admin-landing'); break;
          case 'MENTOR': navigate('/mentor-landing'); break;
          case 'MANAGER': navigate('/manager-dashboard'); break;
          default: navigate('/student-dashboard');
        }
      } else {
        setErrors({ ...errors, login: 'Login failed. Please check your credentials.' });
      }
    } catch (err) {
      setErrors({ ...errors, login: err.message });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, register: '' });
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: formData.registerUsername, 
          email: formData.email, 
          password: formData.registerPassword, 
          role: formData.role 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'Registration failed';
        if (errorMsg.includes('home_customuser.email')) {
          setErrors({ ...errors, register: 'Email already exists. Please use a different email.' });
        } else if (errorMsg.includes('home_customuser.username')) {
          setErrors({ ...errors, register: 'Username already taken. Please choose another one.' });
        } else {
          setErrors({ ...errors, register: errorMsg });
        }
        return;
      }

      const data = await response.json();
      alert(data.message || 'Registration successful!');
      setIsSignInActive(true);
    } catch (err) {
      setErrors({ ...errors, register: err.message });
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      padding: '2rem'
    }}>
      <LoginContainer>
        {/* Sign In Form (Left Side) */}
        <FormPanel active={isSignInActive} left>
          <Form onSubmit={handleLogin}>
            <Title>Sign In</Title>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.login && <ErrorText>{errors.login}</ErrorText>}
            <Link href="#">Forgot password?</Link>
            <Button type="submit">Sign In</Button>
          </Form>
        </FormPanel>

        {/* Create Account Form (Right Side) */}
        <FormPanel active={!isSignInActive} right>
          <Form onSubmit={handleRegister}>
            <Title>Create Account</Title>
            <Input
              type="text"
              name="registerUsername"
              placeholder="Username"
              value={formData.registerUsername}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Role</option>
              <option value="STUDENT">Student</option>
              <option value="HOST">Admin</option>
              <option value="MENTOR">Mentor</option>
            </Select>
            <Input
              type="password"
              name="registerPassword"
              placeholder="Password"
              value={formData.registerPassword}
              onChange={handleChange}
              required
            />
            {errors.register && <ErrorText>{errors.register}</ErrorText>}
            <Link href="#" onClick={() => setIsSignInActive(true)}>
              Already have an account?
            </Link>
            <Button type="submit">Sign Up</Button>
          </Form>
        </FormPanel>

        {/* Overlay Container */}
        <OverlayContainer>
          {/* Right Overlay Panel */}
          <OverlayPanel right active={isSignInActive}>
            <PanelTitle>New Here?</PanelTitle>
            <PanelText>
              Sign up and discover a great community of mentors and students!
            </PanelText>
            <Button 
              onClick={() => setIsSignInActive(false)}
              style={{ 
                marginTop: '2rem', 
                background: 'transparent', 
                border: '2px solid white',
                width: '150px'
              }}
            >
              Sign Up
            </Button>
          </OverlayPanel>

          {/* Left Overlay Panel */}
          <OverlayPanel left active={!isSignInActive}>
            <PanelTitle>Welcome Back!</PanelTitle>
            <PanelText>
              To keep connected with us please login with your personal info
            </PanelText>
            <Button 
              onClick={() => setIsSignInActive(true)}
              style={{ 
                marginTop: '2rem', 
                background: 'transparent', 
                border: '2px solid white',
                width: '150px'
              }}
            >
              Sign In
            </Button>
          </OverlayPanel>
        </OverlayContainer>

        <ToggleButton 
          active={isSignInActive} 
          onClick={() => setIsSignInActive(!isSignInActive)}
        />
      </LoginContainer>
    </div>
  );
};

export default LoginPage;