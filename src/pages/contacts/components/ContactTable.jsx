import React from "react";
import { Users } from "lucide-react";
import ContactRow from "./ContactRow";

const SKELETON_ROWS = 5;

const ContactTable = ({ data, activeTab, isLoading, onRowClick }) => {
  const colLabel = activeTab === "curators" ? "Curators" : "TikTokers";

  return (
    <div className="contacts-table-wrapper">
      <table className="contacts-table">
        <thead>
          <tr>
            <th>{colLabel}</th>
            <th>Redes</th>
            <th>País</th>
            <th>{activeTab === "curators" ? "Playlists" : "Followers"}</th>
            <th>Estado</th>
            <th>Última interacción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} className="contacts-skeleton-row">
                <td><div className="skeleton-cell" style={{ width: "140px" }} /></td>
                <td><div className="skeleton-cell" style={{ width: "80px" }} /></td>
                <td><div className="skeleton-cell" style={{ width: "70px" }} /></td>
                <td><div className="skeleton-cell" style={{ width: "60px" }} /></td>
                <td><div className="skeleton-cell" style={{ width: "90px", borderRadius: "999px" }} /></td>
                <td><div className="skeleton-cell" style={{ width: "80px" }} /></td>
                <td><div className="skeleton-cell" style={{ width: "60px" }} /></td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="7">
                <div className="contacts-empty-state">
                  <Users size={48} />
                  <p className="contacts-empty-title">Sin contactos</p>
                  <p className="contacts-empty-desc">
                    No hay {colLabel.toLowerCase()} que coincidan con tu búsqueda.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                activeTab={activeTab}
                onRowClick={onRowClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContactTable;
