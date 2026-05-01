import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Target,
  Headphones,
  Radio,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Link as LinkIcon,
  Mail,
  Loader2,
  Users
} from "lucide-react";
import { getArtistContext } from "../services/api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Global cache to prevent duplicate fetches (especially in React StrictMode) 
// and to make reopening the modal instantaneous.
const contextCache = {};

// Circular Progress Component for Growth Opportunity Score
const CircularProgress = ({ value }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  // Choose color based on score
  const color = value >= 80 ? "#1DB954" : value >= 60 ? "#FBBF24" : "#EF4444";

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  );
};

export default function ArtistContextModal({ artist, onClose }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Recopilando información del artista...");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState("playlists");

  useEffect(() => {
    // Bloquear el scroll de la página de fondo
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const spotifyId = artist?.spotify_id || artist?.id || artist?.spotifyid;

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchContext = async () => {
      if (!spotifyId) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      // If already fetched or currently fetching, use the cache
      if (contextCache[spotifyId]) {
        if (contextCache[spotifyId] instanceof Promise) {
          const result = await contextCache[spotifyId];
          if (isMounted) {
            setData(result);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setData(contextCache[spotifyId]);
            setIsLoading(false);
          }
        }
        return;
      }

      setIsLoading(true);
      
      // Store the promise in the cache so any immediate duplicate calls (like StrictMode) await the same promise
      const fetchPromise = getArtistContext(spotifyId);
      contextCache[spotifyId] = fetchPromise;
      
      try {
        const result = await fetchPromise;
        if (!result || result.error) {
          // It failed or timed out (returned null from api.js or error from backend)
          delete contextCache[spotifyId];
        } else {
          contextCache[spotifyId] = result; // Replace promise with actual data
        }
        
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (error) {
        delete contextCache[spotifyId]; // Remove from cache on error
        if (isMounted) setIsLoading(false);
      }
    };
    fetchContext();
    return () => { isMounted = false; };
  }, [spotifyId, retryCount]);

  const handleRetry = () => {
    delete contextCache[spotifyId];
    setData(null);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    if (!isLoading) return;

    const phrases = [
      "Conectando con la base de datos musical...",
      "Recopilando información general del artista...",
      "Analizando rendimiento global en plataformas...",
      "Cruzando datos de oyentes y seguidores...",
      "Mapeando tendencias de crecimiento...",
      "Identificando oportunidades clave en mercados...",
      "Evaluando impacto en curadores y playlists...",
      "Calculando proyecciones de alcance...",
      "Sintetizando datos para la inteligencia artificial...",
      "Procesando insights de alto valor...",
      "Redactando el resumen estratégico con IA...",
      "Estructurando el plan de acción recomendado...",
      "Casi listo, finalizando los detalles del reporte..."
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phrases.length;
      setLoadingText(phrases[currentIndex]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Tab mapping
  const tabs = [
    { id: "playlists", label: "Playlists", icon: Headphones },
    { id: "tiktokers", label: "TikTokers", icon: Users },
    { id: "radio", label: "Radio", icon: Radio },
    { id: "ciudades", label: "Ciudades", icon: MapPin },
  ];

  const handleDownloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    setIsGeneratingPDF(true);
    
    // Save original styles to restore them after capture
    const originalMaxHeight = input.style.maxHeight;
    const originalOverflowY = input.style.overflowY;
    const originalHeight = input.style.height;

    // Apply styles to expand the container fully
    input.style.maxHeight = "none";
    input.style.overflowY = "visible";
    input.style.height = "auto";

    // Wait a short moment to allow the DOM to reflow
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f1115",
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Reporte_Estrategico_${data?.artist_name || artist.name || "Artista"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      // Restore the original styles
      input.style.maxHeight = originalMaxHeight;
      input.style.overflowY = originalOverflowY;
      input.style.height = originalHeight;
      setIsGeneratingPDF(false);
    }
  };

  if (!artist) return null;

  return (
    <div
      className="flex-center modal-overlay-padding"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        zIndex: 2500,
        padding: "1rem",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel animate-fade-in modal-container"
        style={{
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#0f1115", // Very dark sleek background
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
        id="pdf-content"
      >
        {/* HEADER */}
        <div style={{ position: "relative", padding: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              padding: "0.5rem",
              borderRadius: "50%",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            data-html2canvas-ignore="true"
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <X size={20} />
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Artist Info */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                {artist.image_url || artist.img || artist.imageUrl ? (
                  <img
                    src={artist.image_url || artist.img || artist.imageUrl}
                    alt={artist.artist_name || artist.name}
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="flex-center" style={{ width: "100%", height: "100%" }}><Users size={32} color="var(--text-dim)" /></div>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "white", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {data?.artist_name || artist.artist_name || artist.name}
                  <CheckCircle2 size={20} color="#1DB954" />
                </h2>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", color: "var(--text-main)" }}>
                    Reporte Estratégico
                  </span>
                </div>
              </div>
            </div>

            {/* Score */}
            {!isLoading && data && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      Growth Opportunity Score
                      <AlertCircle size={12} />
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>
                      Basado en oportunidades y gap
                    </div>
                  </div>
                  <CircularProgress value={data.opportunity_score || 0} />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-center" style={{ padding: "4rem", flexDirection: "column", gap: "1rem", minHeight: "300px" }}>
            <Loader2 size={40} className="loading-spinner" color="var(--accent-primary)" />
            <div style={{ height: "24px", display: "flex", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }} className="animate-fade-in">
                {loadingText}
              </span>
            </div>
          </div>
        ) : !data || data.error ? (
          <div className="flex-center" style={{ padding: "4rem", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
            <AlertCircle size={40} color="var(--accent-primary)" />
            <span style={{ fontSize: "1.1rem" }}>No se pudo cargar el resumen estratégico.</span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)", textAlign: "center", maxWidth: "400px" }}>
              El servidor tardó demasiado en generar el resumen o hubo un error de conexión (Error 504). La inteligencia artificial puede tardar un poco más en horas pico.
            </span>
            <button 
              onClick={handleRetry}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                background: "var(--accent-primary)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div style={{ padding: "1.5rem" }}>
            {/* Plan de acción recomendado */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <Calendar size={20} color="var(--text-muted)" />
                <h3 style={{ fontSize: "1.05rem", color: "white", margin: 0, fontWeight: 700 }}>Plan de acción recomendado</h3>
              </div>
              <div style={{ display: "flex", gap: "2rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {data.priority_actions?.map((action, i) => (
                      <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                        <div className="flex-center" style={{ 
                          width: "28px", height: "28px", borderRadius: "50%", 
                          background: "var(--accent-primary)", color: "white", 
                          fontWeight: "700", fontSize: "0.95rem", flexShrink: 0,
                          boxShadow: "0 0 10px rgba(99, 102, 241, 0.3)"
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ fontSize: "0.95rem", color: "white", lineHeight: 1.5, paddingTop: "3px" }}>
                          {action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ width: "300px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   <div style={{ textAlign: "center" }}>
                      <Target size={32} color="var(--accent-primary)" style={{ margin: "0 auto 1rem auto" }} />
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "white" }}>Ejecuta este plan</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.75rem", lineHeight: "1.5" }}>
                        Nuestro equipo de expertos en marketing musical te acompaña para lograr tus objetivos. Solicita una evaluación estratégica y recibe un plan de acción claro y personalizado.
                      </div>
                      <a 
                        href={`https://api.whatsapp.com/send/?phone=13104699872&text=Estoy+interesado+en+hacer+una+campa%C3%B1a+personalizada+para+el+artista+${encodeURIComponent(data?.artist_name || artist.name || artist.artist_name || "seleccionado")}.&type=phone_number&app_absent=0`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: "1.25rem",
                          background: "var(--accent-primary)",
                          color: "white",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "8px",
                          fontWeight: "600",
                          textDecoration: "none",
                          fontSize: "0.95rem",
                          transition: "opacity 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                        onMouseLeave={e => e.currentTarget.style.opacity = 1}
                        data-html2canvas-ignore="true"
                      >
                        Solicitar Plan
                      </a>
                   </div>
                </div>
              </div>
            </div>

            {/* Summary Blocks */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { icon: Headphones, label: "Playlists", count: data.playlist_summary?.total_opportunities || 0, sub: "Oportunidades", color: "#1DB954" },
                { icon: Users, label: "TikTokers", count: data.tiktok_summary?.total_opportunities || 0, sub: "Oportunidades", color: "#ff0050" },
                { icon: Radio, label: "Radio", count: data.radio_summary?.total_opportunities || 0, sub: "Emisoras clave", color: "#F59E0B" },
                { icon: MapPin, label: "Ciudades", count: data.radio_summary?.top_markets?.length || 0, sub: "Mercados nuevos", color: "#3B82F6" },
              ].map((block, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1.25rem",
                  display: "flex", flexDirection: "column", gap: "0.5rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
                    <block.icon size={18} color={block.color} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{block.label}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>
                      {block.count} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--text-muted)" }}>{block.label === "Playlists" && data.playlist_summary?.top_opportunities?.length ? "Missing" : ""}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: block.color, marginTop: "4px" }}>{block.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs Navigation */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "1.5rem" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "1rem 1.5rem", background: "none", border: "none",
                    borderBottom: activeTab === tab.id ? "2px solid var(--accent-primary)" : "2px solid transparent",
                    color: activeTab === tab.id ? "var(--text-main)" : "var(--text-muted)",
                    fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s"
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ minHeight: "250px", marginBottom: "2rem" }}>
              {activeTab === "playlists" && (
                <div>
                  <h4 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "1rem" }}>Playlists recomendadas (Missing)</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: isGeneratingPDF ? "none" : "350px", overflowY: isGeneratingPDF ? "visible" : "auto", paddingRight: isGeneratingPDF ? "0" : "8px" }}>
                    {data.playlist_summary?.top_opportunities?.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div className="flex-center" style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #1DB954, #1ed760)", borderRadius: "8px" }}>
                            <Headphones size={24} color="white" />
                          </div>
                          <div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>{p.playlist_name}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {p.type_name} • {p.reason}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Prioridad</div>
                            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: p.priority === "High" ? "#EF4444" : "#1DB954" }}>
                              {p.priority === "High" ? "Alta" : p.priority}
                            </div>
                          </div>
                          <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "tiktokers" && (
                <div>
                  <h4 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "1rem" }}>Top Creadores Recomendados</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: isGeneratingPDF ? "none" : "350px", overflowY: isGeneratingPDF ? "visible" : "auto", paddingRight: isGeneratingPDF ? "0" : "8px" }}>
                    {data.tiktok_summary?.top_creators?.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                          <div className="flex-center" style={{ width: "48px", height: "48px", background: "rgba(255,0,80,0.1)", borderRadius: "50%", flexShrink: 0 }}>
                            <Users size={24} color="#ff0050" />
                          </div>
                          <div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>{c.user_name} <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 400 }}>@{c.user_handle}</span></div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {c.reason}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexShrink: 0, marginLeft: "1rem" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Views Relacionadas</div>
                            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "white" }}>
                              {(c.total_views_related / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "radio" && (
                <div>
                  <h4 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "1rem" }}>Oportunidades Missing en Radio</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: isGeneratingPDF ? "none" : "350px", overflowY: isGeneratingPDF ? "visible" : "auto", paddingRight: isGeneratingPDF ? "0" : "8px" }}>
                    {data.radio_summary?.top_stations?.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div className="flex-center" style={{ width: "48px", height: "48px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px" }}>
                            <Radio size={24} color="#F59E0B" />
                          </div>
                          <div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>{s.station_name}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              Mercado: {s.market} • {s.reason}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Gap de Audiencia</div>
                            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "white" }}>
                              {(s.audience_gap / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "ciudades" && (
                <div>
                   <h4 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "1rem" }}>Mercados Clave</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: isGeneratingPDF ? "none" : "350px", overflowY: isGeneratingPDF ? "visible" : "auto", paddingRight: isGeneratingPDF ? "0" : "8px" }}>
                    {data.radio_summary?.top_markets?.map((m, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div className="flex-center" style={{ width: "48px", height: "48px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px" }}>
                            <MapPin size={24} color="#3B82F6" />
                          </div>
                          <div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "white" }}>{m.market}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {m.reason}
                            </div>
                          </div>
                        </div>
                         <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Opp Score</div>
                            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1DB954" }}>
                              {m.opportunity_score}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resumen Estratégico Box */}
            <div style={{
              background: "linear-gradient(145deg, rgba(30, 27, 75, 0.4) 0%, rgba(17, 24, 39, 0.4) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              gap: "1.5rem",
              marginTop: "0.5rem"
            }}>
              <div className="flex-center" style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", color: "#818cf8", flexShrink: 0 }}>
                <Target size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#a5b4fc", margin: "0 0 0.5rem 0" }}>Resumen estratégico</h3>
                <p style={{ fontSize: "0.95rem", color: "var(--text-main)", margin: 0, lineHeight: 1.5 }}>
                  {data.executive_summary || data.dashboard_message}
                </p>
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(99, 102, 241, 0.05)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                  <div style={{ color: "#818cf8" }}><Target size={18} /></div>
                  <div>
                    <span style={{ color: "#818cf8", fontSize: "0.85rem", fontWeight: 600, display: "block" }}>Acción clave:</span>
                    <span style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>{data.main_opportunity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }} data-html2canvas-ignore="true">
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                style={{ flex: 1, padding: "0.8rem", background: "var(--accent-primary)", border: "none", borderRadius: "8px", color: "white", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: isGeneratingPDF ? "not-allowed" : "pointer", opacity: isGeneratingPDF ? 0.7 : 1, transition: "opacity 0.2s" }} 
                onMouseEnter={e => { if (!isGeneratingPDF) e.currentTarget.style.opacity = 0.9 }} 
                onMouseLeave={e => { if (!isGeneratingPDF) e.currentTarget.style.opacity = 1 }}
              >
                {isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
                {isGeneratingPDF ? "Generando PDF..." : "Descargar PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
