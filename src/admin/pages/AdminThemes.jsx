import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function AdminThemes() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      // Récupérer thèmes avec le nombre d'articles
      const { data: themesData, error: themesError } = await supabase
        .from("themes")
        .select("*")
        .order("name");

      if (themesError) throw themesError;

      // Compter les articles pour chaque thème
      const { data: articlesData } = await supabase
        .from("articles")
        .select("theme_id");

      const articleCounts = {};
      articlesData?.forEach((article) => {
        articleCounts[article.theme_id] =
          (articleCounts[article.theme_id] || 0) + 1;
      });

      const themesWithCounts = themesData.map((theme) => ({
        ...theme,
        articleCount: articleCounts[theme.id] || 0,
      }));

      setThemes(themesWithCounts);
    } catch (error) {
      console.error("Erreur fetch themes:", error);
      alert("Erreur lors du chargement des thèmes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (themeId, themeName) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le thème "${themeName}" ?`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("themes")
        .delete()
        .eq("id", themeId);
      if (error) throw error;

      setThemes(themes.filter((t) => t.id !== themeId));
      alert("Thème supprimé avec succès");
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression: " + error.message);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Chargement des thèmes...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>Liste des thèmes ({themes.length})</h1>
        <Link
          to="/admin/themes/new"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          + Ajouter un thème
        </Link>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Emoji
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Nom
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Articles
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Couleur
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {themes.map((theme) => (
              <tr key={theme.id} style={{ borderBottom: "1px solid #eee" }}>
                <td
                  style={{
                    padding: "15px",
                    fontSize: "1.8rem",
                    textAlign: "center",
                  }}
                >
                  {theme.emoji}
                </td>
                <td style={{ padding: "15px", fontWeight: "500" }}>
                  {theme.name}
                </td>
                <td style={{ padding: "15px" }}>
                  <span
                    style={{
                      backgroundColor:
                        theme.articleCount > 0 ? "#e8f5e8" : "#ffeaa7",
                      color: theme.articleCount > 0 ? "#27ae60" : "#f39c12",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    {theme.articleCount} article
                    {theme.articleCount !== 1 ? "s" : ""}
                  </span>
                </td>
                <td style={{ padding: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "25px",
                        backgroundColor: theme.color,
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                      }}
                    ></div>
                    <span style={{ fontSize: "0.9rem", color: "#666" }}>
                      {theme.color}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <Link
                      to={`/admin/themes/edit/${theme.id}`}
                      style={{
                        backgroundColor: "#2196F3",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(theme.id, theme.name)}
                      style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {themes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <p style={{ fontSize: "1.1rem", color: "#666" }}>
            Aucun thème créé pour le moment
          </p>
          <Link
            to="/admin/themes/new"
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "12px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              marginTop: "10px",
              display: "inline-block",
            }}
          >
            Créer le premier thème
          </Link>
        </div>
      )}
    </div>
  );
}
