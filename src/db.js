const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config.json');
const ROOT = path.resolve(__dirname, '..');
let db;

function openDb() {
  const dbPath = path.resolve(ROOT, config.database.path);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  // Create tables if not exist
  db.prepare(
    `CREATE TABLE IF NOT EXISTS text_nodes (
      id INTEGER PRIMARY KEY,
      xpath TEXT NOT NULL,
      original_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
  // Create prompt_batches table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS prompt_batches (
      batch_index INTEGER PRIMARY KEY,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
  // Create batch_translations table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS batch_translations (
      batch_index INTEGER PRIMARY KEY,
      translated_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
  // Create translated_nodes table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS translated_nodes (
      node_id INTEGER PRIMARY KEY,
      translation TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();
}

function insertTextNodes(nodes) {
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO text_nodes (id, xpath, original_text) VALUES (?, ?, ?)`
  );
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.id, item.xpath, item.text);
    }
  });
  insertMany(nodes);
  console.log(`✅ 插入 ${nodes.length} 条文本节点到数据库`);
}

module.exports = {
  // 获取所有已翻译文本节点
  getTranslatedNodes: () => {
    return db.prepare(
      `SELECT tn.xpath, tn2.translation AS translated FROM text_nodes tn
       LEFT JOIN translated_nodes tn2 ON tn.id = tn2.node_id
       ORDER BY tn.id`
    ).all();
  },
  openDb,
  insertTextNodes,
  // 获取所有文本节点
  getTextNodes: () => {
    return db.prepare(
      `SELECT id, xpath, original_text AS text FROM text_nodes ORDER BY id`
    ).all();
  },
  // 插入提示批次
  insertPromptBatches: (batches) => {
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO prompt_batches (batch_index, content) VALUES (?, ?)`
    );
    const insertMany = db.transaction((arr) => {
      arr.forEach((content, idx) => stmt.run(idx + 1, content));
    });
    insertMany(batches);
    console.log(`✅ 插入 ${batches.length} 条提示批次到数据库`);
  },
  // 获取所有提示批次
  getPromptBatches: () => {
    return db.prepare(
      `SELECT batch_index, content FROM prompt_batches ORDER BY batch_index`
    ).all();
  },
  // 插入或更新批次翻译结果
  insertBatchTranslation: (batchIndex, translatedText) => {
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO batch_translations (batch_index, translated_text) VALUES (?, ?)`
    );
    stmt.run(batchIndex, translatedText);
    console.log(`✅ 保存批次 ${batchIndex} 的翻译结果`);
  },
  // 获取所有批次翻译结果
  getBatchTranslations: () => {
    return db.prepare(
      `SELECT batch_index, translated_text FROM batch_translations ORDER BY batch_index`
    ).all();
  },
  // 插入或更新单个节点翻译
  insertTranslatedNode: (nodeId, translation) => {
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO translated_nodes (node_id, translation) VALUES (?, ?)`
    );
    stmt.run(nodeId, translation);
  }
};
