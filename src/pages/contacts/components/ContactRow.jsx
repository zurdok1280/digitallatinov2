import React from "react";
import { Copy, Pencil } from "lucide-react";
import ContactStatusBadge from "./ContactStatusBadge";
import SocialLinks from "./SocialLinks";
import { useToast } from "../../../hooks/use-toast";

const ContactRow = ({ contact, activeTab, onRowClick }) => {
  const { toast } = useToast();

  const getInitials = (name) =>
    name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";

  const handleCopy = (e, text, label) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: `${label} copiado al portapapeles.` });
  };

  return (
    <tr className="contacts-table-row" onClick={() => onRowClick(contact)}>
      {/* Contacto */}
      <td>
        <div className="contact-cell">
          <div className="contact-avatar">{getInitials(contact.name)}</div>
          <div>
            <div className="contact-cell-name">{contact.name}</div>
            <div className="contact-cell-handle">{contact.handle}</div>
          </div>
        </div>
      </td>

      {/* Redes */}
      <td>
        <SocialLinks contact={contact} variant="icons" />
      </td>

      {/* País */}
      <td style={{ color: "#94a3b8" }}>{contact.country}</td>

      {/* Métrica */}
      <td style={{ fontWeight: 600, color: "#f1f5f9" }}>{contact.metric}</td>

      {/* Estado */}
      <td><ContactStatusBadge status={contact.status} /></td>

      {/* Última vez */}
      <td style={{ color: "#64748b", fontSize: "0.8rem" }}>
        {contact.lastContact || "—"}
      </td>

      {/* Acciones */}
      <td onClick={(e) => e.stopPropagation()}>
        <div className="contacts-actions-cell">
          <button
            className="contacts-icon-btn"
            title="Copiar email"
            onClick={(e) => handleCopy(e, contact.email, "Email")}
          >
            <Copy size={13} />
          </button>
          <button
            className="contacts-icon-btn contacts-icon-btn--edit"
            title="Ver / Editar"
            onClick={(e) => { e.stopPropagation(); onRowClick(contact); }}
          >
            <Pencil size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ContactRow;
