'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { extractDeliveryInfo } = require('./extractor');
const { transcribeAudio } = require('./transcribe');
const db = require('./db');

const TEMP_AUDIO_DIR = path.join(__dirname, 'tmp-audio');
const AUTH_DATA_PATH = path.join(__dirname, '.wwebjs_auth');

const AUDIO_MESSAGE_TYPES = new Set(['ptt', 'audio']);

const MIME_EXTENSIONS = {
  'audio/ogg; codecs=opus': '.ogg',
  'audio/ogg': '.ogg',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
  'audio/aac': '.aac',
  'audio/wav': '.wav',
  'audio/webm': '.webm',
};

function guessExtension(mimetype) {
  const base = (mimetype || '').split(';')[0].trim();
  return MIME_EXTENSIONS[mimetype] || MIME_EXTENSIONS[base] || '.ogg';
}

function saveMediaToTempFile(media) {
  fs.mkdirSync(TEMP_AUDIO_DIR, { recursive: true });
  const ext = guessExtension(media.mimetype);
  const filePath = path.join(TEMP_AUDIO_DIR, `voice-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  fs.writeFileSync(filePath, Buffer.from(media.data, 'base64'));
  return filePath;
}

// מטפל בהודעה נכנסת אחת: טקסט -> extractor ישירות, קולי -> transcribe -> extractor.
// כל הזמנה שחולצה נשמרת כטיוטה (status='draft') - שום דבר לא מאושר אוטומטית.
async function handleIncomingMessage(msg, deps = {}) {
  const extract = deps.extractDeliveryInfo || extractDeliveryInfo;
  const transcribe = deps.transcribeAudio || transcribeAudio;
  const database = deps.db || db;

  if (msg.fromMe) return null;

  if (typeof msg.getChat === 'function') {
    const chat = await msg.getChat();
    if (chat && chat.isGroup) return null; // שימוש אישי: מתעלם מקבוצות כברירת מחדל
  }

  let rawText;

  if (msg.hasMedia && AUDIO_MESSAGE_TYPES.has(msg.type)) {
    let audioPath;
    try {
      const media = await msg.downloadMedia();
      if (!media) {
        console.warn('[whatsapp] לא הצלחתי להוריד מדיה מההודעה, מדלג');
        return null;
      }
      audioPath = saveMediaToTempFile(media);
      const transcription = await transcribe(audioPath);
      rawText = transcription.text;
      console.log(`[whatsapp] תומלל (${transcription.source}): ${rawText}`);
    } catch (err) {
      console.error('[whatsapp] תמלול נכשל:', err.message);
      return null;
    } finally {
      if (audioPath) fs.unlink(audioPath, () => {});
    }
  } else if (msg.body && msg.body.trim()) {
    rawText = msg.body.trim();
  } else {
    return null; // לא טקסט ולא קול (תמונה/מדבקה/וכו') - מתעלם
  }

  try {
    const extracted = await extract(rawText);
    const draft = database.insertDraft({
      ...extracted,
      raw_message: rawText,
      source_phone: msg.from,
    });
    console.log(`[whatsapp] טיוטה נשמרה, id=${draft.id}, לקוח=${draft.customer_name || '—'}`);
    return draft;
  } catch (err) {
    console.error('[whatsapp] חילוץ/שמירה נכשלו:', err.message);
    return null;
  }
}

function createClient() {
  const puppeteerOptions = {};
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: AUTH_DATA_PATH }),
    puppeteer: puppeteerOptions,
  });

  client.on('qr', (qr) => {
    console.log('[whatsapp] סרוק את קוד ה-QR עם הטלפון (WhatsApp > מכשירים מקושרים):');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('[whatsapp] מחובר ומאזין להודעות.');
  });

  client.on('auth_failure', (message) => {
    console.error('[whatsapp] אימות נכשל:', message);
  });

  client.on('disconnected', (reason) => {
    console.warn('[whatsapp] נותק:', reason);
  });

  client.on('message', (msg) => {
    handleIncomingMessage(msg).catch((err) => {
      console.error('[whatsapp] שגיאה בטיפול בהודעה:', err.message);
    });
  });

  return client;
}

if (require.main === module) {
  const client = createClient();
  client.initialize();
}

module.exports = { createClient, handleIncomingMessage };
