import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Settings2, Loader2, Trash2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/useAuth";
import { getContactsTiktokers } from "../../services/api";
import ContactAddModal from "../../components/shared/ContactAddModal";
import ModalContactsAdmin from "../../components/ModalContactsAdmin";

export default function TikTokersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [isLoading, setIsLoading] = useState(true);
  const [tiktokers, setTiktokers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminModalState, setAdminModalState] = useState({
    isOpen: false,
    targetKey: null,
    targetName: ""
  });

  const fetchTiktokers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getContactsTiktokers();
      setTiktokers(data);
    } catch (err) {
      console.error("Error fetching tiktokers:", err);
      toast({ title: "Error", description: "No se pudieron cargar los TikTokers." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTiktokers();
  }, [fetchTiktokers]);

  const filteredData = tiktokers.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.handle && item.handle.toLowerCase().includes(q)) ||
      (item.country && item.country.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#ff0050' }}>📱</span> Directorio de TikTokers
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>Gestiona los TikTokers y asigna curadores.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar tiktoker..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '0.5rem 1rem 0.5rem 2.5rem',
                color: 'var(--text-main)',
                width: '250px'
              }}
            />
          </div>
          {isAdmin && (
            <button 
              className="btn-primary" 
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> Nuevo TikToker
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div className="flex-center" style={{ height: '300px' }}>
            <Loader2 className="loading-spinner" size={40} color="#ff0050" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex-center" style={{ height: '200px', color: 'var(--text-muted)' }}>
            No se encontraron tiktokers.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Nombre</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Handle</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>País</th>
                  {isAdmin && <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(tiktoker => (
                  <tr key={tiktoker.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{tiktoker.name}</td>
                    <td style={{ padding: '1rem', color: '#ff0050' }}>{tiktoker.handle || "-"}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-dim)' }}>{tiktoker.country || "-"}</td>
                    {isAdmin && (
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => setAdminModalState({
                            isOpen: true,
                            targetKey: tiktoker.handle,
                            targetName: tiktoker.name
                          })}
                          style={{
                            background: 'rgba(255, 0, 80, 0.1)',
                            border: '1px solid rgba(255, 0, 80, 0.3)',
                            color: '#ff0050',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Settings2 size={14} /> Administrar Curadores
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <ContactAddModal
          initialType="tiktokers"
          onClose={() => setShowAddModal(false)}
          onSaveSuccess={() => fetchTiktokers()}
        />
      )}

      {adminModalState.isOpen && (
        <ModalContactsAdmin
          isOpen={adminModalState.isOpen}
          onClose={() => setAdminModalState({ isOpen: false, targetKey: null, targetName: "" })}
          targetType="tiktoker"
          targetKey={adminModalState.targetKey}
          targetName={adminModalState.targetName}
        />
      )}
    </div>
  );
}
