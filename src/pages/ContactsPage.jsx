import React, { useState, useEffect } from "react";
import { Copy, Plus, Pencil, Check, X, Search, ExternalLink } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import "./ContactsPage.css";

// Mock Data Generators
const generateMockData = (type, count) => {
  const data = [];
  for (let i = 1; i <= count; i++) {
    const isContactado = Math.random() > 0.5;
    data.push({
      id: i,
      name: type === 'curators' ? `Curator ${i}` : `TikToker ${i}`,
      playlistsOrFollowers: type === 'curators' ? `${Math.floor(Math.random() * 10) + 1} Playlists` : `${Math.floor(Math.random() * 900) + 100}K`,
      email: `contacto${i}@${type === 'curators' ? 'spotify.com' : 'tiktok.com'}`,
      phone: `+52 55 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
      instagram: { handle: `@user_ig_${i}`, url: `https://instagram.com/user_ig_${i}` },
      facebook: { handle: `User FB ${i}`, url: `https://facebook.com/user_fb_${i}` },
      tiktok: { handle: `@user_tk_${i}`, url: `https://tiktok.com/@user_tk_${i}` },
      youtube: { handle: `Channel ${i}`, url: `https://youtube.com/c/channel_${i}` },
      country: ["Mexico", "Colombia", "España", "Argentina", "Chile"][Math.floor(Math.random() * 5)],
      language: ["Spanish", "English", "Portuguese"][Math.floor(Math.random() * 3)],
      status: isContactado ? 'Contactado' : 'Pendiente',
      lastContact: isContactado ? `2026-06-${Math.floor(Math.random() * 15) + 1}` : null,
      notes: isContactado ? "Respondieron positivamente." : "",
    });
  }
  return data;
};

const INITIAL_CURATORS = generateMockData('curators', 10);
const INITIAL_TIKTOKERS = generateMockData('tiktokers', 10);

