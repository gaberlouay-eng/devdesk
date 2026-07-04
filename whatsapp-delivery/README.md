# חילוץ הזמנות הובלה מווטסאפ — שלבים 1-2

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

## שלב 2 — מסד נתונים ו-PDF

`db.js` (better-sqlite3) שומר כל הזמנה בטבלת `deliveries` עם השדות שחולצו,
ההודעה הגולמית, מספר הטלפון, וסטטוס `draft`/`confirmed`. מספר תעודה (`doc_number`)
רץ ומוקצה רק בעת אישור (`confirmDelivery`), בטרנזקציה אחת. מיקום קובץ ה-DB
ניתן להגדרה עם `DB_PATH` (ברירת מחדל: `whatsapp-delivery/data/deliveries.db`).

`pdf.js` (pdfmake) מייצר תעודת משלוח PDF בעברית RTL מרשומת delivery: לוגו
placeholder, מספר תעודה, תאריך, לקוח, חומר, כמות, יעד, הערות.

### הערה טכנית על RTL

ל-pdfmake/pdfkit אין תמיכת Unicode bidi אמיתית, ובנוסף מנגנון שבירת השורות שלו
מערבב לפעמים סדר של "מילים" בתוך מחרוזת אחת בצורה לא צפויה. הפתרון ב-`pdf.js`:
כל שורה מפורקת לטוקנים (עברית / רווח / אחר-ספרות ולטינית), טוקן עברי הופך
פנימה (מראה תווים), והטוקנים מועברים ל-pdfmake כמערך ריצות טקסט נפרדות
(inline text runs) בסדר הפוך - זה עוקף את מנגנון שבירת השורות הפנימי של pdfkit
לגמרי. אומת ברמת פיקסל/קואורדינטות (לא רק חזותית) שכל שורה בתעודה יוצאת נכונה.

הפונט: Alef (Google Fonts, רישיון SIL OFL) - כלול תחת `fonts/`.

### הרצה

```bash
node test-stage2.js
```

מריץ את הדוגמה הראשונה מ-`samples.js` מקצה לקצה: חילוץ -> שמירה כטיוטה ->
אישור (הקצאת מספר תעודה) -> יצירת PDF תחת `whatsapp-delivery/output/`.

## קבצים

- `extractor.js` — שלב 1: בניית הפרומפט, קריאה ל-Claude/Gemini, פענוח JSON.
- `known_entities.json` — רשימת לקוחות/חומרים/יעדים ידועים לזיהוי fuzzy.
- `samples.js` — 5 הודעות דוגמה לבדיקה.
- `test-extractor.js` — מריץ את הדוגמאות מול המודל ומדפיס תוצאות.
- `test-parser.js` — בדיקות יחידה ללוגיקת הפענוח, ללא צורך במפתח API.
- `db.js` — שלב 2: סכימת SQLite וניהול טיוטות/אישורים.
- `pdf.js` — שלב 2: יצירת תעודת משלוח PDF בעברית RTL.
- `test-stage2.js` — בדיקת קצה-לקצה של שלב 1+2.
- `fonts/` — פונט Alef (SIL OFL) המשמש ליצירת ה-PDF.

## מה הלאה

הבא בתור: תמלול קול (שלב 3), חיבור ווטסאפ (שלב 4), וממשק אישור אנושי (שלב 5).
שום תעודה לא נוצרת סופית בלי אישור אנושי מפורש.
