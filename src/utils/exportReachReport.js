/**
 * exportReachReport.js
 * Generates a PDF report for the "Alcance de {SongName}" tab.
 * Strategy: Option A — iterate programmatically over platform keys,
 * capture each rendered DOM panel with html-to-image, assemble in jsPDF.
 * Format: US Letter (8.5 x 11 in = 612 x 792 pt)
 */
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// ─── Brand & Print palette ───────────────────────────────────────────────────
const C = {
  bgCard:       '#1C1E2D',   // Fondo oscuro original para captureEl
  bgPage:       '#FFFFFF',   // Fondo de hoja de impresión
  bgSection:    '#F3F4F6',   // Banda de encabezado de sección
  accentPurple: '#7C3AED',
  accentBlue:   '#3B5BDB',
  textMain:     '#111827',   // Texto principal oscuro
  textMuted:    '#4B5563',   // Texto secundario gris medio
  textDim:      '#9CA3AF',
  border:       '#D1D5DB',
};

const h2r = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// ─── Capture a DOM ref as PNG data URL ────────────────────────────────────────
const captureEl = async (ref) => {
  const el = ref?.current;
  if (!el) return null;
  try {
    return await Promise.race([
      toPng(el, {
        pixelRatio: 2,
        backgroundColor: C.bgCard,
        fontEmbedCSS: '',
        style: { transform: 'none', borderRadius: '12px' },
      }),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error('Capture timeout')), 10000),
      ),
    ]);
  } catch (err) {
    console.error('exportReachReport: capture failed', err);
    return null;
  }
};

// ─── Fetch logo as base64 ─────────────────────────────────────────────────────
const fetchLogoBase64 = async () => {
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// ─── Draw footer ──────────────────────────────────────────────────────────────
const drawFooter = (pdf, pw, ph, MARGIN) => {
  const pg = pdf.internal.getCurrentPageInfo().pageNumber;
  pdf.setDrawColor(...h2r(C.border));
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, ph - 24, pw - MARGIN, ph - 24);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...h2r(C.textDim));
  pdf.text('Digital Latino  \u2022  digital-latino.com', MARGIN, ph - 12);
  pdf.text(`P\u00e1gina ${pg}`, pw - MARGIN, ph - 12, { align: 'right' });
};

// ─── Draw section title bar ───────────────────────────────────────────────────
const drawSectionTitle = (pdf, pw, ph, title, subtitle, accentColor, yOffset = 0, MARGIN, USABLE_W) => {
  const BAND_H = 44;
  
  // Fondo claro de la banda
  pdf.setFillColor(...h2r(C.bgSection));
  pdf.rect(MARGIN, yOffset, USABLE_W, BAND_H, 'F');
  
  // Franja de acento izquierda
  pdf.setFillColor(...h2r(accentColor || C.accentBlue));
  pdf.rect(MARGIN, yOffset, 3, BAND_H, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...h2r(C.textMain));
  pdf.text(title, MARGIN + 10, yOffset + 18);

  if (subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...h2r(C.textMuted));
    pdf.text(subtitle, MARGIN + 10, yOffset + 32);
  }
};

// ─── MAIN EXPORT FUNCTION ─────────────────────────────────────────────────────
/**
 * @param {Object} opts
 * @param {string} opts.songName
 * @param {string} opts.artistName
 * @param {Object|null} opts.songPlatformData
 * @param {Array} opts.songHistoricalData
 * @param {Array} opts.topSongsData
 * @param {Array} opts.platforms  — SONG_PLATFORMS constant from ArtistDetailsModal
 * @param {string} opts.currentPlatformKey — selectedPlatformKey at call time
 * @param {Function} opts.setSelectedPlatformKey
 * @param {React.RefObject} opts.platformPanelRef
 * @param {React.RefObject} opts.historicalChartRef
 * @param {React.RefObject} opts.topSongsRef
 */
