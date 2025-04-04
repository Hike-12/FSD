import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {DJANGO_BASE_URL} from "@/lib/utils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);
    const initRef = useRef(false);

    // const fetchCsrfToken = async () => {
    //     try {
    //         const response = await fetch('${DJANGO_BASE_URL}/csrf/', {
    //             method: 'GET',
    //             credentials: 'include',
    //         });
    //         console.log('Response:', response);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch CSRF token');
    //         }
    //         const data = await response.json();
    //         console.log('Fetched CSRF Token:', data.csrfToken);
    //         setCsrfToken(data.csrfToken);
    //         return data.csrfToken;
    //     } catch (error) {
    //         console.error('Error fetching CSRF token:', error);
    //     }
    // };

    const fetchUser = async () => {
        try {
            const response = await fetch(`${DJANGO_BASE_URL}/api/user/`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only run initialization once
        if (initRef.current === false) {
            initRef.current = true;
            
            const initAuth = async () => {
                // await fetchCsrfToken();
                await fetchUser();
            };
            
            initAuth();
        }
    }, []);

    const login = async (credentials) => {
        try {
            // Ensure we have a fresh CSRF token before login
            // if (!token) {
            //     const freshToken = await fetchCsrfToken();
            //     token = freshToken;
            // }
            
            const response = await fetch(`${DJANGO_BASE_URL}/api/login/`, {
                method: 'POST',
                headers: {
                    // 'Authorization': `Token ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }
            const data = await response.json();
            console.log('Login data:', data);
            
            localStorage.setItem('userId', data.id);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('role', data.role);
            await fetchUser();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            const response = await fetch(`${DJANGO_BASE_URL}/api/logout/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            alert('Logout successful!');
            localStorage.removeItem('userId');
            localStorage.removeItem('authToken');
            localStorage.removeItem('role');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            // csrfToken,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);