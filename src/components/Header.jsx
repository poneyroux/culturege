import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

export default function Header({
  menuOpen,
  onToggleMenu,
  showThemesList = false,
  themes = [],
  currentTheme = null,
}) {
  return (
    <>
      {/* Header fixe */}
      <header className="site-header">
        <Link to="/" className="site-title">
          Culture Générale et Expression
        </Link>
        <div
          className={`burger-menu ${menuOpen ? "active" : ""}`}
          onClick={onToggleMenu}
        >
          <span className="burger-line"></span>
          <span className="burger-line"></span>
          <span className="burger-line"></span>
        </div>
      </header>

      {/* Menu burger overlay */}
      <div className={`themes-list ${menuOpen ? "visible" : ""}`}>
        {showThemesList &&
          themes.map((theme) => (
            <Link
              key={theme.id}
              to={`/theme/${theme.slug}`}
              className="list-menu-name"
              style={{ "--theme-color": theme.color }}
              onClick={() => onToggleMenu(false)}
            >
              <span className="theme-emoji">{theme.emoji || "📚"}</span>
              <span className="theme-text">{theme.name}</span>
            </Link>
          ))}
      </div>
    </>
  );
}
