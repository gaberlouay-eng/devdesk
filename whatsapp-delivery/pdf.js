'use strict';

const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake');

const FONT_DIR = path.join(__dirname, 'fonts');
const FONTS = {
  Alef: {
    normal: path.join(FONT_DIR, 'Alef-Regular.ttf'),
    bold: path.join(FONT_DIR, 'Alef-Bold.ttf'),
    italics: path.join(FONT_DIR, 'Alef-Regular.ttf'),
    bolditalics: path.join(FONT_DIR, 'Alef-Bold.ttf'),
  },
};

// pdfmake/pdfkit has no Unicode bidi support: it draws text left-to-right in
// source order, and (confirmed by extracting glyph positions from generated
// PDFs) its internal word-wrap tokenizer will sometimes silently reorder
// adjacent "words" of a single string in unpredictable ways. To get correct
// RTL layout reliably, a base-RTL line is split into typed-order tokens
// (Hebrew run / whitespace / other), each Hebrew token is mirrored
// character-by-character, and the tokens are handed to pdfmake as separate
// inline text runs (not rejoined into one string) in reverse order - this
// bypasses pdfkit's own tokenizer entirely, since each run is drawn as its
// own isolated text-showing operation.
function charType(ch) {
  if (/\s/.test(ch)) return 'space';
  const code = ch.codePointAt(0);
  if (code >= 0x0590 && code <= 0x05ff) return 'hebrew';
  return 'other';
}

function toVisualRTLRuns(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (!str) return [{ text: '' }];

  const tokens = [];
  let current = '';
  let currentType = null;

  for (const ch of str) {
    const type = charType(ch);
    if (currentType === null || type === currentType) {
      current += ch;
    } else {
      tokens.push({ text: current, type: currentType });
      current = ch;
    }
    currentType = type;
  }
  if (current) tokens.push({ text: current, type: currentType });

  return tokens
    .map((token) => ({
      text: token.type === 'hebrew' ? [...token.text].reverse().join('') : token.text,
    }))
    .reverse();
}

function fieldLine(label, value) {
  const displayValue = value === null || value === undefined || value === '' ? '—' : value;
  return toVisualRTLRuns(`${label}: ${displayValue}`);
}

function boxLayout() {
  return {
    hLineWidth: () => 1,
    vLineWidth: () => 1,
    hLineColor: () => '#999999',
    vLineColor: () => '#999999',
  };
}

function buildDocDefinition(record) {
  const docNumberText = record.doc_number ? String(record.doc_number).padStart(4, '0') : '—';

  return {
    defaultStyle: { font: 'Alef', alignment: 'right', fontSize: 12 },
    pageMargins: [40, 50, 40, 50],
    content: [
      {
        columns: [
          { text: toVisualRTLRuns('שם העסק שלך'), style: 'companyName', width: '*' },
          {
            table: { widths: [90], body: [[{ text: 'לוגו', alignment: 'center', margin: [0, 15, 0, 15] }]] },
            layout: boxLayout(),
          },
        ],
        columnGap: 10,
      },
      { text: toVisualRTLRuns('תעודת משלוח'), style: 'docTitle', margin: [0, 15, 0, 15] },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#999999' }],
        margin: [0, 0, 0, 15],
      },
      { text: fieldLine('מספר תעודה', docNumberText), style: 'fieldLine', bold: true },
      { text: fieldLine('תאריך', record.date), style: 'fieldLine' },
      { text: fieldLine('לקוח', record.customer_name), style: 'fieldLine' },
      { text: fieldLine('חומר', record.material), style: 'fieldLine' },
      { text: fieldLine('כמות', record.quantity), style: 'fieldLine' },
      { text: fieldLine('יעד', record.destination), style: 'fieldLine' },
      { text: fieldLine('הערות', record.notes), style: 'fieldLine', margin: [0, 0, 0, 20] },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }],
        margin: [0, 20, 0, 10],
      },
      {
        text: toVisualRTLRuns(`נוצר בתאריך ${new Date().toLocaleDateString('he-IL')}`),
        style: 'footer',
      },
    ],
    styles: {
      companyName: { fontSize: 14, bold: true },
      docTitle: { fontSize: 20, bold: true },
      fieldLine: { fontSize: 12, margin: [0, 4, 0, 4] },
      footer: { fontSize: 9, color: '#666666' },
    },
  };
}

async function generateDeliveryPdf(record, outputPath) {
  pdfMake.setFonts(FONTS);
  pdfMake.setUrlAccessPolicy(() => false);
  pdfMake.setLocalAccessPolicy(() => true);
  const docDefinition = buildDocDefinition(record);
  const doc = pdfMake.createPdf(docDefinition);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await doc.write(outputPath);
  return outputPath;
}

module.exports = { generateDeliveryPdf, buildDocDefinition, toVisualRTLRuns };
