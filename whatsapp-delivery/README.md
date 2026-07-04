# חילוץ הזמנות הובלה מווטסאפ — שלבים 1-3

מודול שמקבל טקסט חופשי (ערבית מדוברת / עברית מעורבת) של הזמנת הובלה, ומחזיר
JSON מובנה עם פרטי ההזמנה, בעזרת Claude או Gemini.

## ספק המודל: Claude או Gemini

התומך תומך בשני ספקים, נבחר לפי `.env`:

- **Anthropic (Claude)** — `ANTHROPIC_API_KEY` מ-console.anthropic.com, בתשלום לפי שימוש.
- **Gemini** — `GEMINI_API_KEY` מ-aistudio.google.com/apikey, עם free tier.

קביעת הספק: `LLM_PROVIDER=anthropic` או `LLM_PROVIDER=gemini` ב-`.env`.
אם לא הוגדר - נבחר `gemini` אוטומטית אם `GEMINI_API_KEY` קיים, אחרת `anthropic`.

## התקנה

```bash
cd whatsapp-delivery
npm install
cp .env.example .env
```

ערכו את `.env` והכניסו את המפתח של הספק שבחרתם.

## הרצה

בדיקת יחידה על לוגיקת הפענוח (לא דורשת מפתח API):

```bash
npm run test:parser
```

הרצת 5 הודעות הדוגמה מול המודל בפועל (דורשת מפתח API תקין ב-`.env` לספק שנבחר):

```bash
npm run test:extractor
```

## מבנה הפלט

לכל הודעה מוחזר אובייקט:

```json
{
  "customer_name": "string | null",
  "material": "string | null",
  "quantity": "string | null",
  "destination": "string | null",
  "date": "string | null",
  "notes": "string | null",
  "confidence": 0.0
}
```

שדה חסר/לא ברור בהודעה יוחזר כ-`null` — המודל לא ממציא ערכים.

## לקוחות וחומרים ידועים

`known_entities.json` מכיל רשימת לקוחות וחומרים ידועים. הרשימה נשלחת למודל
כחלק מהפרומפט כדי שיזהה שמות למרות שגיאות כתיב/תעתיק מערבית (למשל "בקלאש" → "בקלש").
עדכנו את הקובץ עם הלקוחות והחומרים האמיתיים שלכם.

## שלב 2 — מסד נתונים

`db.js` (better-sqlite3) שומר כל הזמנה בטבלת `deliveries` עם השדות שחולצו,
ההודעה הגולמית, מספר הטלפון, וסטטוס `draft`/`confirmed`. מספר תעודה (`doc_number`)
רץ ומוקצה רק בעת אישור (`confirmDelivery`), בטרנזקציה אחת. מיקום קובץ ה-DB
ניתן להגדרה עם `DB_PATH` (ברירת מחדל: `whatsapp-delivery/data/deliveries.db`).

### הרצה

```bash
node test-stage2.js
```

מריץ את הדוגמה הראשונה מ-`samples.js` מקצה לקצה: חילוץ -> שמירה כטיוטה ->
אישור (הקצאת מספר תעודה).

### PDF - מוקפא זמנית

`pdf.js` (pdfmake, עם פונט Alef ב-`fonts/`) קיים בריפו אבל **לא בשימוש כרגע**.
הטקסט שהתקבל בפועל היה הפוך/שגוי חזותית, למרות שהאימות שביצעתי ברמת
קואורדינטות (מיקום כל גליף בקובץ ה-PDF שנוצר) הראה תוצאה תקינה - כלומר יש שם
עדיין באג שלא אותר נכון. יצירת תעודות ה-PDF תיבחן מחדש בהמשך, כנראה בגישה
אחרת (למשל HTML -> PDF דרך דפדפן headless, שיש לו תמיכת bidi מלאה ונכונה
מובנית, במקום המאבק עם pdfmake/pdfkit).

## שלב 3 — תמלול קול

