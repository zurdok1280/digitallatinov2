import React, { useState, useEffect, useCallback } from "react";
import { Search, Settings2, Loader2, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { getTiktokData, getCuratorsForTiktoker } from "../../services/api";
import ModalContactsAdmin from "../../components/ModalContactsAdmin";

const ACCENT = "#ff0050";

const fmt = (n) => {
  if (!n) return "0";
  return parseInt(n).toLocaleString();
};

const formatTotal = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

const fmtAvg = (n) => {
  if (!n && n !== 0) return "—";
  return `${Number(n).toFixed(1)}%`;
};

function Avatar({ handle }) {
  const letter = handle ? handle.replace("@", "").charAt(0).toUpperCase() : "?";
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: "linear-gradient(135deg, rgba(255,0,80,0.25), rgba(255,0,80,0.1))",
      border: "1px solid rgba(255,0,80,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: ACCENT, fontWeight: 700, fontSize: "1rem", flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

function CuratorChips({ handle, refresh }) {
  const [curators, setCurators] = useState(null);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setCurators(null); // eslint-disable-line react-hooks/set-state-in-effect
    const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
    getCuratorsForTiktoker(cleanHandle)
      .then((data) => { if (!cancelled) setCurators(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setCurators([]); });
    return () => { cancelled = true; };
  }, [handle, refresh]);

  if (curators === null) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Cargando...</span>;
  if (curators.length === 0) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Sin curadores asignados</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
      {curators.map((c) => (
        <span key={c.id} style={{
          background: "rgba(255,0,80,0.12)",
          border: "1px solid rgba(255,0,80,0.3)",
          color: ACCENT, borderRadius: "20px",
          padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: 500,
        }}>
          {c.displayName}
        </span>
      ))}
    </div>
  );
}

function ExpandedRow({ tiktoker, colSpan, onManage, isAdmin, refresh }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: "0.75rem 1rem 1.1rem 4.5rem", background: "rgba(255,0,80,0.03)", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Curadores asignados</span>
            <div style={{ marginTop: "0.3rem" }}>
              <CuratorChips handle={tiktoker.user_handle} refresh={refresh} />
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onManage(tiktoker); }}
              style={{
                background: "rgba(255,0,80,0.1)", border: "1px solid rgba(255,0,80,0.3)", color: ACCENT,
                padding: "0.4rem 0.9rem", borderRadius: "20px", fontSize: "0.82rem",
                cursor: "pointer", display: "inline-flex", alignItems: "center",
                gap: "0.4rem", transition: "all 0.2s", whiteSpace: "nowrap",
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

export default function TikTokersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [tiktokers, setTiktokers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [serverOffset, setServerOffset] = useState(0);
  const PAGE_SIZE = 300; // registros por batch del servidor
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [adminModal, setAdminModal] = useState({ isOpen: false, targetKey: null, targetName: "" });
  const [chipsRefresh, setChipsRefresh] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Carga inicial
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setTiktokers([]);
    setServerOffset(0);
    try {
      const result = await getTiktokData(0, 0, PAGE_SIZE);
      setTiktokers(result.tiktok_users);
      setTotalRecords(result.total_records);
      setCurrentPage(1);
      setServerOffset(PAGE_SIZE);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los TikTokers." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carga siguiente batch y lo concatena
  const fetchMore = useCallback(async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const result = await getTiktokData(0, serverOffset, PAGE_SIZE);
      setTiktokers(prev => [...prev, ...result.tiktok_users]);
      setServerOffset(prev => prev + PAGE_SIZE);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar más TikTokers." });
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, serverOffset, toast]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = tiktokers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      (t.user_name || "").toLowerCase().includes(q) ||
      (t.user_handle || "").toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const openManage = (t) => setAdminModal({ isOpen: true, targetKey: t.user_handle, targetName: t.user_name });
  const closeManage = () => {
    setAdminModal({ isOpen: false, targetKey: null, targetName: "" });
    setChipsRefresh((n) => n + 1);
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const hasMoreOnServer = tiktokers.length < totalRecords;
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
            <img src="/logos/tiktok-icon.png" alt="TikTok" style={{ width: 22, height: 22, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            Ranking de <span style={{ color: ACCENT }}>&nbsp;TikTokers</span>
          </h1>
          {!isLoading && (
            <span className="hidden md:inline-block" style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", padding: "0.25rem 0.65rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              {filtered.length} de {formatTotal(totalRecords)} TikTokers
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {!isLoading && (filtered.length > itemsPerPage || hasMoreOnServer) && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
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
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Buscar TikToker..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)", borderRadius: "20px", padding: "0.45rem 1rem 0.45rem 2.2rem", color: "var(--text-main)", fontSize: "0.875rem", width: "220px", outline: "none" }}
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
              No se encontraron TikTokers.
            </div>
          )
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.025)" }}>
                  {["#", "TikToker", "@Handle", "Avg. Data", "Seguidores", ""].map((h, i) => (
                    <th key={i} style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: i === 3 || i === 4 ? "right" : "left", width: i === 0 ? 48 : i === 5 ? 180 : "auto" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((t, i) => {
                  const isExpanded = expandedId === t.tiktok_user_id;
                  const uniqueKey = `${t.tiktok_user_id}-${i}`;
                  return (
                    <React.Fragment key={uniqueKey}>
                      <tr
                        onClick={() => toggleExpand(t.tiktok_user_id)}
                        style={{ borderBottom: isExpanded ? "none" : "1px solid rgba(255,255,255,0.04)", background: isExpanded ? "rgba(255,0,80,0.05)" : "transparent", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontWeight: 700, fontSize: "0.9rem" }}>{t.rk}</td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <Avatar handle={t.user_handle} />
                            <span style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.9rem" }}>{t.user_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <a
                            href={`https://www.tiktok.com/@${t.user_handle}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: ACCENT, fontWeight: 500, fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", textDecoration: "none" }}
                          >
                            @{t.user_handle} <ExternalLink size={11} />
                          </a>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", color: "var(--text-dim)", fontSize: "0.875rem" }}>{fmtAvg(t.avg_data)}</td>
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--text-main)", fontVariantNumeric: "tabular-nums", fontSize: "0.9rem" }}>{fmt(t.followers_count)}</td>
                        <td style={{ padding: "0.85rem 0.75rem", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
                            {isAdmin && (
                              <button
                                onClick={(e) => { e.stopPropagation(); openManage(t); }}
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
                        <ExpandedRow tiktoker={t} colSpan={COL_COUNT} onManage={openManage} isAdmin={isAdmin} refresh={chipsRefresh} />
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
          targetType="tiktoker"
          targetKey={adminModal.targetKey}
          targetName={adminModal.targetName}
        />
      )}
    </div>
  );
}
