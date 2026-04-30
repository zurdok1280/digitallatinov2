import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CitiesGapMap = ({ data }) => {
  const [hoveredCity, setHoveredCity] = useState(null);

  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No map data available.</p>;

  // Sorting to bring smaller markers to front
  const sortedData = [...data].sort((a,b) => b.opportunity_score - a.opportunity_score);

  const getMarkerColor = (city) => {
    if (city.priority_level === 'priority') return '#ff0055'; // High Priority
    if (city.recommendation_type === 'missing') return '#ffb700'; // Missing
    if (city.recommendation_type === 'underperforming') return '#00f0ff'; // Underperforming
    return '#a29bfe'; // Fallback
  };

  const getLabelInfo = (city) => {
    if (city.priority_level === 'priority') return 'Priority';
    if (city.recommendation_type === 'missing') return 'Missing';
    if (city.recommendation_type === 'underperforming') return 'Underperforming';
    return '';
  };

  // Dynamic radius based on gap/score
  const maxScore = Math.max(...sortedData.map(d => d.opportunity_score || 0));
  const minScore = Math.min(...sortedData.map(d => d.opportunity_score || 0));

  const calculateRadius = (val) => {
    if (maxScore === minScore || !val) return 10;
    return 6 + Math.sqrt((val - minScore) / (maxScore - minScore)) * 18;
  };

  return (
    <div className="glass-panel" style={{ width: '100%', height: '450px', background: 'rgba(0,0,0,0.3)', overflow: 'hidden', position: 'relative' }}>
      
      {/* Legend */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(20,20,25,0.85)', padding: '0.8rem', borderRadius: '12px', zIndex: 10, backdropFilter: 'blur(8px)', border: '1px solid var(--glass-border)' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Oportunidades</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff0055' }}></div> Priority (Alta Oportunidad)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffb700' }}></div> Missing (No estás)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00f0ff' }}></div> Underperforming (Muy bajo)
        </div>
      </div>

      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ scale: 350 }} 
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[-95, 38]} zoom={1.2}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography 
                  key={geo.rsmKey} 
                  geography={geo} 
                  fill="#141522" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1e1f32", outline: "none" },
                    pressed: { fill: "#141522", outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {[...sortedData].reverse().map((city, index) => {
            if (!city.city_lng || !city.city_lat) return null;
            const size = calculateRadius(city.opportunity_score);
            const dotColor = getMarkerColor(city);
            const isHovered = hoveredCity?.fk_city === city.fk_city;
            
            return (
              <Marker 
                key={`${city.fk_city}-${index}`} 
                coordinates={[city.city_lng, city.city_lat]}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle 
                  r={isHovered ? size + 10 : size + 6} 
                  fill={dotColor} 
                  fillOpacity={isHovered ? 0.4 : 0.25}
                  style={{ transition: 'all 0.2s ease-in-out' }}
                />
                <circle 
                  r={size} 
                  fill={dotColor} 
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Hover Info Panel (HTML based to always correctly float overhead) */}
      {hoveredCity && (
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(20,20,28,0.95)', border: `1px solid ${getMarkerColor(hoveredCity)}`, borderRadius: '12px', padding: '1rem', color: 'white', minWidth: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
            {hoveredCity.city_name} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>({hoveredCity.country_code})</span>
          </h3>
          <div style={{ display: 'inline-block', background: `${getMarkerColor(hoveredCity)}33`, color: getMarkerColor(hoveredCity), padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
            {getLabelInfo(hoveredCity)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Tus Listeners:</span>
            <strong style={{ color: 'white', textAlign: 'right' }}>{Math.round(hoveredCity.main_current_listeners).toLocaleString()}</strong>
            
            <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Avg Similares:</span>
            <strong style={{ color: 'var(--accent-primary)', textAlign: 'right' }}>{Math.round(hoveredCity.related_avg_current_listeners).toLocaleString()}</strong>
            
            <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Gap:</span>
            <strong style={{ color: getMarkerColor(hoveredCity), textAlign: 'right' }}>{Math.round(hoveredCity.listeners_gap_vs_avg_related).toLocaleString()}</strong>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Rueda para enfocar / Arrastra para explorar
      </div>
    </div>
  );
};
export default CitiesGapMap;
