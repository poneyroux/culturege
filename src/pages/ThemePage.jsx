import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/ThemePage.css";
import Header from "../components/Header";

export default function ThemePage() {
  const { themeSlug } = useParams();
  const [theme, setTheme] = useState(null);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [allThemes, setAllThemes] = useState([]);

  useEffect(() => {
    // récupérer TOUTES les rubriques une fois pour toutes
    const fetchAllThemes = async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("id, name, slug, emoji, color")
        .order("name"); // tri optionnel

      if (error) console.error(error);
      else setAllThemes(data);
    };

    fetchAllThemes();
  }, []);

  useEffect(() => {
    loadThemeData();
  }, [themeSlug]);

  const loadThemeData = async () => {
    try {
      // Charger le thème
      const { data: themeData, error: themeError } = await supabase
        .from("themes")
        .select("*")
        .eq("slug", themeSlug)
        .single();

      console.log(themeData);

      if (themeError) throw themeError;
      if (!themeData) {
        setLoading(false);
        return;
      }

      setTheme(themeData);

      // Charger les articles publiés de ce thème
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("theme_id", themeData.id)
        .eq("status", "published")
        .order("order", { ascending: true });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (error) {
      console.error("Erreur chargement thème:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.subcategory === selectedCategory)
    : articles;

  const uniqueCategories = [
    ...new Set(articles.map((article) => article.subcategory).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="theme-mainpage">
        <header className="theme-page-header">
          <h1 className="theme-page-title">Culture Générale et Expression</h1>
          <div className="burger-menu" onClick={toggleMenu}>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </div>
        </header>
        <div className="loading-state">
          <p>Chargement du thème...</p>
        </div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="theme-mainpage">
        <header className="theme-page-header">
          <Link to="/" className="theme-page-title">
            Culture Générale et Expression
          </Link>
          <div className="burger-menu" onClick={toggleMenu}>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </div>
        </header>
        <div className="error-state">
          <h2>Thème non trouvé</h2>
          <Link to="/" className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-mainpage" style={{ "--theme-color": theme.color }}>
      {/* Header identique à HomePage */}

      <Header
        menuOpen={menuOpen}
        onToggleMenu={toggleMenu}
        showThemesList={true} // ou false si tu ne veux pas la liste
        themes={allThemes} // ou le tableau de thèmes si tu l’as
        currentTheme={theme} // pour coloriser le menu
      />
      {/* Contenu principal */}
      <div
        className={`theme-page-content theme-container ${menuOpen ? "hidden" : ""
          }`}
      >
        {/* En-tête du thème */}
        <div className="theme-header">
          <div className="theme-info">
            <h1 className="theme-title">{theme.name}</h1>
          </div>
        </div>

        {/* Filtres par catégorie */}
        {uniqueCategories.length > 0 && (
          <div className="category-filters">
            <button
              className={`filter-button ${selectedCategory === "" ? "active" : ""
                }`}
              onClick={() => setSelectedCategory("")}
            >
              Tout afficher ({articles.length})
            </button>
            {uniqueCategories.map((category) => (
              <button
                key={category}
                className={`filter-button ${selectedCategory === category ? "active" : ""
                  }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category} (
                {articles.filter((a) => a.subcategory === category).length})
              </button>
            ))}
          </div>
        )}

        {/* Liste des articles */}
        <div className="articles-grid">
          {filteredArticles.length === 0 ? (
            <div className="no-articles">
              <h3>
                {selectedCategory
                  ? `Aucun article dans "${selectedCategory}"`
                  : "Aucun article publié dans ce thème"}
              </h3>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="article-card"
              >
                {/* {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="article-image"
                  />
                )} */}

                <div className="article-content">
                  <h3 className="article-title-theme">{article.title}</h3>

                  {article.summary && (
                    <p className="article-summary">{article.summary}</p>
                  )}

                  <div className="article-button">Lire l'article</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
