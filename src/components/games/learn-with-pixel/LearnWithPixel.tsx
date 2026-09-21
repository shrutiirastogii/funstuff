import { useState } from "react";
import videos, { getThumbnailUrl, type LearnVideo } from "./videos";

export default function LearnWithPixel() {
  const [activeVideo, setActiveVideo] = useState<LearnVideo | null>(null);
  const [blockedEmbed, setBlockedEmbed] = useState(false);

  const openVideo = (video: LearnVideo) => {
    setBlockedEmbed(video.embeddable === false);
    setActiveVideo(video);
  };

  const closeModal = () => {
    setActiveVideo(null);
    setBlockedEmbed(false);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "4px" }}>Learn with Pixel</h1>
      <p style={{ color: "#888", marginBottom: "20px" }}>
        {videos.length} tiles. Pick one, learn something in a few minutes.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => openVideo(video)}
            style={{
              position: "relative",
              padding: 0,
              border: "none",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "pointer",
              aspectRatio: "16 / 9",
              backgroundColor: "#111",
            }}
          >
            <img
              src={getThumbnailUrl(video.youtubeVideoId)}
              alt={video.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0) 60%)",
                display: "flex",
                alignItems: "flex-end",
                padding: "8px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                {video.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      {activeVideo && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "720px",
              background: "#1a1a1a",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "12px 16px", color: "white" }}>
              <strong>{activeVideo.title}</strong>
              <span style={{ color: "#888", marginLeft: "8px", fontSize: "13px" }}>
                {activeVideo.category}
              </span>
            </div>

            {blockedEmbed ? (
              <div style={{ padding: "40px 16px", textAlign: "center" }}>
                <p style={{ color: "#ccc", marginBottom: "12px" }}>
                  This video can't be played here.
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#4ea8ff" }}
                >
                  Watch on YouTube
                </a>
              </div>
            ) : (
              <div style={{ position: "relative", aspectRatio: "16 / 9" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeVideoId}?autoplay=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => setBlockedEmbed(true)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              </div>
            )}

            <button
              onClick={closeModal}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                background: "#2a2a2a",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}