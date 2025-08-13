/* Minimal MediaLibrary – front Vite/React
   – liste les fichiers du dossier /public/images via l'API
   – upload d'images => POST /api/media/upload  (champ: images)
   – support sélection d'image via props onSelect
--------------------------------------------------------------- */
import React, { useEffect, useState } from "react";
import "../styles/MediaLibrary.css"; // même dossier (grille simple)

const API =
  import.meta.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5001/api"; // ⬅ ajustez le port si besoin

export default function MediaLibrary({ onSelect }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  /* ---------- fetch liste ---------- */
  const refresh = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/media`);
      const json = await r.json(); // doit renvoyer un tableau
      setFiles(json);
    } catch (e) {
      console.error("Erreur fetch /api/media :", e);
      alert("API indisponible (voir console)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  /* ---------- upload ---------- */
  const onUpload = async (e) => {
    const toSend = e.target.files;
    if (!toSend?.length) return;

    setBusy(true);
    const fd = new FormData();
    [...toSend].forEach((f) => fd.append("images", f)); // champ `images`

    try {
      const r = await fetch(`${API}/media/upload`, {
        method: "POST",
        body: fd,
      });
      if (!r.ok) throw new Error(await r.text());
      await refresh(); // recharge la liste
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload impossible (voir console)");
    } finally {
      setBusy(false);
      e.target.value = null;
    }
  };

  /* ---------- sélection d'image ---------- */
  const handleImageClick = (imageUrl) => {
    if (onSelect) {
      onSelect(imageUrl); // mode sélection
    }
    // sinon, comportement normal (aperçu, etc.)
  };

  /* ---------- rendu ---------- */
  return (
    <div className="ml-root">
      <header className="ml-bar">
        <h2>Médiathèque</h2>
        <label className="ml-btn">
          {busy ? "Envoi…" : "+ Upload"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={onUpload}
          />
        </label>
      </header>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="ml-grid">
          {files.map((f) => (
            <figure
              key={f.name}
              onClick={() => handleImageClick(f.url)}
              style={{
                cursor: onSelect ? "pointer" : "default",
                border: onSelect ? "2px solid transparent" : "none",
                borderRadius: onSelect ? "8px" : "0",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (onSelect) e.target.style.borderColor = "#007bff";
              }}
              onMouseLeave={(e) => {
                if (onSelect) e.target.style.borderColor = "transparent";
              }}
            >
              <img src={f.url} alt={f.name} />
              <figcaption>{f.name}</figcaption>
              {onSelect && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.8em",
                    color: "#007bff",
                    marginTop: "4px",
                  }}
                >
                  Cliquer pour sélectionner
                </div>
              )}
            </figure>
          ))}
          {!files.length && <p>Aucune image</p>}
        </div>
      )}
    </div>
  );
}
