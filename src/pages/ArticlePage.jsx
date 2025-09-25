import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import "../styles/ArticlePage.css";

export default function ArticlePage() {
  const { themeSlug, articleSlug } = useParams();
  const [article, setArticle] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [allThemes, setAllThemes] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchAllThemes = async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("id, name, slug, emoji, color")
        .order("name");
      if (!error) setAllThemes(data);
    };
    fetchAllThemes();
  }, []);

  useEffect(() => {
    loadThemeData();
  }, [themeSlug]);

  const loadThemeData = async () => {
    try {
      const { themeData, error: themeError } = await supabase
        .from("themes")
        .select("*")
        .eq("slug", themeSlug)
        .single();
      if (themeData) setTheme(themeData);
    } catch (error) {
      // erreur silencieuse
    }
  };

  useEffect(() => {
    if (!articleSlug) return;
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", articleSlug)
          .eq("status", "published");
        if (error) throw error;
        if (!data || data.length === 0) {
          setError("Article non trouvé");
          setArticle(null);
          setLoading(false);
          return;
        }
        setArticle(data[0]); // Contient .powerpoint_url
        // Charge le thème si besoin
        if (data.theme_id) {
          const { data: th } = await supabase
            .from("themes")
            .select("*")
            .eq("id", data.theme_id);
          if (th && th.length > 0) {
            setTheme(th);
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



  const handleDownload = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Extraire le nom du fichier de l'URL
      const fileName = url.split('/').pop() || 'presentation.pptx';

      // Créer un lien temporaire pour télécharger
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      // Fallback : ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
          showThemesList={true}
          themes={allThemes}
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

  // Récupérer et parser le contenu du champ content
  let content = { blocks: [], finalQuestions: [] };
  try {
    if (article.content) {
      content =
        typeof article.content === "string"
          ? JSON.parse(article.content)
          : article.content;
    }
  } catch (e) {
    // ignore l'erreur silencieusement
  }
  const blocks = content.blocks || [];
  const finalQuestions = article?.final_questions
    ? article.final_questions
      .split('\n')
      .filter(line => line.trim()) // Supprimer les lignes vides
      .map((line, index) => ({
        id: index,
        text: line.trim()
      }))
    : [];

  return (
    <div
      className="article-page"
      style={{ "--theme-color": theme?.color || "#000" }}
    >
      <Header
        menuOpen={menuOpen}
        onToggleMenu={toggleMenu}
        currentTheme={theme}
        showThemesList={true}
        themes={allThemes}
      />


      <div
        className={`article-page-content article-container ${menuOpen ? "hidden" : ""
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
        <h1 className="article-title">{article.title}</h1>
        {article.summary && (
          <p className="article-summary">{article.summary}</p>
        )}


        {/* ---- blocs ---- */}
        {blocks.map((block, index) => (
          <React.Fragment key={index}>
            <section className="content-block">
              {block.title && <h2 className="block-title">{block.title}</h2>}
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
              {block.wikiLinks?.length > 0 && (
                <div className="wiki-link">
                  {block.wikiLinks.map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {l.label || "Voir sur Wikipédia"} →
                    </a>
                  ))}
                </div>
              )}
            </section>
            {index !== blocks.length - 1 && <hr className="block-separator" />}
          </React.Fragment>
        ))}

        {/* ---- questions finales ---- */}
        {finalQuestions.length > 0 && (
          <section className="final-questions-section">
            <h2 className="block-final-title">Et pour finir...</h2>

            {finalQuestions.map((q, i) => (
              <p key={i} className="question-item">
                {q.text}
              </p>
            ))}

          </section>
        )}
        {showScrollTop && (
          <button
            className="scroll-to-top"
            onClick={scrollToTop}
            aria-label="Retour en haut"
          >
            ↑
          </button>)}

        {/* ---- bouton téléchargement ppt ---- */}
        <div className="ppt-download">

          {article.powerpoint_url ? (
            <button
              className="ppt-btn"
              onClick={() => {
                console.log("Clic sur téléchargement:", article.powerpoint_url);
                window.open(article.powerpoint_url, '_blank');
              }}
            >
              Télécharger la présentation associée
            </button>
          ) : (
            <p style={{ color: 'red' }}>Aucune présentation disponible</p>
          )}
        </div>


      </div>

    </div>
  );
}
