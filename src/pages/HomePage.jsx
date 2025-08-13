import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import "../styles/HomePage.css";

export default function HomePage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchThemes = async () => {
      const { data } = await supabase.from("themes").select("*").order("name");
      console.log("Themes récupérés avec images:", data); // Debug pour voir les images
      setThemes(data || []);
      setLoading(false);
    };
    fetchThemes();
  }, []);

  // Correction pour fermer le menu
  const handleToggleMenu = (forceClose) => {
    if (typeof forceClose === "boolean") {
      setMenuOpen(forceClose);
    } else {
      setMenuOpen(!menuOpen);
    }
  };

  if (loading) {
    return (
      <div className="homepage">
        <div className="loading-state">Chargement...</div>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="homepage">
        <div className="no-themes">
          <h2>Aucun thème disponible pour le moment</h2>
          <p>Les thèmes seront bientôt ajoutés.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Header
        menuOpen={menuOpen}
        onToggleMenu={handleToggleMenu}
        showThemesList={true}
        themes={themes}
        currentTheme={null}
      />

      <div className="homepage-content">
        <div className={`themes-grid ${menuOpen ? "hidden" : ""}`}>
          {themes.map((theme) => (
            <Link
              key={theme.id}
              to={`/theme/${theme.slug}`}
              className="theme-card"
              style={{ "--theme-color": theme.color }}
            >
              {/* Affichage prioritaire de l'image, fallback vers emoji */}
              {theme.image_url ? (
                <img
                  src={theme.image_url}
                  alt={theme.name}
                  className="theme-image"
                />
              ) : (
                <div className="theme-image-placeholder">
                  <span className="theme-card-emoji">
                    {theme.emoji || "📚"}
                  </span>
                </div>
              )}

              <div className="theme-content">
                <h2 className="theme-card-name">{theme.name}</h2>

                <div className="theme-button">Découvrir</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
