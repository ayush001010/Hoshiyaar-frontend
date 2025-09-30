import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        // This effect runs once when the app loads
        const checkAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
            }
            
            // Add a minimum loading time to show the loading screen
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading, // Provide loading state to other components
        login,
        logout,
    };

    // Always render children, let ProtectedRoute handle the loading state
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

