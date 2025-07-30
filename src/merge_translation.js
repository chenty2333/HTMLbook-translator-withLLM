// merge_translations.js
// 合并翻译结果脚本
const fs = require('fs');
const path = require('path');
// 数据库 API
const { openDb, getBatchTranslations, insertTranslatedNode } = require('./db');

// 使用数据库合并翻译结果
openDb();
const batches = getBatchTranslations();
let total = 0;
for (const { batch_index: idx, translated_text } of batches) {
  const lines = translated_text.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s*(.*)$/);
    if (match) {
      const id = parseInt(match[1], 10);
      const translation = match[2];
      insertTranslatedNode(id, translation);
      total++;
    }
  }
}
console.log(`✅ Merged ${total} translated nodes into database`);
