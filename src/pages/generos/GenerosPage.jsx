import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Tags,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Link2,
  ListFilter,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  getFormatosDigitales,
  createFormatoDigital,
  updateFormatoDigital,
  deleteFormatoDigital,
  getAvailableGenres,
  getGenresByFormat,
  assignGenreToFormat,
  deleteGenreFromFormat
} from '../../services/api';
import './GenerosPage.css';

const GenerosPage = () => {
  const { toast } = useToast();

  // Tab State: 'catalog' | 'relations'
  const [activeTab, setActiveTab] = useState('catalog');

  // Formatos Digitales Catalog State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for Formato CRUD
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states for Formato CRUD
  const [formData, setFormData] = useState({
    format: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Tab 2: Relación Formato - Género State ───
  const [selectedFormatId, setSelectedFormatId] = useState('');
  const [availableGenres, setAvailableGenres] = useState([]);
  const [assignedRelations, setAssignedRelations] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Load Formatos Digitales
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFormatosDigitales();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      // Auto select first format if available and not selected
      if (list.length > 0 && !selectedFormatId) {
        const firstId = list[0].id || list[0].formatId;
        if (firstId) setSelectedFormatId(String(firstId));
      }
    } catch (err) {
      console.error('Error al cargar formatos digitales:', err);
      setError('No se pudieron cargar los formatos digitales. Reintenta más tarde.');
      toast({
        title: 'Error de carga',
        description: 'No se pudo obtener la lista de formatos digitales.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load Available Genres Catalog
  const loadAvailableGenres = async () => {
    try {
      const data = await getAvailableGenres();
      setAvailableGenres(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar catálogo de géneros:', err);
    }
  };

  // Load Relations for Selected Format
  const loadFormatRelations = useCallback(async (formatId) => {
    if (!formatId) {
      setAssignedRelations([]);
      return;
    }
    setLoadingRelations(true);
    try {
      const data = await getGenresByFormat(formatId);
      setAssignedRelations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error al cargar relaciones para formato ${formatId}:`, err);
      toast({
        title: 'Error de relaciones',
        description: 'No se pudieron cargar los géneros asignados a este formato.',
        variant: 'destructive',
      });
    } finally {
      setLoadingRelations(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
    loadAvailableGenres();
  }, []);

  useEffect(() => {
    if (selectedFormatId) {
      loadFormatRelations(selectedFormatId);
    }
  }, [selectedFormatId, loadFormatRelations]);

  // Filter Formatos items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const idStr = String(item.id || item.formatId || '').toLowerCase();
      const formatStr = String(item.digitalformat || item.digitalFormat || item.format || item.name || item.nombre || item.formatDigitalName || '').toLowerCase();
      const titleStr = String(item.meta_title || item.metaTitle || '').toLowerCase();
      const descStr = String(item.meta_description || item.metaDescription || item.description || item.descripcion || item.desc || '').toLowerCase();
      const keyStr = String(item.meta_keywords || item.metaKeywords || '').toLowerCase();
      return idStr.includes(q) || formatStr.includes(q) || titleStr.includes(q) || descStr.includes(q) || keyStr.includes(q);
    });
  }, [items, searchQuery]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({ format: '', meta_title: '', meta_description: '', meta_keywords: '' });
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setFormData({
      format: item.digitalformat || item.digitalFormat || item.format || item.name || item.nombre || item.formatDigitalName || '',
      meta_title: item.meta_title || item.metaTitle || '',
      meta_description: item.meta_description || item.metaDescription || item.description || item.descripcion || '',
      meta_keywords: item.meta_keywords || item.metaKeywords || '',
    });
  };

  // Switch to Relations tab with selected format
  const handleManageRelations = (item) => {
    const targetId = item.id || item.formatId;
    if (targetId) {
      setSelectedFormatId(String(targetId));
    }
    setActiveTab('relations');
  };

  // Save Formato (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.format.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor ingresa un nombre o formato.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (itemToEdit) {
        // Edit mode
        const targetId = itemToEdit.id || itemToEdit.formatId;
        const payload = {
          id: targetId,
          digitalformat: formData.format.trim(),
          meta_title: formData.meta_title.trim(),
          meta_description: formData.meta_description.trim(),
          meta_keywords: formData.meta_keywords.trim(),
        };
        await updateFormatoDigital(targetId, payload);
        toast({
          title: 'Formato Actualizado',
          description: `El género/formato "${formData.format}" ha sido modificado.`,
        });
        setItemToEdit(null);
      } else {
        // Create mode
        const payload = {
          digitalformat: formData.format.trim(),
          meta_title: formData.meta_title.trim(),
          meta_description: formData.meta_description.trim(),
          meta_keywords: formData.meta_keywords.trim(),
        };
        await createFormatoDigital(payload);
        toast({
          title: 'Formato Creado',
          description: `El género/formato "${formData.format}" se agregó exitosamente.`,
        });
        setIsAddOpen(false);
      }
      setFormData({ format: '', meta_title: '', meta_description: '', meta_keywords: '' });
      await loadData();
    } catch (err) {
      console.error('Error al guardar formato digital:', err);
      toast({
        title: 'Error',
        description: err.message || 'Ocurrió un problema al guardar la información.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Formato
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id || itemToDelete.formatId;
    setIsDeleting(true);
    try {
      await deleteFormatoDigital(targetId);
      toast({
        title: 'Formato Eliminado',
        description: `Se eliminó el género/formato "${itemToDelete.digitalformat || itemToDelete.format || targetId}".`,
      });
      setItemToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Error al eliminar formato digital:', err);
      toast({
        title: 'Error al eliminar',
        description: err.message || 'No se pudo eliminar el registro.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Relations Actions ───

  // Assign Genre
  const handleAssignGenre = async (genreId) => {
    if (!selectedFormatId || !genreId) return;
    setAssigningId(genreId);
    try {
      await assignGenreToFormat(selectedFormatId, genreId);
      toast({
        title: 'Género Asignado',
        description: 'Se vinculó el género al formato digital.',
      });
      await loadFormatRelations(selectedFormatId);
    } catch (err) {
      console.error('Error al asignar género:', err);
      toast({
        title: 'Error de asignación',
        description: err.message || 'No se pudo asignar el género.',
        variant: 'destructive',
      });
    } finally {
      setAssigningId(null);
    }
  };

  // Remove Genre Relation
  const handleRemoveGenre = async (genreId) => {
    if (!selectedFormatId || !genreId) return;
    setRemovingId(genreId);
    try {
      await deleteGenreFromFormat(selectedFormatId, genreId);
      toast({
        title: 'Relación Eliminada',
        description: 'Se removió el género del formato digital.',
      });
      await loadFormatRelations(selectedFormatId);
    } catch (err) {
      console.error('Error al eliminar relación:', err);
      toast({
        title: 'Error al eliminar',
        description: err.message || 'No se pudo eliminar la relación.',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  // Derived arrays for Tab 2
  const assignedGenreIds = useMemo(() => {
    return new Set(
      assignedRelations.map((r) => r.genre?.id || r.id?.fk_genre || r.genreId).filter(Boolean)
    );
  }, [assignedRelations]);

  const filteredAvailableGenres = useMemo(() => {
    let result = availableGenres;
    if (genreSearch.trim()) {
      const q = genreSearch.toLowerCase().trim();
      result = result.filter((g) => {
        const idStr = String(g.id || '').toLowerCase();
        const nameStr = String(g.genre || g.name || g.nombre || '').toLowerCase();
        return idStr.includes(q) || nameStr.includes(q);
      });
    }
    return result;
  }, [availableGenres, genreSearch]);

  const currentSelectedFormatObj = useMemo(() => {
    return items.find((f) => String(f.id || f.formatId) === String(selectedFormatId));
  }, [items, selectedFormatId]);

  return (
    <div className="generos-container">
      {/* Header Card */}
      <div className="generos-header-card">
        <div className="generos-header-gradient-bar" />
        <div>
          <h1 className="generos-header-title">
            <Tags size={28} color="#c193ff" />
            Formatos Digitales & Géneros
          </h1>
          <p className="generos-header-desc">
            Administra el catálogo oficial de Formatos Digitales y establece relaciones con los géneros de la plataforma.
          </p>
        </div>
        {activeTab === 'catalog' && (
          <button className="btn-primary-generos" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Agregar Nuevo Formato</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="generos-nav-tabs">
        <button
          className={`generos-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <ListFilter size={18} />
          <span>Catálogo de Formatos</span>
        </button>
        <button
          className={`generos-tab-btn ${activeTab === 'relations' ? 'active' : ''}`}
          onClick={() => setActiveTab('relations')}
        >
          <Link2 size={18} />
          <span>Relación Formato - Género</span>
          {assignedRelations.length > 0 && (
            <span style={{
              background: '#c193ff22',
              color: '#c193ff',
              borderRadius: '9999px',
              padding: '0.1rem 0.5rem',
              fontSize: '0.75rem'
            }}>
              {assignedRelations.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: CATÁLOGO DE FORMATOS ─── */}
      {activeTab === 'catalog' && (
        <>
          {/* Controls */}
          <div className="generos-controls">
            <div className="search-box-generos">
              <Search size={18} className="search-icon-generos" />
              <input
                type="text"
                className="search-input-generos"
                placeholder="Buscar por ID, nombre, meta título o palabras clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={loadData}
                title="Recargar lista"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#9ca3af',
                  padding: '0.5rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RefreshCw size={16} className={loading ? 'loader-spin-generos' : ''} />
              </button>
              <span className="total-badge-generos">
                {filteredItems.length} {filteredItems.length === 1 ? 'Formato' : 'Formatos'}
              </span>
            </div>
          </div>

          {/* Main Table */}
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#c193ff' }}>
              <Loader2 size={36} className="loader-spin-generos" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>Cargando catálogo de formatos digitales...</p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '1.5rem',
                color: '#ef4444',
              }}
            >
              <AlertTriangle size={32} style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 700, marginBottom: '1rem' }}>{error}</p>
              <button className="btn-secondary-generos" onClick={loadData}>
                Reintentar
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '1.5rem',
                color: '#9ca3af',
              }}
            >
              <Tags size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                {searchQuery ? 'No se encontraron resultados' : 'No hay formatos registrados'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {searchQuery
                  ? 'Intenta con otros términos de búsqueda.'
                  : 'Haz clic en "Agregar Nuevo Formato" para registrar el primero.'}
              </p>
            </div>
          ) : (
            <div className="generos-table-wrapper">
              <table className="generos-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Nombre / Formato</th>
                    <th>Meta Title</th>
                    <th>Meta Description / Keywords</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => {
                    const itemId = item.id ?? item.formatId ?? (idx + 1);
                    const itemFormat = item.digitalformat || item.digitalFormat || item.format || item.name || item.nombre || item.formatDigitalName || '—';
                    const itemTitle = item.meta_title || item.metaTitle || '—';
                    const itemDesc = item.meta_description || item.metaDescription || item.description || item.descripcion || item.desc || '—';
                    const itemKeys = item.meta_keywords || item.metaKeywords || '';

                    return (
                      <tr key={itemId}>
                        <td>
                          <span className="id-badge">#{itemId}</span>
                        </td>
                        <td>
                          <a
                            href={`/Chart/${encodeURIComponent(itemFormat)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontWeight: 600,
                              color: 'white',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              transition: 'color 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#c193ff';
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                            title={`Abrir chart de "${itemFormat}" en una nueva pestaña`}
                          >
                            <span>{itemFormat}</span>
                            <ExternalLink size={14} style={{ opacity: 0.6 }} />
                          </a>
                        </td>
                        <td>
                          <span style={{ color: '#c193ff', fontSize: '0.85rem', fontWeight: 500 }}>{itemTitle}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{itemDesc}</span>
                            {itemKeys && (
                              <span style={{ color: '#6b7280', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                🔑 {itemKeys}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="action-btn link"
                              title="Asignar / Ver Géneros"
                              onClick={() => handleManageRelations(item)}
                            >
                              <Link2 size={16} />
                            </button>
                            <button
                              className="action-btn edit"
                              title="Editar formato"
                              onClick={() => handleOpenEdit(item)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Eliminar formato"
                              onClick={() => setItemToDelete(item)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: RELACIÓN FORMATO - GÉNERO ─── */}
      {activeTab === 'relations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Format Selector Box */}
          <div className="relacion-card" style={{ padding: '1.25rem 1.5rem' }}>
            <label className="form-label-generos" style={{ marginBottom: '0.6rem' }}>
              Selecciona el Formato Digital a Configurar:
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-input-generos"
                style={{ flex: 1, minWidth: '260px' }}
                value={selectedFormatId}
                onChange={(e) => setSelectedFormatId(e.target.value)}
              >
                <option value="" disabled>-- Selecciona un Formato --</option>
                {items.map((f) => {
                  const fId = f.id || f.formatId;
                  const fName = f.digitalformat || f.digitalFormat || f.format || f.nombre || f.name || `Formato #${fId}`;
                  return (
                    <option key={fId} value={fId}>
                      #{fId} — {fName}
                    </option>
                  );
                })}
              </select>

              {currentSelectedFormatObj && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#c193ff', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Check size={16} />
                    <span>
                      Formato activo: <strong>{currentSelectedFormatObj.digitalformat || currentSelectedFormatObj.format}</strong>
                    </span>
                  </div>
                  <a
                    href={`/Chart/${encodeURIComponent(currentSelectedFormatObj.digitalformat || currentSelectedFormatObj.format)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#00f0ff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    title="Ver chart en una nueva pestaña"
                  >
                    <span>Ver Chart</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Grid Layout: Assigned vs Available */}
          {!selectedFormatId ? (
            <div style={{
              padding: '4rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '1.5rem',
              color: '#9ca3af'
            }}>
              <Link2 size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'white' }}>
                Selecciona un Formato Digital en la parte superior para comenzar a relacionar géneros.
              </p>
            </div>
          ) : (
            <div className="relacion-grid">
              {/* Left Column: Assigned Genres */}
              <div className="relacion-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 className="relacion-card-title" style={{ margin: 0 }}>
                    <Link2 size={20} color="#c193ff" />
                    Géneros Asignados ({assignedRelations.length})
                  </h3>
                  <button
                    onClick={() => loadFormatRelations(selectedFormatId)}
                    title="Actualizar relaciones"
                    style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    <RefreshCw size={15} className={loadingRelations ? 'loader-spin-generos' : ''} />
                  </button>
                </div>

                {loadingRelations ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#c193ff' }}>
                    <Loader2 size={24} className="loader-spin-generos" style={{ margin: '0 auto 0.5rem' }} />
                    <span style={{ fontSize: '0.85rem' }}>Cargando relaciones...</span>
                  </div>
                ) : assignedRelations.length === 0 ? (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px border-dashed rgba(255,255,255,0.08)',
                    borderRadius: '1rem',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    Este formato digital no tiene géneros asignados aún.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {assignedRelations.map((rel, i) => {
                      const gObj = rel.genre || rel;
                      const gId = gObj.id || rel.id?.fk_genre;
                      const gName = gObj.genre || gObj.name || gObj.nombre || `Género #${gId}`;
                      const isRemoving = removingId === gId;

                      return (
                        <div key={gId || i} className="genre-chip assigned">
                          <span>#{gId} {gName}</span>
                          <button
                            className="genre-chip-remove"
                            title="Quitar relación"
                            onClick={() => handleRemoveGenre(gId)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <Loader2 size={13} className="loader-spin-generos" />
                            ) : (
                              <X size={14} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Available Genres Catalog */}
              <div className="relacion-card">
                <h3 className="relacion-card-title">
                  <Tags size={20} color="#00e5ff" />
                  Catálogo de Géneros Disponibles
                </h3>

                <div className="search-box-generos" style={{ width: '100%', maxWidth: '100%', marginBottom: '1.25rem' }}>
                  <Search size={16} className="search-icon-generos" />
                  <input
                    type="text"
                    className="search-input-generos"
                    placeholder="Filtrar géneros disponibles..."
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                  />
                </div>

                {filteredAvailableGenres.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                    No se encontraron géneros disponibles.
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '360px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    paddingRight: '0.25rem'
                  }}>
                    {filteredAvailableGenres.map((g) => {
                      const isAssigned = assignedGenreIds.has(g.id);
                      const isAssigning = assigningId === g.id;
                      const gName = g.genre || g.name || g.nombre || `Género #${g.id}`;

                      return (
                        <div
                          key={g.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.6rem 0.85rem',
                            background: isAssigned ? 'rgba(193, 147, 255, 0.05)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isAssigned ? 'rgba(193, 147, 255, 0.15)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '0.75rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span className="id-badge" style={{ fontSize: '0.72rem' }}>#{g.id}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: isAssigned ? 600 : 400, color: isAssigned ? '#d1acff' : 'white' }}>
                              {gName}
                            </span>
                          </div>

                          {isAssigned ? (
                            <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Check size={14} /> Asignado
                            </span>
                          ) : (
                            <button
                              className="genre-add-btn"
                              onClick={() => handleAssignGenre(g.id)}
                              disabled={isAssigning}
                            >
                              {isAssigning ? (
                                <Loader2 size={13} className="loader-spin-generos" />
                              ) : (
                                <>
                                  <Plus size={13} />
                                  <span>Asignar</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add or Edit Formato Digital */}
      {(isAddOpen || itemToEdit) && (
        <div className="generos-modal-overlay">
          <div className="generos-modal-content" style={{ maxWidth: '580px' }}>
            <div className="generos-modal-header">
              <h3 className="generos-modal-title">
                <Tags size={22} color="#c193ff" />
                {itemToEdit ? 'Editar Formato Digital' : 'Agregar Nuevo Formato Digital'}
              </h3>
              <button
                className="generos-modal-close"
                onClick={() => {
                  setIsAddOpen(false);
                  setItemToEdit(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group-generos">
                <label className="form-label-generos">Nombre del Formato / Género *</label>
                <input
                  type="text"
                  className="form-input-generos"
                  placeholder="Ej: Urbano Latino, Reggaeton, Pop..."
                  maxLength={150}
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group-generos">
                <label className="form-label-generos">Meta Title (Máx 50 caracteres)</label>
                <input
                  type="text"
                  className="form-input-generos"
                  placeholder="Ej: Canciones de Reggaeton y Urbano - Digital Latino"
                  maxLength={50}
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block', textAlign: 'right', marginTop: '0.2rem' }}>
                  {formData.meta_title.length}/50
                </span>
              </div>

              <div className="form-group-generos">
                <label className="form-label-generos">Meta Description (Máx 350 caracteres)</label>
                <textarea
                  className="form-input-generos"
                  placeholder="Escribe la descripción meta SEO para buscadores..."
                  maxLength={350}
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block', textAlign: 'right', marginTop: '0.2rem' }}>
                  {formData.meta_description.length}/350
                </span>
              </div>

              <div className="form-group-generos">
                <label className="form-label-generos">Meta Keywords (Máx 350 caracteres)</label>
                <input
                  type="text"
                  className="form-input-generos"
                  placeholder="Ej: reggaeton, urbano, spotify, charts, latin"
                  maxLength={350}
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block', textAlign: 'right', marginTop: '0.2rem' }}>
                  {formData.meta_keywords.length}/350
                </span>
              </div>

              <div className="generos-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-generos"
                  onClick={() => {
                    setIsAddOpen(false);
                    setItemToEdit(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-generos" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="loader-spin-generos" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{itemToEdit ? 'Guardar Cambios' : 'Crear Formato'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Formato Digital */}
      {itemToDelete && (
        <div className="generos-modal-overlay">
          <div className="generos-modal-content" style={{ maxWidth: '440px' }}>
            <div className="generos-modal-header">
              <h3 className="generos-modal-title" style={{ color: '#ef4444' }}>
                <AlertTriangle size={22} color="#ef4444" />
                Confirmar Eliminación
              </h3>
              <button className="generos-modal-close" onClick={() => setItemToDelete(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              ¿Estás seguro de que deseas eliminar el formato{' '}
              <strong style={{ color: 'white' }}>
                "{itemToDelete.digitalformat || itemToDelete.format || 'este registro'}"
              </strong>
              ? Esta acción no se puede deshacer.
            </p>

            <div className="generos-modal-footer">
              <button
                className="btn-secondary-generos"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="btn-primary-generos"
                style={{
                  background: '#ef4444',
                  boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                  color: 'white',
                }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="loader-spin-generos" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerosPage;
