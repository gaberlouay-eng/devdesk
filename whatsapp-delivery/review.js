'use strict';

// שלב 5: ממשק אישור אנושי מהיר בטרמינל. מציג את כל הטיוטות (status='draft'),
// ומאפשר לאשר (מקצה doc_number) או לערוך שדה לפני האישור. שום דבר לא מאושר
// אוטומטית - האישור הוא תמיד פעולה ידנית של המשתמש.

const readline = require('readline');
const db = require('./db');

const EDITABLE_FIELDS = ['customer_name', 'material', 'quantity', 'destination', 'date', 'notes'];

function printDrafts(drafts) {
  if (drafts.length === 0) {
    console.log('\nאין טיוטות ממתינות.\n');
    return;
  }

  console.log(`\nטיוטות ממתינות לאישור (${drafts.length}):\n`);
  for (const d of drafts) {
    console.log(
      `#${d.id}  לקוח: ${d.customer_name || '—'}  |  חומר: ${d.material || '—'}  |  כמות: ${d.quantity || '—'}  |  יעד: ${d.destination || '—'}  |  תאריך: ${d.date || '—'}`
    );
    if (d.notes) console.log(`     הערות: ${d.notes}`);
    console.log(`     ביטחון: ${d.confidence ?? '—'}  |  טלפון: ${d.source_phone || '—'}  |  הודעה מקורית: ${d.raw_message}`);
  }
  console.log('');
}

function printHelp() {
  console.log('פקודות: c <id>  (אשר)   e <id> <שדה>=<ערך>  (ערוך)   l  (רענן רשימה)   q  (יציאה)');
  console.log(`שדות לעריכה: ${EDITABLE_FIELDS.join(', ')}\n`);
}

function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  function refresh() {
    printDrafts(db.listByStatus('draft'));
  }

  printHelp();
  refresh();
  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim();

    if (input === 'q') {
      rl.close();
      return;
    }

    if (input === 'l' || input === '') {
      refresh();
      rl.prompt();
      return;
    }

    const confirmMatch = input.match(/^c\s+(\d+)$/);
    if (confirmMatch) {
      const id = Number(confirmMatch[1]);
      try {
        const confirmed = db.confirmDelivery(id);
        console.log(`אושר #${confirmed.id} - מספר תעודה: ${confirmed.doc_number}\n`);
      } catch (err) {
        console.error(`שגיאה: ${err.message}\n`);
      }
      refresh();
      rl.prompt();
      return;
    }

    const editMatch = input.match(/^e\s+(\d+)\s+(\w+)=(.*)$/);
    if (editMatch) {
      const [, idStr, field, value] = editMatch;
      const id = Number(idStr);
      if (!EDITABLE_FIELDS.includes(field)) {
        console.error(`שדה לא ניתן לעריכה: ${field} (אפשריים: ${EDITABLE_FIELDS.join(', ')})\n`);
        rl.prompt();
        return;
      }
      try {
        const updated = db.updateFields(id, { [field]: value });
        console.log(`עודכן #${updated.id}: ${field} = ${updated[field]}\n`);
      } catch (err) {
        console.error(`שגיאה: ${err.message}\n`);
      }
      refresh();
      rl.prompt();
      return;
    }

    console.log('פקודה לא מזוהה.');
    printHelp();
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('להתראות.');
    process.exit(0);
  });
}

main();
