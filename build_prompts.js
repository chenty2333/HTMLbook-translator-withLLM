// build_prompts.js
// 构建翻译批次脚本
const fs = require('fs');
const path = require('path');

// 加载配置文件
// Load configuration file
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8'));

const nodes = JSON.parse(fs.readFileSync(config.files.textNodes, 'utf-8'));
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

// 确保 batches 目录存在
// Ensure batches directory exists
const batchesDir = path.join(__dirname, config.directories.batches);
if (!fs.existsSync(batchesDir)) {
  fs.mkdirSync(batchesDir);
}

// 每个 batch 保存为单独文件
// Save each batch as a separate file
batches.forEach((text, idx) => {
  fs.writeFileSync(path.join(batchesDir, `batch_${idx + 1}.txt`), text, 'utf-8');
});

console.log(`✅ Created ${batches.length} prompt batches in ${config.directories.batches}/`); // 创建提示批次完成
