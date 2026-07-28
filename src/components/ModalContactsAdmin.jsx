import React, { useState, useEffect } from 'react';
import { X, Search, Edit2, Check, Loader2, Save, Plus } from 'lucide-react';
import { 
  getCuratorsForPlaylist, 
  updatePlaylistCurators, 
  getCuratorsForTiktoker, 
  updateTiktokerCurators,
  getContactsCurators,
  getContactsTiktokers
} from '../services/api';
import { useToast } from '../hooks/use-toast';
import ModalEditContacts from './shared/ModalEditContacts';

export default function ModalContactsAdmin({ 
  isOpen, 
  onClose, 
  targetType, // 'playlist' | 'tiktoker'
  targetKey,  // spotifyId | userHandle
  targetName
}) {
  const { toast } = useToast();
  
  const [assignedCurators, setAssignedCurators] = useState([]);
  const [availableCurators, setAvailableCurators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditContacts, setShowEditContacts] = useState(false);

  const loadData = async (isMounted = true) => {
      setIsLoading(true);
      try {
        // 1. Fetch assigned
        let assigned = [];
        if (targetType === 'playlist') {
          assigned = await getCuratorsForPlaylist(targetKey);
        } else if (targetType === 'tiktoker') {
          assigned = await getCuratorsForTiktoker(targetKey);
        }
        
        let all = [];
        if (targetType === 'playlist') {
          all = await getContactsCurators();
        } else if (targetType === 'tiktoker') {
          all = await getContactsTiktokers();
        }
        
        if (isMounted) {
          // normalize: Curator responses use {id, name, priceUsd}, TikToker responses use {id, displayName, priceUsd}
          const normalizedAll = all.map(c => ({ id: c.id, displayName: c.displayName || c.name, priceUsd: c.priceUsd }));
          
          // hydrate assigned with priceUsd from all
          const hydratedAssigned = assigned.map(a => {
            const full = normalizedAll.find(c => c.id === a.id);
            return { ...a, priceUsd: full?.priceUsd };
          });
          
          setAssignedCurators(hydratedAssigned);
          setAvailableCurators(normalizedAll);
        }
      } catch (err) {
        console.error("Error loading curators:", err);
        if (isMounted) {
          toast({
            title: "Error",
            description: "No se pudieron cargar los curadores.",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
  };

  useEffect(() => {
    if (!isOpen || !targetKey) {
      document.body.style.overflow = 'unset';
      return;
    }
    
    document.body.style.overflow = 'hidden';
    let isMounted = true;
    loadData(isMounted);
    
    return () => { 
      isMounted = false; 
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, targetKey, targetType, toast]);

  if (!isOpen) return null;

  const handleToggleAssign = (curator) => {
    const isAssigned = assignedCurators.some(c => c.id === curator.id);
    if (isAssigned) {
      setAssignedCurators(assignedCurators.filter(c => c.id !== curator.id));
    } else {
      setAssignedCurators([...assignedCurators, curator]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const curatorIds = assignedCurators.map(c => c.id);
      if (targetType === 'playlist') {
        await updatePlaylistCurators(targetKey, targetName, curatorIds);
      } else {
        await updateTiktokerCurators(targetKey, targetName, curatorIds);
      }
      
      toast({
        title: "Éxito",
        description: `Curadores actualizados correctamente para ${targetName}`
      });
      onClose();
    } catch (err) {
      console.error("Error saving curators:", err);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter available
  const filteredAvailable = availableCurators.filter(c => {
    // hide already assigned
    if (assignedCurators.some(ac => ac.id === c.id)) return false;
    // search filter
    if (searchQuery.trim() === '') return true;
    return c.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalBudget = assignedCurators.reduce((sum, c) => sum + (parseFloat(c.priceUsd) || 0), 0);

  return (
    <div className="modal-overlay-anim" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }} onClick={onClose}>
      
      <div className="modal-panel-anim glass-panel" style={{
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'var(--bg-dark)',
        border: '1px solid var(--glass-border)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
              {targetType === 'tiktoker' ? 'Administrar Contactos' : 'Administrar Curadores'}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {targetName}
            </p>
          </div>
          <button
            onClick={() => setShowEditContacts(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0.45rem 0.9rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginRight: '0.75rem',
              whiteSpace: 'nowrap',
            }}
          >
            <Edit2 size={14} />
            Editar {targetType === 'tiktoker' ? 'Contactos' : 'Curadores'}
          </button>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar" style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {isLoading ? (
            <div className="flex-center" style={{ height: '200px' }}>
              <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
            </div>
          ) : (
            <>
              {/* Assigned Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Asignados ({assignedCurators.length})
                  </h3>
                  {totalBudget > 0 && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginRight: '4px' }}>Presupuesto total:</span>
                      ${totalBudget.toFixed(2)}
                    </div>
                  )}
                </div>
                {assignedCurators.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    {targetType === 'tiktoker' ? 'Ningún Contacto asignado' : 'Ningún curador asignado'}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {assignedCurators.map(c => (
                      <div key={c.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.8rem',
                        background: 'rgba(29, 185, 84, 0.1)',
                        border: '1px solid rgba(29, 185, 84, 0.3)',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)'
                      }}>
                        {c.displayName}
                        {c.priceUsd ? <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>${c.priceUsd}</span> : null}
                        <button
                          onClick={() => handleToggleAssign(c)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                          title="Remover"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Available */}
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Disponibles
                </h3>
                
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={targetType === 'tiktoker' ? "Buscar Contacto..." : "Buscar curator..."}
                    style={{
                      width: '100%',
                      padding: '0.6rem 1rem 0.6rem 2.5rem',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Available List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '250px',
                  overflowY: 'auto'
                }}>
                  {filteredAvailable.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
                      {targetType === 'tiktoker' ? 'No se encontraron Contactos' : 'No se encontraron curadores'}
                    </p>
                  ) : (
                    filteredAvailable.map(c => (
                      <div key={c.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        transition: 'all 0.2s'
                      }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {c.displayName}
                          {c.priceUsd ? <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>${c.priceUsd}</span> : null}
                        </span>
                        <button
                          onClick={() => handleToggleAssign(c)}
                          className="btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Plus size={14} /> Agregar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'transparent',
              border: '1px solid var(--text-muted)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="btn-primary"
            style={{
              padding: '0.6rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: (isLoading || isSaving) ? 0.7 : 1
            }}
          >
            {isSaving ? <Loader2 size={16} className="loading-spinner" /> : <Save size={16} />}
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
      <ModalEditContacts
        isOpen={showEditContacts}
        onClose={() => { setShowEditContacts(false); loadData(); }}
        type={targetType === 'tiktoker' ? 'tiktokers' : 'curators'}
      />
    </div>
  );
}
