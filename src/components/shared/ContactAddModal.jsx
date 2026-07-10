import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { createCurator, createTiktoker } from "../../services/api";
import "../../pages/ContactsPage.css";

const CRM_STATUS_LABELS = {
  nuevo:       "Nuevo",
  contactado:  "Contactado",
  respondio:   "Respondió",
  negociando:  "Negociando",
  confirmado:  "Confirmado",
  descartado:  "Descartado",
};

const EMPTY_CONTACT = {
  name: "", handle: "", metric: "", email: "", phone: "",
  instagram: { handle: "", url: "" },
  facebook:  { handle: "", url: "" },
  tiktok:    { handle: "", url: "" },
  youtube:   { handle: "", url: "" },
  country: "", language: "", status: "nuevo", lastContact: "", notes: "",
};

const ContactAddModal = ({ initialType = "tiktokers", onClose, onSaveSuccess }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialType);
  const [addForm, setAddForm] = useState({ ...EMPTY_CONTACT });
  const [isSaving, setIsSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSocialChange = (e, platform, field) => {
    const { value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value },
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (activeTab === "curators") {
        await createCurator(addForm);
      } else {
        await createTiktoker(addForm);
      }
      toast({ title: "Contacto agregado", description: `${addForm.name} fue agregado correctamente.` });
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating contact:", err);
      toast({ title: "Error", description: "No se pudo guardar el contacto.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div className="contacts-modal-overlay" style={{ zIndex: 10000 }}>
      <div className="contacts-modal-content">
        <div className="contacts-modal-header">
          <h2 className="contacts-modal-title">
            <div className="contacts-modal-title-icon"><Plus size={18} /></div>
            Nuevo {activeTab === "curators" ? "Curator" : "TikToker"}
          </h2>
          <button className="contacts-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Optional Type Toggle */}
        <div style={{ padding: "0 1.5rem 1rem", display: "flex", gap: "10px" }}>
          <button 
            type="button"
            className={activeTab === "tiktokers" ? "contacts-btn-primary" : "contacts-icon-btn"}
            onClick={() => setActiveTab("tiktokers")}
            style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            TikToker
          </button>
          <button 
            type="button"
            className={activeTab === "curators" ? "contacts-btn-primary" : "contacts-icon-btn"}
            onClick={() => setActiveTab("curators")}
            style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Curator (Playlist)
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {/* Fila 1 */}
          <div className="contacts-form-grid-3">
            <div className="contacts-form-group">
              <label className="contacts-form-label">Nombre</label>
              <input required name="name" value={addForm.name} onChange={onChange} className="contacts-form-input" placeholder="Nombre completo" />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">Handle</label>
              <input name="handle" value={addForm.handle} onChange={onChange} className="contacts-form-input" placeholder="@usuario" />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">{activeTab === "curators" ? "Playlists" : "Followers"}</label>
              <input name="metric" value={addForm.metric} onChange={onChange} className="contacts-form-input" placeholder={activeTab === "curators" ? "5 Playlists" : "100K"} />
            </div>
          </div>

          {/* Fila 2 */}
          <div className="contacts-form-grid-3">
            <div className="contacts-form-group">
              <label className="contacts-form-label">Email</label>
              <input type="email" name="email" value={addForm.email} onChange={onChange} className="contacts-form-input" placeholder="email@..." />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">Teléfono</label>
              <input name="phone" value={addForm.phone} onChange={onChange} className="contacts-form-input" placeholder="+52..." />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">Estado CRM</label>
              <select name="status" value={addForm.status} onChange={onChange} className="contacts-form-input">
                {Object.entries(CRM_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 3 */}
          <div className="contacts-form-grid-3">
            <div className="contacts-form-group">
              <label className="contacts-form-label">País</label>
              <input name="country" value={addForm.country} onChange={onChange} className="contacts-form-input" placeholder="México" />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">Idioma</label>
              <input name="language" value={addForm.language} onChange={onChange} className="contacts-form-input" placeholder="Español" />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">Última vez contactado</label>
              <input type="date" name="lastContact" value={addForm.lastContact} onChange={onChange} className="contacts-form-input" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Redes */}
          <div className="contacts-section-divider">Redes Sociales</div>

          {/* Fila 4: Handles */}
          <div className="contacts-form-grid-3">
            <div className="contacts-form-group">
              <label className="contacts-form-label">Instagram Handle</label>
              <input value={addForm.instagram.handle} onChange={(e) => onSocialChange(e, "instagram", "handle")} className="contacts-form-input" placeholder="@user" />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">Facebook Handle</label>
              <input value={addForm.facebook.handle} onChange={(e) => onSocialChange(e, "facebook", "handle")} className="contacts-form-input" placeholder="Nombre" />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">{activeTab === "curators" ? "YouTube Handle" : "TikTok Handle"}</label>
              <input
                value={activeTab === "curators" ? addForm.youtube.handle : addForm.tiktok.handle}
                onChange={(e) => onSocialChange(e, activeTab === "curators" ? "youtube" : "tiktok", "handle")}
                className="contacts-form-input"
                placeholder={activeTab === "curators" ? "Canal" : "@user"}
              />
            </div>
          </div>

          {/* Fila 5: URLs */}
          <div className="contacts-form-grid-3">
            <div className="contacts-form-group">
              <label className="contacts-form-label">Instagram URL</label>
              <input value={addForm.instagram.url} onChange={(e) => onSocialChange(e, "instagram", "url")} className="contacts-form-input" placeholder="https://..." />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">Facebook URL</label>
              <input value={addForm.facebook.url} onChange={(e) => onSocialChange(e, "facebook", "url")} className="contacts-form-input" placeholder="https://..." />
            </div>
            <div className="contacts-form-group">
              <label className="contacts-form-label">{activeTab === "curators" ? "YouTube URL" : "TikTok URL"}</label>
              <input
                value={activeTab === "curators" ? addForm.youtube.url : addForm.tiktok.url}
                onChange={(e) => onSocialChange(e, activeTab === "curators" ? "youtube" : "tiktok", "url")}
                className="contacts-form-input"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Notas */}
          <div className="contacts-section-divider">Notas</div>
          <div className="contacts-form-grid-1">
            <div className="contacts-form-group">
              <input name="notes" value={addForm.notes} onChange={onChange} className="contacts-form-input" placeholder="Agrega notas o detalles sobre el contacto..." />
            </div>
          </div>

          <div className="contacts-modal-footer">
            <button type="button" onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", padding: "0.5rem 1.25rem", borderRadius: "9999px", fontSize: "0.85rem", cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="contacts-btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
              {isSaving ? "Guardando..." : "Guardar Contacto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ContactAddModal;

