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

const CirclePackGraph = ({ artistId }) => {
  const containerRef = useRef();
  const svgRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [graphData, setGraphData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [hoverNode, setHoverNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;
    const fetchGraph = async () => {
      setIsLoading(true);
      const payload = await getArtistGraph(artistId);
      if (isMounted && payload && payload.nodes) setGraphData(payload.nodes);
      if (isMounted) setIsLoading(false);
    };
    if (artistId) fetchGraph();
    return () => { isMounted = false; };
  }, [artistId]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 600
      });
    }
  }, [graphData]);

  useEffect(() => {
    if (!graphData || !svgRef.current || dimensions.width === 0) return;

    const nodeIds = new Set(graphData.map(d => d.id));
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

      const size = Math.min(dimensions.width, dimensions.height);
      // Create padding around the edges
      const pack = d3.pack()
        .size([size - 60, size - 60])
        .padding(8);

      const packedData = pack(root);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const g = svg.append("g")
        .attr("transform", `translate(${(dimensions.width - size + 60) / 2},${(dimensions.height - size + 60) / 2})`);

      const node = g.append("g")
        .selectAll("circle")
        .data(packedData.descendants())
        .join("circle")
        .attr("fill", d => {
          if (d.data.node_type === 'root') return 'rgba(255,0,85,0.08)';
          if (d.children) return 'rgba(255,255,255,0.05)';
          return colorMap[d.data.group] || GROUP_COLORS[0];
        })
        .attr("stroke", d => {
          if (d.data.node_type === 'root') return 'rgba(255,0,85,0.6)';
          if (d.children) return 'rgba(255,255,255,0.15)';
          return 'rgba(0,0,0,0.5)';
        })
        .attr("stroke-width", d => d.children ? 2 : 1)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .style("transition", "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)")
        .style("cursor", "crosshair");

      // Text labels for leaves
      g.append("g")
        .style("font-family", "Outfit, sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(packedData.descendants().filter(d => !d.children && d.r > 10)) 
        .join("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("dy", "0.3em")
        .attr("fill", "#fff")
        .style("font-size", d => Math.min(14, d.r / 3) + "px")
        .style("font-weight", 700)
        .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)")
        .text(d => truncateText(d.data.label || d.data.name, Math.floor(d.r / 3)));

      node.on("mouseenter", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#fff")
          .attr("stroke-width", 3)
          .style("filter", "brightness(1.5)")
          .moveToFront(); 

        const aColor = d.data.node_type === 'root' ? '#ff0055' : (colorMap[d.data.group] || GROUP_COLORS[0]);
        setHoverNode({ ...d.data, assignedColor: aColor });
      })
      .on("mousemove", (event) => {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on("mouseleave", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", d.data.node_type === 'root' ? 'rgba(255,0,85,0.6)' : (d.children ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.5)'))
          .attr("stroke-width", d.children || d.data.node_type === 'root' ? 2 : 1)
          .style("filter", "none");
        setHoverNode(null);
      });
      
      // Monkey patch moveToFront helper
      d3.selection.prototype.moveToFront = function() {  
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
      };

    } catch (err) {
      console.error("D3 Error rendering Circle Pack", err);
    }
  }, [graphData, dimensions]);

  const truncateText = (text, maxStr) => {
    if (!text) return "";
    return text.length > maxStr ? text.substring(0, maxStr) + "..." : text;
  };

  if (isLoading) return (
    <div className="flex-center" style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', background: '#050508', border: '1px solid var(--glass-border)' }}>
      <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
    </div>
  );

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#050508', border: '1px solid var(--glass-border)', position: 'relative' }}
    >
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ width: '100%', height: '100%' }} />

      {hoverNode && (
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(20,20,25,0.95)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.5rem', color: 'white', width: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', pointerEvents: 'none', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', color: hoverNode.assignedColor }}>
            {hoverNode.label || hoverNode.name}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Listeners</div><div style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatNumber(hoverNode.monthly_listeners)}</div></div>
            <div><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Followers</div><div style={{ color: '#ffb700', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatNumber(hoverNode.followers_total)}</div></div>
            <div><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Popularity</div><div style={{ color: '#ff0055', fontWeight: 'bold', fontSize: '1.2rem' }}>{hoverNode.popularity}%</div></div>
            <div><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Score</div><div style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatNumber(hoverNode.artist_score)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CirclePackGraph;
