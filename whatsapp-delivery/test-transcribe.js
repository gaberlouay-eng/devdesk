'use strict';

// בדיקות ל-transcribe.js. לא דורש קובץ אודיו אמיתי או API key:
// - stripTimestamps נבדק כיחידה על פלט מדומה בסגנון whisper.cpp.
// - זרימת ה-fallback (מקומי -> OpenAI) נבדקת על קובץ שקיים בפועל, ומסתמכת
//   על כך ששני הנתיבים נכשלים בסביבה הזו (אין מודל/מפתח) כדי לוודא שהשרשור
//   בין הנתיבים עצמו תקין ומחזיר שגיאה ברורה בסוף, ולא נתקע/משתתק.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { transcribeAudio, stripTimestamps } = require('./transcribe');

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

run('stripTimestamps מסיר תגי זמן וממזג שורות', () => {
  const raw = [
    '[00:00:00.000 --> 00:00:02.500]   שלום מדבר בדרי',
    '[00:00:02.500 --> 00:00:05.000]   צריך עשרים טון חול',
  ].join('\n');
  assert.strictEqual(stripTimestamps(raw), 'שלום מדבר בדרי צריך עשרים טון חול');
});

run('stripTimestamps מתעלם משורות ריקות', () => {
  const raw = '[00:00:00.000 --> 00:00:01.000]   טקסט\n\n   \n';
  assert.strictEqual(stripTimestamps(raw), 'טקסט');
});

async function main() {
  await runAsync('קובץ לא קיים -> שגיאה ברורה', async () => {
    await assert.rejects(() => transcribeAudio('/no/such/file.wav'), /הקובץ לא נמצא/);
  });

  const dummyPath = path.join(__dirname, '.tmp-test-audio.wav');
  fs.writeFileSync(dummyPath, Buffer.alloc(100));

  await runAsync('ללא OPENAI_API_KEY וללא מודל מקומי -> נופל לניסיון OpenAI ומחזיר שגיאה ברורה', async () => {
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(() => transcribeAudio(dummyPath), /OPENAI_API_KEY חסר/);
  });

  await runAsync('provider=openai מדלג ישירות על המקומי', async () => {
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(
      () => transcribeAudio(dummyPath, { provider: 'openai' }),
      /OPENAI_API_KEY חסר/
    );
  });

  fs.unlinkSync(dummyPath);
  console.log('\nכל בדיקות התמלול הושלמו.');
}

main();
