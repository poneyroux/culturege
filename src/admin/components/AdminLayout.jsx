import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            to="/admin"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/admin/themes"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            🎨 Thèmes
          </Link>
          <Link
            to="/admin/articles"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            📝 Articles
          </Link>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "5px",
              marginTop: "20px",
              cursor: "pointer",
            }}
          >
            🚪 Déconnexion
          </button>
        </nav>
      </div>

      {/* Contenu principal - IMPORTANT : c'est ici qu'on affiche les pages */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#ecf0f1",
          overflow: "auto",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
