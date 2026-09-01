import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import {
  BarChart2,
  Radio,
  Globe,
  Trophy,
  Loader2,
  AlertCircle,
  TrendingUp,
  Headphones,
  MapPin,
  Sparkles
} from 'lucide-react';
import { getCityDataForSong, getTopMarketRadio } from '../services/api';
import SearchableSelect from './SearchableSelect';

// ─── Format helper ───────────────────────────────────────────────────────────
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  const n = Number(num);
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.round(n).toLocaleString();
};

// ─── String normalization for cross-matching ──────────────────────────────────
const normalizeStr = (str) => {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const isCityMatch = (nameA, nameB) => {
  const a = normalizeStr(nameA);
  const b = normalizeStr(nameB);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
};

const DigitalVsRadioChart = ({ csSong, countries = [] }) => {
  const [selectedCountry, setSelectedCountry] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(csSong));
  const [error, setError] = useState(null);

  const [digitalList, setDigitalList] = useState([]);
  const [radioList, setRadioList] = useState([]);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // ── 1. Fetch data from both endpoints ──────────────────────────────────────
  useEffect(() => {
    if (!csSong) return;
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [digitalRes, radioRes] = await Promise.all([
          getCityDataForSong(csSong, 0), // Digital is global
          getTopMarketRadio(csSong, selectedCountry) // Radio filtered by country
        ]);

        if (!isMounted) return;

        // Normalize digital data fields
        const formattedDigital = (Array.isArray(digitalRes) ? digitalRes : []).map((item) => ({
          city_name: item.cityname || item.city_name || item.name || '',
          current_listeners: Number(item.listeners || item.current_listeners || item.streams || 0),
          country_code: item.country_code || item.countrycode || '',
        })).filter(item => item.city_name);

        // Normalize radio data fields
        const formattedRadio = (Array.isArray(radioRes) ? radioRes : []).map((item) => ({
          market: item.market || item.market_name || item.name || '',
          audience: Number(item.audience || item.listeners || item.spins || 0),
          spins: Number(item.spins || 0),
          rank: Number(item.rank || 0),
        })).filter(item => item.market);

        setDigitalList(formattedDigital);
        setRadioList(formattedRadio);
      } catch (err) {
        console.error('Error loading Digital vs Radio data:', err);
        if (isMounted) setError('Ocurrió un error al consultar los datos de mercados.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [csSong, selectedCountry]);

  // ── 2. Calculate Top 3, Full Search & Merge Logic ──────────────────────────
  const comparisonData = useMemo(() => {
    // Sort digital by current_listeners desc
    const sortedDigital = [...digitalList].sort((a, b) => b.current_listeners - a.current_listeners);
    // Sort radio by audience desc
    const sortedRadio = [...radioList].sort((a, b) => b.audience - a.audience);

    const top3Digital = sortedDigital.slice(0, 3);
    const top3Radio = sortedRadio.slice(0, 3);

    const totalTop3Digital = top3Digital.reduce((acc, c) => acc + c.current_listeners, 0);
    const totalTop3Radio = top3Radio.reduce((acc, c) => acc + c.audience, 0);

    // Collect seeds: up to 6 unique markets
    const seeds = [];

    // Add Top 3 Digital
    top3Digital.forEach((d) => {
      seeds.push({
        displayName: d.city_name,
        isDigitalSeed: true,
      });
    });

    // Add Top 3 Radio (merging if matching an existing seed)
    top3Radio.forEach((r) => {
      const existing = seeds.find((s) => isCityMatch(s.displayName, r.market));
      if (!existing) {
        seeds.push({
          displayName: r.market,
          isRadioSeed: true,
        });
      }
    });

    // Now for each unique seed, search in the FULL list of both endpoints
    const mergedMarkets = seeds.map((seed) => {
      // Find in FULL digital list
      const matchedDigital = sortedDigital.find((d) => isCityMatch(d.city_name, seed.displayName));
      const digitalListeners = matchedDigital ? matchedDigital.current_listeners : 0;
      const inDigitalTop3 = top3Digital.some((d) => isCityMatch(d.city_name, seed.displayName));

      // Find in FULL radio list
      const matchedRadio = sortedRadio.find((r) => isCityMatch(r.market, seed.displayName));
      const radioAudience = matchedRadio ? matchedRadio.audience : 0;
      const inRadioTop3 = top3Radio.some((r) => isCityMatch(r.market, seed.displayName));

      // Prefer standard city name if matched in digital
      const finalName = matchedDigital ? matchedDigital.city_name : seed.displayName;

      // Calculate % based on the 100% of top 3 sums
      const digitalPct = totalTop3Digital > 0 ? (digitalListeners / totalTop3Digital) * 100 : 0;
      const radioPct = totalTop3Radio > 0 ? (radioAudience / totalTop3Radio) * 100 : 0;

      return {
        name: finalName,
        digitalListeners,
        radioAudience,
        digitalPct,
        radioPct,
        inDigitalTop3,
        inRadioTop3,
      };
    });

    // Sort markets by highest participation for cleaner visual appeal
    mergedMarkets.sort((a, b) => Math.max(b.digitalPct, b.radioPct) - Math.max(a.digitalPct, a.radioPct));

    return {
      top3Digital,
      top3Radio,
      totalTop3Digital,
      totalTop3Radio,
      mergedMarkets,
    };
  }, [digitalList, radioList]);

  // Deduplicated country options to prevent key="0" collision
  const countryOptions = useMemo(() => {
    const list = [{ value: '0', label: 'Global (Todos)' }];
    const seen = new Set(['0']);
    (countries || []).forEach((c) => {
      const val = String(c?.id ?? '');
      if (val && !seen.has(val)) {
        seen.add(val);
        list.push({
          value: val,
          label: c.country_name || c.name || `País ${val}`,
        });
      }
    });
    return list;
  }, [countries]);

  // ── 3. Render and update ECharts instance ──────────────────────────────────
  useEffect(() => {
    if (!chartRef.current || isLoading) return;

    const { mergedMarkets } = comparisonData;
    if (mergedMarkets.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
      return;
    }

    let chart = echarts.getInstanceByDom(chartRef.current);
    if (!chart) {
      chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;
    }

    const categories = mergedMarkets.map((m) => m.name);
    const digitalValues = mergedMarkets.map((m) => Number(m.digitalPct.toFixed(1)));
    const radioValues = mergedMarkets.map((m) => Number(m.radioPct.toFixed(1)));

    const maxPct = Math.max(
      ...digitalValues,
      ...radioValues,
      50
    );
    // Round max to nearest 10 for clean axis
    const maxAxis = Math.ceil(maxPct / 10) * 10;

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(15, 16, 26, 0.95)',
        borderColor: 'rgba(138, 136, 255, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff',
          fontSize: 12,
        },
        formatter: (params) => {
          if (!params || params.length === 0) return '';
          const marketName = params[0].axisValue;
          const marketData = mergedMarkets.find((m) => m.name === marketName);

          let html = `<div style="font-weight:700;margin-bottom:6px;color:#fff;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px;">📍 ${marketName}</div>`;
          params.forEach((param) => {
            const isDigital = param.seriesName.includes('Digital');
            const color = isDigital ? '#8a88ff' : '#FF7A00';
            const rawVal = isDigital
              ? formatNumber(marketData?.digitalListeners || 0) + ' oyentes'
              : formatNumber(marketData?.radioAudience || 0) + ' audiencia';
            html += `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:4px;">
                <span style="display:flex;align-items:center;gap:6px;color:${color};font-weight:600;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
                  ${param.seriesName}:
                </span>
                <span style="font-weight:700;color:#fff;">
                  ${param.value}% <span style="font-weight:400;font-size:10px;opacity:0.75;">(${rawVal})</span>
                </span>
              </div>
            `;
          });
          return html;
        },
      },
      legend: {
        show: true,
        data: ['Digital ', 'Radio '],
        top: '2%',
        textStyle: {
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: 13,
          fontWeight: 600,
        },
      },
      angleAxis: {
        max: maxAxis,
        startAngle: 30,
        splitLine: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.15)',
          },
        },
        axisLabel: {
          formatter: '{value}%',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 10,
        },
      },
      radiusAxis: {
        type: 'category',
        data: categories,
        z: 10,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.15)',
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 12,
          fontWeight: 600,
          formatter: (value) => {
            return value.length > 14 ? value.substring(0, 12) + '...' : value;
          },
        },
      },
      polar: {},
      series: [
        {
          name: 'Digital (Oyentes)',
          type: 'bar',
          data: digitalValues,
          coordinateSystem: 'polar',
          roundCap: true,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: '#a78bfa' },
              { offset: 1, color: '#8a88ff' },
            ]),
            shadowBlur: 10,
            shadowColor: 'rgba(138, 136, 255, 0.35)',
          },
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Radio (Audiencia)',
          type: 'bar',
          data: radioValues,
          coordinateSystem: 'polar',
          roundCap: true,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: '#fb923c' },
              { offset: 1, color: '#FF7A00' },
            ]),
            shadowBlur: 10,
            shadowColor: 'rgba(255, 122, 0, 0.35)',
          },
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };

    chart.setOption(option, true);
    chart.resize();

    const handleResize = () => {
      if (chartRef.current) {
        const c = echarts.getInstanceByDom(chartRef.current);
        if (c) c.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [comparisonData, isLoading]);

  // Clean chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  const { top3Digital, top3Radio, totalTop3Digital, totalTop3Radio, mergedMarkets } = comparisonData;
  const hasDigital = digitalList.length > 0;
  const hasRadio = radioList.length > 0;

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
            <span>Digital vs Radio — Comparativa Polar de Mercados</span>
          </h3>
         
        </div>

        {/* Radio Country Filter */}
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
            <Radio size={14} color="#FF7A00" /> Radio:
          </span>
          <div style={{ minWidth: '180px' }}>
            <SearchableSelect
              options={countryOptions}
              value={String(selectedCountry)}
              onChange={(val) => setSelectedCountry(Number(val) || val)}
              placeholder="Global (Todos)"
            />
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {isLoading && (
        <div
          className="flex-center"
          style={{
            height: '450px',
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

      {/* ── Error State ── */}
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

      {/* ── Content View ── */}
      {!isLoading && !error && (
        <>
          {/* Warning Notices if one source is missing */}
          {(!hasDigital || !hasRadio) && (
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                background: 'rgba(255, 183, 0, 0.08)',
                border: '1px solid rgba(255, 183, 0, 0.25)',
                color: '#fbbf24',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                {!hasDigital && !hasRadio
                  ? 'No se encontraron datos registrados de mercados para esta canción en Digital ni en Radio.'
                  : !hasDigital
                  ? 'No se encontraron datos de ciudades digitales para esta canción. Se muestran solo los datos de radio.'
                  : 'No se encontraron datos de radio para el país seleccionado. Se muestran solo los datos de consumo digital.'}
              </span>
            </div>
          )}

          {/* Empty State */}
          {!hasDigital && !hasRadio ? (
            <div
              className="flex-center"
              style={{
                height: '350px',
                flexDirection: 'column',
                gap: '1rem',
                color: 'var(--text-muted)',
              }}
            >
              <BarChart2 size={48} style={{ opacity: 0.25 }} />
              <span>No hay datos suficientes para proyectar la comparativa polar.</span>
            </div>
          ) : (
            <>
              {/* ── Polar Chart Canvas ── */}
              <div
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(138, 136, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  marginBottom: '2rem',
                }}
              >
                <div
                  ref={chartRef}
                  style={{
                    width: '100%',
                    height: '460px',
                  }}
                />
              </div>

              {/* ── Top 3 Breakdown Columns ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                {/* Digital Column */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(138, 136, 255, 0.4)',
                    boxShadow: '0 4px 20px rgba(138, 136, 255, 0.08)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      borderBottom: '1px solid rgba(138, 136, 255, 0.2)',
                      paddingBottom: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Globe size={18} color="#8a88ff" />
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 700 }}>
                        Top 3 Mercados Digitales
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#8a88ff', fontWeight: 600 }}>
                      Base 100% = {formatNumber(totalTop3Digital)}
                    </span>
                  </div>

                  {top3Digital.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                      Sin datos de ciudades digitales.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {top3Digital.map((item, idx) => {
                        const pct =
                          totalTop3Digital > 0
                            ? ((item.current_listeners / totalTop3Digital) * 100).toFixed(1)
                            : '0';
                        const badgeColor = idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32';
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              borderLeft: `4px solid ${badgeColor}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  color: badgeColor,
                                  minWidth: '22px',
                                }}
                              >
                                #{idx + 1}
                              </span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                                  {item.city_name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {formatNumber(item.current_listeners)} oyentes
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: 800,
                                  color: '#8a88ff',
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Radio Column */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 122, 0, 0.4)',
                    boxShadow: '0 4px 20px rgba(255, 122, 0, 0.08)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      borderBottom: '1px solid rgba(255, 122, 0, 0.2)',
                      paddingBottom: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Radio size={18} color="#FF7A00" />
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 700 }}>
                        Top 3 Mercados de Radio
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#FF7A00', fontWeight: 600 }}>
                      Base 100% = {formatNumber(totalTop3Radio)}
                    </span>
                  </div>

                  {top3Radio.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                      Sin datos de mercados de radio para este filtro.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {top3Radio.map((item, idx) => {
                        const pct =
                          totalTop3Radio > 0
                            ? ((item.audience / totalTop3Radio) * 100).toFixed(1)
                            : '0';
                        const badgeColor = idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32';
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              borderLeft: `4px solid ${badgeColor}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  color: badgeColor,
                                  minWidth: '22px',
                                }}
                              >
                                #{idx + 1}
                              </span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                                  {item.market}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {formatNumber(item.audience)} audiencia · {item.spins} spins
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: 800,
                                  color: '#FF7A00',
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Unified Matrix Table (All Cross-Compared Markets) ── */}
              {mergedMarkets.length > 0 && (
                <div
                  className="glass-panel"
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 1rem 0',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Trophy size={16} color="#FFD700" />
                    <span>Tabla Comparativa Consolidada de Mercados ({mergedMarkets.length} ciudades)</span>
                  </h4>

                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.85rem',
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-muted)',
                            textAlign: 'left',
                          }}
                        >
                          <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Mercado / Ciudad</th>
                          <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#8a88ff' }}>
                            Oyentes Digital
                          </th>
                          <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#8a88ff' }}>
                            % Digital
                          </th>
                          <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#FF7A00' }}>
                            Audiencia Radio
                          </th>
                          <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#FF7A00' }}>
                            % Radio
                          </th>
                          <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Presencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mergedMarkets.map((m, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                              background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                            }}
                          >
                            <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>
                              📍 {m.name}
                            </td>
                            <td style={{ padding: '0.75rem', color: m.digitalListeners > 0 ? '#fff' : 'var(--text-dim)' }}>
                              {m.digitalListeners > 0 ? formatNumber(m.digitalListeners) : '0'}
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: m.digitalPct > 0 ? '#8a88ff' : 'var(--text-dim)' }}>
                              {m.digitalPct.toFixed(1)}%
                            </td>
                            <td style={{ padding: '0.75rem', color: m.radioAudience > 0 ? '#fff' : 'var(--text-dim)' }}>
                              {m.radioAudience > 0 ? formatNumber(m.radioAudience) : '0'}
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: m.radioPct > 0 ? '#FF7A00' : 'var(--text-dim)' }}>
                              {m.radioPct.toFixed(1)}%
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                {m.inDigitalTop3 && (
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: 'rgba(138, 136, 255, 0.15)',
                                      color: '#8a88ff',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Top 3 Digital
                                  </span>
                                )}
                                {m.inRadioTop3 && (
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: 'rgba(255, 122, 0, 0.15)',
                                      color: '#FF7A00',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Top 3 Radio
                                  </span>
                                )}
                                {!m.inDigitalTop3 && !m.inRadioTop3 && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    Match cruzado
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DigitalVsRadioChart;
