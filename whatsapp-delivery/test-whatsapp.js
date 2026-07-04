'use strict';

// בדיקת handleIncomingMessage מ-whatsapp.js. לא דורשת חיבור ווטסאפ אמיתי
// (זה דורש סריקת QR מטלפון אמיתי - לא אפשרי בסביבה הזו) - רק בונה אובייקטי
// msg מדומים בצורת ההודעה של whatsapp-web.js, ומריצה נגדם extractor+db
// אמיתיים (לא מדומים) כדי לוודא שהניתוב טקסט/קול -> חילוץ -> טיוטה עובד.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const dbModule = require('./db');
const { handleIncomingMessage } = require('./whatsapp');

// מסד נתונים זמני בזיכרון, נפרד מ-whatsapp-delivery/data/deliveries.db
const testDb = new Database(':memory:');
testDb.exec(`
  CREATE TABLE deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT, material TEXT, quantity TEXT, destination TEXT,
    date TEXT, notes TEXT, confidence REAL, raw_message TEXT, source_phone TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'confirmed')),
    doc_number INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now')), confirmed_at TEXT
  );
`);
const testDbAdapter = {
  insertDraft: (record) => dbModule.insertDraft(record, testDb),
  getById: (id) => dbModule.getById(id, testDb),
  listByStatus: (status) => dbModule.listByStatus(status, testDb),
};

async function runAsync(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

function mockTextMessage(body, overrides = {}) {
  return {
    fromMe: false,
    hasMedia: false,
    type: 'chat',
    body,
    from: '972500000000@c.us',
    getChat: async () => ({ isGroup: false }),
    ...overrides,
  };
}

function mockVoiceMessage(filePath, mimetype, overrides = {}) {
  const data = fs.readFileSync(filePath).toString('base64');
  return {
    fromMe: false,
    hasMedia: true,
    type: 'ptt',
    body: '',
    from: '972500000000@c.us',
    getChat: async () => ({ isGroup: false }),
    downloadMedia: async () => ({ mimetype, data }),
    ...overrides,
  };
}

async function main() {
  await runAsync('הודעת טקסט -> חילוץ אמיתי -> טיוטה נשמרת', async () => {
    const msg = mockTextMessage('שלום, מדבר בדרי, אני צריך 20 טון חול למחר לאתר בניה ברמלה');
    const draft = await handleIncomingMessage(msg, { db: testDbAdapter });
    assert.ok(draft, 'הייתה אמורה להישמר טיוטה');
    assert.strictEqual(draft.status, 'draft');
    assert.strictEqual(draft.customer_name, 'בדרי');
    assert.strictEqual(draft.source_phone, '972500000000@c.us');
    assert.strictEqual(draft.raw_message, msg.body);
  });

  await runAsync('הודעה מקבוצה -> מתעלם', async () => {
    const msg = mockTextMessage('טקסט כלשהו', { getChat: async () => ({ isGroup: true }) });
    const result = await handleIncomingMessage(msg, { db: testDbAdapter });
    assert.strictEqual(result, null);
  });

  await runAsync('הודעה יוצאת (fromMe) -> מתעלם', async () => {
    const msg = mockTextMessage('טקסט כלשהו', { fromMe: true });
    const result = await handleIncomingMessage(msg, { db: testDbAdapter });
    assert.strictEqual(result, null);
  });

  await runAsync('הודעה בלי טקסט ובלי מדיה (למשל מדבקה) -> מתעלם', async () => {
    const msg = mockTextMessage('', { type: 'sticker' });
    const result = await handleIncomingMessage(msg, { db: testDbAdapter });
    assert.strictEqual(result, null);
  });

  const voiceFixture = path.join(__dirname, 'test-audio', 'hebrew-tts.wav');
  if (process.env.GEMINI_API_KEY && fs.existsSync(voiceFixture)) {
    await runAsync('הודעה קולית (ptt) -> תמלול אמיתי -> חילוץ אמיתי -> טיוטה', async () => {
      const msg = mockVoiceMessage(voiceFixture, 'audio/wav');
      const draft = await handleIncomingMessage(msg, { db: testDbAdapter });
      assert.ok(draft, 'הייתה אמורה להישמר טיוטה גם עבור הודעה קולית');
      assert.strictEqual(draft.status, 'draft');
      console.log('  raw_message (מתומלל):', draft.raw_message);
    });
  } else {
    console.log('(דילוג על בדיקת הודעה קולית - חסר GEMINI_API_KEY או קובץ הבדיקה)');
  }

  console.log('\nכל בדיקות whatsapp.js הושלמו.');
}

main();
