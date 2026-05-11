import React, { useState, useEffect } from "react";
import { X, Calendar, Activity, Loader2, Download } from "lucide-react";
import { getArtistContextPhases } from "../services/api";

const ArtistContextPhasesModal = ({ artist, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadingMessages = [
    "Recopilando información del artista...",
    "Cruzando datos de oyentes y seguidores...",
    "Analizando playlists relevantes...",
    "Calculando similitudes algorítmicas...",
    "Generando hoja de ruta a 90 días...",
    "Estructurando fases de estrategia..."
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const getTargetLink = (target, headline) => {
    // Support new object structure
    if (typeof target === 'object' && target !== null) {
      if (target.url && target.url.startsWith('http')) return target.url;
      if (target.user_handle) return `https://www.tiktok.com/@${target.user_handle}`;
      return null;
    }

    // Fallback for old string array structure
    if (typeof target === 'string') {
      if (target.startsWith('@')) {
        return `https://www.tiktok.com/${target}`;
      }
      const h = (headline || '').toLowerCase();
      if (h.includes('playlist')) {
        return `https://open.spotify.com/search/${encodeURIComponent(target)}/playlists`;
      }
    }
    return null;
  };

  const getTargetName = (target) => {
    return typeof target === 'object' && target !== null ? target.name : target;
  };

  useEffect(() => {
    const fetchPhases = async () => {
      setLoading(true);
      const phasesData = await getArtistContextPhases(artist.spotifyid || artist.id);
      setData(phasesData);
      setLoading(false);
    };
    if (artist) {
      fetchPhases();
    }
  }, [artist]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const element = document.getElementById("pdf-phases-content");
      if (!element) return;

      const originalHeight = element.style.height;
      const originalOverflow = element.style.overflow;
      const contentDiv = element.querySelector('.phases-scroll-container');
      const originalOverflowY = contentDiv ? contentDiv.style.overflowY : '';

      element.style.height = 'auto';
      element.style.overflow = 'visible';
      if (contentDiv) {
        contentDiv.style.overflowY = 'visible';
        contentDiv.style.maxHeight = 'none';
      }

      // Hide the close button and download button from PDF
      const closeBtn = document.getElementById("pdf-close-btn");
      const downloadBtn = document.getElementById("pdf-download-btn");
      if (closeBtn) closeBtn.style.display = "none";
      if (downloadBtn) downloadBtn.style.display = "none";

      // Add scrollY: 0 and set windowHeight to fix text alignment offsets
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#191923",
        scrollY: -window.scrollY,
        windowHeight: element.scrollHeight
      });

      // Restore
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      if (contentDiv) {
        contentDiv.style.overflowY = originalOverflowY;
      }
      if (closeBtn) closeBtn.style.display = "flex";
      if (downloadBtn) downloadBtn.style.display = "flex";

      const imgData = canvas.toDataURL("image/png");
      
      // Create a PDF that exactly matches the canvas dimensions to eliminate blank space
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Plan_90_Dias_${artist.name.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!artist) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="pdf-phases-content"
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1300px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "var(--bg-dark)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to right, rgba(138, 136, 255, 0.1), rgba(0,0,0,0))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <img
              src={artist.imageUrl || artist.img || "/logo.png"}
              alt={artist.name}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #8a88ff",
              }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>
                Plan de Acción de 90 Días
              </h2>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
                {artist.name} • Hoja de Ruta Estratégica
              </p>
            </div>
          </div>
          <button
            id="pdf-close-btn"
            onClick={onClose}
            className="glass-panel-interactive"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="phases-scroll-container" style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "1.5rem",
              }}
            >
              <Loader2 size={48} className="animate-spin" style={{ color: "#8a88ff" }} />
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", textAlign: "center", transition: "opacity 0.5s ease-in-out" }}>
                {loadingMessages[loadingMsgIdx]}<br/>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Para {artist.name}</span>
              </p>
            </div>
          ) : !data || !data.phases ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "1.5rem",
              }}
            >
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                No se pudo generar el plan de acción en este momento.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLoading(true);
                  getArtistContextPhases(artist.spotifyid || artist.id).then(res => {
                    setData(res);
                    setLoading(false);
                  });
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Executive Summary */}
              <div
                style={{
                  background: "rgba(138, 136, 255, 0.05)",
                  border: "1px solid rgba(138, 136, 255, 0.2)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#8a88ff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Activity size={18} /> Resumen Ejecutivo
                </h3>
                <p style={{ margin: 0, color: "var(--text-main)", lineHeight: 1.6, fontSize: "1.05rem" }}>
                  {data.executive_summary}
                </p>
              </div>

              {/* 3 Columns Kanban Board */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "1.5rem",
                  alignItems: "stretch",
                }}
              >
                {data.phases.map((phase, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(25, 25, 35, 0.6)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    {/* Phase Header */}
                    <div
                      style={{
                        padding: "1.5rem",
                        background: idx === 0 ? "linear-gradient(135deg, rgba(255, 51, 102, 0.15) 0%, rgba(0,0,0,0) 100%)" 
                                   : idx === 1 ? "linear-gradient(135deg, rgba(138, 136, 255, 0.15) 0%, rgba(0,0,0,0) 100%)"
                                   : "linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(0,0,0,0) 100%)",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span
                          style={{
                            background: idx === 0 ? "rgba(255, 51, 102, 0.2)" : idx === 1 ? "rgba(138, 136, 255, 0.2)" : "rgba(0, 229, 255, 0.2)",
                            color: idx === 0 ? "#ff3366" : idx === 1 ? "#8a88ff" : "#00e5ff",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {phase.phase}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          <Calendar size={14} /> {phase.days}
                        </div>
                      </div>
                      <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem" }}>
                        {phase.title}
                      </h3>
                    </div>

                    {/* Phase Actions */}
                    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                      {phase.actions && phase.actions.map((action, actionIdx) => (
                        <div
                          key={actionIdx}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: "12px",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.8rem",
                            transition: "transform 0.2s, background 0.2s",
                            cursor: "default"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          }}
                        >
                          <h4 style={{ margin: 0, color: "#e2e8f0", fontSize: "1.05rem" }}>
                            {action.headline}
                          </h4>
                          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                            {action.description}
                          </p>
                          {action.targets && action.targets.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
                              {action.targets.map((target, targetIdx) => {
                                const link = getTargetLink(target, action.headline);
                                const name = getTargetName(target);
                                const isClickable = !!link;
                                return (
                                  <a
                                    key={targetIdx}
                                    href={link || undefined}
                                    target={isClickable ? "_blank" : undefined}
                                    rel={isClickable ? "noopener noreferrer" : undefined}
                                    style={{
                                      background: "rgba(255,255,255,0.08)",
                                      color: isClickable ? "#00e5ff" : "#cbd5e1",
                                      padding: "0.2rem 0.6rem",
                                      borderRadius: "4px",
                                      fontSize: "0.75rem",
                                      textDecoration: "none",
                                      cursor: isClickable ? "pointer" : "default",
                                      transition: "background 0.2s, color 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (isClickable) {
                                        e.currentTarget.style.background = "rgba(0, 229, 255, 0.15)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (isClickable) {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                      }
                                    }}
                                    title={isClickable ? `Abrir ${name}` : undefined}
                                  >
                                    {name}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Download Button */}
              <div id="pdf-download-btn" style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    background: "linear-gradient(135deg, #00e5ff 0%, #1db954 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 2rem",
                    borderRadius: "24px",
                    fontWeight: "bold",
                    cursor: isDownloading ? "wait" : "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 15px rgba(0, 229, 255, 0.4)",
                    opacity: isDownloading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isDownloading) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 229, 255, 0.6)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDownloading) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 229, 255, 0.4)";
                    }
                  }}
                >
                  {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {isDownloading ? "Generando PDF..." : "Descargar PDF"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistContextPhasesModal;
