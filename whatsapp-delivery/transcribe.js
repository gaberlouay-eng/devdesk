'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });

const DEFAULT_MODEL = process.env.WHISPER_MODEL || 'small';
const MODEL_ROOT_PATH = process.env.WHISPER_MODEL_PATH || path.join(__dirname, 'models');
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const AUDIO_MIME_TYPES = {
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mp3',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.webm': 'audio/webm',
};

function guessAudioMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return AUDIO_MIME_TYPES[ext] || 'application/octet-stream';
}

// whisper.cpp's default CLI output is one line per segment, prefixed with a
// "[00:00:00.000 --> 00:00:02.500]" timestamp. We only want the spoken text.
function stripTimestamps(rawOutput) {
  return rawOutput
    .split('\n')
    .map((line) => line.replace(/^\[[\d:.,>\-\s]+\]\s*/, '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();
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

async function transcribeLocal(filePath, options = {}) {
  const { nodewhisper } = require('nodejs-whisper');
  const modelName = options.model || DEFAULT_MODEL;

  const rawOutput = await nodewhisper(filePath, {
    modelName,
    autoDownloadModelName: modelName,
    modelRootPath: MODEL_ROOT_PATH,
    removeWavFileAfterTranscription: true,
    whisperOptions: { language: 'auto' },
  });

  const text = stripTimestamps(rawOutput);
  if (!text) {
    throw new Error('תמלול מקומי החזיר טקסט ריק');
  }

  // whisper.cpp's plain CLI output here doesn't surface the detected
  // language; only the Gemini fallback reports it.
  return { text, language: null, source: 'local' };
}

async function transcribeGemini(filePath, options = {}) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY חסר. הגדר אותו בקובץ .env (ראה .env.example)');
  }

  const { GoogleGenAI } = require('@google/genai');
  const client = new GoogleGenAI({ apiKey });

  const audioBytes = fs.readFileSync(filePath);
  const mimeType = guessAudioMimeType(filePath);

  const systemPrompt = `אתה מתמלל הודעות קוליות בערבית מדוברת ו/או עברית מעורבת.

החזר אך ורק אובייקט JSON יחיד, בלי טקסט לפני או אחרי, בלי markdown, בפורמט:
{"text": string, "language": string}

- "text": התמלול המדויק של מה שנאמר בהקלטה, מילה במילה. אל תתרגם, אל תמציא
  ואל תסכם - רק תמלול. אם לא ניתן לתמלל דבר (רעש/שקט), החזר מחרוזת ריקה.
- "language": קוד השפה הדומיננטית שזוהתה בהקלטה (he / ar / mixed / other).`;

  const response = await client.models.generateContent({
    model: options.model || DEFAULT_GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ inlineData: { mimeType, data: audioBytes.toString('base64') } }],
      },
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    },
  });

  const rawText = (response.text || '').trim();
  let parsed;
  try {
    parsed = JSON.parse(extractJsonText(rawText));
  } catch (err) {
    throw new Error(`נכשל בפענוח JSON מתשובת Gemini: ${err.message}\nתשובה גולמית:\n${rawText}`);
  }

  const text = (parsed.text || '').trim();
  if (!text) {
    throw new Error('Gemini החזיר תמלול ריק');
  }

  return { text, language: parsed.language || null, source: 'gemini' };
}

async function transcribeAudio(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`הקובץ לא נמצא: ${filePath}`);
  }

  if (options.provider !== 'gemini') {
    try {
      return await transcribeLocal(filePath, options);
    } catch (err) {
      console.warn('[transcribe] תמלול מקומי נכשל, עובר ל-Gemini:', err.message);
    }
  }

  return transcribeGemini(filePath, options);
}

module.exports = { transcribeAudio, transcribeLocal, transcribeGemini, stripTimestamps };
