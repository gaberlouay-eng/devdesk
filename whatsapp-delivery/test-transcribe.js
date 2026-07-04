'use strict';

// בדיקות ל-transcribe.js.
// - stripTimestamps ובדיקת קובץ לא קיים: לא דורשות רשת/מפתח.
// - בדיקת "GEMINI_API_KEY חסר": מוחקת את המשתנה זמנית בתהליך הזה בלבד.
// - בדיקה חיה (אופציונלית): אם GEMINI_API_KEY קיים, מתמללת בפועל את
//   test-audio/hebrew-tts.wav (קובץ TTS רובוטי שנוצר עם espeak-ng - לא
//   דיבור אנושי אמיתי, אבל מספיק כדי לוודא שהקריאה ל-Gemini + פענוח ה-JSON
//   עובדים בפועל, לא רק בתיאוריה).

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { transcribeAudio, transcribeGemini, stripTimestamps } = require('./transcribe');

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

  await runAsync('ללא GEMINI_API_KEY וללא מודל מקומי -> נופל לניסיון Gemini ומחזיר שגיאה ברורה', async () => {
    const savedKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      await assert.rejects(() => transcribeAudio(dummyPath), /GEMINI_API_KEY חסר/);
    } finally {
      if (savedKey) process.env.GEMINI_API_KEY = savedKey;
    }
  });

  await runAsync('provider=gemini מדלג ישירות על המקומי', async () => {
    const savedKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      await assert.rejects(
        () => transcribeAudio(dummyPath, { provider: 'gemini' }),
        /GEMINI_API_KEY חסר/
      );
    } finally {
      if (savedKey) process.env.GEMINI_API_KEY = savedKey;
    }
  });

  fs.unlinkSync(dummyPath);

  const liveAudioPath = path.join(__dirname, 'test-audio', 'hebrew-tts.wav');
  if (process.env.GEMINI_API_KEY && fs.existsSync(liveAudioPath)) {
    await runAsync('בדיקה חיה: תמלול בפועל מול Gemini', async () => {
      const result = await transcribeGemini(liveAudioPath, { provider: 'gemini' });
      console.log('  תמלול:', result);
      assert.ok(result.text.length > 0, 'התמלול לא יכול להיות ריק');
    });
  } else {
    console.log('(דילוג על הבדיקה החיה - חסר GEMINI_API_KEY או קובץ test-audio/hebrew-tts.wav)');
  }

  console.log('\nכל בדיקות התמלול הושלמו.');
}

main();
