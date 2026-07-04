# חילוץ הזמנות הובלה מווטסאפ — שלב 1: extractor.js

מודול שמקבל טקסט חופשי (ערבית מדוברת / עברית מעורבת) של הזמנת הובלה, ומחזיר
JSON מובנה עם פרטי ההזמנה, בעזרת Claude.

## התקנה

```bash
cd whatsapp-delivery
npm install
cp .env.example .env
```

ערכו את `.env` והכניסו את `ANTHROPIC_API_KEY` שלכם.

## הרצה

בדיקת יחידה על לוגיקת הפענוח (לא דורשת מפתח API):

```bash
npm run test:parser
```

הרצת 5 הודעות הדוגמה מול Claude בפועל (דורשת `ANTHROPIC_API_KEY` תקין ב-`.env`):

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

`known_entities.json` מכיל רשימת לקוחות וחומרים ידועים. הרשימה נשלחת ל-Claude
כחלק מהפרומפט כדי שיזהה שמות למרות שגיאות כתיב/תעתיק מערבית (למשל "בקלאש" → "בקלש").
עדכנו את הקובץ עם הלקוחות והחומרים האמיתיים שלכם.

## קבצים

- `extractor.js` — הלוגיקה המרכזית (בניית הפרומפט, קריאה ל-Claude, פענוח JSON).
- `known_entities.json` — רשימת לקוחות/חומרים ידועים לזיהוי fuzzy.
- `samples.js` — 5 הודעות דוגמה לבדיקה.
- `test-extractor.js` — מריץ את הדוגמאות מול Claude ומדפיס תוצאות.
- `test-parser.js` — בדיקות יחידה ללוגיקת הפענוח, ללא צורך במפתח API.

## מה הלאה

זהו שלב 1 בלבד (חילוץ שדות). בהמשך: מסד נתונים SQLite + יצירת PDF (שלב 2),
תמלול קול (שלב 3), חיבור ווטסאפ (שלב 4), וממשק אישור אנושי (שלב 5).
