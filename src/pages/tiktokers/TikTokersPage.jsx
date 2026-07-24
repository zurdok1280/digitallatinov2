import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Settings2, Loader2, ChevronUp, ChevronDown, ExternalLink, UserCheck } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { getTiktokData, getCuratorsForTiktoker, getContactsCurators, updateTiktokerCurators, searchTiktokUsers } from "../../services/api";
import ModalContactsAdmin from "../../components/ModalContactsAdmin";
import ContactPreviewModal from "../../components/shared/ContactPreviewModal";
import ToggleSwitch from "../../components/shared/ToggleSwitch";
import { getAssignedTiktokerHandles } from "../../services/api";

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

function ExpandedRow({ tiktoker, colSpan, onManage, isAdmin, refresh, onAssignmentLoaded }) {
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const cleanHandle = tiktoker.user_handle.startsWith("@") ? tiktoker.user_handle.slice(1) : tiktoker.user_handle;

    Promise.all([
      getCuratorsForTiktoker(cleanHandle).catch(() => []),
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
      // Notify parent with the count of assigned curators
      if (onAssignmentLoaded) {
        const cleanHandle = tiktoker.user_handle.startsWith("@")
          ? tiktoker.user_handle.slice(1)
          : tiktoker.user_handle;
        onAssignmentLoaded(cleanHandle, hydratedAssigned.length);
      }
    });

    return () => { isMounted = false; };
  }, [tiktoker.user_handle, refresh]);

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
      
      const cleanHandle = tiktoker.user_handle.startsWith("@") ? tiktoker.user_handle.slice(1) : tiktoker.user_handle;
      const targetName = tiktoker.user_name || tiktoker.user_handle;
      await updateTiktokerCurators(cleanHandle, targetName, curatorIds);
      
      if (action === 'assign') {
        const updatedAssigned = [...assigned, contact];
        setAssigned(updatedAssigned);
        setAvailable(available.filter(c => c.id !== contact.id));
        if (onAssignmentLoaded) onAssignmentLoaded(cleanHandle, updatedAssigned.length);
      } else {
        const updatedAssigned = assigned.filter(c => c.id !== contact.id);
        setAssigned(updatedAssigned);
        setAvailable([...available, contact]);
        if (onAssignmentLoaded) onAssignmentLoaded(cleanHandle, updatedAssigned.length);
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
        <td colSpan={colSpan} style={{ position: 'relative', padding: "0.75rem 1rem 1.1rem 4.5rem", background: "rgba(255,0,80,0.03)", borderBottom: "1px solid var(--glass-border)" }}>
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
                      background: "rgba(255,0,80,0.12)",
                      border: "1px solid rgba(255,0,80,0.3)",
                      color: ACCENT, borderRadius: "20px",
                      padding: "0.3rem 0.7rem", fontSize: "0.75rem", fontWeight: 500,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(255,0,80,0.22)"}
                    onMouseLeave={(e) => e.target.style.background = "rgba(255,0,80,0.12)"}
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
                        onClick={(e) => { e.stopPropagation(); onManage(tiktoker); }}
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
                onClick={(e) => { e.stopPropagation(); onManage(tiktoker); }}
                style={{
                  background: "rgba(255,0,80,0.1)", border: "1px solid rgba(255,0,80,0.3)", color: ACCENT,
                  padding: "0.45rem 1rem", borderRadius: "20px", fontSize: "0.82rem",
                  cursor: "pointer", display: "inline-flex", alignItems: "center",
                  gap: "0.4rem", transition: "all 0.2s", whiteSpace: "nowrap",
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

export default function TikTokersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [isLoading, setIsLoading] = useState(true);
  const [tiktokers, setTiktokers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [adminModal, setAdminModal] = useState({ isOpen: false, targetKey: null, targetName: "" });
  const [chipsRefresh, setChipsRefresh] = useState(0);
  const [assignmentMap, setAssignmentMap] = useState({});

  const onAssignmentLoaded = useCallback((handle, count) => {
    setAssignmentMap(prev => ({ ...prev, [handle]: count }));
  }, []);

  // Tracks which handles have already been fetched to avoid duplicate requests
  const fetchedHandles = useRef(new Set());

  // Server-side search state
  const [searchResults, setSearchResults] = useState(null); // null = sin búsqueda activa
  const [searchTotalRecords, setSearchTotalRecords] = useState(0);

  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [assignedHandlesSet, setAssignedHandlesSet] = useState(new Set());

  // Load all assigned handles globally
  useEffect(() => {
    getAssignedTiktokerHandles().then(set => setAssignedHandlesSet(set));
  }, [chipsRefresh]);
  const [isSearching, setIsSearching] = useState(false);
  const searchAbortRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Carga inicial
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setTiktokers([]);
    try {
      const result = await getTiktokData(0, 0, 9999);
      setTiktokers(result.tiktok_users);
      setTotalRecords(result.total_records);
      setCurrentPage(1);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los TikTokers." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Buscar con paginación
  const fetchSearch = useCallback(async (query, genre, page) => {
    if (searchAbortRef.current) searchAbortRef.current.abort();
    searchAbortRef.current = new AbortController();
    setIsSearching(true);
    const offset = (page - 1) * itemsPerPage;
    const result = await searchTiktokUsers(query, genre, offset, itemsPerPage, searchAbortRef.current.signal);
    if (result !== null) {
      setSearchResults(result.tiktok_users);
      setSearchTotalRecords(result.total_records);
    }
    setIsSearching(false);
  }, []);

  // Server-side search: debounce 350ms + AbortController para cancelar peticiones stale
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setSearchTotalRecords(0);
      setCurrentPage(1); // Volver a pag 1 local al borrar
      return;
    }
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchSearch(searchQuery, 0, 1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSearch]);

  // On page load and page/search change: batch-fetch assignment counts
  // for visible tiktokers that haven't been fetched yet.
  // This is a workaround until the backend exposes a bulk summary endpoint.
  useEffect(() => {
    const sourceList = searchResults !== null ? searchResults : tiktokers;
    if (sourceList.length === 0) return;
    const q = searchResults !== null ? '' : searchQuery.toLowerCase();
    const filteredList = q
      ? sourceList.filter(t =>
          (t.user_name || "").toLowerCase().includes(q) ||
          (t.user_handle || "").toLowerCase().includes(q)
        )
      : sourceList;
    const page = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const toFetch = page.reduce((acc, t) => {
      const h = t.user_handle?.startsWith("@") ? t.user_handle.slice(1) : (t.user_handle || "");
      if (h && !fetchedHandles.current.has(h)) {
        fetchedHandles.current.add(h);
        acc.push(h);
      }
      return acc;
    }, []);
    if (toFetch.length === 0) return;
    Promise.allSettled(
      toFetch.map(handle =>
        getCuratorsForTiktoker(handle).then(curators => ({ handle, count: (curators || []).length }))
      )
    ).then(results => {
      const updates = {};
      results.forEach(r => { if (r.status === 'fulfilled') updates[r.value.handle] = r.value.count; });
      if (Object.keys(updates).length > 0)
        setAssignmentMap(prev => ({ ...prev, ...updates }));
    });
  }, [tiktokers, searchResults, currentPage]); // assignmentMap excluded intentionally to avoid infinite loop

  // Cuando hay búsqueda activa usa los resultados del servidor; si no, filtra localmente
  const filteredLocal = tiktokers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      (t.user_name || "").toLowerCase().includes(q) ||
      (t.user_handle || "").toLowerCase().includes(q)
    );
  });

  const displayData = searchResults !== null ? searchResults : filteredLocal;

  const visibleData = showUnassignedOnly
    ? displayData.filter(t => {
        const h = t.user_handle?.startsWith("@") ? t.user_handle.slice(1) : (t.user_handle || "");
        return !assignedHandlesSet.has(h) && !(assignmentMap[h] > 0);
      })
    : displayData;

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const openManage = (t) => setAdminModal({ isOpen: true, targetKey: t.user_handle, targetName: t.user_name });
  const closeManage = () => {
    const managedHandle = adminModal.targetKey;
    setAdminModal({ isOpen: false, targetKey: null, targetName: "" });
    setChipsRefresh((n) => n + 1);
    // Immediately update the assignment count for the managed tiktoker
    if (managedHandle) {
      const cleanHandle = managedHandle.startsWith("@") ? managedHandle.slice(1) : managedHandle;
      // Remove from fetched cache so the batch effect can re-fetch if page changes
      fetchedHandles.current.delete(cleanHandle);
      getCuratorsForTiktoker(cleanHandle)
        .then(curators => {
          setAssignmentMap(prev => ({ ...prev, [cleanHandle]: (curators || []).length }));
        })
        .catch(() => {});
    }
  };

  const totalPages = visibleData.length > 0
    ? Math.ceil((searchResults !== null && !showUnassignedOnly ? searchTotalRecords : visibleData.length) / itemsPerPage)
    : 1;

  const paginatedData = searchResults !== null && !showUnassignedOnly
    ? searchResults
    : visibleData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (searchResults !== null) fetchSearch(searchQuery, 0, nextPage);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      if (searchResults !== null) fetchSearch(searchQuery, 0, prevPage);
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
          {(isSearching || !isLoading) && (
            <span className="hidden md:inline-block" style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", padding: "0.25rem 0.65rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {isSearching && <Loader2 size={12} className="loading-spinner" />}
              {searchResults !== null
                ? `${searchTotalRecords >= 50 ? "50+" : searchTotalRecords} resultados para "${searchQuery}"`
                : `${formatTotal(totalRecords)} TikTokers`
              }
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Pagination */}
          {!isLoading && (searchResults !== null ? searchTotalRecords > itemsPerPage : filteredLocal.length > itemsPerPage) && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={handlePrev}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.3rem 0.75rem", borderRadius: "15px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              >Anterior</button>
              <span>{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={handleNext}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: currentPage >= totalPages ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.3rem 0.75rem", borderRadius: "15px", cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
              >Siguiente</button>
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
        {(isLoading || isSearching) ? (
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
                {[...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.85rem 1rem" }}><div className="animate-pulse" style={{ height: "18px", width: "18px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} /></td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="animate-pulse" style={{ height: "36px", width: "36px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", flexShrink: 0 }} />
                        <div className="animate-pulse" style={{ height: "18px", width: "120px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}><div className="animate-pulse" style={{ height: "18px", width: "90px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} /></td>
                    <td style={{ padding: "0.85rem 1rem" }}><div className="animate-pulse" style={{ height: "18px", width: "60px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginLeft: "auto" }} /></td>
                    <td style={{ padding: "0.85rem 1rem" }}><div className="animate-pulse" style={{ height: "18px", width: "60px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginLeft: "auto" }} /></td>
                    <td style={{ padding: "0.85rem 1rem" }}><div className="animate-pulse" style={{ height: "26px", width: "90px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", marginLeft: "auto" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  const cleanHandle = t.user_handle?.startsWith("@") ? t.user_handle.slice(1) : (t.user_handle || "");
                  const assignedCount = assignmentMap[cleanHandle] || 0;
                  const hasAssigned = assignedCount > 0;
                  const baseBg = hasAssigned ? "rgba(255,0,80,0.04)" : "transparent";
                  return (
                    <React.Fragment key={uniqueKey}>
                      <tr
                        onClick={() => toggleExpand(t.tiktok_user_id)}
                        style={{ borderBottom: isExpanded ? "none" : "1px solid rgba(255,255,255,0.04)", background: isExpanded ? "rgba(255,0,80,0.07)" : baseBg, cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                        onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = baseBg; }}
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
                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--text-main)", fontVariantNumeric: "tabular-nums", fontSize: "0.9rem" }}>
                          <span
                            title={`${parseInt(t.followers_count || 0).toLocaleString()} seguidores`}
                            style={{ cursor: 'default' }}
                          >
                            {formatTotal(t.followers_count || 0)}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 0.75rem", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem" }}>
                            {hasAssigned && (
                              <span
                                title={`${assignedCount} TikToker${assignedCount !== 1 ? 's' : ''} asignado${assignedCount !== 1 ? 's' : ''}`}
                                style={{ cursor: 'help', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                onClick={e => e.stopPropagation()}
                              >
                                <UserCheck size={16} color="#22c55e" />
                              </span>
                            )}
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
                        <ExpandedRow tiktoker={t} colSpan={COL_COUNT} onManage={openManage} isAdmin={isAdmin} refresh={chipsRefresh} onAssignmentLoaded={onAssignmentLoaded} />
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0.75rem 1.5rem 0.5rem" }}>
        <ToggleSwitch
          checked={showUnassignedOnly}
          onChange={(v) => { setShowUnassignedOnly(v); setCurrentPage(1); }}
          labelOff="Mostrar TikTokers sin asignar"
          labelOn="Mostrar todos"
        />
      </div>

      {/* Bottom Pagination */}
      {!isLoading && (searchResults !== null ? searchTotalRecords > itemsPerPage : filteredLocal.length > itemsPerPage) && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem", marginBottom: "2rem" }}>
          <div className="glass-panel" style={{ display: "inline-flex", alignItems: "center", gap: "1rem", padding: "0.6rem 1.5rem", borderRadius: "30px", background: "rgba(20,20,30,0.6)" }}>
            <button
              disabled={currentPage === 1}
              onClick={handlePrev}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.4rem 1rem", borderRadius: "20px", cursor: currentPage === 1 ? "not-allowed" : "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => { if (currentPage !== 1) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { if (currentPage !== 1) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >Anterior</button>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 500 }}>
              Página <span style={{ color: "var(--text-main)" }}>{currentPage}</span> de {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={handleNext}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: currentPage >= totalPages ? "rgba(255,255,255,0.2)" : "var(--text-main)", padding: "0.4rem 1rem", borderRadius: "20px", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => { if (currentPage < totalPages) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { if (currentPage < totalPages) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >Siguiente</button>
          </div>
        </div>
      )}

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
