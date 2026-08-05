/**
 * exportReachReport.js
 * Generates a PDF report for the "Alcance de {SongName}" tab.
 * Strategy: Option A — iterate programmatically over platform keys,
 * capture each rendered DOM panel with html-to-image, assemble in jsPDF.
 * Format: US Letter (8.5 x 11 in = 612 x 792 pt)
 */
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// ─── Brand palette ─────────────────────────────────────────────────────────────
const C = {
  bgPrimary:    '#0C0D1A',
  bgSecondary:  '#12131C',
  bgCard:       '#1C1E2D',
  accentPurple: '#C193FF',
  accentBlue:   '#8A88FF',
  textMain:     '#FFFFFF',
  textMuted:    '#A0A5B9',
  textDim:      '#6B7280',
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
const drawFooter = (pdf, pw, ph) => {
  const pg = pdf.internal.getCurrentPageInfo().pageNumber;
  pdf.setDrawColor(...h2r(C.accentBlue));
  pdf.setLineWidth(0.5);
  pdf.line(28, ph - 22, pw - 28, ph - 22);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...h2r(C.textDim));
  pdf.text('Digital Latino  \u2022  digital-latino.com', 28, ph - 10);
  pdf.text(`P\u00e1gina ${pg}`, pw - 28, ph - 10, { align: 'right' });
};

// ─── Draw section title bar ───────────────────────────────────────────────────
const drawSectionTitle = (pdf, pw, ph, title, subtitle, accentColor, yOffset = 0) => {
  // Full-width dark header band
  pdf.setFillColor(...h2r(C.bgSecondary));
  pdf.rect(0, yOffset, pw, 56, 'F');
  // Accent left strip
  pdf.setFillColor(...h2r(accentColor || C.accentBlue));
  pdf.rect(0, yOffset, 4, 56, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...h2r(C.textMain));
  pdf.text(title, 20, yOffset + 28);

  if (subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...h2r(C.textMuted));
    pdf.text(subtitle, 20, yOffset + 44);
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
  const marginBottom = 40;

  const startNewPage = () => {
    if (!isFirstContentPage) {
      pdf.addPage('letter', 'portrait');
    }
    isFirstContentPage = false;
    pdf.setFillColor(...h2r(C.bgPrimary));
    pdf.rect(0, 0, pw, ph, 'F');
    drawFooter(pdf, pw, ph);
    currentY = 20; // Start slightly lower than 0 to have a top margin
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
    try { pdf.addImage(logoBase64, 'PNG', 20, currentY, 100, 38); } catch {}
  }
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...h2r(C.textMuted));
  pdf.text(`Fecha: ${dateStr}`, pw - 20, currentY + 15, { align: 'right' });

  currentY += 85;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(...h2r(C.textMain));
  pdf.text(`Alcance de ${songName}`, 20, currentY);

  currentY += 22;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(...h2r(C.textMuted));
  pdf.text('Estadísticas por Plataformas', 20, currentY);

  currentY += 35; // Space before the first platform block


  for (const platform of activePlatforms) {
    if (onProgress) onProgress(platform.name, platform.accentColor || '#FFFFFF');
    // Switch to this platform and wait for React to re-render
    setSelectedPlatformKey(platform.key);
    await new Promise((r) => setTimeout(r, 200));

    const dataUrl = await captureEl(platformPanelRef);
    if (dataUrl) {
      const { width: natW, height: natH } = await getImgDimensions(dataUrl);
      const scale = pw / (natW / 2); // since we used pixelRatio: 2
      const imgH = (natH / 2) * scale;
      const blockHeight = 56 + imgH + 20; // 56 for title, 20 padding

      if (currentY + blockHeight > ph - marginBottom && currentY > 50) {
        startNewPage();
      }

      drawSectionTitle(pdf, pw, ph, platform.name, 'Métricas de la canción', platform.accentColor, currentY);
      pdf.addImage(dataUrl, 'PNG', 0, currentY + 56, pw, imgH);
      currentY += blockHeight;
    }

    // After Spotify metrics, also capture the historical chart
    if (platform.key === 'spotify' && songHistoricalData?.length > 0) {
      if (onProgress) onProgress('Rendimiento en Spotify', '#1DB954');
      await new Promise((r) => setTimeout(r, 100));
      const chartUrl = await captureEl(historicalChartRef);
      if (chartUrl) {
        const { width: natW, height: natH } = await getImgDimensions(chartUrl);
        const scale = pw / (natW / 2);
        const imgH = (natH / 2) * scale;
        const blockHeight = 56 + imgH + 20;

        if (currentY + blockHeight > ph - marginBottom && currentY > 50) {
          startNewPage();
        }

        drawSectionTitle(pdf, pw, ph, 'Rendimiento en Spotify', `${songHistoricalData.length} semanas de historial de streams`, '#1DB954', currentY);
        pdf.addImage(chartUrl, 'PNG', 0, currentY + 56, pw, imgH);
        currentY += blockHeight;
      }
    }
  }

  // ── Last Block: Top 5 canciones ──────────────────────────────────────────
  if (topSongsData?.length > 0) {
    if (onProgress) onProgress('Top 5 Canciones', '#FFB700');
    const top5Url = await captureEl(topSongsRef);
    if (top5Url) {
      const { width: natW, height: natH } = await getImgDimensions(top5Url);
      const scale = pw / (natW / 2);
      const imgH = (natH / 2) * scale;
      const blockHeight = 56 + imgH + 20;

      if (currentY + blockHeight > ph - marginBottom && currentY > 50) {
        startNewPage();
      }

      drawSectionTitle(pdf, pw, ph, 'Top 5 Canciones', `Mejores canciones de ${artistName}`, '#FFB700', currentY);
      pdf.addImage(top5Url, 'PNG', 0, currentY + 56, pw, imgH);
      currentY += blockHeight;
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
