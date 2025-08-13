import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import "../styles/ArticlePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ArticlePage() {
  const { themeSlug } = useParams();
  const { articleSlug } = useParams();
  const [article, setArticle] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState(null);
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
    } catch (error) {
      console.error("Erreur chargement thème:", error);
    }
  };

  useEffect(() => {
    if (!articleSlug) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const articleResponse = await supabase
          .from("articles")
          .select("*")
          .eq("slug", articleSlug)
          .eq("status", "published");

        if (articleResponse.error) throw articleResponse.error;
        if (!articleResponse.data || articleResponse.data.length === 0) {
          setError("Article non trouvé");
          return;
        }

        const foundArticle = articleResponse.data[0];
        setArticle(foundArticle);

        if (foundArticle.theme_id) {
          const themeResponse = await supabase
            .from("themes")
            .select("*")
            .eq("id", foundArticle.theme_id);

          if (themeResponse.data && themeResponse.data.length > 0) {
            setTheme(themeResponse.data[0]);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleSlug]);

  // Correction pour fermer le menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (loading) {
    return (
      <div className="article-page">
        <Header
          menuOpen={menuOpen}
          onToggleMenu={toggleMenu}
          showThemesList={true} // ou false si tu ne veux pas la liste
          themes={allThemes} // ou le tableau de thèmes si tu l’as
        />
        <div className="loading-state">
          <p>Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-page">
        <Header menuOpen={menuOpen} onToggleMenu={toggleMenu} />
        <div className="error-state">
          <h2>Article non trouvé</h2>
          <Link to="/" className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Parse sécurisé du contenu - CORRIGÉ
  let content = { blocks: [], finalQuestions: [] };
  try {
    if (article.content) {
      // Si c'est déjà un objet, l'utiliser directement
      // Si c'est une string, la parser
      content =
        typeof article.content === "string"
          ? JSON.parse(article.content)
          : article.content;
    }
    console.log(content);
  } catch (e) {
    console.error("Erreur parsing JSON:", e);
  }

  const blocks = content.blocks || [];
  const finalQuestions = content.finalQuestions || [];
  console.log(blocks);

  return (
    <div
      className="article-page"
      style={{ "--theme-color": theme?.color || "#000" }}
    >
      <Header
        menuOpen={menuOpen}
        onToggleMenu={toggleMenu}
        currentTheme={theme}
        showThemesList={true} // ou false si tu ne veux pas la liste
        themes={allThemes} // ou le tableau de thèmes si tu l’as
      />

      <div
        className={`article-page-content article-container ${
          menuOpen ? "hidden" : ""
        }`}
      >
        {/* ---- bouton retour ---- */}
        <div className="article-nav">
          {theme && (
            <Link to={`/theme/${theme.slug}`} className="btn-back">
              ← Retour au thème
            </Link>
          )}
        </div>

        {/* ---- titre + résumé ---- */}
        <h1 className="article-title">{article.title}</h1>
        {article.summary && (
          <p className="article-summary">{article.summary}</p>
        )}

        {/* ---- image principale ---- */}
        {article.image_url && (
          <figure className="article-main-image">
            <img src={article.image_url} alt={article.title} />
          </figure>
        )}

        {/* ---- blocs ---- */}
        {blocks.map((block, index) => (
          <React.Fragment key={index}>
            <section className="content-block">
              {/* titre du bloc */}
              {block.title && <h2 className="block-title">{block.title}</h2>}
              {/* contenu principal */}
              {block.type === "text" && (
                <div
                  className="block-text"
                  dangerouslySetInnerHTML={{
                    __html: block.data || block.content,
                  }}
                />
              )}
              {block.type === "image" && (
                <figure className="block-image">
                  <img
                    src={block.data || block.content}
                    alt={block.title || `image-${index}`}
                  />
                </figure>
              )}
              {block.type === "video" && (
                <div className="block-video">
                  <iframe
                    src={(block.data || "")
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "youtube.com/embed/")}
                    title={block.title || `video-${index}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {block.type === "embed" && (
                <div
                  className="block-embed"
                  dangerouslySetInnerHTML={{ __html: block.data }}
                />
              )}
              {block.type === "quote" && (
                <blockquote className="block-quote">
                  {block.data || block.content}
                </blockquote>
              )}
              {block.questions?.length > 0 && (
                <div className="block-questions">
                  <header>
                    <span>QUESTIONS</span>

                    {/* bouton compact – copier dans le presse-papier */}
                    <button
                      className="copy-btn"
                      title="Copier les questions"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          block.questions
                            .map((q, i) => `${i + 1}. ${q.text}`)
                            .join("\n")
                        )
                      }
                    >
                      📋
                    </button>
                  </header>

                  {block.questions.map((q, qi) => (
                    <p key={qi} className="question-item">
                      {qi + 1}. {q.text}
                    </p>
                  ))}
                </div>
              )}
              {/* lien Wikipédia (placeholder) */}
              {block.wikiLinks?.length > 0 && (
                <div className="wiki-link">
                  {block.wikiLinks.map((l) => (
                    <>
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {l.label || "Voir sur Wikipédia"} →
                      </a>
                    </>
                  ))}
                </div>
              )}
            </section>

            {/* séparateur entre blocs */}
            {index !== blocks.length - 1 && <hr className="block-separator" />}
          </React.Fragment>
        ))}

        {/* ---- questions finales ---- */}
        {finalQuestions.length > 0 && (
          <section className="final-questions-section">
            <h2 className="block-title">QUESTIONS FINALES</h2>
            <div className="block-questions">
              {finalQuestions.map((q, i) => (
                <p key={i} className="question-item">
                  {i + 1}. {q.text}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ---- bouton téléchargement ppt ---- */}
        <div className="ppt-download">
          <button className="ppt-btn">
            Télécharger la présentation associée
          </button>
        </div>
      </div>
    </div>
  );
}
