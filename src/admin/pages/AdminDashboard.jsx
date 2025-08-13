import React from "react";
import { Link } from "react-router-dom";
import MediaLibrary from "../components/MediaLibrary";
import MediaModal from "../components/MediaModal";

export default function AdminDashboard() {
  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ marginBottom: "40px", fontSize: "2.5rem" }}>
        Tableau de bord admin
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          maxWidth: "800px",
        }}
      >
        <Link
          to="/admin/themes"
          style={{
            padding: "40px",
            backgroundColor: "#4CAF50",
            color: "white",
            borderRadius: "15px",
            textDecoration: "none",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.3rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
            display: "block",
          }}
          onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
        >
          🎨 Gérer les thèmes
          <div
            style={{ fontSize: "0.9rem", marginTop: "10px", opacity: "0.9" }}
          >
            Créer, modifier et supprimer les thèmes
          </div>
        </Link>

        <div style={{ padding: "20px" }}>
          <h1>Gestion de la médiathèque</h1>
          <MediaModal triggerLabel="Gérer la médiathèque" />{" "}
        </div>

        <Link
          to="/admin/articles"
          style={{
            padding: "40px",
            backgroundColor: "#2196F3",
            color: "white",
            borderRadius: "15px",
            textDecoration: "none",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.3rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
            display: "block",
          }}
          onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
        >
          📝 Gérer les articles
          <div
            style={{ fontSize: "0.9rem", marginTop: "10px", opacity: "0.9" }}
          >
            Créer, modifier et publier les articles
          </div>
        </Link>
      </div>
    </div>
  );
}
