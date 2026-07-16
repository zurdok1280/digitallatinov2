import React, { useState, useEffect, useCallback } from "react";
import { Search, Settings2, Loader2, Music, ChevronUp, ChevronDown, ExternalLink, Filter } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { getPlaylistData, getPlaylistTypes, getCuratorsForPlaylist, getContactsCurators, updatePlaylistCurators } from "../../services/api";
import ModalContactsAdmin from "../../components/ModalContactsAdmin";
import ContactPreviewModal from "../../components/shared/ContactPreviewModal";

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

function ExpandedRow({ playlist, colSpan, onManage, isAdmin, refresh }) {
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      getCuratorsForPlaylist(playlist.spotify_id).catch(() => []),
      getContactsCurators().catch(() => [])
    ]).then(([assignedData, allContacts]) => {
      if (!isMounted) return;
      
      const assignedIds = new Set((Array.isArray(assignedData) ? assignedData : []).map(c => c.id));
      
      // Hydrate assigned contacts
      const hydratedAssigned = (Array.isArray(assignedData) ? assignedData : []).map(a => {
        const full = allContacts.find(c => c.id === a.id);
        return full || a;
      });
      
      const availableContacts = allContacts.filter(c => !assignedIds.has(c.id));
      
      setAssigned(hydratedAssigned);
      setAvailable(availableContacts);
      setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [playlist.spotify_id, refresh]);

  const onDragStart = (e, contact, source) => {
    e.dataTransfer.setData('contactId', contact.id);
    e.dataTransfer.setData('source', source);
  };
  const onDragOver = (e) => e.preventDefault();
  const onDropAssigned = (e) => {
    e.preventDefault();
    const source = e.dataTransfer.getData('source');
    const contactId = e.dataTransfer.getData('contactId');
    if (source === 'available') {
      const c = available.find(x => x.id === contactId || x.id === parseInt(contactId));
      if (c) setPendingAction({ action: 'assign', contact: c });
    }
  };
  const onDropAvailable = (e) => {
    e.preventDefault();
    const source = e.dataTransfer.getData('source');
    const contactId = e.dataTransfer.getData('contactId');
    if (source === 'assigned') {
      const c = assigned.find(x => x.id === contactId || x.id === parseInt(contactId));
      if (c) setPendingAction({ action: 'unassign', contact: c });
    }
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setIsSaving(true);
    const { action, contact } = pendingAction;
    try {
      let newAssigned = [];
      if (action === 'assign') {
        newAssigned = [...assigned, contact];
      } else {
        newAssigned = assigned.filter(c => c.id !== contact.id);
      }
      const curatorIds = newAssigned.map(c => c.id);
      await updatePlaylistCurators(playlist.spotify_id, playlist.name, curatorIds);
      
      if (action === 'assign') {
        setAssigned([...assigned, contact]);
        setAvailable(available.filter(c => c.id !== contact.id));
      } else {
        setAssigned(assigned.filter(c => c.id !== contact.id));
        setAvailable([...available, contact]);
      }
      setPendingAction(null);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la asignación.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <tr>
        <td colSpan={colSpan} style={{ position: 'relative', padding: "0.75rem 1rem 1.1rem 4.5rem", background: "rgba(138,136,255,0.04)", borderBottom: "1px solid var(--glass-border)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
            
            {/* Contactos */}
            <div style={{ flex: 1, minWidth: "300px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Curadores asignados 
                {isLoading && <Loader2 size={12} className="loading-spinner" color="var(--text-muted)" />}
              </span>
              
              <div 
                onDragOver={onDragOver} 
                onDrop={onDropAssigned}
                style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.35rem", minHeight: "32px", padding: "4px", border: "1px dashed transparent", transition: "all 0.2s" }}
              >
                {!isLoading && assigned.length === 0 && (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", opacity: 0.4, fontStyle: "italic", alignSelf: "center" }}>Sin curadores asignados</span>
                )}
                {assigned.map((c) => (
                  <button 
                    key={c.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, c, 'assigned')}
                    onClick={() => setSelectedContact(c)}
                    style={{
                      background: "rgba(138,136,255,0.15)",
                      border: "1px solid rgba(138,136,255,0.35)",
                      color: ACCENT, borderRadius: "20px",
                      padding: "0.3rem 0.7rem", fontSize: "0.75rem", fontWeight: 500,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(138,136,255,0.25)"}
                    onMouseLeave={(e) => e.target.style.background = "rgba(138,136,255,0.15)"}
                  >
                    {c.displayName || c.name}
                  </button>
                ))}
              </div>

              {!isLoading && available.length > 0 && (
                <div style={{ marginTop: "1.2rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "0.5rem" }}>
                    Sugerencia de contactos
                  </span>
                  <div 
                    onDragOver={onDragOver} 
                    onDrop={onDropAvailable}
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", minHeight: "32px", padding: "4px", border: "1px dashed transparent", transition: "all 0.2s" }}
                  >
                    {available.slice(0, 5).map(c => (
                      <button 
                        key={c.id} 
                        draggable
                        onDragStart={(e) => onDragStart(e, c, 'available')}
                        onClick={() => setSelectedContact(c)}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "var(--text-main)", borderRadius: "20px",
                          padding: "0.25rem 0.6rem", fontSize: "0.75rem",
                          cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
                      >
                        {c.displayName || c.name}
                      </button>
                    ))}
                    {available.length > 5 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onManage(playlist); }}
                        style={{
                          background: "transparent", border: "1px dashed var(--glass-border)",
                          color: "var(--text-muted)", borderRadius: "20px",
                          padding: "0.25rem 0.6rem", fontSize: "0.75rem",
                          cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.color = "var(--text-main)"}
                        onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                      >
                        +{available.length - 5} más
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); onManage(playlist); }}
                style={{
                  background: "rgba(138,136,255,0.12)",
                  border: "1px solid rgba(138,136,255,0.35)",
                  color: ACCENT,
                  padding: "0.45rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                <Settings2 size={14} /> Administrar Curadores
              </button>
            )}
          </div>
          
          {/* Overlay Confirmación */}
          {pendingAction && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
            }}>
              <div style={{
                background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxWidth: '300px', textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 1.2rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  ¿Estás seguro de {pendingAction.action === 'assign' ? 'asignar' : 'desasignar'} a <strong>{pendingAction.contact.displayName || pendingAction.contact.name}</strong>?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setPendingAction(null)} 
                    disabled={isSaving}
                    style={{ padding: '0.4rem 1rem', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirm} 
                    disabled={isSaving}
                    className="btn-primary"
                    style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isSaving && <Loader2 size={14} className="loading-spinner" />}
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </td>
      </tr>
      
      <ContactPreviewModal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
        type="curators"
      />
    </>
  );
}

export default function PlaylistsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [isLoading, setIsLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
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
    try {
      const result = await getPlaylistData(type, 0, 9999);
      setPlaylists(result.playlists);
      setTotalRecords(result.total_records);
      setCurrentPage(1);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las playlists." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
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
          {!isLoading && filtered.length > itemsPerPage && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.3rem 0.75rem", borderRadius: "15px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              >Anterior</button>
              <span>{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={handleNext}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: currentPage >= totalPages ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.3rem 0.75rem", borderRadius: "15px", cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
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
