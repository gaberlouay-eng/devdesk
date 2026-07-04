'use strict';

// בדיקת שלב 2 מקצה לקצה: חילוץ שדות -> שמירה כטיוטה ב-SQLite -> אישור
// (קבלת מספר תעודה רץ). יצירת PDF הוצאה משלב זה בינתיים (ראו README).
// משתמש בדוגמה הראשונה מ-samples.js.

const { extractDeliveryInfo } = require('./extractor');
const db = require('./db');
const samples = require('./samples');

async function main() {
  const sample = samples[0];
  console.log('טקסט מקור:', sample.text);

  const extracted = await extractDeliveryInfo(sample.text);
  console.log('חולץ:', extracted);

  const draft = db.insertDraft({ ...extracted, raw_message: sample.text, source_phone: '972500000000' });
  console.log('נשמר כטיוטה, id:', draft.id, 'status:', draft.status);

  const confirmed = db.confirmDelivery(draft.id);
  console.log('אושר, doc_number:', confirmed.doc_number, 'status:', confirmed.status);
}

main().catch((err) => {
  console.error('שגיאה:', err.message);
  process.exit(1);
});
