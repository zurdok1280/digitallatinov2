import React, { useState, useEffect, useCallback } from "react";
import { Search, Settings2, Loader2, Music, ChevronUp, ChevronDown, ExternalLink, Filter } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { getPlaylistData, getPlaylistTypes, getCuratorsForPlaylist } from "../../services/api";
import ModalContactsAdmin from "../../components/ModalContactsAdmin";

const ACCENT = "#8a88ff";

const fmt = (n) => {
  if (!n) return "0";
  return parseInt(n).toLocaleString();
};

const formatTotal = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

function CuratorChips({ spotifyId, refresh }) {
  const [curators, setCurators] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setCurators(null); // eslint-disable-line react-hooks/set-state-in-effect
    getCuratorsForPlaylist(spotifyId)
      .then((data) => { if (!cancelled) setCurators(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setCurators([]); });
    return () => { cancelled = true; };
  }, [spotifyId, refresh]);

  if (curators === null) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Cargando...</span>;
  if (curators.length === 0) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Sin curadores asignados</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
      {curators.map((c) => (
        <span key={c.id} style={{
          background: "rgba(138,136,255,0.15)",
          border: "1px solid rgba(138,136,255,0.35)",
          color: ACCENT,
          borderRadius: "20px",
          padding: "0.2rem 0.6rem",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}>
          {c.displayName}
        </span>
      ))}
    </div>
  );
}

