import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = "admin2025";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const adminAuth = localStorage.getItem("adminAuth");
        setIsAuthenticated(adminAuth === "authenticated");
        setLoading(false);
    }, []);

    const login = (password) => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem("adminAuth", "authenticated");
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("adminAuth");
    };

    return {
        isAuthenticated,
        login,
        logout,
        loading,
    };
};
