'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DEFAULT_DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'deliveries.db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT,
  material TEXT,
  quantity TEXT,
  destination TEXT,
  date TEXT,
  notes TEXT,
  confidence REAL,
  raw_message TEXT,
  source_phone TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'confirmed')),
  doc_number INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_deliveries_doc_number
  ON deliveries(doc_number)
  WHERE doc_number IS NOT NULL;
`;

const EDITABLE_FIELDS = [
  'customer_name',
  'material',
  'quantity',
  'destination',
  'date',
  'notes',
  'confidence',
  'raw_message',
  'source_phone',
];

let dbInstance = null;

function openDb(dbPath = DEFAULT_DB_PATH) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);
  return db;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = openDb();
  }
  return dbInstance;
}

function insertDraft(record, db = getDb()) {
  const stmt = db.prepare(`
    INSERT INTO deliveries
      (customer_name, material, quantity, destination, date, notes, confidence, raw_message, source_phone)
    VALUES
      (@customer_name, @material, @quantity, @destination, @date, @notes, @confidence, @raw_message, @source_phone)
  `);

  const info = stmt.run({
    customer_name: record.customer_name ?? null,
    material: record.material ?? null,
    quantity: record.quantity ?? null,
    destination: record.destination ?? null,
    date: record.date ?? null,
    notes: record.notes ?? null,
    confidence: record.confidence ?? null,
    raw_message: record.raw_message ?? null,
    source_phone: record.source_phone ?? null,
  });

  return getById(info.lastInsertRowid, db);
}

function getById(id, db = getDb()) {
  return db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id) || null;
}

function listByStatus(status = 'draft', db = getDb()) {
  return db
    .prepare('SELECT * FROM deliveries WHERE status = ? ORDER BY created_at DESC')
    .all(status);
}

function updateFields(id, fields, db = getDb()) {
  const existing = getById(id, db);
  if (!existing) {
    throw new Error(`לא נמצאה הזמנה עם id=${id}`);
  }

  const keysToUpdate = Object.keys(fields).filter((key) => EDITABLE_FIELDS.includes(key));
  if (keysToUpdate.length === 0) return existing;

  const setClause = keysToUpdate.map((key) => `${key} = @${key}`).join(', ');
  db.prepare(`UPDATE deliveries SET ${setClause} WHERE id = @id`).run({ id, ...fields });

  return getById(id, db);
}

function confirmDelivery(id, db = getDb()) {
  const confirm = db.transaction((deliveryId) => {
    const existing = getById(deliveryId, db);
    if (!existing) {
      throw new Error(`לא נמצאה הזמנה עם id=${deliveryId}`);
    }
    if (existing.status === 'confirmed') {
      return existing;
    }

    const { maxDoc } = db.prepare('SELECT MAX(doc_number) AS maxDoc FROM deliveries').get();
    const nextDocNumber = (maxDoc || 0) + 1;

    db.prepare(`
      UPDATE deliveries
      SET status = 'confirmed', doc_number = ?, confirmed_at = datetime('now')
      WHERE id = ?
    `).run(nextDocNumber, deliveryId);

    return getById(deliveryId, db);
  });

  return confirm(id);
}

module.exports = {
  openDb,
  getDb,
  insertDraft,
  getById,
  listByStatus,
  updateFields,
  confirmDelivery,
};
