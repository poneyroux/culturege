/* src/admin/components/MediaPicker.jsx
   Sélecteur d'image réutilisable qui ouvre MediaModal
   et retourne l'URL sélectionnée
------------------------------------------------------ */
import React, { useState } from "react";
import MediaModal from "./MediaModal";
import "../styles/MediaPicker.css";

export default function MediaPicker({
  value, // URL actuelle
  onChange, // callback(url)
  triggerLabel = "Choisir / Uploader", // texte du bouton
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelect = (imageUrl) => {
    onChange(imageUrl); // transmet l'URL au parent
    setModalOpen(false); // ferme la modale
  };

  return (
    <div className="media-picker">
      <button
        type="button"
        className="btn btn--blue"
        onClick={() => setModalOpen(true)}
      >
        {triggerLabel}
      </button>

      {value && (
        <div className="preview">
          <img src={value} alt="Aperçu" className="thumb" />
          <button
            type="button"
            className="btn btn--xs btn--red"
            onClick={() => onChange("")}
          >
            Supprimer
          </button>
        </div>
      )}

      {modalOpen && (
        <MediaModal
          onSelect={handleSelect} // passe la fonction de sélection
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
