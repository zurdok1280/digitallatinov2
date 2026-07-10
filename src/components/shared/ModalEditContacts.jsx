import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus, Trash2, Loader2, UserCheck, ChevronRight, ArrowLeft, Save } from 'lucide-react';
import {
  getContactsCurators,
  getContactsTiktokers,
  createCurator,
  createTiktoker,
  updateCurator,
  updateTiktoker,
  deleteCurator,
  deleteTiktoker,
} from '../../services/api';
import { useToast } from '../../hooks/use-toast';

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.85rem',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  color: 'var(--text-main)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  marginBottom: '4px',
  display: 'block',
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const CRM_STATUS_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'respondio', label: 'Respondió' },
  { value: 'negociando', label: 'Negociando' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'descartado', label: 'Descartado' },
];

const EMPTY_CONTACT = {
  name: '', handle: '', metric: '', email: '', phone: '',
  instagram: { handle: '', url: '' },
  facebook: { handle: '', url: '' },
  tiktok: { handle: '', url: '' },
  youtube: { handle: '', url: '' },
  country: '', language: '', status: 'nuevo', lastContact: '', notes: '',
};

// ─── Full Contact Form ─────────────────────────────────────────────────────────
const ContactForm = ({ type, initialData = EMPTY_CONTACT, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY_CONTACT,
    ...initialData,
    instagram: { ...EMPTY_CONTACT.instagram, ...(initialData.instagram || {}) },
    facebook: { ...EMPTY_CONTACT.facebook, ...(initialData.facebook || {}) },
    tiktok: { ...EMPTY_CONTACT.tiktok, ...(initialData.tiktok || {}) },
    youtube: { ...EMPTY_CONTACT.youtube, ...(initialData.youtube || {}) },
  }));

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSocialChange = (e, platform, field) => {
    const { value } = e.target;
    setForm((p) => ({ ...p, [platform]: { ...p[platform], [field]: value } }));
  };

  const isEdit = !!initialData.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

      {/* ── Sección principal ── */}
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.6rem' }}>
          Información Principal
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Nombre *</label>
            <input required name="name" value={form.name} onChange={onChange} style={inputStyle} placeholder="Nombre completo" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Handle</label>
            <input name="handle" value={form.handle} onChange={onChange} style={inputStyle} placeholder="@usuario" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} style={inputStyle} placeholder="email@..." />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Teléfono</label>
            <input name="phone" value={form.phone} onChange={onChange} style={inputStyle} placeholder="+52..." />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>País</label>
            <input name="country" value={form.country} onChange={onChange} style={inputStyle} placeholder="México" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Idioma</label>
            <input name="language" value={form.language} onChange={onChange} style={inputStyle} placeholder="Español" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>{type === 'curators' ? 'Playlists' : 'Followers'}</label>
            <input name="metric" value={form.metric} onChange={onChange} style={inputStyle} placeholder={type === 'curators' ? '5 Playlists' : '100K'} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Estado CRM</label>
            <select name="status" value={form.status} onChange={onChange} style={inputStyle}>
              {CRM_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Última vez contactado</label>
            <input type="date" name="lastContact" value={form.lastContact} onChange={onChange} style={{ ...inputStyle, width: '50%', colorScheme: 'dark' }} />
          </div>
        </div>
      </div>

      {/* ── Redes Sociales ── */}
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.6rem' }}>
          Redes Sociales
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Instagram */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Instagram Handle</label>
            <input value={form.instagram.handle} onChange={(e) => onSocialChange(e, 'instagram', 'handle')} style={inputStyle} placeholder="@user" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Instagram URL</label>
            <input value={form.instagram.url} onChange={(e) => onSocialChange(e, 'instagram', 'url')} style={inputStyle} placeholder="https://..." />
          </div>
          {/* Facebook */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Facebook Handle</label>
            <input value={form.facebook.handle} onChange={(e) => onSocialChange(e, 'facebook', 'handle')} style={inputStyle} placeholder="Nombre" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Facebook URL</label>
            <input value={form.facebook.url} onChange={(e) => onSocialChange(e, 'facebook', 'url')} style={inputStyle} placeholder="https://..." />
          </div>
          {/* TikTok */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>TikTok Handle</label>
            <input value={form.tiktok.handle} onChange={(e) => onSocialChange(e, 'tiktok', 'handle')} style={inputStyle} placeholder="@user" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>TikTok URL</label>
            <input value={form.tiktok.url} onChange={(e) => onSocialChange(e, 'tiktok', 'url')} style={inputStyle} placeholder="https://..." />
          </div>
          {/* YouTube */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>YouTube Handle</label>
            <input value={form.youtube.handle} onChange={(e) => onSocialChange(e, 'youtube', 'handle')} style={inputStyle} placeholder="Canal" />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>YouTube URL</label>
            <input value={form.youtube.url} onChange={(e) => onSocialChange(e, 'youtube', 'url')} style={inputStyle} placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* ── Notas ── */}
      <div style={fieldGroupStyle}>
        <label style={labelStyle}>Notas</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={onChange}
          style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
          placeholder="Observaciones, detalles relevantes..."
        />
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ padding: '0.55rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isSaving || !form.name.trim()}
          onClick={() => onSave(form)}
          className="btn-primary"
          style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: (isSaving || !form.name.trim()) ? 0.6 : 1 }}
        >
          {isSaving ? <Loader2 size={15} className="loading-spinner" /> : <Save size={15} />}
          {isEdit ? 'Guardar cambios' : 'Crear contacto'}
        </button>
      </div>
    </div>
  );
};

