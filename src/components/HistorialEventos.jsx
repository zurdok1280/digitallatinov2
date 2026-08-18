import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Radio,
  TrendingUp,
  TrendingDown,
  Trophy,
  Music,
  Plus,
  Minus,
  Award,
  Calendar,
  Loader2,
} from "lucide-react";
import { getSongTimeline } from "../services/api";

// ─── Constants ──────────────────────────────────────────────────────────────
const BATCH_SIZE = 50;

// ─── Event Type Config ───────────────────────────────────────────────────────
const EVENT_CONFIG = {
  RADIO_FIRST_PLAY: {
    icon: Radio,
    color: "#FF7A00",   // orange
    label: "Radio",
  },
  RANK_UP: {
    icon: TrendingUp,
    color: "#22c55e",   // green
    label: "Subió",
  },
  RANK_DOWN: {
    icon: TrendingDown,
    color: "#ef4444",   // red
    label: "Bajó",
  },
  RANK_TOP: {
    icon: Trophy,
    color: "#FFD700",
    label: "Top Chart",
  },
  TIKTOK_MILESTONE: {
    icon: Music,
    color: "#ff0050",
    label: "TikTok",
  },
  PLAYLIST_ADD: {
    icon: Plus,
    color: "#1DB954",
    label: "Playlist",
  },
  PLAYLIST_REMOVE: {
    icon: Minus,
    color: "#e74c3c",
    label: "Playlist",
  },
  STREAM_MILESTONE: {
    icon: Award,
    color: "#FFD700",
    label: "Milestone",
  },
};

const DEFAULT_CONFIG = {
  icon: Calendar,
  color: "#8a88ff",
  label: "Evento",
};

// ─── Medal Colors ────────────────────────────────────────────────────────────
const MEDAL_COLOR = {
  1: "#FFD700", // gold
  2: "#C0C0C0", // silver
  3: "#CD7F32", // bronze
};

// ─── Rank helpers ────────────────────────────────────────────────────────────
const getRankPosition = (event) => {
  if (!["RANK_TOP", "RANK_UP", "RANK_DOWN"].includes(event.eventType)) return null;
  const pos = parseInt(event.value, 10);
  return isNaN(pos) ? null : pos;
};

const getMedalEmoji = (pos) => {
  if (pos === 1) return "🥇";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return null;
};

// ─── Border & Card Class Helpers ─────────────────────────────────────────────
const getBorderGradient = (eventType, rankPos) => {
  if (eventType === "RADIO_FIRST_PLAY") return "#FF7A00";
  if (eventType === "RANK_UP")          return "#22c55e";
  if (eventType === "RANK_DOWN")        return "#ef4444";
  if (eventType === "RANK_TOP") {
    if (rankPos !== null && rankPos <= 3) {
      const medalColor = MEDAL_COLOR[rankPos] || "#FFD700";
      return `linear-gradient(to bottom, #22c55e 50%, ${medalColor} 50%)`;
    }
    return `linear-gradient(to bottom, #22c55e 50%, #FFD700 50%)`;
  }
  return null;
};

// ─── Dot (Sphere) Style Helper ───────────────────────────────────────────────
const getDotStyle = (eventType, rankPos, fallbackColor) => {
  if (eventType === "RADIO_FIRST_PLAY") {
    return {
      background: "#FF7A00",
      boxShadow: "0 0 10px rgba(255, 122, 0, 0.7)",
    };
  }
  if (eventType === "RANK_UP") {
    return {
      background: "#22c55e",
      boxShadow: "0 0 10px rgba(34, 197, 94, 0.7)",
    };
  }
  if (eventType === "RANK_DOWN") {
    return {
      background: "#ef4444",
      boxShadow: "0 0 10px rgba(239, 68, 68, 0.7)",
    };
  }
  if (eventType === "RANK_TOP") {
    if (rankPos !== null && rankPos <= 3) {
      const medalColor = MEDAL_COLOR[rankPos] || "#FFD700";
      return {
        background: `linear-gradient(135deg, #22c55e 50%, ${medalColor} 50%)`,
        boxShadow: "0 0 10px rgba(255, 215, 0, 0.8)",
      };
    }
    return {
      background: "linear-gradient(135deg, #22c55e 50%, #FFD700 50%)",
      boxShadow: "0 0 10px rgba(255, 215, 0, 0.7)",
    };
  }
  return {
    background: fallbackColor,
    boxShadow: `0 0 8px ${fallbackColor}60`,
  };
};

