/**
 * exportChart.js
 * Utility for exporting Digital Latino chart data to styled .xlsx and .pdf
 */

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  bgPrimary:   '0C0D1A',
  bgSecondary: '12131C',
  bgCard:      '1C1E2D',
  bgRow:       '181926',
  accentPurple:'C193FF',
  accentBlue:  '8A88FF',
  textMain:    'FFFFFF',
  textMuted:   'A0A5B9',
  textDim:     '6B7280',
  gold:        'FFB700',
  silver:      'C0C0C0',
  bronze:      'CD7F32',
};

// ─── Shared Helpers ───────────────────────────────────────────────────────────
const getLogoBase64 = async () => {
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror  = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const fmtStreams = (song) =>
  song.spotify_streams
    ? Number(song.spotify_streams).toLocaleString('es-MX')
    : song.spotify_streams_total
    ? Number(song.spotify_streams_total).toLocaleString('es-MX')
    : '0';

const fmtScore = (song) =>
  song.score != null ? String(song.score)
  : song.spotify_score != null ? String(song.spotify_score)
  : '-';

const truncate = (str = '', max) =>
  str.length > max ? str.substring(0, max - 2) + '\u2026' : str;

// ─── XLSX Export (ExcelJS) ────────────────────────────────────────────────────
export const exportToXLSX = async (songs = [], filters = {}) => {
  if (!songs || songs.length === 0) return;

  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Digital Latino';

  const ws = workbook.addWorksheet('Chart Digital Latino', {
    views: [{ state: 'frozen', ySplit: 6 }],
    properties: { tabColor: { argb: 'FF' + C.accentPurple } },
  });
  ws.pageSetup.orientation = 'landscape';
  ws.pageSetup.fitToPage  = true;
  ws.pageSetup.fitToWidth = 1;

  ws.columns = [
    { key: 'rk',      width: 6  },
    { key: 'song',    width: 42 },
    { key: 'artists', width: 30 },
    { key: 'label',   width: 28 },
    { key: 'streams', width: 20 },
    { key: 'score',   width: 12 },
    { key: 'rk_lw',  width: 14 },
  ];

  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });



  const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + argb } });
  const font = (argb, size = 9, bold = false) => ({ name: 'Calibri', size, bold, color: { argb: 'FF' + argb } });

  const addMetaRow = (value, fgColor, bgColor, bold = false, size = 9, height = 20) => {
    const row = ws.addRow(['', value, '', '', '', '', '']);
    row.height = height;
    ws.mergeCells(`B${row.number}:G${row.number}`);
    const cell = ws.getCell(`B${row.number}`);
    cell.value     = value;
    cell.font      = font(fgColor, size, bold);
    cell.fill      = fill(bgColor);
    cell.alignment = { vertical: 'middle', wrapText: false };
    ws.getCell(`A${row.number}`).fill = fill(bgColor);
  };

  // Row 1 — Title (leaves space for logo in col A)
  addMetaRow('DIGITAL LATINO \u2014 REPORTE OFICIAL DE CHART', C.accentPurple, C.bgSecondary, true, 16, 70);
  ws.getCell('B1').alignment = { vertical: 'bottom', wrapText: false };
  // Row 2 — Date
  addMetaRow(`Fecha de exportaci\u00f3n: ${dateStr}`, C.textMuted, C.bgSecondary, false, 10, 18);
  // Row 3 — Filter label
  addMetaRow('FILTROS SELECCIONADOS', C.accentPurple, C.bgCard, true, 9, 16);
  // Row 4 — Filter values
  const filterText = [
    `Pa\u00eds: ${filters.country  || 'Global'}`,
    `G\u00e9nero: ${filters.genre  || 'Todos los g\u00e9neros'}`,
    `Ciudad: ${filters.city        || 'Todas las ciudades'}`,
    `CRG: ${filters.crg            || 'General'}`,
    `Total canciones: ${songs.length}`,
  ].join('   |   ');
  addMetaRow(filterText, C.textMain, C.bgCard, false, 9, 20);

  // Row 5 — Spacer
  const spacer = ws.addRow(['']);
  spacer.height = 8;
  for (let col = 1; col <= 7; col++) ws.getCell(spacer.number, col).fill = fill(C.bgPrimary);

  // Row 6 — Column headers
  const hdrs = ['#', 'Canci\u00f3n', 'Artista', 'Sello / Disquera', 'Reproducciones', 'Score', 'Pos. Anterior'];
  const hdrRow = ws.addRow(hdrs);
  hdrRow.height = 22;
  hdrRow.eachCell((cell) => {
    cell.font      = font(C.textMain, 9, true);
    cell.fill      = fill(C.accentBlue);
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border    = { bottom: { style: 'thin', color: { argb: 'FF' + C.accentPurple } } };
  });

  // Data rows
  songs.forEach((song, idx) => {
    const rk   = song.rk ?? song.posicion ?? (idx + 1);
    const rkLw = song.rk_lw ?? song.posicion_anterior ?? '-';
    const bgHex = idx % 2 === 0 ? C.bgRow : C.bgCard;

    const row = ws.addRow([rk, song.song || '', song.artists || '', song.label || '', fmtStreams(song), fmtScore(song), rkLw]);
    row.height = 16;

    const rkColor = rk === 1 ? C.gold : rk === 2 ? C.silver : rk === 3 ? C.bronze : C.textMain;
    row.getCell(1).font      = font(rkColor, 9, true);
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'right',  vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

    row.eachCell((cell, colNum) => {
      cell.fill = fill(bgHex);
      cell.alignment = { ...(cell.alignment || {}), vertical: 'middle' };
      if (colNum > 1) cell.font = font(C.textMain, 9);
    });
  });

  // Footer
  const footerNum = 6 + songs.length + 1;
  const footerRow = ws.addRow(['', `Generado por Digital Latino \u2022 digital-latino.com \u2022 ${dateStr}`, '', '', '', '', '']);
  footerRow.height = 18;
  ws.mergeCells(`B${footerNum}:G${footerNum}`);
  const footerCell = ws.getCell(`B${footerNum}`);
  footerCell.value     = `Generado por Digital Latino \u2022 digital-latino.com \u2022 ${dateStr}`;
  footerCell.font      = font(C.textDim, 8);
  footerCell.fill      = fill(C.bgPrimary);
  footerCell.alignment = { vertical: 'middle' };
  ws.getCell(`A${footerNum}`).fill = fill(C.bgPrimary);

  // Logo
  try {
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      const imgId = workbook.addImage({ base64: logoBase64.split(',')[1], extension: 'png' });
      ws.addImage(imgId, { tl: { col: 0, row: 0 }, ext: { width: 180, height: 52 }, editAs: 'oneCell' });
    }
  } catch { /* logo optional */ }

  // Download
  const buf  = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `Chart_DigitalLatino_${new Date().toISOString().slice(0, 10)}.xlsx`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── PDF Export (jsPDF) ───────────────────────────────────────────────────────
