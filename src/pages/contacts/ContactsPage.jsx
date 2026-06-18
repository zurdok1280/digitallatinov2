import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { INITIAL_CURATORS, INITIAL_TIKTOKERS, EMPTY_CONTACT } from "./mockData";
import ContactTable from "./components/ContactTable";
import ContactDrawer from "./components/ContactDrawer";
import ContactAddModal from "./components/ContactAddModal";
import "../../pages/ContactsPage.css";

const ContactsPage = () => {
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("curators");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [curators, setCurators] = useState(INITIAL_CURATORS);
  const [tiktokers, setTiktokers] = useState(INITIAL_TIKTOKERS);
  const [drawerContact, setDrawerContact] = useState(null);   // contact open in Drawer
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_CONTACT });

  // Block body scroll when modal or drawer is open
  useEffect(() => {
    const blocked = showAddModal;
    document.body.style.overflow = blocked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAddModal]);

  // ── Tab Switch ─────────────────────────────────────────────
  const handleTabChange = (tab) => {
    if (tab === activeTab || isTransitioning) return;
    setIsTransitioning(true);
    setDrawerContact(null);
    setTimeout(() => {
      setActiveTab(tab);
      setSearchQuery("");
      setIsTransitioning(false);
    }, 200);
  };

  // ── Derived data ───────────────────────────────────────────
  const currentData = activeTab === "curators" ? curators : tiktokers;
  const filteredData = currentData.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.handle && item.handle.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.country && item.country.toLowerCase().includes(q))
    );
  });

  // ── Drawer handlers ────────────────────────────────────────
  const handleRowClick = (contact) => setDrawerContact(contact);
  const handleDrawerClose = () => setDrawerContact(null);
  const handleDrawerSave = (updatedContact) => {
    if (activeTab === "curators") {
      setCurators((prev) => prev.map((c) => c.id === updatedContact.id ? updatedContact : c));
    } else {
      setTiktokers((prev) => prev.map((t) => t.id === updatedContact.id ? updatedContact : t));
    }
    setDrawerContact(updatedContact); // keep drawer open with fresh data
  };

  // ── Add Modal handlers ─────────────────────────────────────
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e, platform, field) => {
    const { value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value },
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newContact = { ...addForm, id: Date.now(), type: activeTab === "curators" ? "curator" : "tiktoker" };
    if (activeTab === "curators") {
      setCurators((prev) => [newContact, ...prev]);
    } else {
      setTiktokers((prev) => [newContact, ...prev]);
    }
    setShowAddModal(false);
    setAddForm({ ...EMPTY_CONTACT });
    toast({ title: "Contacto agregado", description: `${newContact.name} fue agregado correctamente.` });
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="contacts-container">
      {/* Header */}
      <div className="contacts-header-card">
        <div className="contacts-header-gradient-bar" />
        <div>
          <h1 className="contacts-header-title">
            <Search size={26} color="#38bdf8" />
            Directorio de Contactos
          </h1>
          <p className="contacts-header-desc">
            Gestiona curators y TikTokers. Haz click en cualquier fila para ver el detalle.
          </p>
        </div>
        <button className="contacts-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Agregar Nuevo
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="contacts-tab-switcher">
        <div
          className="contacts-tab-indicator"
          style={{ transform: activeTab === "curators" ? "translateX(0)" : "translateX(100%)" }}
        />
        <button
          className={`contacts-tab-btn ${activeTab === "curators" ? "active" : ""}`}
          onClick={() => handleTabChange("curators")}
        >
          Curators
        </button>
        <button
          className={`contacts-tab-btn ${activeTab === "tiktokers" ? "active" : ""}`}
          onClick={() => handleTabChange("tiktokers")}
        >
          TikTokers
        </button>
      </div>

      {/* Toolbar */}
      <div className="contacts-toolbar">
        <span className="contacts-count-badge">
          {filteredData.length} {activeTab === "curators" ? "curators" : "tiktokers"}
        </span>
        <input
          type="text"
          placeholder={`Buscar en ${activeTab}...`}
          className="contacts-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <ContactTable
        data={filteredData}
        activeTab={activeTab}
        isLoading={isTransitioning}
        onRowClick={handleRowClick}
      />

      {/* Drawer */}
      {drawerContact && (
        <ContactDrawer
          contact={drawerContact}
          onClose={handleDrawerClose}
          onSave={handleDrawerSave}
          activeTab={activeTab}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <ContactAddModal
          activeTab={activeTab}
          addForm={addForm}
          onChange={handleAddChange}
          onSocialChange={handleSocialChange}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default ContactsPage;
