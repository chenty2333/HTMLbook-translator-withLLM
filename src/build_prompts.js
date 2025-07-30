// build_prompts.js
// 构建翻译批次脚本
const fs = require('fs');
const path = require('path');
// 数据库 API
const { openDb, getTextNodes, insertPromptBatches } = require('./db');

// 加载配置文件
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8'));
// 项目根目录
const ROOT = path.resolve(__dirname, '..');
// 初始化数据库，读取文本节点
openDb();
const nodes = getTextNodes();
const batchSize = config.translation.batchSize;

const batches = [];
for (let i = 0; i < nodes.length; i += batchSize) {
  // 每 batchSize 条为一组
  // Group by batchSize
  const batch = nodes.slice(i, i + batchSize);
  const numbered = batch.map(item => `${item.id}. ${item.text}`) // 保留原始格式 // Keep original format
    .join('\n');
  batches.push(numbered);
}

// 将批次提示插入数据库
insertPromptBatches(batches);
console.log(`✅ 已生成并保存 ${batches.length} 条提示批次到数据库`);