const getCardClass = (eventType, rankPos) => {
  const base = "timeline-card";
  if (eventType === "RADIO_FIRST_PLAY") return `${base} timeline-card--radio`;
  if (eventType === "RANK_UP")          return `${base} timeline-card--rank-up`;
  if (eventType === "RANK_DOWN")        return `${base} timeline-card--rank-down`;
  if (eventType === "RANK_TOP") {
    if (rankPos !== null && rankPos <= 3) return `${base} timeline-card--top3`;
    return `${base} timeline-card--top10`;
  }
  return base;
};

// ─── Date Helpers ────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatEventDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].substring(0, 3)} ${d.getFullYear()}`;
};

const getMonthKey = (dateStr) => {
  if (!dateStr) return "Sin fecha";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "Sin fecha";
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

// ─── Group events by month ───────────────────────────────────────────────────
const groupByMonth = (events) => {
  const groups = {};
  events.forEach((event) => {
    const key = getMonthKey(event.eventDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  });
  return Object.entries(groups);
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
  <div
    className="timeline-card skeleton-block"
    style={{
      opacity: 0.6,
      animation: `timelineSpringIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
      marginBottom: "1rem",
    }}
  >
    <div className="shimmer-effect" />
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: "55%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />
        <div style={{ width: "35%", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
      </div>
    </div>
  </div>
);

// ─── Single Event Card ───────────────────────────────────────────────────────
const EventCard = React.memo(({ event, staggerDelay }) => {
  const config = EVENT_CONFIG[event.eventType] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const rankPos = getRankPosition(event);
  const medal = rankPos ? getMedalEmoji(rankPos) : null;
  const isTop3 = event.eventType === "RANK_TOP" && rankPos !== null && rankPos <= 3;
  const borderGradient = getBorderGradient(event.eventType, rankPos);
  const cardClass = getCardClass(event.eventType, rankPos);
  const dotStyle = getDotStyle(event.eventType, rankPos, config.color);

  return (
    <div
      className={cardClass}
      style={{
        "--timeline-accent": config.color,
        "--border-gradient": borderGradient || config.color,
        animationDelay: `${staggerDelay}s`,
      }}
    >
      {/* Dot on the vertical line */}
      <div
        className="timeline-dot"
        style={dotStyle}
      />

      <div className="timeline-card-content">
        {/* Top row: date + badge */}
        <div className="timeline-card-header">
          <span className="timeline-date-pill">{formatEventDate(event.eventDate)}</span>
          <span
            className="timeline-platform-badge"
            style={{ background: `${config.color}20`, color: config.color }}
          >
            <Icon size={12} />
            <span>{config.label}</span>
          </span>
        </div>

        {/* Main row: icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Directional icon for rank events */}
          {event.eventType === "RANK_UP" && (
            <TrendingUp size={16} color="#22c55e" style={{ flexShrink: 0 }} />
          )}
          {event.eventType === "RANK_DOWN" && (
            <TrendingDown size={16} color="#ef4444" style={{ flexShrink: 0 }} />
          )}
          {event.eventType === "RANK_TOP" && (
            isTop3 && medal ? (
              <span className="timeline-medal-emoji" style={{ flexShrink: 0, lineHeight: 1 }}>
                {medal}
              </span>
            ) : (
              <Trophy size={16} color="#FFD700" style={{ flexShrink: 0 }} />
            )
          )}

          <p className="timeline-title" style={{ flex: 1 }}>{event.title}</p>
        </div>

        {/* Footer: value badge only (subtitle hidden) */}
        {event.value > 0 && event.eventType !== "RANK_TOP" &&
          event.eventType !== "RANK_UP" && event.eventType !== "RANK_DOWN" && (
          <div className="timeline-card-footer">
            <span
              className="timeline-value-badge"
              style={{ background: `${config.color}15`, color: config.color }}
            >
              {event.value >= 1_000_000
                ? `${(event.value / 1_000_000).toFixed(1)}M`
                : event.value >= 1_000
                ? `${(event.value / 1_000).toFixed(0)}K`
                : `${event.value}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
EventCard.displayName = "EventCard";

// ─── Main Component ──────────────────────────────────────────────────────────
const HistorialEventos = ({ artist }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const csSong = artist?.cs_song || artist?.csSong;
  const songTitle =
    artist?.title ||
    artist?.song ||
    artist?.song_name ||
    artist?.name ||
    artist?.track_name ||
    "la canción";

  // ── Fetch all events once ──
  useEffect(() => {
    if (!csSong) { setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setVisibleCount(BATCH_SIZE);

    (async () => {
      try {
        const data = await getSongTimeline(csSong);
        if (!cancelled) setAllEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [csSong]);

  // ── IntersectionObserver for lazy rendering ──
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= allEvents.length) return prev;
      setIsLoadingMore(true);
      setTimeout(() => setIsLoadingMore(false), 300);
      return Math.min(prev + BATCH_SIZE, allEvents.length);
    });
  }, [allEvents.length]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinelRef.current);

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [loadMore]);

  // ── Guard states ──
  if (!csSong) {
    return (
      <div className="animate-fade-in flex-center" style={{ height: 300, flexDirection: "column", gap: "1rem" }}>
        <Calendar size={48} style={{ opacity: 0.2 }} />
        <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          Selecciona una canción para ver su historial de eventos
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ padding: "0.5rem 0" }}>
        {/* Dynamic Glow Loading Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.75rem",
            padding: "1rem 1.25rem",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(138, 136, 255, 0.08) 0%, rgba(255, 158, 238, 0.04) 100%)",
            border: "1px solid rgba(138, 136, 255, 0.18)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div
              style={{
                position: "absolute",
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(138, 136, 255, 0.25)",
                animation: "pulse 1.8s ease-in-out infinite",
              }}
            />
            <Loader2 size={24} className="spin" style={{ color: "var(--accent-primary)", position: "relative", zIndex: 2 }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-main)", fontSize: "0.95rem", fontWeight: 600 }}>
                Obteniendo los eventos de{" "}
                <span className="text-gradient" style={{ fontWeight: 700 }}>
                  "{songTitle}"
                </span>
              </span>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "2px" }}>
              Analizando emisiones radiales, listas y charts…
            </span>
          </div>
        </div>

        {/* Shimmer Skeletons */}
        <div className="timeline-container">
          <div className="timeline-line" />
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in flex-center" style={{ height: 300, flexDirection: "column", gap: "1rem" }}>
        <Calendar size={48} style={{ opacity: 0.2, color: "#ff6b6b" }} />
        <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Error al cargar el historial</span>
      </div>
    );
  }

  if (allEvents.length === 0) {
    return (
      <div className="animate-fade-in flex-center" style={{ height: 300, flexDirection: "column", gap: "1rem" }}>
        <Calendar size={48} style={{ opacity: 0.2 }} />
        <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Sin eventos registrados aún</span>
      </div>
    );
  }

  const visibleEvents = allEvents.slice(0, visibleCount);
  const grouped = groupByMonth(visibleEvents);
  const hasMore = visibleCount < allEvents.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, flexWrap: "wrap" }}>
          <Calendar size={20} color="#8a88ff" />
          <span>Historial de los últimos Eventos Relevantes</span>
          {hasMore && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 400, opacity: 0.7, marginLeft: "0.25rem" }}>
              — {visibleCount} eventos cargados
            </span>
          )}
        </h3>
      </div>

      {/* Timeline */}
      <div className="timeline-container">
        <div className="timeline-line" />

        {grouped.map(([monthLabel, monthEvents], gIdx) => (
          <div key={monthLabel} className="timeline-month-section">
            {/* Sticky month header */}
            <div className="timeline-month-header">
              <span className="timeline-month-title">{monthLabel}</span>
              <span className="timeline-month-count">
                {monthEvents.length} evento{monthEvents.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Events in this month */}
            <div className="timeline-month-cards">
              {monthEvents.map((event, eIdx) => (
                <EventCard
                  key={`${event.eventType}-${event.eventDate}-${gIdx}-${eIdx}`}
                  event={event}
                  staggerDelay={eIdx * 0.03}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Sentinel for lazy loading */}
        {hasMore && (
          <div ref={sentinelRef} style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isLoadingMore && (
              <Loader2 size={16} className="spin" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
            )}
          </div>
        )}

        {/* End of timeline */}
        {!hasMore && allEvents.length > 0 && (
          <div style={{ textAlign: "center", padding: "1rem 0", color: "var(--text-dim)", fontSize: "0.8rem" }}>
            — Fin del historial —
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialEventos;