export const exportToPDF = async (songs = [], filters = {}) => {
  if (!songs || songs.length === 0) return;
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const pw  = doc.internal.pageSize.getWidth();
    const ph  = doc.internal.pageSize.getHeight();

    const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const hex = (h) => [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];

    // Logo is fetched once
    const logoBase64 = await getLogoBase64();

    const drawBg = () => {
      doc.setFillColor(...hex(C.bgPrimary));
      doc.rect(0, 0, pw, ph, 'F');
    };

    const drawHeader = () => {
      doc.setFillColor(...hex(C.bgSecondary));
      doc.rect(0, 0, pw, 68, 'F');

      if (logoBase64) {
        try { doc.addImage(logoBase64, 'PNG', 28, 12, 110, 40); }
        catch { drawLogoText(); }
      } else { drawLogoText(); }

      function drawLogoText() {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...hex(C.accentPurple));
        doc.text('DIGITAL LATINO', 28, 44);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...hex(C.textMain));
      doc.text('Reporte Oficial de Chart', pw - 28, 32, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...hex(C.textMuted));
      doc.text(`Fecha: ${dateStr}`, pw - 28, 48, { align: 'right' });
    };

    const drawFilterBar = (y) => {
      doc.setFillColor(...hex(C.bgCard));
      doc.roundedRect(28, y, pw - 56, 34, 5, 5, 'F');
      doc.setFillColor(...hex(C.accentBlue));
      doc.rect(28, y, 4, 34, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...hex(C.accentPurple));
      doc.text('FILTROS SELECCIONADOS:', 40, y + 13);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hex(C.textMain));
      const ft = [
        `Pa\u00eds: ${filters.country  || 'Global'}`,
        `G\u00e9nero: ${filters.genre  || 'Todos'}`,
        `Ciudad: ${filters.city        || 'Todas'}`,
        `CRG: ${filters.crg            || 'General'}`,
        `Total: ${songs.length} canciones`,
      ].join('   \u00b7   ');
      doc.text(ft, 40, y + 26);
      return y + 34 + 12;
    };

    // Col positions (landscape A4 = 841.89pt wide)
    const COLS = [28, 66, 250, 418, 566, 702];
    const HDRS = ['#', 'Canci\u00f3n', 'Artista', 'Sello / Disquera', 'Reproducciones', 'Score'];

    const drawTableHeader = (y) => {
      doc.setFillColor(...hex(C.accentBlue));
      doc.rect(28, y - 11, pw - 56, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...hex(C.textMain));
      COLS.forEach((x, i) => doc.text(HDRS[i], x, y + 2));
      return y + 18;
    };

    const drawFooter = () => {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setDrawColor(...hex(C.accentBlue));
      doc.setLineWidth(0.5);
      doc.line(28, ph - 22, pw - 28, ph - 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...hex(C.textDim));
      doc.text('Digital Latino  \u2022  digital-latino.com', 28, ph - 10);
      doc.text(`P\u00e1gina ${pg}`, pw - 28, ph - 10, { align: 'right' });
    };

    // ── Render page 1 ──
    drawBg();
    drawHeader();
    let y = drawFilterBar(76);
    y = drawTableHeader(y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    songs.forEach((song, idx) => {
      if (y > ph - 40) {
        drawFooter();
        doc.addPage();
        drawBg();
        y = 28;
        y = drawTableHeader(y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
      }

      const rk = song.rk ?? song.posicion ?? (idx + 1);
      const bg = idx % 2 === 0 ? C.bgRow : C.bgCard;
      doc.setFillColor(...hex(bg));
      doc.rect(28, y - 10, pw - 56, 15, 'F');

      const rkColor = rk === 1 ? C.gold : rk === 2 ? C.silver : rk === 3 ? C.bronze : C.textMain;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hex(rkColor));
      doc.text(String(rk), COLS[0], y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...hex(C.textMain));
      doc.text(truncate(song.song    || '', 36), COLS[1], y);
      doc.text(truncate(song.artists || '', 26), COLS[2], y);
      doc.text(truncate(song.label   || '', 22), COLS[3], y);

      doc.setTextColor(...hex(C.textMuted));
      doc.text(fmtStreams(song), COLS[4] + 118, y, { align: 'right' });
      doc.text(fmtScore(song),  COLS[5] + 50,  y, { align: 'right' });

      y += 15;
    });

    drawFooter();
    doc.save(`Chart_DigitalLatino_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('Error generating PDF:', err);
  }
};
