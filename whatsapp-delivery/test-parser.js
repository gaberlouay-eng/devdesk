'use strict';

// בדיקת יחידה ל-parseExtractedJson - לא דורשת ANTHROPIC_API_KEY.
// מוודאת שהפענוח וההנרמול של תשובת המודל עובדים נכון גם כשיש
// גדרות markdown, שדות חסרים, או טקסט עודף סביב ה-JSON.

const assert = require('assert');
const { parseExtractedJson } = require('./extractor');

function run(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

run('JSON נקי', () => {
  const raw = JSON.stringify({
    customer_name: 'בדרי',
    material: 'חול',
    quantity: '20 טון',
    destination: 'רמלה',
    date: 'מחר',
    notes: null,
    confidence: 0.9,
  });
  const result = parseExtractedJson(raw);
  assert.strictEqual(result.customer_name, 'בדרי');
  assert.strictEqual(result.confidence, 0.9);
});

run('JSON בתוך גדרות markdown', () => {
  const raw = '```json\n{"customer_name": "אלריאן", "material": null, "quantity": null, "destination": null, "date": null, "notes": null, "confidence": 0.4}\n```';
  const result = parseExtractedJson(raw);
  assert.strictEqual(result.customer_name, 'אלריאן');
  assert.strictEqual(result.material, null);
});

run('שדות חסרים -> null', () => {
  const raw = JSON.stringify({ customer_name: 'בקלש', confidence: 0.5 });
  const result = parseExtractedJson(raw);
  assert.strictEqual(result.material, null);
  assert.strictEqual(result.quantity, null);
  assert.strictEqual(result.destination, null);
  assert.strictEqual(result.date, null);
  assert.strictEqual(result.notes, null);
});

run('טקסט עודף סביב ה-JSON', () => {
  const raw = 'הנה התוצאה:\n{"customer_name": "חסן", "material": "אבן גיר", "quantity": "15 טון", "destination": null, "date": "היום", "notes": null, "confidence": 0.7}\nתודה';
  const result = parseExtractedJson(raw);
  assert.strictEqual(result.customer_name, 'חסן');
  assert.strictEqual(result.date, 'היום');
});

run('JSON לא תקין -> זורק שגיאה ברורה', () => {
  assert.throws(() => parseExtractedJson('לא json בכלל'), /נכשל בפענוח JSON/);
});

console.log('\nכל בדיקות הפרסור הושלמו.');