export const exportReachReport = async ({
  songName,
  artistName,
  songPlatformData,
  songHistoricalData,
  topSongsData,
  platforms,
  currentPlatformKey,
  setSelectedPlatformKey,
  platformPanelRef,
  historicalChartRef,
  topSongsRef,
  onProgress,
}) => {
  // Letter: 612 x 792 pt
  const pw = 612;
  const ph = 792;
  const MARGIN = 36;
  const USABLE_W = pw - MARGIN * 2;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const logoBase64 = await fetchLogoBase64();

  // Determine which platforms have real data
  const activePlatforms = platforms.filter((p) => {
    if (!songPlatformData) return false;
    return p.fields.some((f) => {
      const v = songPlatformData[f.key];
      return v !== null && v !== undefined && Number(v) > 0;
    });
  });

  // ── Pages: Content ────────────────────────────────────────────────────────
  let isFirstContentPage = true;
  let currentY = 0;
  const marginBottom = 50;

  const startNewPage = () => {
    if (!isFirstContentPage) {
      pdf.addPage('letter', 'portrait');
    }
    isFirstContentPage = false;
    pdf.setFillColor(...h2r(C.bgPage));
    pdf.rect(0, 0, pw, ph, 'F');
    drawFooter(pdf, pw, ph, MARGIN);
    currentY = MARGIN; // Start from margin
  };

  const getImgDimensions = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: pw * 2, height: 200 * 2 }); // fallback
      img.src = dataUrl;
    });
  };

  startNewPage();

  // ── Draw Main Header on First Page ────────────────────────────────────────
  if (logoBase64) {
    try { 
      const { width: logoNW, height: logoNH } = await getImgDimensions(logoBase64);
      const logoTargetH = 40;
      const logoAspect = logoNW / logoNH;
      const logoW = logoTargetH * logoAspect;
      
      // Tira oscura estilo componente para el logo
      const padX = 16;
      const padY = 8;
      pdf.setFillColor(...h2r(C.bgCard));
      pdf.roundedRect(MARGIN, currentY, logoW + padX * 2, logoTargetH + padY * 2, 8, 8, 'F');
      
      pdf.addImage(logoBase64, 'PNG', MARGIN + padX, currentY + padY, logoW, logoTargetH); 
    } catch {}
  }
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...h2r(C.textMuted));
  pdf.text(`Fecha: ${dateStr}`, pw - MARGIN, currentY + 15, { align: 'right' });

  currentY += 95; // Espacio ajustado para asegurar un gap limpio debajo de la tira del logo

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(...h2r(C.textMain));
  pdf.text(`Alcance de ${songName}`, MARGIN, currentY);

  currentY += 22;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(...h2r(C.textMuted));
  pdf.text('Estadísticas por Plataformas', MARGIN, currentY);

  currentY += 35; // Space before the first platform block


  for (const platform of activePlatforms) {
    if (onProgress) onProgress(platform.name, platform.accentColor || '#FFFFFF');
    // Switch to this platform and wait for React to re-render
    setSelectedPlatformKey(platform.key);
    await new Promise((r) => setTimeout(r, 200));

    const dataUrl = await captureEl(platformPanelRef);
    if (dataUrl) {
      const { width: natW, height: natH } = await getImgDimensions(dataUrl);
      const scale = USABLE_W / (natW / 2); // since we used pixelRatio: 2
      const imgH = (natH / 2) * scale;
      const BAND_H = 44;
      const blockHeight = BAND_H + imgH + 12;

      if (currentY + blockHeight > ph - marginBottom && currentY > MARGIN + BAND_H) {
        startNewPage();
      }

      drawSectionTitle(pdf, pw, ph, platform.name, 'Métricas de la canción', platform.accentColor, currentY, MARGIN, USABLE_W);
      pdf.addImage(dataUrl, 'PNG', MARGIN, currentY + BAND_H, USABLE_W, imgH);
      currentY += blockHeight + 8;
    }

    // After Spotify metrics, also capture the historical chart
    if (platform.key === 'spotify' && songHistoricalData?.length > 0) {
      if (onProgress) onProgress('Rendimiento en Spotify', '#1DB954');
      await new Promise((r) => setTimeout(r, 100));
      const chartUrl = await captureEl(historicalChartRef);
      if (chartUrl) {
        const { width: natW, height: natH } = await getImgDimensions(chartUrl);
        const scale = USABLE_W / (natW / 2);
        const imgH = (natH / 2) * scale;
        const BAND_H = 44;
        const blockHeight = BAND_H + imgH + 12;

        if (currentY + blockHeight > ph - marginBottom && currentY > MARGIN + BAND_H) {
          startNewPage();
        }

        drawSectionTitle(pdf, pw, ph, 'Rendimiento en Spotify', `${songHistoricalData.length} semanas de historial de streams`, '#1DB954', currentY, MARGIN, USABLE_W);
        pdf.addImage(chartUrl, 'PNG', MARGIN, currentY + BAND_H, USABLE_W, imgH);
        currentY += blockHeight + 8;
      }
    }
  }

  // ── Last Block: Top 5 canciones ──────────────────────────────────────────
  if (topSongsData?.length > 0) {
    if (onProgress) onProgress('Top 5 Canciones', '#FFB700');
    const top5Url = await captureEl(topSongsRef);
    if (top5Url) {
      const { width: natW, height: natH } = await getImgDimensions(top5Url);
      const scale = USABLE_W / (natW / 2);
      const imgH = (natH / 2) * scale;
      const BAND_H = 44;
      const blockHeight = BAND_H + imgH + 12;

      if (currentY + blockHeight > ph - marginBottom && currentY > MARGIN + BAND_H) {
        startNewPage();
      }

      drawSectionTitle(pdf, pw, ph, 'Top 5 Canciones', `Mejores canciones de ${artistName}`, '#FFB700', currentY, MARGIN, USABLE_W);
      pdf.addImage(top5Url, 'PNG', MARGIN, currentY + BAND_H, USABLE_W, imgH);
      currentY += blockHeight + 8;
    }
  }

  // Restore original platform key
  setSelectedPlatformKey(currentPlatformKey);

  const safeName = (songName || 'cancion')
    .replace(/[<>:"/\\|?*]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);
  pdf.save(`Alcance_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
