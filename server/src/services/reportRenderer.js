const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

async function renderExcel({ title, columns, rows }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title.slice(0, 31));

  sheet.addRow(columns).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));
  sheet.columns.forEach((col) => {
    col.width = 18;
  });

  return workbook.xlsx.writeBuffer();
}

// Proportions each column by the longest value it actually holds (header included),
// clamped so one very long value can't starve the rest of the table. A hard floor
// (MIN_COL_WIDTH) keeps short columns (e.g. "Year") from being squeezed so thin that
// pdfkit's single-line ellipsis truncation has no room to work and visibly breaks.
const MIN_COL_WIDTH = 40;

function computeColumnWidths(columns, rows, totalWidth) {
  const lengths = columns.map((col, i) => {
    let max = String(col).length;
    for (const row of rows) {
      const cell = row[i];
      const len = cell === null || cell === undefined ? 0 : String(cell).length;
      if (len > max) max = len;
    }
    return Math.min(Math.max(max, 4), 28);
  });
  const totalWeight = lengths.reduce((a, b) => a + b, 0);
  const raw = lengths.map((w) => (w / totalWeight) * totalWidth);

  const totalDeficit = raw.reduce((sum, w) => sum + Math.max(0, MIN_COL_WIDTH - w), 0);
  if (totalDeficit === 0) return raw;

  const surplusPool = raw.reduce((sum, w) => sum + Math.max(0, w - MIN_COL_WIDTH), 0);
  return raw.map((w) => {
    if (w < MIN_COL_WIDTH) return MIN_COL_WIDTH;
    const surplus = w - MIN_COL_WIDTH;
    const share = surplusPool > 0 ? (surplus / surplusPool) * totalDeficit : 0;
    return w - share;
  });
}

// pdfkit's own width+ellipsis+lineBreak:false combo can still wrap a character onto a
// second line when the box is only a few points too narrow (observed directly by
// inspecting generated PDFs). Truncating the string ourselves before calling .text()
// — with no width/ellipsis option at all — removes any ambiguity: what we hand pdfkit
// already fits, so there is nothing left for it to wrap.
function truncateToWidth(doc, text, maxWidth) {
  if (maxWidth <= 0) return '';
  if (doc.widthOfString(text) <= maxWidth) return text;

  const ellipsis = '…';
  if (doc.widthOfString(ellipsis) > maxWidth) return '';

  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = text.slice(0, mid) + ellipsis;
    if (doc.widthOfString(candidate) <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo > 0 ? text.slice(0, lo) + ellipsis : ellipsis;
}

function renderPdf({ title, columns, rows }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();

    const startX = doc.page.margins.left;
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidths = computeColumnWidths(columns, rows, usableWidth);
    const colX = [];
    let acc = startX;
    for (const w of colWidths) {
      colX.push(acc);
      acc += w;
    }

    const rowHeight = 20;
    const cellPadding = 4;

    function drawCell(text, i, y) {
      const maxWidth = colWidths[i] - cellPadding * 2;
      doc.text(truncateToWidth(doc, text, maxWidth), colX[i] + cellPadding, y + 6, { lineBreak: false });
    }

    function drawHeader(y) {
      doc.rect(startX, y, usableWidth, rowHeight).fill('#1F3C88');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
      columns.forEach((col, i) => drawCell(String(col), i, y));
      doc.fillColor('#000000');
    }

    let y = doc.y;
    drawHeader(y);
    y += rowHeight;
    doc.font('Helvetica').fontSize(8);

    rows.forEach((row, rowIndex) => {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        drawHeader(y);
        y += rowHeight;
        doc.font('Helvetica').fontSize(8);
      }

      if (rowIndex % 2 === 1) {
        doc.rect(startX, y, usableWidth, rowHeight).fill('#F4F5F9');
        doc.fillColor('#000000');
      }

      row.forEach((cell, i) => {
        drawCell(cell === null || cell === undefined ? '' : String(cell), i, y);
      });
      y += rowHeight;
    });

    doc.end();
  });
}

module.exports = { renderExcel, renderPdf };
