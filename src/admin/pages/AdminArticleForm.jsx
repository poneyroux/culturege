// src/admin/pages/AdminArticleForm.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import ReactQuill from "react-quill";
import MediaPicker from "../components/MediaPicker";
import "react-quill/dist/quill.snow.css";
import "../styles/AdminArticleForm.css";

export default function AdminArticleForm() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(articleId);

  /* ---------------- state ---------------- */
  const [themes, setThemes] = useState([]); // [{id,name,emoji,color,subcategories:[]}]
  const [subcats, setSubcats] = useState([]); // sous-cat du thème choisi
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    slug: "",
    theme_id: "",
    subcategory: "",
    image_url: "",
    powerpoint_url: "", // ← Nom correct de la colonne
    status: "draft",
  });

  const [content, setContent] = useState({ blocks: [] });

  /* ---------------- utils ---------------- */
  const makeSlug = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join("-");

  /* -------------- fetch ------------------ */
  useEffect(() => {
    getThemes();
  }, []);
  useEffect(() => {
    if (isEdit) getArticle();
  }, [articleId]);

  const getThemes = async () => {
    const { data } = await supabase.from("themes").select("*").order("name");
    setThemes(data ?? []);
  };

  const getArticle = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .single();
    if (data) {
      setForm({
        title: data.title ?? "",
        summary: data.summary ?? "",
        slug: data.slug ?? "",
        theme_id: data.theme_id ?? "",
        subcategory: data.subcategory ?? "",
        image_url: data.image_url ?? "",
        powerpoint_url: data.powerpoint_url ?? "",
        status: data.status ?? "draft",
      });
      setContent(
        typeof data.content === "string"
          ? JSON.parse(data.content)
          : data.content
      );
    }
    setLoading(false);
  };

  /* maj sous-cat quand thème ou liste des thèmes change */
  useEffect(() => {
    const th = themes.find((t) => String(t.id) === String(form.theme_id));
    setSubcats(th?.subcategories ?? []);
  }, [themes, form.theme_id]);

  /* ------------- handlers --------------- */
  const onChange = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));

    // slug auto si titre modifié (création)
    if (key === "title" && !isEdit) {
      setForm((p) => ({ ...p, slug: makeSlug(val) }));
    }

    // reset sous-cat si on change de thème
    if (key === "theme_id") {
      const th = themes.find((t) => String(t.id) === String(val));
      setSubcats(th?.subcategories ?? []);
      setForm((p) => ({ ...p, subcategory: "" }));
    }
  };

  /* ---------- blocs de contenu ---------- */
  const addBlock = (type) => {
    const newBlockId = Date.now().toString(); // ← Cette ligne doit être dans la fonction

    setContent((p) => ({
      ...p,
      blocks: [
        ...p.blocks,
        {
          id: newBlockId,
          type,
          title: "",
          data: "",
          questions: [],
          wikiLinks: [],
        },
      ],
    }));

    // Scroll vers le nouveau bloc
    setTimeout(() => {
      const blockElement = document.getElementById(`block-${newBlockId}`);
      if (blockElement) {
        blockElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };


  const updateBlock = (id, field, val) =>
    setContent((p) => ({
      ...p,
      blocks: p.blocks.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    }));

  const deleteBlock = (id) =>
    setContent((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }));

  const addQuestion = (id) => {
    const blk = content.blocks.find((b) => b.id === id);
    updateBlock(id, "questions", [
      ...blk.questions,
      { id: Date.now().toString(), text: "" },
    ]);
  };

  const addWikiLink = (id) =>
    updateBlock(id, "wikiLinks", [
      ...(content.blocks.find((b) => b.id === id)?.wikiLinks ?? []),
      { id: Date.now().toString(), label: "", url: "" },
    ]);

  const deleteWikiLink = (bid, wid) =>
    updateBlock(
      bid,
      "wikiLinks",
      content.blocks
        .find((b) => b.id === bid)
        .wikiLinks.filter((w) => w.id !== wid)
    );

  // Dans AdminArticleForm.jsx, ajoutez cette fonction :
  // Dans AdminArticleForm.jsx, ajoutez ces fonctions :

  const handlePptDelete = async () => {
    if (!data.powerpoint_url) return;

    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer ce PowerPoint ?');
    if (!confirmDelete) return;

    try {
      console.log('Deleting PowerPoint:', data.powerpoint_url);

      const response = await fetch(`/api/delete-powerpoint?url=${encodeURIComponent(data.powerpoint_url)}`, {
        method: 'DELETE',
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText} - ${responseText}`);
      }

      // Supprimer l'URL du formulaire
      onChange("powerpoint_url", "");
      alert("PowerPoint supprimé avec succès !");

    } catch (error) {
      console.error('Erreur suppression PowerPoint:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handlePptUpload = async (event) => {
    const file = event.target.files;
    if (!file) return;

    try {
      console.log('File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      // ✅ Upload direct vers Vercel Blob (pas de limite 4.5MB)
      const response = await fetch('/api/get-upload-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      const { url, token } = await response.json();

      // Upload direct avec fetch vers l'URL signée
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (uploadResponse.ok) {
        const blobUrl = uploadResponse.url.split('?')[0]; // Nettoyer l'URL
        onChange("powerpoint_url", blobUrl);
        alert("PowerPoint uploadé avec succès !");
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(`Erreur: ${error.message}`);
    }
  };


  /* -------------- save ------------------ */
  const handleSave = async (status) => {
    if (!form.title.trim()) return alert("Le titre est obligatoire");
    if (!form.slug.trim()) return alert("Le slug est obligatoire");
    if (!form.theme_id) return alert("Le thème est obligatoire");

    setSaving(true);
    const payload = {
      ...form,
      status,
      content,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit) {
        await supabase.from("articles").update(payload).eq("id", articleId);
      } else {
        await supabase
          .from("articles")
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
      }
      navigate("/admin/articles");
    } catch (e) {
      alert("Erreur de sauvegarde");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  /* ============== render ============== */
  if (loading) return <div className="loader">Chargement…</div>;

  return (
    <div className="page">
      {/* ---- header ---- */}
      <header className="page__header">
        <h1>{isEdit ? "Modifier l’article" : "Nouvel article"}</h1>
        <Link to="/admin/articles" className="btn btn--grey">
          ← Retour
        </Link>
      </header>

      {/* ---- infos générales ---- */}
      <section className="card">
        <h3>Informations générales</h3>

        <div className="grid2">
          <div className="field">
            <label>Titre *</label>
            <input
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => onChange("slug", e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Résumé</label>
          <textarea
            value={form.summary}
            onChange={(e) => onChange("summary", e.target.value)}
          />
        </div>

        <div className="grid2">
          <div className="field">
            <label>Thème *</label>
            <select
              value={form.theme_id}
              onChange={(e) => onChange("theme_id", e.target.value)}
            >
              <option value="">Sélectionner un thème</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.emoji} {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Sous-catégorie</label>
            <select
              value={form.subcategory}
              onChange={(e) => onChange("subcategory", e.target.value)}
              disabled={subcats.length === 0}
            >
              <option value="">Aucune</option>
              {subcats.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---- image principale via médiathèque ---- */}

        <div className="field">
          <label>Image principale</label>
          <MediaPicker
            value={form.image_url}
            onChange={(url) => onChange("image_url", url)}
            triggerLabel={form.image_url ? "Changer l'image" : "Choisir / Uploader une image"}
          />
          {form.image_url && (
            <img src={form.image_url} alt="" className="thumb" style={{ marginTop: '10px', maxWidth: '200px' }} />
          )}
        </div>

      </section>

      {/* ---- blocs ---- */}
      <section className="card">
        <header className="blocks__header">
          <h3>Contenu</h3>
          <div className="btn-group">
            <button className="btn btn--green" onClick={() => addBlock("text")}>
              {" "}
              + Texte
            </button>
            <button className="btn btn--blue" onClick={() => addBlock("image")}>
              {" "}
              + Image
            </button>
            <button
              className="btn btn--purple"
              onClick={() => addBlock("video")}
            >
              {" "}
              + Vidéo
            </button>
            <button
              className="btn btn--orange"
              onClick={() => addBlock("embed")}
            >
              {" "}
              + Embed
            </button>
          </div>
        </header>

        {content.blocks.length === 0 && <p className="empty">Aucun bloc</p>}

        {content.blocks.map((b, i) => (
          <div key={b.id} id={`block-${b.id}`} className="block"> {/* ← ID ajouté */}
            <div className="block__title">
              <strong>
                Bloc {i + 1} – {b.type}
              </strong>
              <button
                className="btn btn--xs btn--red"
                onClick={() => deleteBlock(b.id)}
              >
                Supprimer
              </button>
            </div>

            <div className="field">
              <input
                placeholder="Titre du bloc"
                value={b.title}
                onChange={(e) => updateBlock(b.id, "title", e.target.value)}
              />
            </div>

            {/* ---- Texte ---- */}
            {b.type === "text" && (
              <ReactQuill
                theme="snow"
                value={b.data}
                onChange={(v) => updateBlock(b.id, "data", v)}
              />
            )}

            {/* ---- Image ---- */}
            {/* ---- Image ---- */}
            {b.type === "image" && (
              <div className="field">
                <MediaPicker
                  value={b.data}
                  onChange={(url) => updateBlock(b.id, "data", url)}
                  triggerLabel="Choisir depuis la médiathèque"
                />
                {b.data && <img src={b.data} alt="" className="thumb" />}
              </div>
            )}


            {/* ---- Vidéo ---- */}
            {b.type === "video" && (
              <div className="field">
                <input
                  placeholder="https://www.youtube.com/watch?v=XXXX"
                  value={b.data}
                  onChange={(e) => updateBlock(b.id, "data", e.target.value)}
                />
              </div>
            )}

            {/* ---- Embed ---- */}
            {b.type === "embed" && (
              <textarea
                placeholder="<iframe …></iframe>"
                value={b.data}
                onChange={(e) => updateBlock(b.id, "data", e.target.value)}
              />
            )}

            {/* questions liées */}
            <div className="questions">
              <header>
                <span>Questions liées</span>
                <button
                  className="btn btn--xs btn--grey"
                  onClick={() => addQuestion(b.id)}
                >
                  + Question
                </button>
              </header>

              {b.questions.length === 0 && (
                <p className="empty">Aucune question</p>
              )}

              {b.questions.map((q, qi) => (
                <input
                  key={q.id}
                  className="question-input"
                  placeholder={`Question ${qi + 1}`}
                  value={q.text}
                  onChange={(e) =>
                    updateBlock(
                      b.id,
                      "questions",
                      b.questions.map((qq) =>
                        qq.id === q.id ? { ...qq, text: e.target.value } : qq
                      )
                    )
                  }
                />
              ))}
            </div>

            {/* Liens Wikipédia */}
            <div className="wiki-links">
              <header>
                <span>Liens Wikipédia</span>
                <button
                  className="btn btn--xs btn--grey"
                  onClick={() => addWikiLink(b.id)}
                >
                  + Wikipédia
                </button>
              </header>

              {(b.wikiLinks ?? []).length === 0 && (
                <p className="empty">Aucun lien</p>
              )}

              {(b.wikiLinks ?? []).map((w) => (
                <div key={w.id} className="wiki-item">
                  <input
                    className="wiki-label"
                    placeholder="Titre du lien"
                    value={w.label}
                    onChange={(e) =>
                      updateBlock(
                        b.id,
                        "wikiLinks",
                        b.wikiLinks.map((l) =>
                          l.id === w.id ? { ...l, label: e.target.value } : l
                        )
                      )
                    }
                  />
                  <input
                    className="wiki-url"
                    placeholder="https://fr.wikipedia.org/wiki/..."
                    value={w.url}
                    onChange={(e) =>
                      updateBlock(
                        b.id,
                        "wikiLinks",
                        b.wikiLinks.map((l) =>
                          l.id === w.id ? { ...l, url: e.target.value } : l
                        )
                      )
                    }
                  />
                  <button
                    className="btn btn--xs btn--red"
                    onClick={() => deleteWikiLink(b.id, w.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      {/* ---- PowerPoint (UPLOAD vers Vercel) ---- */}
      <section className="card">
        {/* Section PowerPoint améliorée */}
        <div className="form-group">
          <label>PowerPoint associé</label>

          {data.powerpoint_url ? (
            // PowerPoint existant
            <div className="powerpoint-section">
              <div className="powerpoint-current">
                <div className="powerpoint-info">
                  <span className="powerpoint-icon">📄</span>
                  <span className="powerpoint-name">
                    {data.powerpoint_url.split('/').pop()}
                  </span>
                  <a
                    href={data.powerpoint_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="powerpoint-link"
                  >
                    Ouvrir
                  </a>
                </div>
                <div className="powerpoint-actions">
                  <button
                    type="button"
                    onClick={handlePptDelete}
                    className="btn-delete"
                  >
                    🗑️ Supprimer
                  </button>
                  <label className="btn-change">
                    🔄 Changer
                    <input
                      type="file"
                      accept=".ppt,.pptx, .pdf"
                      onChange={handlePptUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            // Aucun PowerPoint
            <div className="powerpoint-upload">
              <label className="btn-upload">
                📤 Ajouter un PowerPoint
                <input
                  type="file"
                  accept=".ppt,.pptx, .pdf"
                  onChange={handlePptUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}
        </div>

      </section>


      {/* ---- actions ---- */}
      <div className="actions">
        <button
          className="btn btn--grey"
          disabled={saving}
          onClick={() => handleSave("draft")}
        >
          {saving ? "…" : "Brouillon"}
        </button>
        <button
          className="btn btn--green"
          disabled={saving}
          onClick={() => handleSave("published")}
        >
          {saving ? "…" : "Publier"}
        </button>
      </div>
    </div>
  );
}
