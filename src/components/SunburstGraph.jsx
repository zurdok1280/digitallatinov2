import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getArtistGraph } from '../services/api';
import { Loader2 } from 'lucide-react';

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const GROUP_COLORS = [
  '#4ade80', '#60a5fa', '#f87171', '#fbbf24', 
  '#c084fc', '#2dd4bf', '#fb923c', '#a78bfa',
  '#f472b6', '#facc15', '#00f0ff', '#ff9e00'
];

const SunburstGraph = ({ artistId }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [graphData, setGraphData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600, size: 600 });
  
  const [hoverNode, setHoverNode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGraph = async () => {
      setIsLoading(true);
      const payload = await getArtistGraph(artistId);
      if (isMounted && payload && payload.nodes) {
        setGraphData(payload.nodes);
        setIsLoading(false);
      }
    };
    if (artistId) fetchGraph();
    return () => { isMounted = false; };
  }, [artistId]);

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const h = clientHeight || 600;
      const size = Math.min(clientWidth, h);
      setDimensions({ width: clientWidth, height: h, size });
    }
  }, [graphData]);

  useEffect(() => {
    if (!graphData || !svgRef.current || dimensions.size === 0) return;

    const nodeIds = new Set(graphData.map(d => d.id));
    // Filter root and descendants that actually refer to valid parents to prevent stratify crash
    const validNodes = graphData.filter(d => d.node_type === 'root' || nodeIds.has(d.parent_id));

    if (validNodes.length === 0) return;

    const uniqueGroups = [...new Set(validNodes.map(n => n.group).filter(Boolean))];
    const colorMap = {};
    uniqueGroups.forEach((g, idx) => {
      colorMap[g] = GROUP_COLORS[idx % GROUP_COLORS.length];
    });

    try {
      const stratify = d3.stratify()
        .id(d => d.id)
        .parentId(d => d.node_type === 'root' ? undefined : d.parent_id);
      
      const root = stratify(validNodes)
        .sum(d => d.monthly_listeners || 1)
        .sort((a, b) => b.value - a.value);

      const size = dimensions.size;
      const radius = size / 6;

      const partition = d3.partition()
        .size([2 * Math.PI, root.height + 1]);

      partition(root);
      root.each(d => d.current = d);

      const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const g = svg.append("g")
        .attr("transform", `translate(${dimensions.width / 2},${dimensions.height / 2})`);

      // All paths including root
      const path = g.append("g")
        .selectAll("path")
        .data(root.descendants())
        .join("path")
        .attr("fill", d => {
          if (d.data.node_type === 'root') return '#ff0055';
          return colorMap[d.data.group] || GROUP_COLORS[0];
        })
        .attr("fill-opacity", d => d.children ? 0.8 : 0.6)
        .attr("d", d => arc(d.current))
        .style("transition", "opacity 0.2s, fill-opacity 0.2s")
        .style("cursor", "crosshair");

      const label = g.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().filter(d => d.depth && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.015))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill", "#fff")
        .style("font-size", "10px")
        .style("font-family", "Outfit, sans-serif")
        .attr("transform", d => {
          const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
          const y = (d.y0 + d.y1) / 2 * radius;
          return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .text(d => truncateText(d.data.label || d.data.name, 12));

      // Root label inside center circle
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "Outfit, sans-serif")
        .attr("pointer-events", "none")
        .attr("dy", "0.3em")
        .text(truncateText(root.data.label || root.data.name, 15));

      // Tooltip triggers
      path.on("mouseenter", (event, d) => {
        d3.select(event.currentTarget).attr("fill-opacity", 1).style("stroke", "#fff").style("stroke-width", "2px");
        const aColor = d.data.node_type === 'root' ? '#ff0055' : (colorMap[d.data.group] || GROUP_COLORS[0]);
        setHoverNode({ ...d.data, assignedColor: aColor });
      })
      .on("mouseleave", (event, d) => {
        d3.select(event.currentTarget).attr("fill-opacity", d.children ? 0.8 : 0.6).style("stroke", "none");
        setHoverNode(null);
      });

    } catch (err) {
      console.error("D3 Error rendering Sunburst", err);
    }
  }, [graphData, dimensions]);

  const truncateText = (text, maxStr) => {
    if (!text) return "";
    return text.length > maxStr ? text.substring(0, maxStr) + "..." : text;
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', background: '#050508', border: '1px solid var(--glass-border)' }}>
        <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (!graphData || graphData.length === 0) {
    return (
      <div className="flex-center" style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', background: '#050508', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
        No hay datos suficientes para generar el Sunburst.
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#050508', border: '1px solid var(--glass-border)', position: 'relative' }}
    >
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ width: '100%', height: '100%' }} />

      {hoverNode && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          background: 'rgba(20,20,25,0.95)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          width: '280px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          zIndex: 9999,
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', color: hoverNode.assignedColor }}>
            {hoverNode.label || hoverNode.name}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Listeners</div>
              <div style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatNumber(hoverNode.monthly_listeners)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</div>
              <div style={{ color: '#ffb700', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatNumber(hoverNode.followers_total)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Popularity</div>
              <div style={{ color: '#ff0055', fontWeight: 'bold', fontSize: '1.2rem' }}>{hoverNode.popularity}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</div>
              <div style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatNumber(hoverNode.artist_score)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunburstGraph;
