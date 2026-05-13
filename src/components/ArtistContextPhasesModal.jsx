import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getArtistContextPhases } from "../services/api";
import "../styles/plan90.css";

const ArtistContextPhasesModal = ({ artist, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activePhaseTab, setActivePhaseTab] = useState(1);
  const [expandedActions, setExpandedActions] = useState({});
  const [expandedKpi, setExpandedKpi] = useState(null);

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
    if (typeof target === 'object' && target !== null) {
      if (target.url && target.url.startsWith('http')) return target.url;
      if (target.user_handle) return `https://www.tiktok.com/@${target.user_handle}`;
      return null;
    }
    if (typeof target === 'string') {
      if (target.startsWith('@')) return `https://www.tiktok.com/${target}`;
      const h = (headline || '').toLowerCase();
      if (h.includes('playlist')) return `https://open.spotify.com/search/${encodeURIComponent(target)}/playlists`;
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
    if (artist) fetchPhases();
  }, [artist]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);

      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const originalElement = document.getElementById("pdf-phases-content");
      if (!originalElement) return;

      // Create a clone to render off-screen
      const clone = originalElement.cloneNode(true);

      // Force clone to be off-screen but rendered
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = originalElement.offsetWidth + 'px';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';

      // Expand phase pane in the clone so there's no scrollbar
      const phasePane = clone.querySelector('.plan90-phase-pane');
      if (phasePane) {
        phasePane.style.maxHeight = 'none';
        phasePane.style.overflowY = 'visible';
      }

      // Force ALL phases to be visible in the clone
      const phaseContents = clone.querySelectorAll('.plan90-phase-content');
      phaseContents.forEach(el => {
        el.style.display = 'block';
      });

      // Also expand the KPI pane if visible
      const kpiPane = clone.querySelector('.plan90-kpi-pane');
      if (kpiPane) {
        kpiPane.style.maxHeight = 'none';
        kpiPane.style.overflow = 'visible';
      }

      // Hide sidebar and force single-column layout for PDF
      const sidebar = clone.querySelector('.plan90-sidebar');
      if (sidebar) sidebar.style.display = 'none';
      const body = clone.querySelector('.plan90-body');
      if (body) body.style.gridTemplateColumns = '1fr';

      // Hide phase footers in PDF (they are contextual UI)
      clone.querySelectorAll('.plan90-phase-footer').forEach(el => {
        el.style.display = 'none';
      });

      // Hide close and download buttons in the clone
      const closeBtn = clone.querySelector('#pdf-close-btn');
      if (closeBtn) closeBtn.style.display = 'none';
      const downloadBtn = clone.querySelector('#pdf-download-btn');
      if (downloadBtn) downloadBtn.style.display = 'none';

      // Append to body so html2canvas can compute styles
      document.body.appendChild(clone);

      // Wait a tick to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#06070b",
        scrollY: 0,
        windowHeight: clone.scrollHeight,
        allowTaint: true,
        logging: false,
      });

      // Remove the clone after capture
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Plan_90_Dias_${(artist.name || "artista").replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderKpiExpandedPane = () => {
    let targets = [];
    if (expandedKpi === 'playlists') targets = data.priority_targets?.playlists || [];
    else if (expandedKpi === 'markets') targets = data.priority_targets?.markets || [];
    else if (expandedKpi === 'tiktokers') targets = data.priority_targets?.tiktokers || [];

    if (!expandedKpi || targets.length === 0) return null;

    return (
      <div className="plan90-kpi-pane" onClick={(e) => e.stopPropagation()}>
        <div className="plan90-kpi-pane-grid">
          {targets.map((t, idx) => {
            const link = t.url && t.url.startsWith('http') ? t.url : null;
            return (
              <a 
                key={idx} 
                href={link || "#"} 
                target={link ? "_blank" : "_self"} 
                rel={link ? "noopener noreferrer" : ""}
                className="plan90-kpi-item"
                style={{ cursor: link ? "pointer" : "default" }}
                onClick={(e) => { if (!link) e.preventDefault(); }}
              >
                <div className="plan90-kpi-item-header">
                  <span className="plan90-kpi-item-name">{t.name}</span>
                  {t.type && <span className="plan90-kpi-item-type">{t.type}</span>}
                </div>
                {t.reason && (
                  <div className="plan90-kpi-item-reason" title={t.reason}>
                    {t.reason}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  if (!artist) return null;

  // Render logic for the dynamic "it" styling in titles
  const renderItalicTitle = (titleStr) => {
    if (!titleStr) return null;
    const words = titleStr.split(" ");
    if (words.length <= 1) return <span>{titleStr}</span>;
    // Highlight the last word or second word depending on length. Let's just highlight the last word.
    const lastWord = words.pop();
    return (
      <>
        {words.join(" ")} <span className="it">{lastWord}</span>
      </>
    );
  };

  return (
    <div className={`plan90-backdrop plan90-wrapper`} data-phase={activePhaseTab} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="plan90-modal" id="pdf-phases-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="plan90-head">
          <div className="plan90-head-photo">
            {artist.imageUrl || artist.img ? (
               <img src={artist.imageUrl || artist.img} alt={artist.name} />
            ) : (
               <div className="initials">{getInitials(artist.name)}</div>
            )}
          </div>
          <div className="plan90-head-info">
            <div className="eyebrow"><span className="pulse"></span> Plan estratégico · 90 días</div>
            <h1>{renderItalicTitle(artist.name)}</h1>
            <div className="sub">Hoja de ruta para los próximos noventa días.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="plan90-cta plan90-cta-secondary" 
              onClick={handleDownloadPDF}
              disabled={isDownloading || loading || !data}
              id="pdf-download-btn"
              style={{ fontSize: '11px', padding: '7px 14px', gap: '6px' }}
            >
              {isDownloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span className="plan90-btn-label">Exportar plan</span>
                </>
              )}
            </button>
            <button id="pdf-close-btn" className="plan90-close-btn" aria-label="Cerrar" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "1.5rem" }}>
            <Loader2 size={48} className="animate-spin" style={{ color: "var(--accent)" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", textAlign: "center" }}>
              {loadingMessages[loadingMsgIdx]}<br/>
            </p>
          </div>
        ) : !data || !data.phases ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "1.5rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>No se pudo generar el plan de acción en este momento.</p>
            <button
              onClick={() => {
                setLoading(true);
                getArtistContextPhases(artist.spotifyid || artist.id).then(res => { setData(res); setLoading(false); });
              }}
              className="plan90-cta"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="plan90-kpis">
              <div 
                className={`plan90-kpi ${data.priority_targets?.playlists?.length ? 'clickable' : ''}`}
                onClick={() => {
                  if (data.priority_targets?.playlists?.length) {
                    setExpandedKpi(expandedKpi === 'playlists' ? null : 'playlists');
                  }
                }}
              >
                <div>
                  <div className="v">{data.priority_targets?.playlists?.length || 0} <span className="unit">playlists</span></div>
                  <div className="l">Listados objetivo {data.priority_targets?.playlists?.length ? (expandedKpi === 'playlists' ? '▲' : '▼') : ''}</div>
                </div>
                <div className="plan90-kpi-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
              </div>
              <div 
                className={`plan90-kpi ${data.priority_targets?.markets?.length ? 'clickable' : ''}`}
                onClick={() => {
                  if (data.priority_targets?.markets?.length) {
                    setExpandedKpi(expandedKpi === 'markets' ? null : 'markets');
                  }
                }}
              >
                <div>
                  <div className="v">{data.priority_targets?.markets?.length || 0} <span className="unit">emisoras</span></div>
                  <div className="l">Nacional + intl. {data.priority_targets?.markets?.length ? (expandedKpi === 'markets' ? '▲' : '▼') : ''}</div>
                </div>
                <div className="plan90-kpi-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
                  </svg>
                </div>
              </div>
              <div 
                className={`plan90-kpi ${data.priority_targets?.tiktokers?.length ? 'clickable' : ''}`}
                onClick={() => {
                  if (data.priority_targets?.tiktokers?.length) {
                    setExpandedKpi(expandedKpi === 'tiktokers' ? null : 'tiktokers');
                  }
                }}
              >
                <div>
                  <div className="v">{data.priority_targets?.tiktokers?.length || 0} <span className="unit">creadores</span></div>
                  <div className="l">TikTok afines {data.priority_targets?.tiktokers?.length ? (expandedKpi === 'tiktokers' ? '▲' : '▼') : ''}</div>
                </div>
                <div className="plan90-kpi-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
              </div>
            </div>
            {renderKpiExpandedPane()}

            {/* BODY: Sidebar + Content */}
            <div className="plan90-body">
              {/* SIDEBAR */}
              <div className="plan90-sidebar">
                {data.phases.map((phase, idx) => {
                  const phaseNum = idx + 1;
                  const nums = ["01", "02", "03"];
                  const fallbackTitles = ["Impulso Inicial", "Escalamiento", "Expansión"];
                  const fallbackSubs = ["", "Con Artistas Similares", "Nodo B y Exploración Int."];
                  const fallbackDays = ["Días 1–30", "Días 31–60", "Días 61–90"];
                  
                  return (
                    <div
                      key={idx}
                      className={`plan90-sidebar-item ${activePhaseTab === phaseNum ? 'active' : ''}`}
                      data-phase={phaseNum}
                      onClick={() => setActivePhaseTab(phaseNum)}
                    >
                      <span className="plan90-sidebar-num">{nums[idx]}</span>
                      <div className="plan90-sidebar-info">
                        <div className="plan90-sidebar-title">{phase.title || fallbackTitles[idx]}</div>
                        {fallbackSubs[idx] && <div className="plan90-sidebar-subtitle">{fallbackSubs[idx]}</div>}
                        <div className="plan90-sidebar-days">{phase.days || fallbackDays[idx]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT CONTENT */}
              <div className="plan90-phase-pane">
                {data.phases.map((phase, idx) => {
                  const phaseNum = idx + 1;
                  const isVisible = activePhaseTab === phaseNum;
                  const romanNum = phaseNum === 1 ? "I" : phaseNum === 2 ? "II" : "III";
                  
                  return (
                    <div key={idx} className="plan90-phase-content" data-phase={phaseNum} style={{ display: isVisible ? 'block' : 'none' }}>
                      {/* Phase header with progress */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '6px', transition: 'color 0.4s ease' }}>
                            FASE {phaseNum}
                          </div>
                        </div>
                        <div className="plan90-progress">
                          <span className="lbl">Día <b style={{color:'var(--text)'}}>1</b> / 90</span>
                          <div className="plan90-bar">
                            <div className="plan90-fill" style={{ width: activePhaseTab === 1 ? '33.3%' : activePhaseTab === 2 ? '66.6%' : '100%' }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="plan90-phase-header">
                        <div className="plan90-phase-meta">
                          <h2>{renderItalicTitle(phase.title)}</h2>
                        </div>
                      </div>

                      <p className="plan90-phase-tagline">
                        {phaseNum === 1 ? "Ganar momentum donde la puerta ya está entreabierta — playlists de baja barrera y Meta Ads sobre fans afines." :
                         phaseNum === 2 ? "Aparecer donde los artistas similares ya viven — editoriales stretch, TikTokers y emisoras de afinidad." :
                         "Cruzar al segundo grado del ecosistema — playlists Nodo B, creadores nuevos y radios internacionales."}
                      </p>

                      <div className="plan90-moves">
                        {phase.actions && phase.actions.map((action, actionIdx) => {
                          let ico = "◉";
                          const hl = (action.headline || "").toLowerCase();
                          if (hl.includes("playlist")) ico = "♫";
                          else if (hl.includes("tiktok") || hl.includes("creadores")) ico = "▲";
                          else if (hl.includes("radio") || hl.includes("emisoras")) ico = "◐";
                          else if (hl.includes("ciudad") || hl.includes("plaza")) ico = "⬡";

                          const hasLinks = action.targets && action.targets.some(t => getTargetLink(t, action.headline));
                          const actionKey = `${phaseNum}-${actionIdx}`;
                          const isExpanded = expandedActions[actionKey];

                          return (
                            <div 
                              key={actionIdx} 
                              className="plan90-move"
                              onClick={() => {
                                if (action.targets && action.targets.length > 0) {
                                  setExpandedActions(prev => ({...prev, [actionKey]: !prev[actionKey]}));
                                }
                              }}
                              style={{ cursor: action.targets && action.targets.length > 0 ? "pointer" : "default", alignItems: isExpanded ? "flex-start" : "center" }}
                            >
                              <span className="plan90-move-tag" style={{ marginTop: isExpanded ? "2px" : "0" }}><span className="ico">{ico}</span> {hl.split(" ")[0] || "Acción"}</span>
                              <div className="plan90-move-body">
                                <div className="plan90-move-title">{action.headline}</div>
                                <div className="plan90-move-targets" style={{ whiteSpace: isExpanded ? "normal" : "nowrap" }}>
                                  {!isExpanded ? (
                                    action.targets && action.targets.map(t => getTargetName(t)).join(" · ") || action.description
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
                                      {action.targets && action.targets.map((t, tIdx) => {
                                        const link = getTargetLink(t, action.headline);
                                        const name = getTargetName(t);
                                        if (link) {
                                          return (
                                            <a 
                                              key={tIdx} 
                                              href={link} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                              style={{ color: "var(--accent)", textDecoration: "none", fontSize: "12px", display: "inline-block", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "4px" }}
                                              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                            >
                                              {name} <span style={{fontSize: "10px", opacity: 0.7, marginLeft: "4px"}}>↗</span>
                                            </a>
                                          );
                                        }
                                        return <span key={tIdx} style={{ color: "var(--text-2)", fontSize: "12px", background: "rgba(255,255,255,0.02)", padding: "4px 8px", borderRadius: "4px" }}>{name}</span>;
                                      })}
                                      {(!action.targets || action.targets.length === 0) && action.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {action.targets && action.targets.length > 0 && (
                                <span className="plan90-move-arrow" style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s ease", marginTop: isExpanded ? "2px" : "0" }}>→</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODAL FOOTER: Enfoque + Impacto (reactive to active phase) */}
            <div className="plan90-phase-footer">
              <div>
                <div className="plan90-pf-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div className="plan90-pf-label">Enfoque</div>
                <div className="plan90-pf-text">
                  {activePhaseTab === 1 ? "Tracción rápida y primeros resultados" :
                   activePhaseTab === 2 ? "Conectar con audiencias similares y editores" :
                   "Diversificar canales y consolidar crecimiento"}
                </div>
              </div>
              <span className="plan90-pf-arrow">→</span>
              <div>
                <div className="plan90-pf-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div className="plan90-pf-label">Impacto Esperado</div>
                <div className="plan90-pf-text">
                  {activePhaseTab === 1 ? "Más visibilidad, primeras conexiones y crecimiento inicial." :
                   activePhaseTab === 2 ? "Presencia editorial, alcance en TikTok y rotación en radio." :
                   "Ecosistema completo, nuevos mercados y sustentabilidad."}
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default ArtistContextPhasesModal;
