import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/csrf/', {
                method: 'GET',
                credentials: 'include' // Important for cookies
            });
            const data = await response.json();
            setCsrfToken(data.csrfToken);
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            localStorage.setItem('access', data.access);
            return data.access;
        } catch (err) {
            console.error('Token refresh error:', err.message);
            throw err;
        }
    };

    const checkTokenValidity = async () => {
        try {
            const accessToken = localStorage.getItem('access');
            const role = localStorage.getItem('role');
            
            if (!accessToken) {
                setLoading(false);
                return;
            }
            
            // Restore user state from localStorage
            setUser({
                role,
                accessToken
            });
            
            // You could add additional validation here if needed
            // For example, make a request to a protected endpoint
            // If it fails, try refreshing the token
            
            setLoading(false);
        } catch (error) {
            console.error('Token validation error:', error);
            // If validation fails, try refreshing the token
            try {
                await refreshAccessToken();
                const role = localStorage.getItem('role');
                setUser({
                    role,
                    accessToken: localStorage.getItem('access')
                });
            } catch (refreshError) {
                // If refresh fails, log out
                localStorage.clear();
                setUser(null);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initialize auth state
        fetchCsrfToken();
        checkTokenValidity();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include', // Important for sending cookies
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();

            setUser({
                username: credentials.username,
                role: data.role,
                accessToken: data.access
            });
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('role', data.role);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh');
            await fetch('http://127.0.0.1:8000/api/logout/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken 
                },
                credentials: 'include',
                body: JSON.stringify({ refresh: refreshToken })
            });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Clear local storage and state even if the server request fails
            localStorage.clear();
            setUser(null);
        }
    };
    
    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            csrfToken, 
            refreshAccessToken,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);