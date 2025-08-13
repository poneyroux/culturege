import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Le mot de passe admin (vous pouvez le changer)
  const ADMIN_PASSWORD = "admin2025";

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth === "authenticated") {
      setIsAuthenticated(true);
    }
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

  const value = {
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
