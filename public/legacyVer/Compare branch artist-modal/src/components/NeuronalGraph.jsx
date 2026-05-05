import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
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

const NeuronalGraph = ({ artistId }) => {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [hoverNode, setHoverNode] = useState(null);

  const calculateRadius = (val, maxVal, minVal) => {
    if (maxVal === minVal || !val) return 8;
    return 8 + ((val - minVal) / (maxVal - minVal)) * 32;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchGraph = async () => {
      setIsLoading(true);
      const payload = await getArtistGraph(artistId);
      if (isMounted && payload && payload.nodes) {
        const maxListeners = Math.max(...payload.nodes.map(n => n.monthly_listeners || 0));
        const minListeners = Math.min(...payload.nodes.map(n => n.monthly_listeners || 0));
        
        const uniqueGroups = [...new Set(payload.nodes.map(n => n.group).filter(Boolean))];
        const colorMap = {};
        uniqueGroups.forEach((g, idx) => {
          colorMap[g] = GROUP_COLORS[idx % GROUP_COLORS.length];
        });
        
        const parsedData = {
          nodes: payload.nodes.map(n => ({
            ...n,
            val: calculateRadius(n.monthly_listeners, maxListeners, minListeners),
            assignedColor: n.id === artistId ? '#ff0055' : (colorMap[n.group] || GROUP_COLORS[0])
          })),
          links: payload.edges.map(e => ({
            source: e.source,
            target: e.target
          }))
        };
        setGraphData(parsedData);
      }
      if (isMounted) setIsLoading(false);
    };
    
    if (artistId) fetchGraph();
    return () => { isMounted = false; };
  }, [artistId]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 500
      });
    }
    
    if (graphData && fgRef.current) {
      // Repel nodes more strongly to separate families
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(link => {
        return link.source.group === link.target.group ? 40 : 150;
      });

      setTimeout(() => {
        fgRef.current.zoomToFit(1000, 50);
      }, 500);
    }
  }, [graphData]);

  if (isLoading) {
    return (
      <div className="flex-center" style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', background: '#050508', border: '1px solid var(--glass-border)' }}>
        <Loader2 className="loading-spinner" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex-center" style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', background: '#050508', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
        No hay datos suficientes para generar el clúster.
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '65vh', minHeight: '500px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#050508', border: '1px solid var(--glass-border)', position: 'relative' }}
    >
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={() => ''} /* Disable native browser tooltip */
        nodeVal="val"
        nodeColor={node => node.assignedColor}
        linkColor={(link) => {
           return `${link.source.assignedColor || '#ffffff'}60`; // Add alpha transparency visually
        }}
        linkWidth={1.5}
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.2}
        onNodeHover={node => setHoverNode(node)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || node.name;
          const fontSize = Math.max(10 / globalScale, 2);
          const radius = node.val || 5;
          const isHovered = hoverNode && hoverNode.id === node.id;
          
          const color = node.assignedColor || '#ffffff';
          
          ctx.shadowBlur = isHovered ? 25 : 15;
          ctx.shadowColor = color;
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          
          ctx.shadowBlur = 0;
          ctx.font = `${fontSize}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
          ctx.fillText(label, node.x, node.y + radius + (fontSize * 1.5));
        }}
      />
      
      {/* Fixed Interactive Tooltip Container */}
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

      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Rueda para enfocar / Arrastra nodos
      </div>
    </div>
  );
};

export default NeuronalGraph;
