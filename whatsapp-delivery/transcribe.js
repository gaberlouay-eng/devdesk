'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });

const DEFAULT_MODEL = process.env.WHISPER_MODEL || 'small';
const MODEL_ROOT_PATH = process.env.WHISPER_MODEL_PATH || path.join(__dirname, 'models');

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
  // language; only the OpenAI fallback (verbose_json) reports it.
  return { text, language: null, source: 'local' };
}

async function transcribeOpenAI(filePath, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY חסר. הגדר אותו בקובץ .env (ראה .env.example)');
  }

  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey });

  const response = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: options.model || 'whisper-1',
    response_format: 'verbose_json',
  });

  const text = (response.text || '').trim();
  if (!text) {
    throw new Error('OpenAI Whisper החזיר טקסט ריק');
  }

  return { text, language: response.language || null, source: 'openai' };
}

async function transcribeAudio(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`הקובץ לא נמצא: ${filePath}`);
  }

  if (options.provider !== 'openai') {
    try {
      return await transcribeLocal(filePath, options);
    } catch (err) {
      console.warn('[transcribe] תמלול מקומי נכשל, עובר ל-OpenAI Whisper API:', err.message);
    }
  }

  return transcribeOpenAI(filePath, options);
}

module.exports = { transcribeAudio, transcribeLocal, transcribeOpenAI, stripTimestamps };
