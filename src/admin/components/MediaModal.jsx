/* src/admin/components/MediaModal.jsx */
import React, { useState } from "react";
import MediaLibrary from "./MediaLibrary";
import "../styles/MediaModal.css";

export default function MediaModal({
  triggerLabel = "Ouvrir la médiathèque",
  onSelect, // fonction de sélection
  onClose, // fonction de fermeture
}) {
  const [open, setOpen] = useState(true); // ouverte par défaut si appelée

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleImageSelect = (imageUrl) => {
    onSelect?.(imageUrl);
  };

  if (!open) return null;

  return (
    <div className="mm-backdrop" onClick={handleClose}>
      <div className="mm-body" onClick={(e) => e.stopPropagation()}>
        <button className="mm-close" onClick={handleClose}>
          ✕
        </button>
        <MediaLibrary onSelect={handleImageSelect} />
      </div>
    </div>
  );
}
