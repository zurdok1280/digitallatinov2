import { Play, Pause, ArrowUp, ArrowDown, Minus, Loader2, Info, Zap, Lock, Search, X, PieChart as PieChartIcon, RefreshCw, Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAudioPreview } from '../hooks/useAudioPreview.jsx';
import { getLabelMarketShareDigitalVideo } from '../services/api';

import { useMemo, useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';

const rankColors = [
  '#8a88ff', '#ff9eee', '#00f0ff', '#c193ff', '#ffb700',
  '#00e676', '#ff3366', '#74b9ff', '#a29bfe', '#fdcb6e',
  '#1db954', '#e056fd', '#00cec9', '#fd79a8', '#ffeaa7'
];

const pieSliceColors = [
  '#c193ff', '#00f0ff', '#ff3366', '#ffb700', '#00e676',
  '#74b9ff', '#e056fd', '#fdcb6e', '#a29bfe', '#6c5ce7',
  '#1db954', '#ff7675', '#00cec9', '#fd79a8', '#ffeaa7'
];

const MarketSharePieChart = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (data.length <= 8) {
      return data.map((d, i) => ({
        name: d.label,
        value: Number(d.market_share_percent || 0),
        songs: d.songs || 0,
        color: pieSliceColors[i % pieSliceColors.length]
      }));
    }

    const topItems = data.slice(0, 8).map((d, i) => ({
      name: d.label,
      value: Number(d.market_share_percent || 0),
      songs: d.songs || 0,
      color: pieSliceColors[i % pieSliceColors.length]
    }));

    const rest = data.slice(8);
    const restShare = rest.reduce((acc, curr) => acc + Number(curr.market_share_percent || 0), 0);
    const restSongs = rest.reduce((acc, curr) => acc + Number(curr.songs || 0), 0);

    if (restShare > 0) {
      topItems.push({
        name: `Otros (${rest.length} disqueras)`,
        value: Number(restShare.toFixed(2)),
        songs: restSongs,
        color: '#6b7280'
      });
    }

    return topItems;
  }, [data]);

  const totalPercentage = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const slices = useMemo(() => {
    let cumulativeAngle = 0;
    const radius = 90;
    const innerRadius = 55;
    const center = 110;

    return chartData.map((item, idx) => {
      const sliceAngle = (item.value / (totalPercentage || 100)) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      const radStart = (startAngle - 90) * (Math.PI / 180);
      const radEnd = (endAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(radStart);
      const y1 = center + radius * Math.sin(radStart);
      const x2 = center + radius * Math.cos(radEnd);
      const y2 = center + radius * Math.sin(radEnd);

      const ix1 = center + innerRadius * Math.cos(radEnd);
      const iy1 = center + innerRadius * Math.sin(radEnd);
      const ix2 = center + innerRadius * Math.cos(radStart);
      const iy2 = center + innerRadius * Math.sin(radStart);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${ix1} ${iy1}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
        'Z'
      ].join(' ');

      return {
        ...item,
        pathData,
        idx
      };
    });
  }, [chartData, totalPercentage]);

  if (chartData.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ overflow: 'visible' }}>
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.idx;
            return (
              <path
                key={slice.idx}
                d={slice.pathData}
                fill={slice.color}
                opacity={hoveredIdx === null || isHovered ? 1 : 0.4}
                style={{
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  transformOrigin: '110px 110px',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          {hoveredIdx !== null ? (
            <>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: slices[hoveredIdx].color, lineHeight: 1 }}>
                {slices[hoveredIdx].value}%
              </span>
              <span style={{ fontSize: '0.72rem', color: '#d1d5db', maxWidth: '95px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                {slices[hoveredIdx].name}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                {slices[hoveredIdx].songs} canciones
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                {data.reduce((a, b) => a + (b.songs || 0), 0)}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px' }}>
                Canciones
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


const Sparkline = ({ song, color }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [data, setData] = useState(song?.trend || []);
  const [labels, setLabels] = useState(song?.trend ? song.trend.map((_, i) => `Week ${i + 1}`) : []);

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (containerRef.current) observer.unobserve(containerRef.current);
      }
    }, { rootMargin: '100px' });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (song?.cs_song && isVisible && !hasFetched) {
      Promise.resolve().then(() => {
        if (isMounted) setIsLoading(true);
      });
      fetch(`https://backend.digital-latino.com/api/report/getSongHistoricalStreamsWeek/${song.cs_song}/0/0`)
        .then(res => res.json())
        .then(json => {
          if (isMounted) {
            setHasFetched(true);
            if (Array.isArray(json) && json.length > 0) {
              const sorted = [...json].sort((a, b) => a.date_week.localeCompare(b.date_week));
              setData(sorted.map(item => item.spotify_streams / 1000000));
              setLabels(sorted.map(item => item.date_week));
            }
          }
        })
        .catch(e => console.error("Error fetching historical streams:", e))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [song?.cs_song, isVisible, hasFetched]);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 140;
  const height = 36;

  // Handle single data point naturally
  const displayData = data.length === 1 ? [data[0], data[0]] : data;
  const displayLabels = labels.length === 1 ? [labels[0], labels[0]] : labels;

  const points = displayData.map((d, i) => {
    const x = (i / (displayData.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return { x, y, val: d };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  const fillPoints = `${pointsString} ${width},${height} 0,${height}`;
  const reactId = useId();
  const gradientId = `spark-${color.replace('#', '')}-${song?.cs_song || reactId.replace(/:/g, '')}`;
  const colWidth = width / displayData.length;

  return (
    <div
      className="sparkline-wrapper"
      onClick={(e) => e.stopPropagation()}
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        opacity: 0.8,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" color={color} style={{ opacity: 0.7 }} />
      ) : (!data || data.length === 0) ? null : (
        <>
          <svg width={width} height={height} viewBox={`0 -5 ${width} ${height + 10}`} style={{ overflow: 'visible', position: 'absolute', left: 0, top: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <polyline points={fillPoints} fill={`url(#${gradientId})`} />

            {/* Render Hover Indicator Lines Below the Main Stroke */}
            {hoveredIdx !== null && (
              <line x1={points[hoveredIdx].x} y1="-5" x2={points[hoveredIdx].x} y2={height} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2" />
            )}

            <polyline points={pointsString} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Default end dot if no hover */}
            {hoveredIdx === null && (
              <circle cx={width} cy={points[points.length - 1].y} r="3.5" fill={color} stroke="#050508" strokeWidth="1.5" />
            )}

            {/* Hover Active Dot */}
            {hoveredIdx !== null && (
              <circle cx={points[hoveredIdx].x} cy={points[hoveredIdx].y} r="4.5" fill={color} stroke="#fff" strokeWidth="2" style={{ transition: 'all 0.1s' }} />
            )}

            {/* Invisible Hit Area Columns for Cursor Tracking */}
            {points.map((p, i) => (
              <rect
                key={i}
                x={p.x - colWidth / 2}
                y={-5}
                width={colWidth}
                height={height + 10}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                style={{ cursor: 'crosshair' }}
              />
            ))}
          </svg>

          {/* Dynamic Popover Overlay */}
          {hoveredIdx !== null && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: `${points[hoveredIdx].x}px`,
              transform: 'translateX(-50%) translateY(-8px)',
              background: 'rgba(15,15,20,0.95)',
              border: '1px solid var(--glass-border)',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              color: 'white',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 50,
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{ color: color, fontWeight: '700', fontSize: '1rem', lineHeight: '1.2' }}>
                {Number(points[hoveredIdx].val.toFixed(1))}M
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {displayLabels[hoveredIdx]}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const getBase64ImageFromUrl = async (imageUrl) => {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
};

const exportToExcel = (songs = [], filters = {}) => {
  if (!songs || songs.length === 0) return;
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const metadataLines = [
    'DIGITAL LATINO — REPORTE OFICIAL DE CHART',
    `Fecha de exportación: ${dateStr}`,
    'FILTROS SELECCIONADOS:',
    `País: ${filters.country || 'Global'}`,
    `Género: ${filters.genre || 'Todos los géneros'}`,
    `Ciudad: ${filters.city || 'Todas las ciudades'}`,
    `Clasificación CRG: ${filters.crg || 'Catalog'}`,
    `Total de canciones: ${songs.length}`,
    '', // Separator line
  ];

  const headers = ['Posición', 'Canción', 'Artista', 'Sello / Disquera', 'Reproducciones', 'Score', 'Posición Anterior'];
  const rows = songs.map((s) => [
    s.rk ?? s.posicion ?? '',
    `"${(s.song || '').replace(/"/g, '""')}"`,
    `"${(s.artists || '').replace(/"/g, '""')}"`,
    `"${(s.label || '').replace(/"/g, '""')}"`,
    s.spotify_streams ? Number(s.spotify_streams).toLocaleString('es-MX') : (s.spotify_streams_total ? Number(s.spotify_streams_total).toLocaleString('es-MX') : '0'),
    s.score ?? s.spotify_score ?? '',
    s.rk_lw ?? s.posicion_anterior ?? ''
  ]);

  const csvContent = '\uFEFF' + [...metadataLines, headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Chart_DigitalLatino_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToPDF = async (songs = [], filters = {}) => {
  if (!songs || songs.length === 0) return;
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fetch official Digital Latino logo image
    const logoBase64 = await getBase64ImageFromUrl('/logo.png');

    // Header Background Banner
    doc.setFillColor(18, 19, 28);
    doc.rect(0, 0, pageWidth, 75, 'F');

    // Render Logo Image or Text Fallback
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 40, 15, 120, 45);
      } catch (err) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(193, 147, 255);
        doc.text('DIGITAL LATINO', 40, 44);
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(193, 147, 255);
      doc.text('DIGITAL LATINO', 40, 44);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Reporte Oficial de Chart', pageWidth - 230, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(160, 165, 185);
    const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Fecha: ${dateStr}`, pageWidth - 230, 52);

    // Filters Summary Box
    doc.setFillColor(28, 30, 45);
    doc.roundedRect(40, 85, pageWidth - 80, 42, 6, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(193, 147, 255);
    doc.text('FILTROS SELECCIONADOS:', 55, 102);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 225, 240);

    const filterText = `País: ${filters.country || 'Global'}   |   Género: ${filters.genre || 'Todos'}   |   Ciudad: ${filters.city || 'Todas'}   |   CRG: ${filters.crg || 'Catalog'}   |   Total canciones: ${songs.length}`;
    doc.text(filterText, 55, 118);

    // Table Header setup
    let startY = 152;
    const colX = [40, 80, 280, 480, 650, 750];
    const headers = ['#', 'Canción', 'Artista', 'Sello / Disquera', 'Reproducciones', 'Score'];

    const renderTableHeader = (y) => {
      doc.setFillColor(18, 19, 28);
      doc.rect(40, y - 12, pageWidth - 80, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      headers.forEach((h, i) => doc.text(h, colX[i], y + 2));
    };

    renderTableHeader(startY);
    startY += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    songs.forEach((song, idx) => {
      if (startY > pageHeight - 40) {
        doc.addPage();
        startY = 50;
        renderTableHeader(startY);
        startY += 18;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
      }

      if (idx % 2 === 1) {
        doc.setFillColor(245, 247, 252);
        doc.rect(40, startY - 11, pageWidth - 80, 16, 'F');
      }

      doc.setTextColor(30, 30, 35);
      const rk = String(song.rk ?? song.posicion ?? (idx + 1));
      const songName = (song.song || '').length > 35 ? (song.song || '').substring(0, 33) + '...' : (song.song || '');
      const artistName = (song.artists || '').length > 32 ? (song.artists || '').substring(0, 30) + '...' : (song.artists || '');
      const labelName = (song.label || '').length > 25 ? (song.label || '').substring(0, 23) + '...' : (song.label || '');
      const streams = song.spotify_streams ? Number(song.spotify_streams).toLocaleString('es-MX') : (song.spotify_streams_total ? Number(song.spotify_streams_total).toLocaleString('es-MX') : '-');
      const score = song.score ? String(song.score) : (song.spotify_score ? String(song.spotify_score) : '-');

      doc.text(rk, colX[0], startY);
      doc.text(songName, colX[1], startY);
      doc.text(artistName, colX[2], startY);
      doc.text(labelName, colX[3], startY);
      doc.text(streams, colX[4], startY);
      doc.text(score, colX[5], startY);

      startY += 16;
    });

    doc.save(`Chart_DigitalLatino_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('Error generating PDF:', err);
  }
};

const SongChart = ({
  songs,
  isLoading,
  onArtistClick,
  onSongClick,
  onLoginClick,
  comparisonMode,
  onSongSelect,
  selectedSongs = [],
  selectedCountry = '0',
  selectedGenre = '0',
  selectedCity = '0',
  selectedCRG = 'C',
  selectedFormat = '0',
  countriesList = [],
  genresList = [],
  citiesList = [],
}) => {
  const { token, user } = useAuth();
  const { currentlyPlaying, handlePlayPreview } = useAudioPreview();
  const [searchQuery, setSearchQuery] = useState('');

  // Compute Readable Active Filters for Reports
  const countryName = useMemo(() => {
    if (!selectedCountry || selectedCountry === '0' || selectedCountry === 0) return 'Global';
    const match = countriesList.find((c) => String(c.id) === String(selectedCountry));
    return match?.country_name || match?.name || `País #${selectedCountry}`;
  }, [selectedCountry, countriesList]);

  const genreName = useMemo(() => {
    if (!selectedGenre || selectedGenre === '0' || selectedGenre === 0) return 'Todos los géneros';
    const match = genresList.find((g) => String(g.id) === String(selectedGenre));
    return match?.genre || match?.name || match?.nombre || `Género #${selectedGenre}`;
  }, [selectedGenre, genresList]);

  const cityName = useMemo(() => {
    if (!selectedCity || selectedCity === '0' || selectedCity === 0) return 'Todas las ciudades';
    const match = citiesList.find((c) => String(c.id) === String(selectedCity));
    return match?.name || match?.city || `Ciudad #${selectedCity}`;
  }, [selectedCity, citiesList]);

  const crgName = useMemo(() => {
    if (selectedCRG === 'C') return 'Catalog (C)';
    if (selectedCRG === 'R') return 'Current (R)';
    if (selectedCRG === 'G') return 'General (G)';
    return selectedCRG || 'General';
  }, [selectedCRG]);

  const activeFilters = useMemo(() => ({
    country: countryName,
    genre: genreName,
    city: cityName,
    crg: crgName,
  }), [countryName, genreName, cityName, crgName]);

  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Market Share Modal State
  const [isMarketShareOpen, setIsMarketShareOpen] = useState(false);
  const [marketShareTop, setMarketShareTop] = useState(300);
  const [marketShareData, setMarketShareData] = useState([]);
  const [marketShareLoading, setMarketShareLoading] = useState(false);
  const [marketShareError, setMarketShareError] = useState(null);
  const [marketShareSearch, setMarketShareSearch] = useState('');

  // Fetch Market Share Data
  useEffect(() => {
    if (!isMarketShareOpen) return;
    let isMounted = true;
    setMarketShareLoading(true);
    setMarketShareError(null);

    getLabelMarketShareDigitalVideo({
      format: selectedFormat || 0,
      country: selectedCountry || 0,
      crg: selectedCRG || 'C',
      genre: selectedGenre || 0,
      city: selectedCity || 0,
      noradio: 0,
      top: marketShareTop,
    })
      .then((data) => {
        if (isMounted) {
          setMarketShareData(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error('Error fetching market share data:', err);
        if (isMounted) setMarketShareError('No se pudieron cargar los datos de Market Share.');
      })
      .finally(() => {
        if (isMounted) setMarketShareLoading(false);
      });

    return () => { isMounted = false; };
  }, [isMarketShareOpen, marketShareTop, selectedFormat, selectedCountry, selectedCRG, selectedGenre, selectedCity]);

  const filteredMarketShareList = useMemo(() => {
    if (!marketShareSearch.trim()) return marketShareData;
    const q = marketShareSearch.toLowerCase().trim();
    return marketShareData.filter((item) => (item.label || '').toLowerCase().includes(q));
  }, [marketShareData, marketShareSearch]);

  useEffect(() => {
    setSearchQuery('');
  }, [songs]);

  // Generate deterministic "historical" trend data for demonstration purposes
  const enrichedSongs = useMemo(() => {
    if (!songs) return [];

    return songs.map((s, idx) => {
      let val = 100 - (s.rk * 0.3);
      const trend = [];
      for (let i = 0; i < 20; i++) {
        val = val + (Math.sin(s.rk * 1.3 + i * 0.8) * 8) + (Math.cos(idx + i) * 6);
        trend.push(Math.max(10, val));
      }
      return { ...s, trend };
    });
  }, [songs]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return enrichedSongs;
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return enrichedSongs.filter(song => {
      const songName = (song.song || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const artistName = (song.artists || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const labelName = (song.label || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return songName.includes(query) || artistName.includes(query) || labelName.includes(query);
    });
  }, [enrichedSongs, searchQuery]);

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="grid-base" style={{ gap: '0.5rem' }}>
          {[...Array(5)].map((_, i) => <ChartRowSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!enrichedSongs || enrichedSongs.length === 0) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No se encontraron canciones con esos filtros.</p>
      </div>
    );
  }

  const renderMovement = (mo) => {
    if (!mo) return null;
    const mov = String(mo).toLowerCase();
    if (mov.includes('up')) return <ArrowUp size={16} color="var(--accent-primary)" title="Subió" />;
    if (mov.includes('down')) return <ArrowDown size={16} color="var(--accent-secondary)" title="Bajó" />;
    return <Minus size={16} color="var(--text-muted)" title="Sin cambio" />;
  };

  const renderRow = (song, index, isTeaser = false) => {
    const rowColor = rankColors[index % rankColors.length];
    const isSelected = selectedSongs.some(s => s.cs_song === song.cs_song);

    if (isTeaser) {
      return (
        <div
          key={song.cs_song || index}
          className="chart-row glass-panel-interactive"
          style={{ opacity: 0.5, pointerEvents: 'none', position: 'relative' }}
        >
          <div className="chart-left" style={{ flex: 1, overflow: 'hidden' }}>
            <div className="chart-rank">
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: rowColor, lineHeight: 1 }}>
                {song.rk}
              </span>
              <div style={{ marginTop: '0.15rem' }}>
                {renderMovement(song.movement)}
              </div>
            </div>

            <div className="chart-img-wrapper" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
            </div>

            <div className="chart-title-wrapper" style={{ minWidth: 0 }}>
              <h3 className="chart-title">{song.song}</h3>
              <p className="chart-artist">{song.artists}</p>
              {song.label && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.label}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={song.cs_song || index}
        className={`chart-row glass-panel-interactive ${isSelected ? 'selected-for-compare' : ''}`}
        onClick={(e) => {
          if (!user) {
            onLoginClick();
            return;
          }
          if (comparisonMode) {
            e.stopPropagation();
            onSongSelect(song);
          } else {
            onSongClick(song);
          }
        }}
        style={{
          background: index === 0 ? 'rgba(0, 240, 255, 0.05)' : undefined,
          borderColor: index === 0 ? 'rgba(0, 240, 255, 0.3)' : undefined,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s, background 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(8px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
          e.currentTarget.style.zIndex = '50';
          if (index !== 0) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.zIndex = '1';
          if (index !== 0) e.currentTarget.style.background = '';
        }}
      >
        {comparisonMode && (
          <div className="compare-checkbox-wrapper">
            <div className={`compare-checkbox ${isSelected ? 'checked' : ''}`}>
              {isSelected && <Zap size={14} fill="currentColor" />}
            </div>
          </div>
        )}

        <div className="neon-watermark">#{index + 1}</div>

        <div className="chart-left" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="chart-rank">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: rowColor, lineHeight: 1 }}>
                {song.rk}
              </span>
              {song.rk_lw && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '2px', fontWeight: 600 }} title="Rango de la semana pasada">
                  {song.rk_lw}
                </span>
              )}
            </div>
            <div style={{ marginTop: '0.15rem' }}>
              {renderMovement(song.movement)}
            </div>
          </div>

          <div className="chart-img-wrapper" style={{ position: 'relative' }}>
            <img src={(song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.img || song.image_url || song.url || song.avatar || '/logo.png'} alt={song.song} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="eq-container">
              <div className="eq-bar" style={{ height: '16px' }} />
              <div className="eq-bar" style={{ height: '24px' }} />
              <div className="eq-bar" style={{ height: '12px' }} />
            </div>
            <div
              className="play-overlay"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePlayPreview(
                  song.rk,
                  `https://audios.monitorlatino.com/Iam/${song.entid}.mp3`,
                  { title: song.song, artist: song.artists, image: (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.img || song.image_url || song.url || song.avatar || '/logo.png' }
                );
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: currentlyPlaying === song.rk ? 1 : 0,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
                borderRadius: 'inherit'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => { if (currentlyPlaying !== song.rk) e.currentTarget.style.opacity = 0; }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {currentlyPlaying === song.rk ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} style={{ marginLeft: "2px" }} />
                )}
              </div>
            </div>
          </div>

          <div className="chart-title-wrapper" style={{ minWidth: 0 }}>
            <h3 className="chart-title" style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>{song.song}</h3>
            <p
              className="chart-artist"
              style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'inline-block' }}
              onMouseEnter={(e) => e.target.style.color = '#8c52ff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
              onClick={async (e) => {
                e.stopPropagation();
                if (!user) {
                  onLoginClick();
                  return;
                }
                if (user?.role === 'ARTIST') {
                  const allowedId = String(user.allowedArtistId);
                  const normalizeStr = (str) => String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                  const allowedName = normalizeStr(user.allowedArtistName || '');
                  const songArtistsStr = normalizeStr(song.artists || '');

                  if (String(song.spotifyartistid || song.cs_song) !== allowedId && (!allowedName || !songArtistsStr.includes(allowedName))) {
                    const { toast } = await import('../hooks/use-toast');
                    toast({
                      title: "🔒 Acceso Restringido",
                      description: "Acceso restringido, este artista no pertenece a tu selección actual.",
                      className: "bg-red-500/10 border-red-500/50 text-white backdrop-blur-md rounded-xl",
                    });
                    return;
                  }
                }
                onArtistClick({
                  id: song.spotifyartistid || song.cs_song,
                  spotifyid: song.spotifyartistid || song.cs_song,
                  name: song.artists,
                  imageUrl: (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.avatar || song.url,
                  monthlyListeners: song.spotify_streams_total || 0,
                  followers: song.audience_total || 0,
                  artist: song.artists,
                  img: (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.url || song.avatar || '/logo.png',
                  songName: song.song,
                  cs_song: song.cs_song
                });
              }}
            >
              {song.artists}
            </p>
            {song.label && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                {song.label}
              </p>
            )}
          </div>
        </div>

        <Sparkline song={song} color={rowColor} />

        <div className="score-info-container" style={{ textAlign: 'right', minWidth: '60px' }}>
          <div className="text-gradient chart-score">
            {song.score != null ? Number(song.score).toFixed(1) : '0.0'}
          </div>
          <span className="chart-score-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
            <span className="score-label-full">Score</span>
            <span className="score-label-short">SCR</span>
            <Info size={11} style={{ opacity: 0.7 }} />
          </span>

          <div className="score-tooltip">
            El <strong style={{ color: '#fff' }}>Score Digital</strong> es una métrica del 1 al 100 que mide la exposición de canciones en español a partir de señales de consumo en plataformas digitales y su alcance geográfico. Se enfoca únicamente en canciones recientes.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem' }}>
      <style>{`
        .sparkline-wrapper { display: none; margin: 0 1.5rem 0 auto; pointer-events: auto; flex-shrink: 0; }
        @media (min-width: 900px) {
          .sparkline-wrapper { display: block; }
        }
        @media (max-width: 768px) {
          .score-info-container {
            min-width: 48px !important;
          }
        }
        
        /* Score label toggle: base = show "Score", hide "SCR" */
        .score-label-full  { display: inline !important; }
        .score-label-short { display: none !important; }

        /* On mobile: hide "Score", show "SCR" */
        @media (max-width: 768px) {
          .score-label-full  { display: none !important; }
          .score-label-short { display: inline !important; }
        }
        
        /* Tooltip classes */
        .score-info-container { position: relative; }
        .score-tooltip {
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(-10px);
          background: rgba(25, 25, 35, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 1rem;
          margin-right: 15px;
          border-radius: 12px;
          width: 260px;
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.5;
          box-shadow: 0 12px 32px rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          text-align: left;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 100;
        }
        
        .score-tooltip::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -6px;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-style: solid;
          border-color: transparent transparent transparent rgba(25, 25, 35, 0.98);
        }

        .score-info-container:hover .score-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
        }

        /* Comparison Styles */
        .chart-row.selected-for-compare {
          border-color: var(--accent-primary) !important;
          background: rgba(138, 136, 255, 0.1) !important;
          box-shadow: 0 0 20px rgba(138, 136, 255, 0.2);
        }

        .compare-checkbox-wrapper {
          padding: 0 0.5rem 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .compare-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          color: transparent;
        }

        .compare-checkbox.checked {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
          box-shadow: 0 0 10px rgba(138, 136, 255, 0.5);
        }

        .chart-row:hover .compare-checkbox:not(.checked) {
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* Search Input Styles */
        .song-search-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          width: 100%;
        }
        
        .song-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 8px 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .song-search-wrapper:focus-within {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 3px rgba(138, 136, 255, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .song-search-wrapper:hover:not(:focus-within) {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .search-icon {
          color: var(--accent-primary);
          margin-right: 10px;
          opacity: 0.8;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        
        .song-search-wrapper:focus-within .search-icon {
          transform: scale(1.1);
          opacity: 1;
        }
        
        .song-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 0.9rem;
          font-family: inherit;
          padding: 0;
          width: 100%;
        }
        
        .song-search-input::placeholder {
          color: var(--text-muted);
          opacity: 0.7;
        }
        
        .song-search-clear {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          margin-left: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .song-search-clear:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: scale(1.05);
        }
        
        .search-results-badge {
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(138, 136, 255, 0.1);
          border: 1px solid rgba(138, 136, 255, 0.2);
          padding: 6px 12px;
          border-radius: 20px;
          white-space: nowrap;
          font-weight: 600;
          letter-spacing: 0.5px;
          animation: searchBadgeFadeIn 0.2s ease-out;
        }
        
        @keyframes searchBadgeFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Toolbar / Actions Bar */}
      <div className="song-chart-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Exportar Button with Dropdown */}
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  if (onLoginClick) onLoginClick();
                  return;
                }
                setIsExportMenuOpen((prev) => !prev);
              }}
              title={!user ? 'Inicia sesión para exportar el chart' : 'Exportar reporte'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: !user ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)',
                border: !user ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.15)',
                color: !user ? '#6b7280' : 'white',
                padding: '0.55rem 1.1rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                opacity: !user ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: !user ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.2)',
              }}
              onMouseEnter={(e) => {
                if (user) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (user) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
            >
              {!user ? <Lock size={15} color="#6b7280" /> : <Download size={17} color="#00e5ff" />}
              <span>Exportar</span>
              {user && <ChevronDown size={14} style={{ opacity: 0.7, transform: isExportMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />}
            </button>

            {user && isExportMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                backgroundColor: '#181926',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '0.75rem',
                padding: '0.4rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                zIndex: 100,
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    exportToExcel(filteredSongs, activeFilters);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <FileSpreadsheet size={16} color="#00e676" />
                  <span>Excel (.csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    exportToPDF(filteredSongs, activeFilters);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 51, 102, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <FileText size={16} color="#ff3366" />
                  <span>PDF (.pdf)</span>
                </button>
              </div>
            )}
          </div>

          {/* Market Share Button */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                if (onLoginClick) onLoginClick();
                return;
              }
              setIsMarketShareOpen(true);
            }}
            title={!user ? 'Inicia sesión para ver Market Share' : 'Ver Market Share'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: !user ? 'rgba(255, 255, 255, 0.03)' : 'rgba(193, 147, 255, 0.12)',
              border: !user ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(193, 147, 255, 0.3)',
              color: !user ? '#6b7280' : '#c193ff',
              padding: '0.55rem 1.1rem',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: !user ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: !user ? 'none' : '0 4px 15px rgba(193, 147, 255, 0.15)',
            }}
            onMouseEnter={(e) => {
              if (user) {
                e.currentTarget.style.background = '#c193ff';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (user) {
                e.currentTarget.style.background = 'rgba(193, 147, 255, 0.12)';
                e.currentTarget.style.color = '#c193ff';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {!user ? <Lock size={15} color="#6b7280" /> : <PieChartIcon size={17} />}
            <span>Market Share</span>
          </button>
        </div>
      </div>

      {/* Buscador de canciones */}
      <div className="song-search-container">
        <div className="song-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="song-search-input"
            placeholder="Buscar por canción, artista o disquera..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="song-search-clear"
              onClick={() => setSearchQuery('')}
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className="search-results-badge">
            {filteredSongs.length} {filteredSongs.length === 1 ? 'resultado' : 'resultados'}
          </div>
        )}
      </div>

      <div className="grid-base" style={{ gap: '0.5rem' }}>
        {filteredSongs.length === 0 ? (
          <div className="flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
              No se encontraron canciones que coincidan con "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 1.2rem',
                borderRadius: '20px',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          token ? (
            filteredSongs.map((song, index) => renderRow(song, index, false))
          ) : (
            <>
              {filteredSongs.slice(0, 5).map((song, index) => renderRow(song, index, false))}

              {filteredSongs.length > 5 && (
                <div style={{ position: 'relative', marginTop: '1rem' }} className="glass-panel">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
                    {filteredSongs.slice(5, 8).map((song, index) => renderRow(song, 5 + index, true))}
                  </div>

                  {/* Overlay CTA */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(15,17,26,0) 0%, rgba(15,17,26,0.6) 60%, rgba(15,17,26,0.9) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: 'inherit',
                    padding: '1.5rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #ff3366, #c193ff)',
                      padding: '0.8rem',
                      borderRadius: '50%',
                      marginBottom: '0.8rem',
                      boxShadow: '0 0 15px rgba(255, 51, 102, 0.4)'
                    }}>
                      <Lock size={22} color="white" />
                    </div>
                    <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.3rem', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      ¿Quieres ver más allá del Top 5?
                    </h2>
                    <p style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '1.2rem', textAlign: 'center', maxWidth: '350px' }}>
                      Accede a rankings completos y métricas avanzadas
                    </p>
                    <button
                      onClick={onLoginClick}
                      style={{
                        background: 'linear-gradient(135deg, #ff3366, #c193ff)',
                        border: 'none',
                        padding: '0.6rem 1.8rem',
                        borderRadius: '30px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(255, 51, 102, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 51, 102, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 51, 102, 0.3)';
                      }}
                    >
                      Ver ranking completo
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Disclaimer Note (Bottom) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '0.75rem',
        padding: '0.65rem 1rem',
        fontSize: '0.82rem',
        color: '#9ca3af',
        marginTop: '1.25rem',
      }}>
        <Info size={15} color="#c193ff" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: '#e5e7eb' }}>Nota:</strong> Los charts consideran únicamente canciones en español con una fecha de lanzamiento menor a un año.
        </span>
      </div>

      {/* Market Share Modal */}
      {isMarketShareOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '1rem',
        }} onClick={(e) => {
          if (e.target === e.currentTarget) setIsMarketShareOpen(false);
        }}>
          <div style={{
            maxWidth: '920px',
            width: '100%',
            maxHeight: '88vh',
            overflowY: 'auto',
            backgroundColor: '#12131c',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            position: 'relative',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <PieChartIcon size={24} color="#c193ff" />
                  Market Share por Disquera / Sello
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                  Porcentaje de participación de mercado y volumen de canciones en video digital.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Top Selector (default 300) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top:</label>
                  <select
                    value={marketShareTop}
                    onChange={(e) => setMarketShareTop(Number(e.target.value))}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.6rem',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value={20} style={{ background: '#12131c', color: 'white' }}>Top 20</option>
                    <option value={50} style={{ background: '#12131c', color: 'white' }}>Top 50</option>
                    <option value={100} style={{ background: '#12131c', color: 'white' }}>Top 100</option>
                    <option value={200} style={{ background: '#12131c', color: 'white' }}>Top 200</option>
                    <option value={300} style={{ background: '#12131c', color: 'white' }}>Top 300</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMarketShareOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#9ca3af',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            {marketShareLoading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#c193ff' }}>
                <Loader2 size={36} style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontWeight: 600 }}>Cargando datos de Market Share (Top {marketShareTop})...</p>
              </div>
            ) : marketShareError ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
                <p style={{ fontWeight: 700, marginBottom: '1rem' }}>{marketShareError}</p>
                <button
                  type="button"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => setMarketShareTop(marketShareTop)}
                >
                  Reintentar
                </button>
              </div>
            ) : marketShareData.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                No se encontraron datos de Market Share para los filtros seleccionados.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Left: Donut Chart */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e5e7eb', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Distribución de Mercado
                  </h3>
                  <MarketSharePieChart data={marketShareData} />
                </div>

                {/* Right: Legend Table with search */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '0.75rem',
                        padding: '0.65rem 1rem 0.65rem 2.5rem',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                      placeholder="Filtrar por disquera..."
                      value={marketShareSearch}
                      onChange={(e) => setMarketShareSearch(e.target.value)}
                    />
                  </div>

                  <div style={{
                    maxHeight: '380px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    paddingRight: '0.3rem'
                  }}>
                    {filteredMarketShareList.map((item, idx) => {
                      const color = pieSliceColors[idx % pieSliceColors.length];
                      return (
                        <div
                          key={item.label || idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '0.75rem',
                            padding: '0.65rem 0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', paddingRight: '0.5rem' }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{item.songs} {item.songs === 1 ? 'canción' : 'canciones'}</span>
                              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#c193ff' }}>{item.market_share_percent}%</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, item.market_share_percent)}%`, height: '100%', background: color, borderRadius: '2px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SongChart;

const ChartRowSkeleton = () => (
  <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', height: '72px', position: 'relative', overflow: 'hidden' }}>
    <div className="shimmer-effect" />
    <div className="skeleton-block" style={{ width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0 }} />
    <div className="skeleton-block" style={{ width: '48px', height: '48px', borderRadius: '8px', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div className="skeleton-block" style={{ height: '14px', width: '45%' }} />
      <div className="skeleton-block" style={{ height: '10px', width: '28%' }} />
    </div>
    <div className="skeleton-block" style={{ width: '120px', height: '30px', flexShrink: 0 }} />
    <div className="skeleton-block" style={{ width: '42px', height: '42px', flexShrink: 0 }} />
  </div>
);
