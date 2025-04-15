import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styled, { keyframes, css } from 'styled-components';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

const move = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Background with enhanced pattern
const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #050A15, #0A1428, #050A15, #0A1428);
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  z-index: -2;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.05) 0%, transparent 25%),
      linear-gradient(135deg, transparent 49.5%, rgba(59, 130, 246, 0.03) 49.5%, rgba(59, 130, 246, 0.03) 50.5%, transparent 50.5%),
      linear-gradient(-135deg, transparent 49.5%, rgba(59, 130, 246, 0.03) 49.5%, rgba(59, 130, 246, 0.03) 50.5%, transparent 50.5%);
    background-size: 100px 100px;
    opacity: 0.8;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%233b82f6' fill-opacity='0.03' d='M45,0 L55,0 L55,200 L45,200 Z M95,0 L105,0 L105,200 L95,200 Z M145,0 L155,0 L155,200 L145,200 Z M0,45 L0,55 L200,55 L200,45 Z M0,95 L0,105 L200,105 L200,95 Z M0,145 L0,155 L200,155 L200,145 Z'/%3E%3C/svg%3E");
    background-size: 50px 50px;
    opacity: 0.5;
  }
`;

const FloatingOrbs = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;

  span {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.15;
    animation: ${float} 15s infinite linear;
  }

  span:nth-child(1) {
    width: 500px;
    height: 500px;
    background: #3b82f6;
    top: -100px;
    left: -100px;
    animation-duration: 20s;
  }

  span:nth-child(2) {
    width: 300px;
    height: 300px;
    background: #2563eb;
    top: 50%;
    right: -50px;
    animation-duration: 25s;
  }

  span:nth-child(3) {
    width: 400px;
    height: 400px;
    background: #60a5fa;
    bottom: -100px;
    left: 30%;
    animation-duration: 30s;
  }

  @media (max-width: 768px) {
    span:nth-child(1) {
      width: 300px;
      height: 300px;
    }
    span:nth-child(2) {
      width: 200px;
      height: 200px;
    }
    span:nth-child(3) {
      width: 250px;
      height: 250px;
    }
  }
`;

const LoginContainer = styled.div`
  position: relative;
  width: 900px;
  height: 600px;
  background: rgba(10, 20, 40, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 23px;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
  margin: 0 auto;
  animation: ${move} 0.8s ease-out;

  @media (max-width: 992px) {
    width: 700px;
    height: 500px;
  }

  @media (max-width: 768px) {
    width: 90%;
    height: auto;
    min-height: 600px;
    margin: 2rem auto;
  }

  @media (max-width: 576px) {
    width: 95%;
    border-radius: 15px;
  }
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

  @media (max-width: 768px) {
    width: 100%;
    opacity: ${props => props.active ? 1 : 0};
    z-index: ${props => props.active ? 2 : 1};
    padding: 2rem;
  }

  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const OverlayContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const OverlayPanel = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  background-size: 200% 200%;
  animation: ${gradientShift} 8s ease infinite;
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
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  z-index: 4;
  top: 70%;
  left: 50%;
  transform: translateX(-50%) rotate(${props => props.active ? '180deg' : '0deg'});
  transition: all 0.6s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${pulse} 3s infinite;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: translateX(-50%) rotate(${props => props.active ? '180deg' : '0deg'}) scale(1.1);
  }

  &::before {
    content: "⇄";
    font-size: 2rem;
    color: white;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileToggleButton = styled.button`
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  padding: 0.8rem 1.5rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
  display: none;
  align-self: center;

  &:hover {
    background: rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  animation: ${move} 0.5s ease-out;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem;
  background: rgba(5, 10, 21, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #f8fafc;
  font-size: 1rem;
  transition: all 0.3s;
  backdrop-filter: blur(5px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    background: rgba(10, 20, 40, 0.9);
  }

  &::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 576px) {
    padding: 0.9rem;
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1.1rem;
  background: rgba(5, 10, 21, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #f8fafc;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  transition: all 0.3s;
  backdrop-filter: blur(5px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    background: rgba(10, 20, 40, 0.9);
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 576px) {
    padding: 0.9rem;
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  padding: 1.1rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
  animation: ${gradientShift} 5s ease infinite;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 45%,
      rgba(255, 255, 255, 0.2) 48%,
      rgba(255, 255, 255, 0.2) 52%,
      rgba(255, 255, 255, 0) 55%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    animation: shine 3s infinite;
  }

  @keyframes shine {
    0% { transform: translateX(-100%) rotate(30deg); }
    100% { transform: translateX(100%) rotate(30deg); }
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 576px) {
    padding: 0.9rem;
    font-size: 0.9rem;
  }
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin: -0.8rem 0 0.8rem 0;
  text-shadow: 0 0 5px rgba(255, 107, 107, 0.3);

  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

const Link = styled.a`
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;

  &:hover {
    color: #3b82f6;
    text-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: #3b82f6;
    transition: width 0.3s;
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

const Title = styled.h1`
  color: #f8fafc;
  font-size: 2.2rem;
  margin-bottom: 1.8rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  position: relative;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(to right, #3b82f6, #7c3aed);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 576px) {
    font-size: 1.8rem;
    margin-bottom: 1.2rem;
  }
`;

const PanelTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.2rem;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const PanelText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  max-width: 80%;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 0.9rem;
    max-width: 90%;
  }
`;

const Particles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
`;

const Particle = styled.div`
  position: absolute;
  background: rgba(59, 130, 246, ${props => props.opacity});
  border-radius: 50%;
  animation: ${float} ${props => props.duration}s linear infinite;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
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
  const [particles, setParticles] = useState([]);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Create particles
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 5 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.1 + 0.02,
        duration: Math.random() * 20 + 10
      });
    }
    setParticles(newParticles);
  }, []);

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
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Background />
      <FloatingOrbs>
        <span />
        <span />
        <span />
      </FloatingOrbs>
      
      <Particles>
        {particles.map(particle => (
          <Particle 
            key={particle.id}
            size={particle.size}
            left={particle.left}
            top={particle.top}
            opacity={particle.opacity}
            duration={particle.duration}
          />
        ))}
      </Particles>

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
            <MobileToggleButton 
              type="button" 
              onClick={() => setIsSignInActive(false)}
            >
              Don't have an account? Sign Up
            </MobileToggleButton>
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
            <Button type="submit">Sign Up</Button>
            <MobileToggleButton 
              type="button" 
              onClick={() => setIsSignInActive(true)}
            >
              Already have an account? Sign In
            </MobileToggleButton>
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