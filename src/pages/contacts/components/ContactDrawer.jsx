import React, { useState, useEffect } from "react";
import { X, Copy, Pencil, Check } from "lucide-react";
import ContactStatusBadge from "./ContactStatusBadge";
import SocialLinks from "./SocialLinks";
import { CRM_STATUS_LABELS } from "../mockData";
import { useToast } from "../../../hooks/use-toast";

const ContactDrawer = ({ contact, onClose, onSave, activeTab }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setEditForm({ ...contact });
    setIsEditing(false);
  }, [contact]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 220);
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: `${label} copiado al portapapeles.` });
  };

  const handleSave = () => {
    onSave(editForm);
    setIsEditing(false);
    toast({ title: "Guardado", description: "Contacto actualizado correctamente." });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [platform]: {
        ...(prev[platform] || {}),
        [field]: value,
      },
    }));
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";

  const fieldStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.4rem", padding: "0.45rem 0.7rem", color: "white", fontSize: "0.85rem", width: "100%", outline: "none" };

  return (
    <>
      {/* Overlay */}
      <div className="contacts-drawer-overlay" onClick={handleClose} />

      {/* Panel */}
      <div className={`contacts-drawer-panel${isClosing ? " closing" : ""}`}>
        {/* Header */}
        <div className="contacts-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div className="contacts-drawer-avatar">
              {getInitials(contact.name)}
            </div>
            <div>
              {isEditing ? (
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleChange}
                  style={{ ...fieldStyle, marginBottom: "0.25rem" }}
                />
              ) : (
                <p className="contacts-drawer-name">{contact.name}</p>
              )}
              <span className="contacts-drawer-handle">{contact.handle}</span>
            </div>
          </div>
          <button className="contacts-icon-btn" onClick={handleClose} title="Cerrar">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="contacts-drawer-body">
          {/* Status */}
          <div className="contacts-drawer-section">
            <div className="contacts-drawer-section-title">Estado CRM</div>
            {isEditing ? (
              <select name="status" value={editForm.status} onChange={handleChange} style={fieldStyle}>
                {Object.entries(CRM_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            ) : (
              <ContactStatusBadge status={contact.status} />
            )}
          </div>

          {/* Métricas */}
          <div className="contacts-drawer-section">
            <div className="contacts-drawer-section-title">Información</div>
            <div className="contacts-drawer-field">
              <span className="contacts-drawer-field-label">{activeTab === "curators" ? "Playlists" : "Followers"}</span>
              <span className="contacts-drawer-field-value">{contact.metric}</span>
            </div>
            <div className="contacts-drawer-field">
              <span className="contacts-drawer-field-label">País</span>
              {isEditing ? (
                <input name="country" value={editForm.country} onChange={handleChange} style={fieldStyle} />
              ) : (
                <span className="contacts-drawer-field-value">{contact.country}</span>
              )}
            </div>
            <div className="contacts-drawer-field">
              <span className="contacts-drawer-field-label">Idioma</span>
              {isEditing ? (
                <input name="language" value={editForm.language} onChange={handleChange} style={fieldStyle} />
              ) : (
                <span className="contacts-drawer-field-value">{contact.language}</span>
              )}
            </div>
            <div className="contacts-drawer-field">
              <span className="contacts-drawer-field-label">Última vez</span>
              <span className="contacts-drawer-field-value">{contact.lastContact || "—"}</span>
            </div>
          </div>

          {/* Contacto */}
          <div className="contacts-drawer-section">
            <div className="contacts-drawer-section-title">Contacto</div>
            <div className="contacts-drawer-field">
              <span className="contacts-drawer-field-label">Email</span>
              {isEditing ? (
                <input name="email" value={editForm.email} onChange={handleChange} style={fieldStyle} />
              ) : (
                <div
                  className="contacts-copy-cell contacts-drawer-field-value"
                  onClick={() => handleCopy(contact.email, "Email")}
                >
                  {contact.email} <Copy size={11} />
                </div>
              )}
            </div>
            <div className="contacts-drawer-field">
              <span className="contacts-drawer-field-label">Teléfono</span>
              {isEditing ? (
                <input name="phone" value={editForm.phone} onChange={handleChange} style={fieldStyle} />
              ) : (
                <div
                  className="contacts-copy-cell contacts-drawer-field-value"
                  onClick={() => handleCopy(contact.phone, "Teléfono")}
                >
                  {contact.phone} <Copy size={11} />
                </div>
              )}
            </div>
          </div>

          {/* Redes */}
          <div className="contacts-drawer-section">
            <div className="contacts-drawer-section-title">Redes Sociales</div>
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {["instagram", "facebook", "tiktok", "youtube"].map(platform => {
                  if (activeTab === "curators" && platform === "tiktok") return null;
                  if (activeTab === "tiktokers" && platform === "youtube") return null;
                  return (
                    <div key={platform} style={{ display: "flex", gap: "0.5rem", flexDirection: "column", background: "rgba(0,0,0,0.1)", padding: "0.5rem", borderRadius: "0.4rem" }}>
                      <span style={{ textTransform: "capitalize", fontSize: "0.75rem", color: "#9ca3af", paddingLeft: "0.2rem" }}>{platform}</span>
                      <input 
                        placeholder="Handle (@usuario)" 
                        value={editForm[platform]?.handle || ""} 
                        onChange={(e) => handleSocialChange(platform, "handle", e.target.value)} 
                        style={{...fieldStyle, padding: "0.4rem 0.6rem"}} 
                      />
                      <input 
                        placeholder="URL (https://...)" 
                        value={editForm[platform]?.url || ""} 
                        onChange={(e) => handleSocialChange(platform, "url", e.target.value)} 
                        style={{...fieldStyle, padding: "0.4rem 0.6rem"}} 
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <SocialLinks contact={contact} variant="full" />
            )}
          </div>

          {/* Notas */}
          <div className="contacts-drawer-section">
            <div className="contacts-drawer-section-title">Notas</div>
            {isEditing ? (
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleChange}
                rows={3}
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            ) : (
              <p style={{ fontSize: "0.875rem", color: contact.notes ? "#e2e8f0" : "#4b5563", lineHeight: 1.6 }}>
                {contact.notes || "Sin notas."}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="contacts-drawer-footer">
          {isEditing ? (
            <>
              <button className="contacts-icon-btn contacts-icon-btn--cancel" onClick={() => setIsEditing(false)} style={{ width: "auto", padding: "0 1rem", gap: "0.4rem", fontSize: "0.85rem" }}>
                <X size={14} /> Cancelar
              </button>
              <button className="contacts-btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }} onClick={handleSave}>
                <Check size={14} /> Guardar
              </button>
            </>
          ) : (
            <button className="contacts-btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }} onClick={() => setIsEditing(true)}>
              <Pencil size={14} /> Editar contacto
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactDrawer;
