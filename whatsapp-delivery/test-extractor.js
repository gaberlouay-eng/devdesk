'use strict';

const { extractDeliveryInfo } = require('./extractor');
const samples = require('./samples');

async function main() {
  for (const [index, sample] of samples.entries()) {
    console.log(`\n--- דוגמה ${index + 1}: ${sample.label} ---`);
    console.log(`טקסט: ${sample.text}`);
    try {
      const result = await extractDeliveryInfo(sample.text);
      console.log('תוצאה:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('שגיאה:', err.message);
    }
  }
}

main();