function ExpandedRow({ playlist, colSpan, onManage, isAdmin, refresh }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: "0.75rem 1rem 1.1rem 4.5rem", background: "rgba(138,136,255,0.04)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Curadores asignados</span>
            <div style={{ marginTop: "0.3rem" }}>
              <CuratorChips spotifyId={playlist.spotify_id} refresh={refresh} />
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onManage(playlist); }}
              style={{
                background: "rgba(138,136,255,0.12)",
                border: "1px solid rgba(138,136,255,0.35)",
                color: ACCENT,
                padding: "0.4rem 0.9rem",
                borderRadius: "20px",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <Settings2 size={13} /> Administrar Curadores
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function PlaylistsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [serverOffset, setServerOffset] = useState(0);
  const PAGE_SIZE = 100; // registros por batch del servidor
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [adminModal, setAdminModal] = useState({ isOpen: false, targetKey: null, targetName: "" });
  const [chipsRefresh, setChipsRefresh] = useState(0);

  // Type filter
  const [playlistTypesList, setPlaylistTypesList] = useState([]);
  const [selectedType, setSelectedType] = useState(0);

  // Pagination (sobre los datos ya en memoria)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Load playlist types on mount
  useEffect(() => {
    getPlaylistTypes().then(types => {
      const normalized = Array.isArray(types) ? types : (types?.data || []);
      setPlaylistTypesList(normalized);
    });
  }, []);

  // Carga inicial (o cuando cambia el tipo)
  const fetchData = useCallback(async (type) => {
    setIsLoading(true);
    setPlaylists([]);
    setServerOffset(0);
    try {
      const result = await getPlaylistData(type, 0, PAGE_SIZE);
      setPlaylists(result.playlists);
      setTotalRecords(result.total_records);
      setCurrentPage(1);
      setServerOffset(PAGE_SIZE);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las playlists." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carga siguiente batch del servidor y lo concatena
  const fetchMore = useCallback(async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const result = await getPlaylistData(selectedType, serverOffset, PAGE_SIZE);
      setPlaylists(prev => [...prev, ...result.playlists]);
      setServerOffset(prev => prev + PAGE_SIZE);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar más playlists." });
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, selectedType, serverOffset, toast]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(selectedType); }, [selectedType, fetchData]);

  const filtered = playlists.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.playlist_name || "").toLowerCase().includes(q) ||
      (p.owner_name || "").toLowerCase().includes(q) ||
      (p.type_name || "").toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const openManage = (pl) => setAdminModal({ isOpen: true, targetKey: pl.spotify_id, targetName: pl.playlist_name });
  const closeManage = () => {
    setAdminModal({ isOpen: false, targetKey: null, targetName: "" });
    setChipsRefresh((n) => n + 1);
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const hasMoreOnServer = playlists.length < totalRecords;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNext = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
    }
    // Activar carga anticipada desde la antepenúltima página
    if (currentPage >= totalPages - 2 && hasMoreOnServer) {
      fetchMore();
      if (nextPage > totalPages) setCurrentPage(nextPage);
    }
  };

  const COL_COUNT = 6;

  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "1.5rem 2rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Music size={22} color={ACCENT} />
            Ranking de <span style={{ color: ACCENT }}>&nbsp;Playlists</span>
          </h1>
          {!isLoading && (
            <span className="hidden md:inline-block" style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", padding: "0.25rem 0.65rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              {filtered.length} de {formatTotal(totalRecords)} Playlists
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Type filter */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <Filter size={14} style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(Number(e.target.value))}
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--glass-border)",
                borderRadius: "20px",
                padding: "0.45rem 1rem 0.45rem 2rem",
                color: "var(--text-main)",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
                appearance: "auto",
                minWidth: "160px",
              }}
            >
              <option value={0} style={{ background: "#1a1a2e" }}>Todas las playlists</option>
              {playlistTypesList.map(t => (
                <option key={t.id} value={t.id} style={{ background: "#1a1a2e" }}>{t.name}</option>
              ))}
            </select>
          </div>
          {/* Pagination */}
          {!isLoading && (filtered.length > itemsPerPage || hasMoreOnServer) && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.3rem 0.75rem", borderRadius: "15px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              >Anterior</button>
              <span>{currentPage} / {Math.ceil(totalRecords / itemsPerPage) || totalPages}</span>
              <button
                disabled={currentPage >= totalPages && !hasMoreOnServer}
                onClick={handleNext}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: (currentPage >= totalPages && !hasMoreOnServer) ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.3rem 0.75rem", borderRadius: "15px", cursor: (currentPage >= totalPages && !hasMoreOnServer) ? "not-allowed" : "pointer" }}
              >
                Siguiente
              </button>
            </div>
          )}
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Buscar playlist..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)", borderRadius: "20px", padding: "0.45rem 1rem 0.45rem 2.2rem", color: "var(--text-main)", fontSize: "0.875rem", width: "200px", outline: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ height: "350px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 size={40} color={ACCENT} className="loading-spinner" />
          </div>
        ) : paginatedData.length === 0 ? (
          isFetchingMore ? (
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse" style={{ height: "48px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
              ))}
            </div>
          ) : (
            <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              No se encontraron playlists.
            </div>
          )
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.025)" }}>
                  {["#", "Playlist", "Propietario", "Tipo", "Seguidores", ""].map((h, i) => (
                    <th key={i} style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: i === 4 ? "right" : "left", width: i === 0 ? 48 : i === 5 ? 180 : "auto" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((pl, i) => {
                  const isExpanded = expandedId === pl.spotify_id;
                  const uniqueKey = `${pl.spotify_id}-${i}`;
                  return (
                    <React.Fragment key={uniqueKey}>
                      <tr
                        onClick={() => toggleExpand(pl.spotify_id)}
                        style={{ borderBottom: isExpanded ? "none" : "1px solid rgba(255,255,255,0.04)", background: isExpanded ? "rgba(138,136,255,0.06)" : "transparent", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 700, fontSize: "0.9rem" }}>{pl.rk}</td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {pl.artwork ? (
                              <img src={pl.artwork} alt={pl.playlist_name} style={{ width: 42, height: 42, borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div style={{ width: 42, height: 42, borderRadius: "8px", background: "rgba(138,136,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Music size={18} color={ACCENT} />
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>
                                {pl.playlist_name}
                              </div>
                              {pl.external_url && (
                                <a href={pl.external_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: ACCENT, fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: "0.2rem", textDecoration: "none", opacity: 0.7 }}>
                                  Abrir en Spotify <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", color: "var(--text-dim)", fontSize: "0.875rem" }}>{pl.owner_name || "—"}</td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          {pl.type_name && (
                            <span style={{ background: "rgba(138,136,255,0.12)", border: "1px solid rgba(138,136,255,0.25)", color: ACCENT, borderRadius: "20px", padding: "0.2rem 0.65rem", fontSize: "0.72rem", fontWeight: 500 }}>
                              {pl.type_name}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--text-main)", fontVariantNumeric: "tabular-nums", fontSize: "0.9rem" }}>{fmt(pl.followers_count)}</td>
                        <td style={{ padding: "0.85rem 0.75rem", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
                            {isAdmin && (
                              <button
                                onClick={(e) => { e.stopPropagation(); openManage(pl); }}
                                style={{
                                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                                  padding: "0.4rem 0.75rem", color: "var(--text-main)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                              >
                                <Settings2 size={14} color={ACCENT} /> <span className="hidden xl:inline">Administrar</span>
                              </button>
                            )}
                            {isExpanded ? <ChevronUp size={16} color={ACCENT} /> : <ChevronDown size={16} color="var(--text-muted)" />}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <ExpandedRow playlist={pl} colSpan={COL_COUNT} onManage={openManage} isAdmin={isAdmin} refresh={chipsRefresh} />
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adminModal.isOpen && (
        <ModalContactsAdmin
          isOpen={adminModal.isOpen}
          onClose={closeManage}
          targetType="playlist"
          targetKey={adminModal.targetKey}
          targetName={adminModal.targetName}
        />
      )}
    </div>
  );
}
