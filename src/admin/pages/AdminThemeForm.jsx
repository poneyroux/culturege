/* src/admin/pages/AdminThemeForm.jsx
   – formulaire complet (création / édition) des thèmes
------------------------------------------------------ */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "../styles/AdminThemeForm.css";

export default function AdminThemeForm() {
  /* ---------- routing ---------- */
  const { themeId } = useParams(); // undefined → création
  const isEdit = Boolean(themeId);
  const navigate = useNavigate();

  /* ---------- state ---------- */
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    emoji: "📚",
    color: "#2196f3",
    subcategories: [], // tableau de strings
  });

  /* ---------- helpers ---------- */
  const makeSlug = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // retire accents
      .toLowerCase()
      .replace(/[^a-z0-9\\s-]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join("-");

  /* ---------- fetch en édition ---------- */
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("id", themeId)
        .single();

      if (error) console.error(error);
      if (data)
        setForm({
          ...data,
          subcategories: data.subcategories ?? [], // sécurise
        });

      setLoading(false);
    })();
  }, [isEdit, themeId]);

  /* ---------- sauvegarde ---------- */
  const save = async () => {
    if (!form.name.trim()) return alert("Le nom est obligatoire");
    if (!form.slug.trim()) return alert("Le slug est obligatoire");

    setSaving(true);

    /* retire entrées vides / espaces */
    const cleanSubs = form.subcategories.map((s) => s.trim()).filter(Boolean);

    const payload = {
      ...form,
      subcategories: cleanSubs, // tableau prêt pour une colonne jsonb
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit) {
        await supabase.from("themes").update(payload).eq("id", themeId);
      } else {
        await supabase
          .from("themes")
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
      }
      navigate("/admin/themes");
    } catch (e) {
      console.error(e);
      alert("Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- sous-catégories (UI) ---------- */
  const addSubcat = () =>
    setForm((f) => ({ ...f, subcategories: [...f.subcategories, ""] }));

  const handleSubcatKey = (e, i) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (form.subcategories[i].trim() !== "") addSubcat();
    }
  };

  const updateSubcat = (i, v) =>
    setForm((f) => ({
      ...f,
      subcategories: f.subcategories.map((s, si) => (si === i ? v : s)),
    }));

  const deleteSubcat = (i) =>
    setForm((f) => ({
      ...f,
      subcategories: f.subcategories.filter((_, si) => si !== i),
    }));

  /* ---------- rendu ---------- */
  if (loading) return <div className="theme-loader">Chargement…</div>;

  return (
    <div className="theme-page">
      <header className="theme-header">
        <h1>{isEdit ? "Modifier le thème" : "Nouveau thème"}</h1>
        <Link to="/admin/themes" className="btn btn--grey">
          ← Retour
        </Link>
      </header>

      <div className="theme-card">
        {/* nom & slug */}
        <div className="grid2">
          <div className="field">
            <label>Nom *</label>
            <input
              value={form.name}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({
                  ...f,
                  name: v,
                  slug: isEdit ? f.slug : makeSlug(v),
                }));
              }}
            />
          </div>
          <div className="field">
            <label>Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
        </div>

        {/* emoji & couleur */}
        <div className="grid2">
          <div className="field">
            <label>Emoji</label>
            <input
              value={form.emoji}
              maxLength={2}
              style={{ fontSize: "2rem", textAlign: "center" }}
              onChange={(e) =>
                setForm((f) => ({ ...f, emoji: e.target.value }))
              }
            />
          </div>
          <div className="field">
            <label>Couleur</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) =>
                setForm((f) => ({ ...f, color: e.target.value }))
              }
            />
          </div>
        </div>

        {/* sous-catégories */}
        <div className="subcat-wrapper">
          <header>
            <span>Sous-catégories</span>
            <button className="btn btn--xs btn--grey" onClick={addSubcat}>
              + Ajouter
            </button>
          </header>

          {form.subcategories.length === 0 && (
            <p className="empty">Aucune sous-catégorie</p>
          )}

          {form.subcategories.map((s, i) => (
            <div key={i} className="subcat-item">
              <input
                value={s}
                placeholder={`Sous-catégorie ${i + 1}`}
                onChange={(e) => updateSubcat(i, e.target.value)}
                onKeyDown={(e) => handleSubcatKey(e, i)}
              />
              <button
                className="btn btn--xs btn--red"
                onClick={() => deleteSubcat(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="theme-actions">
        <button className="btn btn--green" disabled={saving} onClick={save}>
          {saving ? "…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
