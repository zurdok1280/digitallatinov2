import React, { useEffect, useState, useMemo } from 'react';
import { Tags, Plus, Search, Pencil, Trash2, Loader2, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  getFormatosDigitales,
  createFormatoDigital,
  updateFormatoDigital,
  deleteFormatoDigital
} from '../../services/api';
import './GenerosPage.css';

const GenerosPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ format: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Formatos Digitales
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFormatosDigitales();
      setItems(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    loadData();
  }, []);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const idStr = String(item.id || item.formatId || '').toLowerCase();
      const formatStr = String(item.format || item.name || item.nombre || item.formatDigitalName || '').toLowerCase();
      const descStr = String(item.description || item.descripcion || item.desc || '').toLowerCase();
      return idStr.includes(q) || formatStr.includes(q) || descStr.includes(q);
    });
  }, [items, searchQuery]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({ format: '', description: '' });
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setItemToEdit(item);
    setFormData({
      format: item.format || item.name || item.nombre || item.formatDigitalName || '',
      description: item.description || item.descripcion || item.desc || '',
    });
  };

  // Save (Create or Update)
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
          ...itemToEdit,
          format: formData.format.trim(),
          description: formData.description.trim(),
          // include fallback fields if needed
          nombre: formData.format.trim(),
          descripcion: formData.description.trim(),
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
          format: formData.format.trim(),
          description: formData.description.trim(),
          nombre: formData.format.trim(),
          descripcion: formData.description.trim(),
        };
        await createFormatoDigital(payload);
        toast({
          title: 'Formato Creado',
          description: `El género/formato "${formData.format}" se agregó exitosamente.`,
        });
        setIsAddOpen(false);
      }
      setFormData({ format: '', description: '' });
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

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const targetId = itemToDelete.id || itemToDelete.formatId;
    setIsDeleting(true);
    try {
      await deleteFormatoDigital(targetId);
      toast({
        title: 'Formato Eliminado',
        description: `Se eliminó el género/formato "${itemToDelete.format || itemToDelete.name || targetId}".`,
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

  return (
    <div className="generos-container">
      {/* Header Card */}
      <div className="generos-header-card">
        <div className="generos-header-gradient-bar" />
        <div>
          <h1 className="generos-header-title">
            <Tags size={28} color="#c193ff" />
            Formatos Digitales (Géneros)
          </h1>
          <p className="generos-header-desc">
            Administra el catálogo oficial de formatos digitales y géneros musicales utilizados en la plataforma.
          </p>
        </div>
        <button className="btn-primary-generos" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Agregar Nuevo Formato</span>
        </button>
      </div>

      {/* Controls (Search + Filter + Count) */}
      <div className="generos-controls">
        <div className="search-box-generos">
          <Search size={18} className="search-icon-generos" />
          <input
            type="text"
            className="search-input-generos"
            placeholder="Buscar por ID, nombre o descripción..."
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

      {/* Main Content / Table */}
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
                <th style={{ width: '100px' }}>ID</th>
                <th>Nombre / Formato</th>
                <th>Descripción</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => {
                const itemId = item.id ?? item.formatId ?? (idx + 1);
                const itemFormat = item.format || item.name || item.nombre || item.formatDigitalName || '—';
                const itemDesc = item.description || item.descripcion || item.desc || '—';

                return (
                  <tr key={itemId}>
                    <td>
                      <span className="id-badge">#{itemId}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'white' }}>{itemFormat}</span>
                    </td>
                    <td>
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{itemDesc}</span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
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

      {/* Modal: Add or Edit */}
      {(isAddOpen || itemToEdit) && (
        <div className="generos-modal-overlay">
          <div className="generos-modal-content">
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
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group-generos">
                <label className="form-label-generos">Descripción (Opcional)</label>
                <textarea
                  className="form-input-generos"
                  placeholder="Escribe una breve descripción del género o formato..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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

      {/* Modal: Confirm Delete */}
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
                "{itemToDelete.format || itemToDelete.name || itemToDelete.nombre || 'este registro'}"
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
