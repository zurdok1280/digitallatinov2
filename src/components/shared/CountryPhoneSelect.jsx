import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

// ─── Curated Lists ────────────────────────────────────────────────────────────
export const LANGUAGES = [
  { value: 'Español', label: 'Español' },
  { value: 'Inglés', label: 'Inglés' },
  { value: 'Portugués', label: 'Portugués' },
  { value: 'Francés', label: 'Francés' },
  { value: 'Italiano', label: 'Italiano' },
  { value: 'Alemán', label: 'Alemán' },
  { value: 'Chino', label: 'Chino' },
  { value: 'Japonés', label: 'Japonés' },
  { value: 'Coreano', label: 'Coreano' },
  { value: 'Otro', label: 'Otro' },
];

export const COUNTRIES = [
  // Latam & Spain (Priority)
  { code: 'MX', name: 'México', flag: '🇲🇽', dial: '+52', example: '00 0000 0000' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dial: '+57', example: '000 000 0000' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dial: '+54', example: '00 0000 0000' },
  { code: 'ES', name: 'España', flag: '🇪🇸', dial: '+34', example: '000 00 00 00' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', dial: '+51', example: '000 000 000' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dial: '+56', example: '0 0000 0000' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dial: '+58', example: '000 000 0000' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dial: '+593', example: '00 000 0000' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', dial: '+502', example: '0000 0000' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', dial: '+53', example: '0 000 0000' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', dial: '+591', example: '000 00000' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴', dial: '+1', example: '000 000 0000' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', dial: '+504', example: '0000 0000' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dial: '+595', example: '000 000 000' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', dial: '+503', example: '0000 0000' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', dial: '+505', example: '0000 0000' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', dial: '+506', example: '0000 0000' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦', dial: '+507', example: '0000 0000' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dial: '+598', example: '00 000 000' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', dial: '+1', example: '000 000 0000' },

  // Global & Others
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dial: '+1', example: '000 000 0000' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', dial: '+55', example: '00 00000 0000' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dial: '+351', example: '000 000 000' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', dial: '+39', example: '000 000 0000' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', dial: '+33', example: '0 00 00 00 00' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', dial: '+49', example: '000 0000000' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', dial: '+44', example: '0000 000000' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', dial: '+1', example: '000 000 0000' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', dial: '+81', example: '00 0000 0000' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dial: '+86', example: '000 0000 0000' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dial: '+91', example: '00000 00000' },
].sort((a, b) => a.name.localeCompare(b.name));

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inputStyleBase = {
  width: '100%',
  padding: '0.55rem 0.85rem',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  color: 'var(--text-main)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};

const popoverStyle = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  width: '100%',
  maxHeight: '250px',
  overflowY: 'auto',
  background: 'rgba(20, 20, 20, 0.95)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  backdropFilter: 'blur(10px)',
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
};

// ─── Country Combobox ─────────────────────────────────────────────────────────
export const CountryCombobox = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const s = search.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(s));
  }, [search]);

  const selectedCountry = COUNTRIES.find(c => c.name === value);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputStyleBase,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: isOpen ? 'rgba(0,0,0,0.4)' : inputStyleBase.background,
        }}
      >
        <span>
          {selectedCountry ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : value ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <span>🌍</span>
              <span>{value}</span>
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Seleccionar país...</span>
          )}
        </span>
        <ChevronDown size={16} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <div style={popoverStyle} className="scroll-custom">
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, background: 'rgba(20, 20, 20, 0.95)', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '0 0.5rem' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  padding: '0.4rem 0.5rem',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
          <div style={{ padding: '0.2rem' }}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: value === c.name ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = value === c.name ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  {value === c.name && <Check size={14} color="#ff0050" />}
                </button>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No se encontraron países en la lista
              </div>
            )}
            
            {/* Custom Country Option */}
            {search.trim() && !COUNTRIES.find(c => c.name.toLowerCase() === search.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => {
                  onChange({ name: search.trim(), flag: '🌍', dial: '' });
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 0, 80, 0.1)',
                  border: '1px solid rgba(255, 0, 80, 0.3)',
                  borderRadius: '4px',
                  color: '#ff0050',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>🌍</span>
                <span>Usar "{search.trim()}"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Phone Dial Input ─────────────────────────────────────────────────────────
export const PhoneDialInput = ({ dialCode, phone, onDialChange, onPhoneChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const s = search.toLowerCase();
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(s) || 
      c.dial.toLowerCase().includes(s)
    );
  }, [search]);

  // Find flag and placeholder for current dial code
  const currentCountry = COUNTRIES.find(c => c.dial === dialCode);
  const currentFlag = currentCountry ? currentCountry.flag : '🌐';
  const currentPlaceholder = currentCountry && currentCountry.example ? currentCountry.example : '00 0000 0000';

  return (
    <div style={{ display: 'flex', gap: '4px', position: 'relative' }} ref={containerRef}>
      {/* Dial Code Selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputStyleBase,
          width: 'auto',
          minWidth: '90px',
          padding: '0.55rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          cursor: 'pointer',
          background: isOpen ? 'rgba(0,0,0,0.4)' : inputStyleBase.background,
        }}
        title="Seleccionar Lada"
      >
        <span style={{ fontSize: '1rem' }}>{currentFlag}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{dialCode}</span>
        <ChevronDown size={14} color="var(--text-muted)" style={{ marginLeft: '2px' }} />
      </button>

      {/* Popover for Dial Codes */}
      {isOpen && (
        <div style={{...popoverStyle, width: '250px'}} className="scroll-custom">
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, background: 'rgba(20, 20, 20, 0.95)', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '0 0.5rem' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar país o lada..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  padding: '0.4rem 0.5rem',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
          <div style={{ padding: '0.2rem' }}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c, i) => (
                <button
                  key={`${c.code}-${i}`}
                  type="button"
                  onClick={() => {
                    onDialChange(c.dial);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: dialCode === c.dial ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = dialCode === c.dial ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{c.flag}</span>
                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{c.name}</span>
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{c.dial}</span>
                </button>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No se encontraron países
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone Number Input */}
      <input
        type="tel"
        placeholder={currentPlaceholder}
        value={phone}
        onChange={(e) => {
          // Allow only numbers, spaces, and hyphens
          const val = e.target.value.replace(/[^\d\s-]/g, '');
          onPhoneChange(val);
        }}
        style={{ ...inputStyleBase, flex: 1 }}
      />
    </div>
  );
};

// ─── Language Combobox ────────────────────────────────────────────────────────
export const LanguageCombobox = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const s = search.toLowerCase();
    return LANGUAGES.filter(l => l.label.toLowerCase().includes(s));
  }, [search]);

  const selectedLanguage = LANGUAGES.find(l => l.value === value);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputStyleBase,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: isOpen ? 'rgba(0,0,0,0.4)' : inputStyleBase.background,
        }}
      >
        <span>
          {selectedLanguage ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <span>{selectedLanguage.label}</span>
            </span>
          ) : value ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <span>💬</span>
              <span>{value}</span>
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Seleccionar idioma...</span>
          )}
        </span>
        <ChevronDown size={16} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <div style={popoverStyle} className="scroll-custom">
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, background: 'rgba(20, 20, 20, 0.95)', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '0 0.5rem' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar idioma..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  padding: '0.4rem 0.5rem',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
          <div style={{ padding: '0.2rem' }}>
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => {
                    onChange(l.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: value === l.value ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = value === l.value ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{l.label}</span>
                  </span>
                  {value === l.value && <Check size={14} color="#ff0050" />}
                </button>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No se encontraron idiomas en la lista
              </div>
            )}
            
            {/* Custom Language Option */}
            {search.trim() && !LANGUAGES.find(l => l.label.toLowerCase() === search.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => {
                  onChange(search.trim());
                  setIsOpen(false);
                  setSearch('');
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 0, 80, 0.1)',
                  border: '1px solid rgba(255, 0, 80, 0.3)',
                  borderRadius: '4px',
                  color: '#ff0050',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>💬</span>
                <span>Usar "{search.trim()}"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
