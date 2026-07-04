'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });
const Anthropic = require('@anthropic-ai/sdk');

const KNOWN_ENTITIES_PATH = path.join(__dirname, 'known_entities.json');
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const FIELDS = ['customer_name', 'material', 'quantity', 'destination', 'date', 'notes'];

function loadKnownEntities() {
  try {
    const raw = fs.readFileSync(KNOWN_ENTITIES_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { customers: [], materials: [] };
  }
}

function buildSystemPrompt(knownEntities) {
  const customersList = (knownEntities.customers || []).join(', ') || '(אין)';
  const materialsList = (knownEntities.materials || []).join(', ') || '(אין)';

  return `אתה מנוע לחילוץ פרטי הזמנת הובלה מהודעת ווטסאפ חופשית, בערבית מדוברת ו/או עברית מעורבת.

החזר אך ורק אובייקט JSON יחיד. בלי טקסט לפני או אחרי, בלי הסברים, בלי markdown, בלי גדרות קוד (\`\`\`).

מבנה ה-JSON חייב להיות בדיוק (המפתחות הבאים ובאותו סדר):
{
  "customer_name": string | null,
  "material": string | null,
  "quantity": string | null,
  "destination": string | null,
  "date": string | null,
  "notes": string | null,
  "confidence": number
}

כללים:
- אם שדה לא מופיע בהודעה או לא ברור - החזר null עבורו. אסור להמציא או לנחש ערך שלא נאמר בפועל.
- "confidence" הוא מספר בין 0 ל-1 המשקף כמה אתה בטוח בחילוץ הכולל.
- רשימת שמות לקוחות ידועים (בהודעה עלולות להופיע שגיאות כתיב/תעתיק מערבית - נסה להתאים): ${customersList}
- רשימת חומרים/סחורות ידועים (יתכנו שגיאות כתיב/תעתיק - נסה להתאים): ${materialsList}
- אם מילה בהודעה נשמעת דומה פונטית או קרובה בכתיב לשם ברשימה, החזר את הצורה הרשמית מהרשימה, לא את הכתיב המקורי מההודעה.
- אם השם/החומר בהודעה לא דומה לשום פריט ברשימה, החזר את מה שנאמר כפי שהוא (אל תכריח התאמה לרשימה).
- quantity - שמור כפי שנאמר, כולל יחידה אם צוינה (לדוגמה: "20 טון", "3 משאיות", "משאית וחצי").
- date - אם צוין תאריך יחסי כמו "מחר" או "יום ראשון הבא" - שמור את הביטוי כפי שנאמר, אל תחשב תאריך מוחלט.
- notes - כל מידע רלוונטי נוסף שלא שייך לשדות האחרים (למשל הערות גישה, שעה מועדפת וכו').
- החזר אך ורק את אובייקט ה-JSON, שום דבר מעבר לכך.`;
}

function extractJsonText(rawText) {
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return rawText.slice(firstBrace, lastBrace + 1);
  }
  return rawText;
}

function normalizeResult(parsed) {
  const result = {};
  for (const field of FIELDS) {
    const value = parsed[field];
    result[field] = value === undefined || value === '' ? null : value;
  }
  result.confidence = typeof parsed.confidence === 'number' ? parsed.confidence : null;
  return result;
}

function parseExtractedJson(rawText) {
  const jsonText = extractJsonText(rawText);
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(
      `נכשל בפענוח JSON מתשובת המודל: ${err.message}\nתשובה גולמית:\n${rawText}`
    );
  }
  return normalizeResult(parsed);
}

async function extractDeliveryInfo(text, options = {}) {
  if (!text || !text.trim()) {
    throw new Error('טקסט ההודעה ריק');
  }

  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY חסר. הגדר אותו בקובץ .env (ראה .env.example)');
  }

  const knownEntities = options.knownEntities || loadKnownEntities();
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: options.model || DEFAULT_MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(knownEntities),
    messages: [{ role: 'user', content: text }],
  });

  const rawText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  return parseExtractedJson(rawText);
}

module.exports = {
  extractDeliveryInfo,
  loadKnownEntities,
  buildSystemPrompt,
  parseExtractedJson,
};
