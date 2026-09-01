import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, Radio, Globe, Loader2, AlertCircle } from 'lucide-react';
import { getDigitalVsRadioMarkets, resolveCountryCode } from '../services/api';
import SearchableSelect from './SearchableSelect';

// ─── Diagnosis config ─────────────────────────────────────────────────────────
const DIAGNOSIS = {
  'STRONG': {
    label: 'Fuerte',
    emoji: '🟢',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  'RADIO OPPORTUNITY': {
    label: 'Oportunidad Radio',
    emoji: '🔵',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.3)',
  },
  'DIGITAL OPPORTUNITY': {
    label: 'Oportunidad Digital',
    emoji: '🟠',
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.12)',
    border: 'rgba(251, 146, 60, 0.3)',
  },
  'DEVELOPING MARKET': {
    label: 'Por desarrollar',
    emoji: '⚪',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.08)',
    border: 'rgba(148, 163, 184, 0.2)',
  },
};

const getDiagnosis = (status) => {
  const key = String(status || '').toUpperCase().trim();
  return DIAGNOSIS[key] || DIAGNOSIS['DEVELOPING MARKET'];
};

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreBar = ({ value, color }) => {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '110px' }}>
      <div
        style={{
          flex: 1,
          height: '6px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: '999px',
            background: color,
            transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color,
          minWidth: '34px',
          textAlign: 'right',
        }}
      >
        {pct.toFixed(0)}
      </span>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const RadioVsDigitalTable = ({ csSong, countries = [] }) => {
  const [selectedCountry, setSelectedCountry] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(csSong));
  const [error, setError] = useState(null);
  const [markets, setMarkets] = useState([]);

  // Country dropdown options
  const countryOptions = useMemo(() => {
    const list = [{ value: '0', label: 'Global (Todos)' }];
    const seen = new Set(['0']);
    (countries || []).forEach((c) => {
      const val = String(c?.id ?? '');
      if (val && !seen.has(val)) {
        seen.add(val);
        list.push({ value: val, label: c.country_name || c.description || c.name || `País ${val}` });
      }
    });
    return list;
  }, [countries]);

  // Fetch
  useEffect(() => {
    if (!csSong) return;
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const idCountry = (selectedCountry === 0 || selectedCountry === '0') ? 0 : Number(selectedCountry);
        const countryObj = (countries || []).find(c => String(c?.id) === String(selectedCountry));
        const countryCode = idCountry === 0
          ? 'ALL'
          : resolveCountryCode(countryObj || selectedCountry);

        const data = await getDigitalVsRadioMarkets(csSong, idCountry, countryCode, 200);
        if (isMounted) setMarkets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading Radio vs Digital data:', err);
        if (isMounted) setError('Ocurrió un error al consultar los datos de mercados.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [csSong, selectedCountry, countries]);

  return (
    <div className="animate-fade-in" style={{ padding: '0.25rem 0' }}>

      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            <BarChart2 size={22} color="#C193FF" />
            <span>Radio vs Digital — Comparativa de Mercados</span>
          </h3>
          {/* HIDDEN TEMPORARILY — Diagnóstico subtitle
          <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0 0', fontSize: '0.85rem' }}>
            Diagnóstico de penetración cruzada entre rotación radial y consumo en plataformas digitales.
          </p>
          */}
        </div>

        {/* Country filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '220px' }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Globe size={14} color="#8a88ff" /> País:
          </span>
          <div style={{ minWidth: '180px' }}>
            <SearchableSelect
              options={countryOptions}
              value={String(selectedCountry)}
              onChange={(val) => setSelectedCountry(val === '0' ? 0 : Number(val) || val)}
              placeholder="Global (Todos)"
            />
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div
          className="flex-center"
          style={{
            height: '380px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Loader2 className="spin" size={36} color="var(--accent-primary)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Calculando correlación de mercados Digital vs Radio...
          </span>
        </div>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '12px',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#f87171',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !error && markets.length === 0 && (
        <div
          className="flex-center"
          style={{
            height: '320px',
            flexDirection: 'column',
            gap: '1rem',
            color: 'var(--text-muted)',
          }}
        >
          <BarChart2 size={48} style={{ opacity: 0.2 }} />
          <span>No hay datos de mercados para esta canción.</span>
        </div>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && markets.length > 0 && (
        <div
          className="glass-panel"
          style={{
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden',
          }}
        >
          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              flexWrap: 'wrap',
              padding: '0.9rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {Object.entries(DIAGNOSIS).map(([, d]) => (
              <span
                key={d.label}
                style={{ fontSize: '0.78rem', color: d.color, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {d.emoji} {d.label}
              </span>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-muted)',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, width: '40px' }}>#</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Ciudad</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FF7A00' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Radio size={13} /> Radio
                    </span>
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#8a88ff' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Globe size={13} /> Digital
                    </span>
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((row, idx) => {
                  const diag = getDiagnosis(row.market_status || row.marketStatus);
                  const radioScore = Number(row.radio_score ?? row.radioScore ?? 0);
                  const digitalScore = Number(row.digital_score ?? row.digitalScore ?? 0);
                  const city = row.city || row.City || '—';

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
                    >
                      {/* # */}
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--text-muted)',
                        }}
                      >
                        {idx + 1}
                      </td>

                      {/* Ciudad */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                        📍 {city}
                      </td>

                      {/* Radio score */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <ScoreBar value={radioScore} color="#FF7A00" />
                      </td>

                      {/* Digital score */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <ScoreBar value={digitalScore} color="#8a88ff" />
                      </td>

                      {/* Diagnóstico */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: diag.color,
                            background: diag.bg,
                            border: `1px solid ${diag.border}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {diag.emoji} {diag.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioVsDigitalTable;
