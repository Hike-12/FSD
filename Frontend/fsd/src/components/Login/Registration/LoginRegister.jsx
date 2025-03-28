import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

function LoginRegister() {
  // Toggle state for sign in/sign up
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
  const { login } = useAuth();

  const toggle = (value) => {
    setSignIn(value);
  };

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
          case 'HOST':
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
    <div style={{ backgroundColor: '#233d4d' }} className="flex items-center justify-center h-screen overflow-hidden">
      <div className="bg-white rounded-lg shadow-2xl relative overflow-hidden w-full max-w-[678px] min-h-[400px]">
        {/* Sign Up Container */}
        <div 
          className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 ${
            !signIn 
              ? "transform translate-x-full opacity-100 z-10" 
              : "opacity-0 z-0"
          }`}
        >
          <form 
            onSubmit={handleRegister}
            className="bg-white flex items-center justify-center flex-col p-0 px-12 h-full text-center"
          >
            <h1 style={{ color: '#233d4d' }} className="font-bold m-0">Create Account</h1>
            <input 
              type="text" 
              placeholder="Username" 
              className="bg-gray-100 border-none py-3 px-4 my-2 w-full"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="bg-gray-100 border-none py-3 px-4 my-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              className="bg-gray-100 border-none py-3 px-4 my-2 w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="STUDENT">Student</option>
              <option value="HOST">Admin</option>
              <option value="MENTOR">Mentor</option>
            </select>
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-gray-100 border-none py-3 px-4 my-2 w-full"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
            {registerError && <p className="text-red-500 text-xs mt-2">{registerError}</p>}
            <button 
              type="submit"
              style={{ backgroundColor: '#e1bb80', color: '#233d4d', borderColor: '#e1bb80' }}
              className="rounded-full border text-xs font-bold py-3 px-11 uppercase tracking-wider transition duration-80 ease-in-out active:scale-95 focus:outline-none mt-4"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Container */}
        <div 
          className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-[2] ${
            signIn ? "" : "transform translate-x-full"
          }`}
        >
          <form 
            onSubmit={handleLogin}
            className="bg-white flex items-center justify-center flex-col p-0 px-12 h-full text-center"
          >
            <h1 style={{ color: '#233d4d' }} className="font-bold m-0">Sign in</h1>
            <input 
              type="text" 
              placeholder="Username" 
              className="bg-gray-100 border-none py-3 px-4 my-2 w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-gray-100 border-none py-3 px-4 my-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <a href="#" className="text-gray-800 text-sm no-underline my-4">
              Forgot your password?
            </a>
            {loginError && <p className="text-red-500 text-xs mt-2">{loginError}</p>}
            <button 
              type="submit"
              style={{ backgroundColor: '#e1bb80', color: '#233d4d', borderColor: '#e1bb80' }}
              className="rounded-full border text-xs font-bold py-3 px-11 uppercase tracking-wider transition duration-80 ease-in-out active:scale-95 focus:outline-none"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div 
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-100 ${
            !signIn ? "transform -translate-x-full" : ""
          }`}
        >
          {/* Overlay */}
          <div 
            className={`bg-no-repeat bg-cover bg-left text-white relative -left-full h-full w-[200%] transition-transform duration-600 ease-in-out ${
              !signIn ? "transform translate-x-1/2" : "transform translate-x-0"
            }`}
            style={{ background: 'linear-gradient(to right, #e1bb80, #233d4d)' }}
          >
            {/* Left Overlay Panel */}
            <div 
              className={`absolute flex items-center justify-center flex-col p-0 px-10 text-center top-0 h-full w-1/2 transition-transform duration-600 ease-in-out ${
                !signIn ? "transform translate-x-0" : "transform -translate-x-[20%]"
              }`}
            >
              <h1 style={{ color: '#233d4d' }} className="font-bold m-0">Welcome Back!</h1>
              <p style={{ color: '#233d4d' }} className="text-sm font-thin leading-5 tracking-wider my-5 mx-0">
                To keep connected with us please login with your personal info
              </p>
              <button 
                onClick={() => toggle(true)}
                style={{ color: '#233d4d', borderColor: '#233d4d' }}
                className="rounded-full border bg-transparent text-xs font-bold py-3 px-11 uppercase tracking-wider transition duration-80 ease-in-out active:scale-95 focus:outline-none"
                type="button"
              >
                Sign In
              </button>
            </div>

            {/* Right Overlay Panel */}
            <div 
              className={`absolute right-0 flex items-center justify-center flex-col p-0 px-10 text-center top-0 h-full w-1/2 transition-transform duration-600 ease-in-out ${
                !signIn ? "transform translate-x-[20%]" : "transform translate-x-0"
              }`}
            >
              <h1 className="font-bold m-0 text-white">Hello, Friend!</h1>
              <p className="text-sm font-thin leading-5 tracking-wider my-5 mx-0 text-white">
                Enter your personal details and start journey with us
              </p>
              <button 
                onClick={() => toggle(false)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-11 uppercase tracking-wider transition duration-80 ease-in-out active:scale-95 focus:outline-none"
                type="button"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;