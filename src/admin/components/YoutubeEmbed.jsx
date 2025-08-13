import React from "react";

export default function YoutubeEmbed({ url }) {
  if (!url) return null;

  // Extraction de l’ID vidéo classique ou short url
  const videoIdMatch = url.match(
    /(?:youtube\.com\/watch\\?v=|youtu\.be\/)([\\w-]+)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  if (!embedUrl) return <p>URL YouTube invalide</p>;

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "56.25%",
        height: 0,
        overflow: "hidden",
      }}
    >
      <iframe
        src={embedUrl}
        title="Vidéo Youtube"
        frameBorder="0"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