`transcribe.js` מקבל נתיב לקובץ אודיו ומחזיר `{ text, language, source }`.
מנסה קודם Whisper מקומי (`nodejs-whisper`, מריץ whisper.cpp על ה-CPU), ואם
נכשל (או אם מבקשים `provider: 'openai'` במפורש) - נופל אוטומטית ל-OpenAI
Whisper API.

**דרישות ל-Whisper מקומי:**
- כלי build: `make`, `gcc`/`g++`, `cmake` (ב-Linux: `sudo apt install build-essential cmake`).
- `ffmpeg` מותקן במערכת (להמרת האודיו ל-WAV 16kHz מונו - הפורמט שהוואטסאפ
  שולח, בד"כ `.ogg`/opus, יומר אוטומטית).
- בהרצה הראשונה מוריד אוטומטית מודל ggml (`WHISPER_MODEL` ב-`.env`,
  ברירת מחדל `small`) מ-huggingface.co לתוך `whisper-delivery/models/`
  (לא נכלל ב-git, ראו `.gitignore`).
- זיהוי שפה (עברית/ערבית) הוא אוטומטי (`language: 'auto'`) - זו התנהגות
  ברירת המחדל של whisper.cpp עם מודל רב-לשוני (לא `*.en`).

**Fallback ל-OpenAI:** דורש `OPENAI_API_KEY` ב-`.env`. משתמש ב-`response_format:
'verbose_json'` כדי לקבל גם את קוד השפה שזוהה (`response.language`) - מידע
שה-CLI המקומי לא חושף בקלות, ולכן בנתיב המקומי `language` חוזר `null`.

**מגבלת בדיקה בסביבה הזו:** לא הצלחתי להריץ תמלול אמיתי כאן - ל-huggingface.co
(מקור המודלים) אין גישה דרך ה-proxy של הסביבה, ואין לי מפתח OpenAI. מה
שכן אימתתי: כל שרשרת ה-fallback עצמה (ניסיון מקומי אמיתי -> כישלון אמיתי
בגלל חסימת הרשת -> מעבר אוטומטי ל-OpenAI -> שגיאה ברורה כשגם שם אין מפתח) -
כלומר הלוגיקה עובדת נכון, רק לא נבדק תמלול בפועל על קובץ קול אמיתי. אם
תרצה בדיקה מלאה: הרץ על המחשב שלך (שם יש גישה חופשית לאינטרנט), או תן לי
קובץ קול + מפתח OpenAI.

### הרצה

```bash
npm run test:transcribe
```

בדיקות יחידה + זרימת fallback, ללא צורך בקובץ אודיו אמיתי או ברשת.

לתמלול קובץ אמיתי:

```js
const { transcribeAudio } = require('./transcribe');
const result = await transcribeAudio('/path/to/voice-note.ogg');
console.log(result); // { text, language, source }
```

## קבצים

- `extractor.js` — שלב 1: בניית הפרומפט, קריאה ל-Claude/Gemini, פענוח JSON.
- `known_entities.json` — רשימת לקוחות/חומרים/יעדים ידועים לזיהוי fuzzy.
- `samples.js` — 5 הודעות דוגמה לבדיקה.
- `test-extractor.js` — מריץ את הדוגמאות מול המודל ומדפיס תוצאות.
- `test-parser.js` — בדיקות יחידה ללוגיקת הפענוח, ללא צורך במפתח API.
- `db.js` — שלב 2: סכימת SQLite וניהול טיוטות/אישורים.
- `test-stage2.js` — בדיקת קצה-לקצה של שלב 1+2 (חילוץ + DB, ללא PDF).
- `pdf.js`, `fonts/` — יצירת PDF, קיים אך לא בשימוש כרגע (ראו למעלה).
- `transcribe.js` — שלב 3: תמלול קול, מקומי עם fallback ל-OpenAI.
- `test-transcribe.js` — בדיקות יחידה + זרימת fallback לתמלול.

## מה הלאה

הבא בתור: חיבור ווטסאפ (שלב 4), וממשק אישור אנושי (שלב 5).
PDF יטופל מחדש בנפרד. שום תעודה לא נוצרת סופית בלי אישור אנושי מפורש.
