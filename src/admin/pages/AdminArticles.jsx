// src/pages/admin/AdminArticles.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "../styles/AdminArticles.css";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [themes, setThemes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (articlesError) throw articlesError;
        setArticles(articlesData || []);

        const { data: themesData, error: themesError } = await supabase
          .from("themes")
          .select("*");

        if (themesError) throw themesError;

        const themesMap = {};
        (themesData || []).forEach((t) => (themesMap[t.id] = t));
        setThemes(themesMap);
      } catch (err) {
        console.error("Erreur chargement articles :", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Supprimer l’article « ${title} » ?`)) return;

    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      setArticles((prev) => prev.filter((a) => a.id !== id));
      alert("Article supprimé");
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Erreur : " + err.message);
    }
  };

  const getStatusBadge = (status) => (
    <span className={`badge badge--${status}`}>
      {status === "published" ? "Publié" : "Brouillon"}
    </span>
  );

  if (loading)
    return <div className="admin-loader">Chargement des articles…</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Liste des articles ({articles.length})</h1>
        <Link to="/admin/articles/new" className="btn btn--primary">
          + Nouvel article
        </Link>
      </header>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Thème</th>
              <th>Statut</th>
              <th className="txt-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => {
              const theme = themes[a.theme_id];
              return (
                <tr key={a.id}>
                  <td>
                    <Link
                      to={`/admin/articles/edit/${a.id}`}
                      className="link-title"
                    >
                      {a.title}
                    </Link>
                    <div className="created-at">
                      Créé le {new Date(a.created_at).toLocaleDateString()}
                    </div>
                  </td>

                  <td>
                    {theme ? (
                      <span
                        className="theme-badge"
                        style={{ background: theme.color }}
                      >
                        {theme.emoji} {theme.name}
                      </span>
                    ) : (
                      <em className="txt-muted">Thème inconnu</em>
                    )}
                  </td>

                  <td>{getStatusBadge(a.status)}</td>

                  <td>
                    <div className="action-group">
                      <Link
                        to={`/admin/articles/edit/${a.id}`}
                        className="btn btn--small"
                      >
                        Modifier
                      </Link>

                      {a.status === "published" && (
                        <Link
                          to={`/article/${a.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn--small btn--success"
                        >
                          Voir
                        </Link>
                      )}

                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="btn btn--small btn--danger"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {articles.length === 0 && (
        <div className="empty-state">
          <p>Aucun article créé pour le moment</p>
          <Link to="/admin/articles/new" className="btn btn--primary">
            Créer le premier article
          </Link>
        </div>
      )}
    </div>
  );
}