// ─── Quick Add Row (collapsed / simple) ───────────────────────────────────────
const AddContactRow = ({ type, onAdded, onOpenFull }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', handle: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsSaving(true);
    try {
      const payload = { ...EMPTY_CONTACT, ...form };
      if (type === 'curators') await createCurator(payload);
      else await createTiktoker(payload);
      toast({ title: 'Agregado', description: `${form.name} fue agregado correctamente.` });
      setForm({ name: '', handle: '', email: '' });
      setExpanded(false);
      if (onAdded) onAdded();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo guardar el contacto.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          width: '100%', padding: '0.65rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: '8px',
          color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
        }}
      >
        <Plus size={16} />
        Agregar {type === 'curators' ? 'curador' : 'TikToker'}
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px', padding: '0.85rem',
      display: 'flex', flexDirection: 'column', gap: '0.6rem',
    }}>
      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        Nuevo {type === 'curators' ? 'curador' : 'TikToker'}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input name="name" required value={form.name} onChange={onChange} placeholder="Nombre *" autoFocus style={{ ...inputStyle, flex: '1 1 140px' }} />
        <input name="handle" value={form.handle} onChange={onChange} placeholder="@handle" style={{ ...inputStyle, flex: '1 1 110px' }} />
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email" style={{ ...inputStyle, flex: '1 1 160px' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onOpenFull({ ...EMPTY_CONTACT, ...form })}
          style={{
            padding: '0.38rem 0.85rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-muted)',
            borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <ChevronRight size={13} /> Información completa
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => { setForm({ name: '', handle: '', email: '' }); setExpanded(false); }}
            style={{ padding: '0.4rem 0.9rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {isSaving ? <Loader2 size={14} className="loading-spinner" /> : <Plus size={14} />}
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * ModalEditContacts
 * Portal modal for managing the curator / tiktoker directory.
 * Props:
 *  isOpen  {boolean}
 *  onClose {() => void}
 *  type    {'curators' | 'tiktokers'}
 */
export default function ModalEditContacts({ isOpen, onClose, type = 'curators' }) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // 'list' | 'edit' | 'create'
  const [view, setView] = useState('list');
  const [activeContact, setActiveContact] = useState(null); // contact being edited/created
  const [isSaving, setIsSaving] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = type === 'curators' ? await getContactsCurators() : await getContactsTiktokers();
      setContacts(data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudieron cargar los contactos.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [type, toast]);

  useEffect(() => {
    if (isOpen) { setView('list'); setActiveContact(null); fetchContacts(); }
  }, [isOpen, fetchContacts]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (contact, e) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar a "${contact.name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(contact.id);
    try {
      if (type === 'curators') await deleteCurator(contact.id);
      else await deleteTiktoker(contact.id);
      toast({ title: 'Eliminado', description: `${contact.name} fue eliminado.` });
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo eliminar el contacto.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Save (create or update) ─────────────────────────────────────────────────
  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      const isEdit = !!form.id;
      if (isEdit) {
        if (type === 'curators') await updateCurator(form.id, form);
        else await updateTiktoker(form.id, form);
        toast({ title: 'Guardado', description: `${form.name} actualizado correctamente.` });
      } else {
        if (type === 'curators') await createCurator(form);
        else await createTiktoker(form);
        toast({ title: 'Agregado', description: `${form.name} fue agregado correctamente.` });
      }
      await fetchContacts();
      setView('list');
      setActiveContact(null);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo guardar el contacto.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.handle?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  const label = type === 'curators' ? 'Curadores' : 'TikTokers';
  const accentColor = type === 'curators' ? '#1DB954' : '#ff0050';

  // ── Helpers para el header según vista ─────────────────────────────────────
  const viewTitle = view === 'list'
    ? `Editar ${label}`
    : view === 'edit'
    ? `Editar: ${activeContact?.name || ''}`
    : `Nuevo ${type === 'curators' ? 'Curador' : 'TikToker'}`;

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10001, padding: '1rem',
      }}
      onClick={view === 'list' ? onClose : undefined}
    >
      <div
        className="glass-panel modal-panel-anim"
        style={{
          width: '100%',
          maxWidth: view === 'list' ? '640px' : '680px',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-dark)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px', overflow: 'hidden',
          transition: 'max-width 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {view !== 'list' && (
              <button
                onClick={() => { setView('list'); setActiveContact(null); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '2px', borderRadius: '6px' }}
                title="Volver"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: `${accentColor}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UserCheck size={17} color={accentColor} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {viewTitle}
              </h2>
              {view === 'list' && (
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {contacts.length} contacto{contacts.length !== 1 ? 's' : ''} en el directorio
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={21} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="custom-scrollbar" style={{ padding: '1.1rem 1.5rem', overflowY: 'auto', flex: 1 }}>

          {/* ── LIST VIEW ── */}
          {view === 'list' && (
            <>
              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={`Buscar por nombre, handle, país...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '2.4rem' }}
                />
              </div>

              {/* Quick-add row */}
              <div style={{ marginBottom: '1rem' }}>
                <AddContactRow
                  type={type}
                  onAdded={fetchContacts}
                  onOpenFull={(preData) => { setActiveContact(preData); setView('create'); }}
                />
              </div>

              {/* Contact list */}
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                  <Loader2 className="loading-spinner" size={32} color={accentColor} />
                </div>
              ) : filtered.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
                  {searchQuery ? 'No se encontraron resultados.' : `No hay ${label.toLowerCase()} en el directorio.`}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {filtered.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => { setActiveContact(c); setView('edit'); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.65rem 0.9rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px', gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                          {[c.handle, c.email, c.country].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', paddingRight: '0.25rem' }}>Editar</span>
                        <ChevronRight size={15} style={{ color: 'var(--text-dim)' }} />
                        <button
                          onClick={(e) => handleDelete(c, e)}
                          disabled={deletingId === c.id}
                          title="Eliminar"
                          style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', borderRadius: '6px',
                            padding: '0.3rem 0.5rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            opacity: deletingId === c.id ? 0.5 : 1,
                            transition: 'all 0.2s', marginLeft: '0.25rem',
                          }}
                        >
                          {deletingId === c.id ? <Loader2 size={13} className="loading-spinner" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── EDIT / CREATE VIEW ── */}
          {(view === 'edit' || view === 'create') && (
            <ContactForm
              type={type}
              initialData={activeContact || EMPTY_CONTACT}
              onSave={handleSave}
              onCancel={() => { setView('list'); setActiveContact(null); }}
              isSaving={isSaving}
            />
          )}
        </div>

        {/* ── Footer (list view only) ── */}
        {view === 'list' && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex', justifyContent: 'flex-end',
            flexShrink: 0, background: 'rgba(0,0,0,0.15)',
          }}>
            <button onClick={onClose} className="btn-primary" style={{ padding: '0.55rem 1.5rem' }}>
              Listo
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
