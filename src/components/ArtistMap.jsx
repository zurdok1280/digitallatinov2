import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Extracted outside the component so it's a stable reference (no re-creation on every render)
const clusterData = (dataset, distanceThreshold = 3.5) => {
  const sorted = [...dataset].sort((a, b) => b.current_listeners - a.current_listeners);
  const clusters = [];
  for (const city of sorted) {
    let merged = false;
    for (const cluster of clusters) {
      const dx = city.city_lng - cluster.city_lng;
      const dy = city.city_lat - cluster.city_lat;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < distanceThreshold) {
        cluster.current_listeners += city.current_listeners;
        cluster.cities.push(city);
        merged = true;
        break;
      }
    }
    if (!merged) clusters.push({ ...city, cities: [city] });
  }
  return clusters;
};

const ArtistMap = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // ✅ All hooks MUST be called before any early return
  const clusteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const clustered = clusterData(data, 3.5);
    return clustered.sort((a, b) => b.current_listeners - a.current_listeners);
  }, [data]);

  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No map data available.</p>;

  const maxListeners = Math.max(...clusteredData.map(d => d.current_listeners));
  const minListeners = Math.min(...clusteredData.map(d => d.current_listeners));

  // Dynamic radius using area density (Math.sqrt) to prevent massive blobs from swallowing the screen
  const calculateRadius = (val) => {
    if (maxListeners === minListeners || maxListeners === 0) return 10;
    return 6 + Math.sqrt((val - minListeners) / (maxListeners - minListeners)) * 24;
  };

  const mapColors = [
    '#8a88ff', '#ff9eee', '#00f0ff', '#c193ff', '#ffb700', 
    '#00e676', '#ff3366', '#74b9ff', '#a29bfe', '#fdcb6e', 
    '#1db954', '#e056fd', '#00cec9', '#fd79a8', '#ffeaa7'
  ];

  return (
    <div className="glass-panel" style={{ width: '100%', height: '400px', background: 'rgba(0,0,0,0.3)', overflow: 'hidden', position: 'relative' }}>
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ scale: 400 }} 
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[-95, 38]} zoom={1.3}>
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

          {clusteredData.map((cluster, index) => {
            const size = calculateRadius(cluster.current_listeners);
            const dotColor = mapColors[index % mapColors.length];
            const isHovered = hoveredNode === cluster.city_name;
            
            return (
              <Marker 
                key={cluster.city_name} 
                coordinates={[cluster.city_lng, cluster.city_lat]}
                onMouseEnter={() => setHoveredNode(cluster.city_name)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer Glow */}
                <circle 
                  r={isHovered ? size + 10 : size + 6} 
                  fill={dotColor} 
                  fillOpacity={isHovered ? 0.4 : 0.25}
                  style={{ transition: 'all 0.2s ease-in-out' }}
                />
                {/* Inner Dot */}
                <circle 
                  r={size} 
                  fill={dotColor} 
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
                
                {/* Render Label exclusively on Mouse Hover or if its a solo massive anchor to prevent massive screen clutter */}
                {(isHovered || size > 16) && (
                  <text
                    textAnchor="middle"
                    y={size + 14}
                    style={{ 
                      fontFamily: "Outfit, sans-serif", 
                      fill: "var(--text-main)", 
                      fontSize: isHovered ? "14px" : "11px", 
                      fontWeight: "700", 
                      textShadow: "0px 2px 4px rgba(0,0,0,0.9)",
                      pointerEvents: "none",
                      transition: 'all 0.2s ease-in-out',
                      zIndex: isHovered ? 999 : 1
                    }}
                  >
                    {cluster.cities.length > 1 ? `${cluster.city_name} (+${cluster.cities.length - 1})` : cluster.city_name}
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Rueda para enfocar / Arrastra para explorar
      </div>
    </div>
  );
};

export default ArtistMap;