const ContactsPage = () => {
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('curators'); // 'curators' or 'tiktokers'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [curators, setCurators] = useState(INITIAL_CURATORS);
  const [tiktokers, setTiktokers] = useState(INITIAL_TIKTOKERS);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", playlistsOrFollowers: "", email: "", phone: "",
    instagram: { handle: "", url: "" },
    facebook: { handle: "", url: "" },
    tiktok: { handle: "", url: "" },
    youtube: { handle: "", url: "" },
    country: "", language: "", status: "Pendiente", lastContact: "", notes: ""
  });

  // Block scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [showAddModal]);

  // Tab switching with animation
  const handleTabChange = (tab) => {
    if (tab === activeTab || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setEditingId(null);
      setIsTransitioning(false);
    }, 200);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `Se ha copiado "${text}" al portapapeles.`,
    });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    // Deep copy to avoid mutating state directly during edit
    setEditForm(JSON.parse(JSON.stringify(item)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (activeTab === 'curators') {
      setCurators(curators.map(c => c.id === editingId ? editForm : c));
    } else {
      setTiktokers(tiktokers.map(t => t.id === editingId ? editForm : t));
    }
    setEditingId(null);
    toast({ title: "Guardado", description: "El contacto ha sido actualizado exitosamente." });
  };

  const saveNew = (e) => {
    e.preventDefault();
    const newId = Date.now(); // fake ID
    const newItem = { ...addForm, id: newId };
    if (activeTab === 'curators') {
      setCurators([...curators, newItem]);
    } else {
      setTiktokers([...tiktokers, newItem]);
    }
    setShowAddModal(false);
    toast({ title: "Creado", description: "El nuevo contacto ha sido agregado." });
    // Reset form
    setAddForm({
      name: "", playlistsOrFollowers: "", email: "", phone: "",
      instagram: { handle: "", url: "" },
      facebook: { handle: "", url: "" },
      tiktok: { handle: "", url: "" },
      youtube: { handle: "", url: "" },
      country: "", language: "", status: "Pendiente", lastContact: "", notes: ""
    });
  };

  // Helper for generic text changes in forms
  const handleFormChange = (e, formState, setFormState) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  // Helper for social links changes
  const handleSocialChange = (e, platform, field, formState, setFormState) => {
    const { value } = e.target;
    setFormState({
      ...formState,
      [platform]: { ...formState[platform], [field]: value }
    });
  };

  const currentData = activeTab === 'curators' ? curators : tiktokers;
  const filteredData = currentData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="contacts-container">
      <div className="contacts-header-card">
        <div className="contacts-header-gradient-bar"></div>
        <div>
          <h1 className="contacts-header-title">
            <Search size={28} color="#38bdf8" />
            Directorio de Contactos
          </h1>
          <p className="contacts-header-desc">
            Gestión de alcance para Curators y TikTokers. Copia contactos y gestiona el seguimiento.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="contacts-btn-primary">
          <Plus size={20} />
          Agregar Nuevo
        </button>
      </div>

      <div className="contacts-tab-switcher">
        <div 
          className="contacts-tab-indicator" 
          style={{
            transform: activeTab === 'curators' ? 'translateX(0)' : 'translateX(100%)',
            width: '50%'
          }} 
        />
        <button 
          className={`contacts-tab-btn ${activeTab === 'curators' ? 'active' : ''}`}
          onClick={() => handleTabChange('curators')}
          style={{ width: '50%' }}
        >
          Curators
        </button>
        <button 
          className={`contacts-tab-btn ${activeTab === 'tiktokers' ? 'active' : ''}`}
          onClick={() => handleTabChange('tiktokers')}
          style={{ width: '50%' }}
        >
          TikTokers
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <input 
          type="text" 
          placeholder={`Buscar en ${activeTab}...`} 
          className="contacts-form-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: "700px" }}
        />
      </div>

      <div className={`contacts-table-wrapper ${isTransitioning ? 'contacts-table-fade-exit-active' : 'contacts-table-fade-enter-active'}`}>
        <table className="contacts-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{activeTab === 'curators' ? 'Curator' : 'TikToker'}</th>
              <th>{activeTab === 'curators' ? 'Playlists' : 'Followers'}</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Instagram</th>
              <th>Facebook</th>
              <th>TikTok</th>
              <th>Youtube</th>
              <th>País</th>
              <th>Idioma</th>
              <th>Estado</th>
              <th>Última Vez</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => {
              const isEditing = editingId === item.id;
              const data = isEditing ? editForm : item;

              return (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  
                  {/* Name */}
                  <td>
                    {isEditing ? (
                      <input name="name" value={data.name} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      <strong>{item.name}</strong>
                    )}
                  </td>

                  {/* Playlists / Followers */}
                  <td>
                    {isEditing ? (
                      <input name="playlistsOrFollowers" value={data.playlistsOrFollowers} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      item.playlistsOrFollowers
                    )}
                  </td>

                  {/* Email */}
                  <td>
                    {isEditing ? (
                      <input name="email" value={data.email} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      <div className="contacts-copy-cell" onClick={() => handleCopy(item.email)}>
                        {item.email} <Copy size={12} />
                      </div>
                    )}
                  </td>

                  {/* Phone */}
                  <td>
                    {isEditing ? (
                      <input name="phone" value={data.phone} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      <div className="contacts-copy-cell" onClick={() => handleCopy(item.phone)}>
                        {item.phone} <Copy size={12} />
                      </div>
                    )}
                  </td>

                  {/* Instagram */}
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input placeholder="Handle (@user)" value={data.instagram?.handle || ''} onChange={(e) => handleSocialChange(e, 'instagram', 'handle', editForm, setEditForm)} className="contacts-edit-input" />
                        <input placeholder="URL" value={data.instagram?.url || ''} onChange={(e) => handleSocialChange(e, 'instagram', 'url', editForm, setEditForm)} className="contacts-edit-input" />
                      </div>
                    ) : (
                      item.instagram?.handle && item.instagram?.url ? (
                        <a href={item.instagram.url} target="_blank" rel="noopener noreferrer" className="social-link-wrapper">
                          <ExternalLink size={14} /> {item.instagram.handle}
                        </a>
                      ) : "-"
                    )}
                  </td>

                  {/* Facebook */}
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input placeholder="Name" value={data.facebook?.handle || ''} onChange={(e) => handleSocialChange(e, 'facebook', 'handle', editForm, setEditForm)} className="contacts-edit-input" />
                        <input placeholder="URL" value={data.facebook?.url || ''} onChange={(e) => handleSocialChange(e, 'facebook', 'url', editForm, setEditForm)} className="contacts-edit-input" />
                      </div>
                    ) : (
                      item.facebook?.handle && item.facebook?.url ? (
                        <a href={item.facebook.url} target="_blank" rel="noopener noreferrer" className="social-link-wrapper">
                          <ExternalLink size={14} /> {item.facebook.handle}
                        </a>
                      ) : "-"
                    )}
                  </td>

                  {/* TikTok */}
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input placeholder="Handle" value={data.tiktok?.handle || ''} onChange={(e) => handleSocialChange(e, 'tiktok', 'handle', editForm, setEditForm)} className="contacts-edit-input" />
                        <input placeholder="URL" value={data.tiktok?.url || ''} onChange={(e) => handleSocialChange(e, 'tiktok', 'url', editForm, setEditForm)} className="contacts-edit-input" />
                      </div>
                    ) : (
                      item.tiktok?.handle && item.tiktok?.url ? (
                        <a href={item.tiktok.url} target="_blank" rel="noopener noreferrer" className="social-link-wrapper">
                          <ExternalLink size={14} /> {item.tiktok.handle}
                        </a>
                      ) : "-"
                    )}
                  </td>

                  {/* Youtube */}
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input placeholder="Channel" value={data.youtube?.handle || ''} onChange={(e) => handleSocialChange(e, 'youtube', 'handle', editForm, setEditForm)} className="contacts-edit-input" />
                        <input placeholder="URL" value={data.youtube?.url || ''} onChange={(e) => handleSocialChange(e, 'youtube', 'url', editForm, setEditForm)} className="contacts-edit-input" />
                      </div>
                    ) : (
                      item.youtube?.handle && item.youtube?.url ? (
                        <a href={item.youtube.url} target="_blank" rel="noopener noreferrer" className="social-link-wrapper">
                          <ExternalLink size={14} /> {item.youtube.handle}
                        </a>
                      ) : "-"
                    )}
                  </td>

                  {/* Country */}
                  <td>
                    {isEditing ? (
                      <input name="country" value={data.country} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      item.country
                    )}
                  </td>

                  {/* Language */}
                  <td>
                    {isEditing ? (
                      <input name="language" value={data.language} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      item.language
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    {isEditing ? (
                      <select name="status" value={data.status} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Contactado">Contactado</option>
                      </select>
                    ) : (
                      <span className={`contacts-status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    )}
                  </td>

                  {/* Last Contact */}
                  <td>
                    {isEditing ? (
                      <input type="date" name="lastContact" value={data.lastContact || ''} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      item.lastContact || "-"
                    )}
                  </td>

                  {/* Notes */}
                  <td>
                    {isEditing ? (
                      <input name="notes" value={data.notes} onChange={(e) => handleFormChange(e, editForm, setEditForm)} className="contacts-edit-input" />
                    ) : (
                      <span style={{ display: 'inline-block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.notes}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    {isEditing ? (
                      <div className="contacts-actions-cell">
                        <button onClick={saveEdit} className="btn-icon" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                          <Check size={16} />
                        </button>
                        <button onClick={cancelEdit} className="btn-icon" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(item)} className="btn-icon">
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="15" style={{ textAlign: 'center', padding: '3rem' }}>
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="contacts-modal-overlay">
          <div className="contacts-modal-content">
            <div className="contacts-modal-header">
              <h2 className="contacts-modal-title">
                <div className="contacts-modal-title-icon">
                  <Plus size={20} />
                </div>
                Nuevo {activeTab === 'curators' ? 'Curator' : 'TikToker'}
              </h2>
            </div>

            <form onSubmit={saveNew}>
              {/* Fila 1 */}
              <div className="contacts-form-grid-3">
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Nombre / Handle</label>
                  <input required name="name" value={addForm.name} onChange={(e) => handleFormChange(e, addForm, setAddForm)} className="contacts-form-input" />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">{activeTab === 'curators' ? 'Playlists' : 'Followers'}</label>
                  <input name="playlistsOrFollowers" value={addForm.playlistsOrFollowers} onChange={(e) => handleFormChange(e, addForm, setAddForm)} className="contacts-form-input" />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Email</label>
                  <input type="email" name="email" value={addForm.email} onChange={(e) => handleFormChange(e, addForm, setAddForm)} className="contacts-form-input" />
                </div>
              </div>

              {/* Fila 2 */}
              <div className="contacts-form-grid-3">
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Teléfono</label>
                  <input name="phone" value={addForm.phone} onChange={(e) => handleFormChange(e, addForm, setAddForm)} className="contacts-form-input" />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">País</label>
                  <input name="country" value={addForm.country} onChange={(e) => handleFormChange(e, addForm, setAddForm)} className="contacts-form-input" />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Estado</label>
                  <select name="status" value={addForm.status} onChange={(e) => handleFormChange(e, addForm, setAddForm)} className="contacts-form-input">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Contactado">Contactado</option>
                  </select>
                </div>
              </div>

              {/* Redes Sociales */}
              <div style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: '#c193ff', fontSize: '0.85rem', fontWeight: 'bold' }}>REDES</div>
              
              {/* Fila 3: Users */}
              <div className="contacts-form-grid-3">
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Instagram User</label>
                  <input value={addForm.instagram.handle} onChange={(e) => handleSocialChange(e, 'instagram', 'handle', addForm, setAddForm)} className="contacts-form-input" placeholder="@user" />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Facebook User</label>
                  <input value={addForm.facebook.handle} onChange={(e) => handleSocialChange(e, 'facebook', 'handle', addForm, setAddForm)} className="contacts-form-input" placeholder="User Name" />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">{activeTab === 'curators' ? 'Youtube User' : 'TikTok User'}</label>
                  <input value={activeTab === 'curators' ? addForm.youtube.handle : addForm.tiktok.handle} onChange={(e) => handleSocialChange(e, activeTab === 'curators' ? 'youtube' : 'tiktok', 'handle', addForm, setAddForm)} className="contacts-form-input" placeholder={activeTab === 'curators' ? "Channel Name" : "@user"} />
                </div>
              </div>

              {/* Fila 4: Links */}
              <div className="contacts-form-grid-3">
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Link de Instagram</label>
                  <input value={addForm.instagram.url} onChange={(e) => handleSocialChange(e, 'instagram', 'url', addForm, setAddForm)} className="contacts-form-input" placeholder="https://..." />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Link de Facebook</label>
                  <input value={addForm.facebook.url} onChange={(e) => handleSocialChange(e, 'facebook', 'url', addForm, setAddForm)} className="contacts-form-input" placeholder="https://..." />
                </div>
                <div className="contacts-form-group">
                  <label className="contacts-form-label">{activeTab === 'curators' ? 'Link de Youtube' : 'Link de TikTok'}</label>
                  <input value={activeTab === 'curators' ? addForm.youtube.url : addForm.tiktok.url} onChange={(e) => handleSocialChange(e, activeTab === 'curators' ? 'youtube' : 'tiktok', 'url', addForm, setAddForm)} className="contacts-form-input" placeholder="https://..." />
                </div>
              </div>

              {/* Notas */}
              <div style={{ marginTop: '1rem', marginBottom: '0.75rem', color: '#c193ff', fontSize: '0.85rem', fontWeight: 'bold' }}>NOTAS</div>
              <div className="contacts-form-grid-1">
                <div className="contacts-form-group">
                  <label className="contacts-form-label">Notas Generales</label>
                  <input name="notes" value={addForm.notes} onChange={(e) => handleFormChange(e, addForm, setAddForm)} className="contacts-form-input" placeholder="Agrega notas o detalles sobre el contacto..." />
                </div>
              </div>

              <div className="contacts-modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="contacts-btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
