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
// clamped so one very long value can't starve the rest of the table.
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
  return lengths.map((w) => (w / totalWeight) * totalWidth);
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

    function drawHeader(y) {
      doc.rect(startX, y, usableWidth, rowHeight).fill('#1F3C88');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
      columns.forEach((col, i) => {
        doc.text(String(col), colX[i] + cellPadding, y + 6, {
          width: colWidths[i] - cellPadding * 2,
          lineBreak: false,
          ellipsis: true,
        });
      });
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
        doc.text(cell === null || cell === undefined ? '' : String(cell), colX[i] + cellPadding, y + 6, {
          width: colWidths[i] - cellPadding * 2,
          lineBreak: false,
          ellipsis: true,
        });
      });
      y += rowHeight;
    });

    doc.end();
  });
}

module.exports = { renderExcel, renderPdf };
