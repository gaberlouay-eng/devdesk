'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenAI } = require('@google/genai');

const KNOWN_ENTITIES_PATH = path.join(__dirname, 'known_entities.json');
const DEFAULT_ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
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

async function callAnthropic(text, systemPrompt, options) {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY חסר. הגדר אותו בקובץ .env (ראה .env.example)');
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: options.model || DEFAULT_ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: text }],
  });

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}

async function callGemini(text, systemPrompt, options) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY חסר. הגדר אותו בקובץ .env (ראה .env.example)');
  }

  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: options.model || DEFAULT_GEMINI_MODEL,
    contents: text,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    },
  });

  return (response.text || '').trim();
}

function resolveProvider(options) {
  if (options.provider) return options.provider;
  if (process.env.LLM_PROVIDER) return process.env.LLM_PROVIDER;
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return 'anthropic';
}

async function extractDeliveryInfo(text, options = {}) {
  if (!text || !text.trim()) {
    throw new Error('טקסט ההודעה ריק');
  }

  const knownEntities = options.knownEntities || loadKnownEntities();
  const systemPrompt = buildSystemPrompt(knownEntities);
  const provider = resolveProvider(options);

  let rawText;
  if (provider === 'gemini') {
    rawText = await callGemini(text, systemPrompt, options);
  } else if (provider === 'anthropic') {
    rawText = await callAnthropic(text, systemPrompt, options);
  } else {
    throw new Error(`ספק לא מוכר: ${provider} (אפשרויות: anthropic, gemini)`);
  }

  return parseExtractedJson(rawText);
}

module.exports = {
  extractDeliveryInfo,
  loadKnownEntities,
  buildSystemPrompt,
  parseExtractedJson,
};
