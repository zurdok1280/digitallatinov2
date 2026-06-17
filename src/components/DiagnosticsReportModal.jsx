import React, { useState, useRef, useEffect } from "react";
import {
  X, ChevronLeft, ChevronRight, Download,
  CheckCircle2, Music, TrendingUp, Heart, Search,
  FileText, BarChart2, Star, Settings,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { getCountries, getCitiesGapData } from "../services/api";
import "./DiagnosticsReportModal.css";

const DiagnosticsReportModal = ({ artist, artistData, citiesGapData, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [cardScale, setCardScale] = useState(1);
  const cardRefs = useRef([]);
  const cardWrapperRef = useRef(null);
  const totalSlides = 9;

  // Editable states
  const [coverImage, setCoverImage] = useState(artist?.imageUrl || "");
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 }); // Posición en píxeles
  const [bgZoom, setBgZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [daysText, setDaysText] = useState("45 días");
  const [card2Note, setCard2Note] = useState("En CDMX, artistas similares promedian oyentes superiores. La audiencia ya consume el género — solo falta llegarle.");
  const [card3Note, setCard3Note] = useState("Score = Gap × Afinidad de género. Ciudades donde tu audiencia potencial es mayor, con menor competencia directa.");
  const [card5Note, setCard5Note] = useState("Objetivo: posicionar al artista entre los Top 5 del género en mercados principales por oyentes mensuales de Spotify.");
  const [price, setPrice] = useState("$5,000");
  const [card8Req, setCard8Req] = useState("Acceso como agencia a Spotify for Artists para optimizar perfil y hacer pitch editorial.");
  const [ctaLink, setCtaLink] = useState("https://digital-latino.com");

  // Country Picker states
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [allCitiesData, setAllCitiesData] = useState(citiesGapData || []);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Base64 image states to prevent html2canvas CORS hangs
  const [logoBase64, setLogoBase64] = useState("");
  const [artistImageBase64, setArtistImageBase64] = useState("");
  const [coverImageBase64, setCoverImageBase64] = useState("");

  // Pre-fetch images and convert to Base64 to prevent html2canvas CORS hangs
  useEffect(() => {
    let active = true;

    const convertToDataURL = async (url) => {
      if (!url) return "";
      if (url.startsWith("data:")) return url;

      try {
        // Bypass caching header issues on external domains by using a cache buster parameter
        let fetchUrl = url;
        if (url.startsWith("http")) {
          fetchUrl = `${url}${url.includes("?") ? "&" : "?"}_cb=${Date.now()}`;
        }
        const res = await fetch(fetchUrl, { mode: "cors" });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("Failed to load image via fetch/CORS:", url, err);
        // Fallback: draw image to a canvas (if CORS permissions allow)
        try {
          return await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg"));
              } catch (e) {
                reject(e);
              }
            };
            img.onerror = (e) => reject(e);
            img.src = url;
          });
        } catch (fallbackErr) {
          console.error("Fallback image conversion failed:", fallbackErr);
          // Return transparent 1x1 GIF to prevent image loading failure hanging html2canvas
          return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        }
      }
    };

    const loadAll = async () => {
      const logoData = await convertToDataURL("/logo.png");
      if (!active) return;
      setLogoBase64(logoData);

      if (artist?.imageUrl) {
        const artistData = await convertToDataURL(artist.imageUrl);
        if (!active) return;
        setArtistImageBase64(artistData);
        if (coverImage === artist.imageUrl) {
          setCoverImageBase64(artistData);
        }
      }
    };

    loadAll();
    return () => { active = false; };
  }, [artist?.imageUrl]);

  // Keep coverImage in sync if artist imageUrl changes asynchronously
  useEffect(() => {
    if (artist?.imageUrl) {
      setCoverImage(artist.imageUrl);
    }
  }, [artist?.imageUrl]);

  // Keep coverImageBase64 in sync when coverImage changes
  useEffect(() => {
    let active = true;
    if (coverImage) {
      if (coverImage.startsWith("data:")) {
        setCoverImageBase64(coverImage);
      } else {
        const convert = async () => {
          try {
            // Bypass caching header issues on external domains by using a cache buster parameter
            const fetchUrl = coverImage.startsWith("http")
              ? `${coverImage}${coverImage.includes("?") ? "&" : "?"}_cb=${Date.now()}`
              : coverImage;
            const res = await fetch(fetchUrl, { mode: "cors" });
            if (!res.ok) throw new Error("Fetch failed");
            const blob = await res.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              if (active) setCoverImageBase64(reader.result);
            };
            reader.readAsDataURL(blob);
          } catch (e) {
            console.error("Failed to convert coverImage:", e);
            if (active) setCoverImageBase64(coverImage);
          }
        };
        convert();
      }
    }
    return () => { active = false; };
  }, [coverImage]);

  // Compute scale so the fixed 390×844 card fits within the viewport
  useEffect(() => {
    const compute = () => {
      const maxH = window.innerHeight * 0.82;
      const maxW = Math.min(window.innerWidth - 160, 500);
      setCardScale(Math.min(maxH / 844, maxW / 390, 1));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchCountries = async () => {
      const data = await getCountries();
      if (active) setCountriesList(data);
    };
    fetchCountries();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (selectedCountries.length === 0) {
      setAllCitiesData(citiesGapData || []);
      return;
    }
    
    const fetchAll = async () => {
      setIsCitiesLoading(true);
      try {
        const results = await Promise.all(
          selectedCountries.map(countryId => getCitiesGapData(countryId, artist?.id))
        );
        if (active) {
          const combined = results.flat();
          setAllCitiesData(combined);
        }
      } catch (error) {
        console.error("Error fetching cities for selected countries", error);
      } finally {
        if (active) setIsCitiesLoading(false);
      }
    };
    
    fetchAll();
    return () => { active = false; };
  }, [selectedCountries, artist?.id, citiesGapData]);

  const toggleCountry = (countryId) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryId)) {
        return prev.filter(id => id !== countryId);
      } else {
        if (prev.length >= 10) return prev; // Max 10 countries
        return [...prev, countryId];
      }
    });
  };

  const formatNum = (num) => {
    if (!num) return "0";
    const n = Number(num);
    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return Math.round(n).toLocaleString();
  };

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !isGeneratingPDF) onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [onClose, isGeneratingPDF]);

  const handleNext = () => { if (currentSlide < totalSlides - 1) setCurrentSlide(s => s + 1); };
  const handlePrev = () => { if (currentSlide > 0) setCurrentSlide(s => s - 1); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePointerDown = (e) => {
    if (isGeneratingPDF) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Mover 1:1 en píxeles
    setBgPos(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    await new Promise(r => setTimeout(r, 100)); // allow spinner to show
    const savedSlide = currentSlide;

    // Disable CSS transition on the track so slides change instantly
    const track = cardWrapperRef.current?.querySelector(".report-slides-track");
    if (track) track.style.transition = "none";

    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [390, 844] });

      for (let i = 0; i < totalSlides; i++) {
        setCurrentSlide(i);
        // Wait just enough for React to render the new slide position instantly
        await new Promise(r => setTimeout(r, 45));

        const slideEl = cardRefs.current[i];
        if (!slideEl) continue;

        // Reset scroll position
        slideEl.scrollTop = 0;

        // Force exact 390x844px dimension and add pdf-exporting class to slide
        slideEl.classList.add("report-pdf-exporting");
        const origOverflowY = slideEl.style.overflowY;
        const origWidth = slideEl.style.width;
        const origHeight = slideEl.style.height;
        const origFlex = slideEl.style.flex;

        slideEl.style.overflowY = "hidden";
        slideEl.style.width = "390px";
        slideEl.style.height = "844px";
        slideEl.style.flex = "0 0 390px";

        await new Promise(r => setTimeout(r, 25)); // wait for DOM to settle

        let dataUrl = null;
        try {
          dataUrl = await Promise.race([
            toPng(slideEl, {
              pixelRatio: 2,
              backgroundColor: "#0a0a0e",
              fontEmbedCSS: "", // Disable slow and blocking remote font-face fetches/embeddings
              style: {
                transform: "none",
                borderRadius: "0",
              }
            }),
            new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout capturing slide " + (i + 1))), 8000)),
          ]);
        } catch (captureErr) {
          console.error(`Slide ${i + 1} capture failed or timed out:`, captureErr);
        }

        // Restore styles immediately
        slideEl.classList.remove("report-pdf-exporting");
        slideEl.style.overflowY = origOverflowY;
        slideEl.style.width = origWidth;
        slideEl.style.height = origHeight;
        slideEl.style.flex = origFlex;

        if (!dataUrl) continue;
        if (i > 0) pdf.addPage([390, 844]);
        pdf.addImage(dataUrl, "PNG", 0, 0, 390, 844);

        // --- MAP INTERACTIVE LINKS (Only on final slide: i === 8) ---
        if (i === 8) {
          const slideRect = slideEl.getBoundingClientRect();
          const scaleX = 390 / slideRect.width;
          const scaleY = 844 / slideRect.height;

          // 1. CTA Button Link
          const btn = slideEl.querySelector('#pdf-cta-btn');
          if (btn && ctaLink) {
            let validUrl = ctaLink.trim();
            if (!/^https?:\/\//i.test(validUrl)) validUrl = 'https://' + validUrl;
            
            const btnRect = btn.getBoundingClientRect();
            const relX = (btnRect.left - slideRect.left) * scaleX;
            const relY = (btnRect.top - slideRect.top) * scaleY;
            const relW = btnRect.width * scaleX;
            const relH = btnRect.height * scaleY;
            pdf.link(relX, relY, relW, relH, { url: validUrl });
          }

          // 2. Social Link
          const social = slideEl.querySelector('#pdf-social-link');
          if (social) {
            const socialRect = social.getBoundingClientRect();
            const relX = (socialRect.left - slideRect.left) * scaleX;
            const relY = (socialRect.top - slideRect.top) * scaleY;
            const relW = socialRect.width * scaleX;
            const relH = socialRect.height * scaleY;
            pdf.link(relX, relY, relW, relH, { url: 'https://www.instagram.com/digitallatino/' });
          }
        }
      }

      pdf.save(`Propuesta_ExpansionDigital_${artist?.name || "Artista"}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Error al generar el PDF: " + err.message);
    } finally {
      // Re-enable transition and restore original slide
      if (track) track.style.transition = "";
      setCurrentSlide(savedSlide);
      setIsGeneratingPDF(false);
    }
  };

  const topCities = allCitiesData
    ? [...allCitiesData].sort((a, b) => b.opportunity_score - a.opportunity_score).slice(0, 5)
    : [];

  // ── Styles ────────────────────────────────────────────────────────────────
  const scaleOuter = {
    width: Math.round(390 * cardScale),
    height: Math.round(844 * cardScale),
    position: "relative",
    flexShrink: 0,
  };
  const scaleInner = {
    width: 390,
    height: 844,
    transform: `scale(${cardScale})`,
    transformOrigin: "top left",
    position: "absolute",
    top: 0,
    left: 0,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="report-overlay"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget && !isGeneratingPDF) onClose();
      }}
    >
      {/* PDF loading overlay */}
      {isGeneratingPDF && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3020,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: "1rem",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(168,85,247,0.2)", borderTopColor: "#a855f7",
            animation: "report-spin 0.8s linear infinite",
          }} />
          <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>Generando PDF…</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Esto puede tomar unos segundos</div>
        </div>
      )}

      <button className="report-close-btn" onClick={onClose} disabled={isGeneratingPDF} aria-label="Cerrar">
        <X size={24} />
      </button>

      <div className="report-carousel-container">
        {/* Left arrow */}
        <button className="report-nav-arrow prev" onClick={handlePrev} disabled={currentSlide === 0 || isGeneratingPDF}>
          <ChevronLeft size={24} />
        </button>

        {/* Center column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>

          {/* Scale outer → layout footprint */}
          <div style={scaleOuter}>
            {/* Scale inner → visual scaling from top-left */}
            <div style={scaleInner}>
              <div className="report-card-wrapper" ref={cardWrapperRef}>
                <div className="report-slides-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>

                  {/* ── Slide 1: Portada ──────────────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[0] = el; }}>
                    <div className="card-1-bg">
                      <img 
                        src={coverImageBase64 || coverImage} 
                        alt="Cover" 
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain', // Mostrar completa sin recortes por defecto
                          transform: `translate(${bgPos.x}px, ${bgPos.y}px) scale(${bgZoom / 100})`,
                          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                          pointerEvents: 'none' // Prevent default drag behavior on the image
                        }} 
                      />
                    </div>
                    <div 
                      className="card-1-gradient" 
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      style={{ cursor: isGeneratingPDF ? 'default' : (isDragging ? 'grabbing' : 'grab'), zIndex: 1 }}
                    />
                    {!isGeneratingPDF && (
                      <div className="report-upload-container">
                        <label className="report-upload-btn-overlay">
                          <Download size={14} style={{ transform: "rotate(180deg)" }} />
                          Cambiar Fondo
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                        </label>
                        <div className="report-slider-overlay">
                          <span style={{ fontSize: '0.65rem', marginRight: '6px', color: 'rgba(255,255,255,0.8)' }}>Zoom</span>
                          <input 
                            type="range" 
                            min="10" max="500" 
                            value={bgZoom} 
                            onChange={(e) => setBgZoom(e.target.value)} 
                            title="Ajustar zoom"
                          />
                        </div>
                      </div>
                    )}
                    <div className="report-content card-1-content">
                      <div className="report-logo-top" style={{ position: "absolute", top: "1.8rem", left: "1.5rem" }}>
                        <img src={logoBase64 || "/logo.png"} alt="DigitalLatino" />
                      </div>
                      <div>
                        <div className="report-title-small">PROPUESTA DE EXPANSIÓN DIGITAL</div>
                        <h1 className="report-title-main" style={{ fontSize: "2.2rem" }}>
                          {artist?.name?.split(" ").slice(0, 1).join(" ")} <br />
                          <span>{artist?.name?.split(" ").slice(1).join(" ")}</span>
                        </h1>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                          Análisis Inteligente · Oportunidad de Mercado
                        </div>
                        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                          <div className="report-info-box">Mercado: MX/US</div>
                          <div className="report-info-box report-editable">
                            <span
                              contentEditable={!isGeneratingPDF}
                              suppressContentEditableWarning
                              onBlur={(e) => setDaysText(e.target.textContent)}
                              className="report-editable-span"
                              style={{ display: "inline-block", minWidth: "50px", textAlign: "center" }}
                            >
                              {daysText}
                            </span>
                          </div>
                        </div>
                        <div className="report-info-box" style={{ marginTop: "0.6rem", display: "inline-block" }}>
                          {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 2: Diagnóstico ─────────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[1] = el; }}>
                    <div className="report-content">
                      <div className="report-logo-top"><img src={logoBase64 || "/logo.png"} alt="DL" /></div>
                      <div className="report-title-small">DIAGNÓSTICO</div>
                      <h2 className="report-title-main">Dónde están <span>hoy</span>.</h2>
                      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "0.8rem", display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.8rem" }}>
                        <img src={artistImageBase64 || artist?.imageUrl} alt={artist?.name} style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover" }} />
                        <div>
                          <h3 style={{ fontSize: "1rem", margin: "0 0 0.2rem 0" }}>{artist?.name}</h3>
                          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Métricas actuales</div>
                        </div>
                      </div>
                      <div className="report-data-grid">
                        <div className="report-data-card"><div className="report-data-val">{formatNum(artistData?.monthly_listeners)}</div><div className="report-data-label">Oyentes Spotify</div></div>
                        <div className="report-data-card"><div className="report-data-val">{formatNum(artistData?.video_views_total_youtube)}</div><div className="report-data-label">Vistas YouTube</div></div>
                        <div className="report-data-card"><div className="report-data-val">{formatNum(artistData?.streams_total)}</div><div className="report-data-label">Streams Totales</div></div>
                        <div className="report-data-card"><div className="report-data-val">{artistData?.popularity || 0}</div><div className="report-data-label">Popularidad</div></div>
                      </div>
                      <div className="report-editable" style={{ marginTop: "auto", background: "rgba(236,72,153,0.05)", borderRadius: "10px", borderLeft: "4px solid #ec4899", minHeight: "70px", display: "flex" }}>
                        <div
                          contentEditable={!isGeneratingPDF}
                          suppressContentEditableWarning
                          onBlur={(e) => setCard2Note(e.target.textContent)}
                          className="report-editable-div"
                          style={{ fontSize: "0.8rem", color: "white", width: "100%", whiteSpace: "pre-wrap" }}
                        >
                          {card2Note}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 3: Oportunidad ─────────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[2] = el; }}>
                    <div className="report-content">
                      <div className="report-logo-top"><img src={logoBase64 || "/logo.png"} alt="DL" /></div>
                      <div className="report-title-small">OPORTUNIDAD</div>
                      <h2 className="report-title-main" style={{ fontSize: "1.3rem" }}>La brecha que vamos a <span>cerrar</span>.</h2>
                      
                      {!isGeneratingPDF && (
                        <div className="report-country-picker-container">
                          <button 
                            className="report-country-picker-btn"
                            onClick={() => setShowCountryPicker(!showCountryPicker)}
                          >
                             Países ({selectedCountries.length || 'Todos'})
                          </button>
                          
                          {showCountryPicker && (
                            <div className="report-country-picker-dropdown">
                              {countriesList.map(country => (
                                <label key={country.id}>
                                  <input 
                                    type="checkbox"
                                    checked={selectedCountries.includes(country.id)}
                                    onChange={() => toggleCountry(country.id)}
                                    disabled={!selectedCountries.includes(country.id) && selectedCountries.length >= 10}
                                  />
                                  {country.country_name}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ marginTop: "0.8rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {isCitiesLoading ? (
                          <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>Cargando datos...</div>
                        ) : topCities.map((city, idx) => (
                          <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "0.7rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{city.city_name}</div>
                              <div style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "10px", fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>#{idx + 1}</div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                              <div>Tuyos: <span style={{ color: "white" }}>{formatNum(city.main_current_listeners)}</span></div>
                              <div>Gap: <span style={{ color: "#ec4899" }}>{formatNum(city.listeners_gap_vs_avg_related)}</span></div>
                            </div>
                            <div className="report-gap-bar">
                              <div className="report-gap-fill" style={{ width: `${Math.min(100, (city.main_current_listeners / (city.related_avg_current_listeners || 1)) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                        {!isCitiesLoading && topCities.length === 0 && (
                          <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>Sin datos de ciudades.</div>
                        )}
                      </div>
                      <div className="report-editable" style={{ marginTop: "0.8rem", background: "rgba(168,85,247,0.05)", borderRadius: "10px", borderLeft: "4px solid #a855f7", minHeight: "60px", display: "flex" }}>
                        <div
                          contentEditable={!isGeneratingPDF}
                          suppressContentEditableWarning
                          onBlur={(e) => setCard3Note(e.target.textContent)}
                          className="report-editable-div"
                          style={{ fontSize: "0.75rem", color: "white", width: "100%", whiteSpace: "pre-wrap" }}
                        >
                          {card3Note}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 4: Estrategia pt1 ───────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[3] = el; }}>
                    <div className="report-content">
                      <div className="report-logo-top"><img src={logoBase64 || "/logo.png"} alt="DL" /></div>
                      <div className="report-title-small">ESTRATEGIA</div>
                      <h2 className="report-title-main" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.35rem" }}>
                        Plan de{" "}
                        <span className="report-editable" style={{ display: "inline-block" }}>
                          <span
                            contentEditable={!isGeneratingPDF}
                            suppressContentEditableWarning
                            onBlur={(e) => setDaysText(e.target.textContent)}
                            className="report-editable-span"
                            style={{ outline: "none", display: "inline-block", minWidth: "80px" }}
                          >
                            {daysText}
                          </span>
                        </span>
                      </h2>
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "1rem", marginTop: "0.8rem" }}>
                        <div className="report-title-small" style={{ color: "#a855f7" }}>SEMANAS 1-2</div>
                        <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.6rem 0" }}>Fundación</h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                          <li>○ Optimización perfil Spotify</li>
                          <li>○ Mapeo de curadores de playlists</li>
                          <li>○ Setup Meta Ads en Mercados Clave</li>
                          <li>○ Contacto con influencers TikTok</li>
                        </ul>
                        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.6rem", textAlign: "center", marginTop: "0.8rem" }}>
                          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ec4899" }}>+15%</div>
                          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>PROYECCIÓN CRECIMIENTO</div>
                        </div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "1rem", marginTop: "0.7rem" }}>
                        <div className="report-title-small" style={{ color: "#a855f7" }}>SEMANAS 3-4</div>
                        <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.6rem 0" }}>Activación</h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                          <li>○ Pitch a Spotify Editorial</li>
                          <li>○ Campañas con influencers TikTok</li>
                          <li>○ Optimización basada en data</li>
                        </ul>
                        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.6rem", textAlign: "center", marginTop: "0.8rem" }}>
                          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ec4899" }}>+40%</div>
                          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>PROYECCIÓN CRECIMIENTO</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 5: Estrategia pt2 ───────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[4] = el; }}>
                    <div className="report-content">
                      <div className="report-logo-top"><img src={logoBase64 || "/logo.png"} alt="DL" /></div>
                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "1rem", marginTop: "0.5rem" }}>
                        <div className="report-title-small" style={{ color: "#a855f7" }}>SEMANAS 5-6</div>
                        <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.6rem 0" }}>Escala</h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                          <li>○ Negociación con curadores independientes</li>
                          <li>○ Expansión a ciudades secundarias</li>
                          <li>○ Análisis de save-rate por canción</li>
                          <li>○ Reporte final de campaña</li>
                        </ul>
                        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "0.6rem", textAlign: "center", marginTop: "0.8rem" }}>
                          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ec4899" }}>+80%</div>
                          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", letterSpacing: "1px" }}>META DE CRECIMIENTO GLOBAL</div>
                        </div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "1.2rem", marginTop: "0.7rem", textAlign: "center" }}>
                        <div className="report-title-small" style={{ marginBottom: "0.8rem" }}>RESUMEN DE METAS</div>
                        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#a855f7" }}>{formatNum(artistData?.monthly_listeners)}</div>
                            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)" }}>ACTUALES</div>
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.3)" }}>→</div>
                          <div>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#a855f7" }}>{formatNum(Number(artistData?.monthly_listeners) * 1.8)}</div>
                            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)" }}>OBJETIVO</div>
                          </div>
                        </div>
                      </div>
                      <div className="report-editable" style={{ marginTop: "0.7rem", background: "rgba(255,255,255,0.04)", borderRadius: "10px", minHeight: "65px", display: "flex" }}>
                        <div
                          contentEditable={!isGeneratingPDF}
                          suppressContentEditableWarning
                          onBlur={(e) => setCard5Note(e.target.textContent)}
                          className="report-editable-div"
                          style={{ fontSize: "0.78rem", color: "white", width: "100%", whiteSpace: "pre-wrap" }}
                        >
                          {card5Note}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 6: Servicios pt1 ───────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[5] = el; }}>
                    <div className="report-content">
                      <div className="report-logo-top"><img src={logoBase64 || "/logo.png"} alt="DL" /></div>
                      <div className="report-title-small">SERVICIOS</div>
                      <h2 className="report-title-main">Qué <span>incluye</span>.</h2>
                      <div style={{ marginTop: "0.8rem" }}>
                        <div className="report-service-item"><div className="report-service-icon"><BarChart2 size={16} color="#60a5fa" /></div><div><div className="report-service-title">Reporte de Audiencia</div><div className="report-service-desc">Data de Spotify, YouTube y TikTok con benchmarks.</div></div></div>
                        <div className="report-service-item"><div className="report-service-icon"><Search size={16} color="#a78bfa" /></div><div><div className="report-service-title">Análisis de Competencia</div><div className="report-service-desc">Brechas y oportunidades por ciudad con herramientas.</div></div></div>
                        <div className="report-service-item"><div className="report-service-icon"><Music size={16} color="#34d399" /></div><div><div className="report-service-title">Playlist Pitching</div><div className="report-service-desc">Pitch a 10+ playlists: curadores independientes y Editorial.</div></div></div>
                        <div className="report-service-item"><div className="report-service-icon"><TrendingUp size={16} color="#fb923c" /></div><div><div className="report-service-title">Meta Ads</div><div className="report-service-desc">Campañas geolocalizadas en mercados clave identificados.</div></div></div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 7: Servicios pt2 ───────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[6] = el; }}>
                    <div className="report-content">
                      <div className="report-logo-top"><img src={logoBase64 || "/logo.png"} alt="DL" /></div>
                      <div style={{ marginTop: "0.5rem" }}>
                        <div className="report-service-item"><div className="report-service-icon"><Star size={16} color="#f472b6" /></div><div><div className="report-service-title">Pitch a Influencers</div><div className="report-service-desc">Contacto con creadores del ecosistema de tu género.</div></div></div>
                        <div className="report-service-item"><div className="report-service-icon"><Heart size={16} color="#f87171" /></div><div><div className="report-service-title">Playlists Personalizadas</div><div className="report-service-desc">Inserción en playlists curadas de la red Digital Latino.</div></div></div>
                        <div className="report-service-item"><div className="report-service-icon"><FileText size={16} color="#94a3b8" /></div><div><div className="report-service-title">Reportes Quincenales</div><div className="report-service-desc">2 reportes con métricas de avance y ajustes estratégicos.</div></div></div>
                        <div className="report-service-item"><div className="report-service-icon"><Settings size={16} color="#cbd5e1" /></div><div><div className="report-service-title">Optimización Continua</div><div className="report-service-desc">Ajuste semanal de pauta basado en métricas reales.</div></div></div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 8: Inversión ───────────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[7] = el; }}>
                    <div className="report-content">
                      <div className="report-logo-top"><img src={logoBase64 || "/logo.png"} alt="DL" /></div>
                      <div className="report-title-small">INVERSIÓN</div>
                      <div style={{ textAlign: "center", margin: "1rem 0" }}>
                        <div className="report-editable" style={{ display: "inline-block" }}>
                          <span
                            contentEditable={!isGeneratingPDF}
                            suppressContentEditableWarning
                            onBlur={(e) => setPrice(e.target.textContent)}
                            className="report-editable-span"
                            style={{ fontSize: "2.8rem", fontWeight: 800, color: "#f472b6", textAlign: "center", outline: "none", display: "inline-block", minWidth: "120px" }}
                          >
                            {price}
                          </span>
                        </div>
                        <div style={{ fontSize: "1rem", letterSpacing: "2px", color: "rgba(255,255,255,0.7)" }}>USD</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "0.4rem" }}>
                          Fee único · Mercados Clave ·{" "}
                          <span className="report-editable" style={{ display: "inline-block" }}>
                            <span
                              contentEditable={!isGeneratingPDF}
                              suppressContentEditableWarning
                              onBlur={(e) => setDaysText(e.target.textContent)}
                              className="report-editable-span"
                              style={{ outline: "none", display: "inline-block", minWidth: "50px" }}
                            >
                              {daysText}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div>
                        {["Estrategia + ejecución digital completa", "Meta Ads management incluido", "2 reportes quincenales de avance", "Dashboard de métricas en tiempo real", "Playlist pitching + inserción", "Pitch a influencers TikTok"].map((item, idx) => (
                          <div key={idx} className="report-checklist-item">
                            <div className="report-check-icon"><CheckCircle2 size={14} /></div>
                            <div style={{ fontSize: "0.78rem" }}>{item}</div>
                          </div>
                        ))}
                        <div className="report-editable" style={{ background: "rgba(236,72,153,0.05)", borderLeft: "4px solid #ec4899", padding: "0.6rem", borderRadius: "0 8px 8px 0", marginTop: "0.5rem" }}>
                          <div style={{ fontSize: "0.65rem", color: "#ec4899", fontWeight: "bold", marginBottom: "0.3rem" }}>Requisito:</div>
                          <div
                            contentEditable={!isGeneratingPDF}
                            suppressContentEditableWarning
                            onBlur={(e) => setCard8Req(e.target.textContent)}
                            className="report-editable-div"
                            style={{ fontSize: "0.72rem", color: "white", width: "100%", whiteSpace: "pre-wrap" }}
                          >
                            {card8Req}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Slide 9: CTA ─────────────────────────────────────── */}
                  <div className="report-slide" ref={el => { cardRefs.current[8] = el; }}>
                    <div className="report-content" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                      <img src={logoBase64 || "/logo.png"} alt="DigitalLatino" style={{ height: "32px", marginBottom: "1.5rem" }} />
                      <h2 className="report-title-main" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                        Los datos sin <span>ejecución</span> no sirven.
                      </h2>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "2rem" }}>
                        Digital Strategy &amp; Music Intelligence
                      </div>
                      <div className="report-editable" style={{ display: "inline-block", position: "relative" }}>
                        <a id="pdf-cta-btn" href={ctaLink} target="_blank" rel="noopener noreferrer" className="report-download-btn" style={{ textDecoration: "none", padding: "0.8rem 2rem", fontSize: "1rem" }}>
                          Comencemos 
                        </a>
                        {!isGeneratingPDF && (
                          <div style={{ position: "absolute", top: "-28px", left: "50%", transform: "translateX(-50%)", width: "200px" }}>
                            <input type="text" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className="report-editable-input" style={{ fontSize: "0.65rem", textAlign: "center", background: "rgba(0,0,0,0.8)", padding: "3px", borderRadius: "4px" }} placeholder="Link destino" />
                          </div>
                        )}
                      </div>
                      <a id="pdf-social-link" href="https://www.instagram.com/digitallatino/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "2.5rem", fontSize: "0.75rem", letterSpacing: "2px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                        @digitallatino
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Footer: download + page indicator */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            {currentSlide === totalSlides - 1 && (
              <button className="report-download-btn" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                <Download size={16} />
                {isGeneratingPDF ? "Generando PDF…" : "Descargar Reporte"}
              </button>
            )}
            {!isGeneratingPDF && (
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", letterSpacing: "2px" }}>
                {String(currentSlide + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </div>
            )}
          </div>
        </div>

        {/* Right arrow */}
        <button className="report-nav-arrow next" onClick={handleNext} disabled={currentSlide === totalSlides - 1 || isGeneratingPDF}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default DiagnosticsReportModal;
