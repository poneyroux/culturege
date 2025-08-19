import React, { useState, useEffect, useRef } from 'react';
import './MediaPicker.css';

export default function MediaPicker({ value, onChange, triggerLabel = "Choisir une image" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Charger la médiathèque
  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get-media');
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Erreur chargement médiathèque:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  // Upload d'une nouvelle image
  const handleUpload = async (event) => {
    const file = event?.target?.files?.[0];

    if (!file) return;

    console.log("=== STARTING UPLOAD ===");
    console.log("File:", file.name, file.type, file.size);

    // Vérification du type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const url = `/api/upload-image?filename=${encodeURIComponent(file.name)}`;
      console.log("🚀 Making request to:", url);
      console.log("📦 FormData created with file:", file.name);

      // ✅ Ajout d'un timeout pour éviter l'attente infinie
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes max

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal // Timeout
      });

      clearTimeout(timeoutId); // Annuler le timeout si ça marche

      console.log("✅ Response received!");
      console.log("Status:", response.status);
      console.log("Status text:", response.statusText);
      console.log("Headers:", [...response.headers.entries()]);

      const responseText = await response.text();
      console.log("📄 Response body:", responseText);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log("🎉 Parsed ", data);

      if (data.success) {
        onChange(data.url);
        loadMedia();
        alert('Image uploadée avec succès !');

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error("❌ UPLOAD ERROR:");
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);

      if (error.name === 'AbortError') {
        alert('Upload timeout (30s) - fichier trop volumineux ?');
      } else {
        alert(`Erreur: ${error.message}`);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      console.log("=== UPLOAD FINISHED ===");
      setUploading(false);
    }
  };



  if (!isOpen) {
    return (
      <button
        type="button"
        className="media-picker-trigger"
        onClick={() => setIsOpen(true)}
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="media-picker-modal">
      <div className="media-picker-content">
        <header className="media-picker-header">
          <h3>Médiathèque</h3>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </header>

        <div className="media-picker-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            id="media-upload"
          />
          <label htmlFor="media-upload" className="upload-btn">
            {uploading ? 'Upload en cours...' : '+ Uploader une nouvelle image'}
          </label>
        </div>

        <div className="media-picker-grid">
          {loading && <p>Chargement...</p>}
          {images.length === 0 && !loading && (
            <p className="empty-state">Aucune image dans la médiathèque. Uploadez-en une !</p>
          )}
          {images.map((img) => (
            <div
              key={img.filename}
              className={`media-item ${value === img.url ? 'selected' : ''}`}
              onClick={() => {
                onChange(img.url);
                setIsOpen(false);
              }}
            >
              <img src={img.url} alt={img.filename} />
              <span className="media-filename">{img.filename}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
