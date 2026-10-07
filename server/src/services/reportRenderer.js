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

function renderPdf({ title, columns, rows }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown();

    const colWidth = (doc.page.width - 60) / columns.length;
    const startX = doc.x;
    let y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(String(col), startX + i * colWidth, y, { width: colWidth, ellipsis: true });
    });
    y += 18;
    doc.font('Helvetica');

    for (const row of rows) {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = doc.y;
      }
      row.forEach((cell, i) => {
        doc.text(cell === null || cell === undefined ? '' : String(cell), startX + i * colWidth, y, {
          width: colWidth,
          ellipsis: true,
        });
      });
      y += 16;
    }

    doc.end();
  });
}

module.exports = { renderExcel, renderPdf };
